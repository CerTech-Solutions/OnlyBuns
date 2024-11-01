const { User } = require('../models');
const { Result, StatusEnum } = require('../utils/result');
const { parseSequelizeErrors } = require('../utils/errorParser');
const EmailService = require('./emailService');
const jwtParser = require('../utils/jwtParser');

class UserService {
	async register(user, role) {
		user.role = role;
		user.isActive = true;

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
		const user = await User.findOne({ where: { email, password } });
		if (!user) {
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

	async getAllUsersForAdmin() {
		let users = await User.findAll({
				attributes: ['name', 'surname', 'email', 'postsCount', 'followingCount']
		});

		users = users.map(user => user.dataValues);
		return new Result(StatusEnum.OK, 200, users);
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
}

module.exports = new UserService();