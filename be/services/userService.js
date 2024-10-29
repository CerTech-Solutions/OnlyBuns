const { User } = require('../models');
const { Result, StatusEnum } = require('../utils/result');

class UserService {
	async register(user, role) {
		user.role = role;
		try {
				const newUser = await User.create(user);
				return new Result(StatusEnum.OK, newUser);
		}
		catch (err) {
				return new Result(StatusEnum.FAIL, null, []);
		}
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
}

module.exports = new UserService();