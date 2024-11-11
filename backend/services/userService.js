const { User } = require('../models');
const { Result, StatusEnum } = require('../utils/result');
const { parseSequelizeErrors } = require('../utils/errorParser');
const EmailService = require('./emailService');
const PostService = require('./postService');
const jwtParser = require('../utils/jwtParser');
const { hashPassword, checkPasswordHash } = require('../utils/passwordHasher');
const { use } = require('../routes/postRoute');
const Sequelize = require('sequelize'); 

class UserService {
	async register(user, role) {
		user.role = role;
		user.isActive = true;

		user.password = hashPassword(user.password);

		if(process.env.ENABLE_EMAIL_SERVICE === 'true') {
			user.isActive = false;
		}

		try {
			user = await User.create(user);
		}
		catch (exception) {
				const errors = parseSequelizeErrors(exception);
				return new Result(StatusEnum.FAIL, 500, null, errors);
		}

		if (process.env.ENABLE_EMAIL_SERVICE === 'true') {
			const token = jwtParser.generateToken(user);
			EmailService.sendActivationEmail(user.email, token);
		}

		return new Result(StatusEnum.OK, 201, user);
	}

	async login(email, password) {
		const user = await User.findOne({ where: { email } });
		if (!user) {
			return new Result(StatusEnum.FAIL, 400, null, [{ message: 'Invalid email or password' }]);
		}

		const passwordsMatch = checkPasswordHash(password, user.password);
		if (!passwordsMatch) {
			return new Result(StatusEnum.FAIL, 400, null, [{ message: 'Invalid email or password' }]);
		}

		if(!user.isActive) {
			return new Result(StatusEnum.FAIL, 403, null, [{ message: 'Email address is not verified' }]);
		}

		return new Result(StatusEnum.OK, 200, user);
	}

	async activateUser(email) {
		const user = await User.findOne({ where: { email: email }});
		if (!user) {
			return new Result(StatusEnum.FAIL, 404, null, [{ message: 'User not found' }]);
		}

		user.isActive = true;
		await user.save();
		return new Result(StatusEnum.OK);
	}

	async getAllUsersForAdmin(name, surname, email, minPosts, maxPosts) {
		const whereConditions = {};
		if (name) {
			whereConditions.name = { [Sequelize.Op.iLike]: `%${name}%` };
		}
		if (surname) {
			whereConditions.surname = { [Sequelize.Op.iLike]: `%${surname}%` };
		}
		if (email) {
			whereConditions.email = { [Sequelize.Op.iLike]: `%${email}%` };
		}
		if (minPosts || maxPosts) {
			whereConditions.postsCount = {};
			if (minPosts) {
				whereConditions.postsCount[Sequelize.Op.gte] = minPosts;
			}
			if (maxPosts) {
				whereConditions.postsCount[Sequelize.Op.lte] = maxPosts;
			}
		}
	
		try {
			const users = await User.findAll({
				attributes: ['name', 'surname', 'email', 'postsCount', 'followingCount'],
				where: whereConditions
			});
	


			console.log(users);

			return new Result(StatusEnum.OK, 200, users);
		} catch (exception) {
			const errors = parseSequelizeErrors(exception);
			return new Result(StatusEnum.FAIL, 500, null, errors);
		}
	}
	

	async getUserProfile(username) {
		const user = await User.findOne({
			where: { username },
			attributes: ['name', 'surname', 'username', 'email', 'followersCount', 'followingCount']
		});

		if (!user) {
			return new Result(StatusEnum.FAIL, 404, null, [{ message: 'User not found' }]);
		}

		return new Result(StatusEnum.OK, 200, user);
	}

	async findNearbyPosts(username) {
		const userAddress = await User.findOne({ where: { username }, attributes: ['address'] });
		if (!userAddress) {
			return new Result(StatusEnum.FAIL, 404, null, [{ message: 'User not found' }]);
		}

		const result = await PostService.findNearbyPosts(userAddress.address);

		result.data = {
			userAddress: userAddress.address,
			posts: result.data,
		}

		return result;
	}
}

module.exports = new UserService();