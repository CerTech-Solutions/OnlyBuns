const { User } = require('../models');
const { Result, StatusEnum } = require('../utils/result');
const { parseSequelizeErrors } = require('../utils/errorParser');
const EmailService = require('./emailService');
const jwtParser = require('../utils/jwtParser');

class UserService {
	async register(user, role) {
		user.role = role;
		user.isActive = false;
		try {
			user = await User.create(user);
		}
		catch (exception) {
				const errors = parseSequelizeErrors(exception);
				return new Result(StatusEnum.FAIL, null, errors);
		}

		if (process.env.NODE_ENV !== 'development') {
			const token = jwtParser.generateToken(user);
			EmailService.sendActivationEmail(user.email, token);
		}

		return new Result(StatusEnum.OK, user);
	}

	async login(email, password) {
		const user = await User.findOne({ where: { email, password } });
		if (!user) {
			return new Result(StatusEnum.FAIL, null, [{ message: 'Invalid email or password' }]);
		}

		if(!user.isActive) {
			return new Result(StatusEnum.FAIL, null, [{ message: 'Email address of user is not verified' }]);
		}

		return new Result(StatusEnum.OK, user);
	}

	async activateUser(email) {
		const user = await User.findOne({ where: { email: email }});
		if (!user) {
			return new Result(StatusEnum.FAIL, null, [{ message: 'User not found' }]);
		}

		user.isActive = true;
		await user.save();
		return new Result(StatusEnum.OK, null);
	}

	async getAllUsers() {
		const users = await User.findAll({ attributes: { exclude: ['password'] } });
		return new Result(StatusEnum.OK, users);
	}
}

module.exports = new UserService();