const { User } = require('../models');
const { StatusEnum } = require('../utils/result');
const UserService = require('../services/userService');
const { parseValidationErrors } = require('../utils/errorParser');
const { registerValidator, loginValidator } = require('../validators/userValidators');
const jwtParser = require('../utils/jwtParser');

const express = require('express');
const router = express.Router();

router.post('/register',
	...registerValidator,
	parseValidationErrors,
	async (req, res) => {

		const user = req.body;
		const result = await UserService.register(user, 'user');

		if (result.status === StatusEnum.FAIL) {
			return res.status(400).json({ errors: result.errors });
		}

		return res.status(201).json({ message: 'User registered successfully!'});
});

router.post('/register/admin',
	...registerValidator,
	parseValidationErrors,
	jwtParser.verifyToken,
	async (req, res) => {
		if(req.token.role !== 'admin') {
			return res.status(403);
		}

		const user = req.body;
		const result = await UserService.register(user, 'admin');

		if (result.status === StatusEnum.FAIL) {
			return res.status(400).json({ errors: result.errors });
		}

		return res.status(201).json({ message: 'Admin registered successfully!'});
});

router.post('/login',
	...loginValidator,
	parseValidationErrors,
	async (req, res) => {
		const { email, password } = req.body;

		const result = await UserService.login(email, password);

		if (result.status === StatusEnum.FAIL) {
			return res.status(400).json({ errors: result.errors });
		}

		const user = result.data;
		const token = jwtParser.generateToken(user);
		return res.status(200).json({ token });
});

router.post('/activate/:token',
	async (req, res) => {
		let email = '';

		try {
			const token = req.params.token;
			decoded = jwtParser.decodeToken(token);
			if (decoded.email === undefined) {
				throw new Error();
			}
			email = decoded.email;
		}
		catch (err) {
			return res.status(400).json({ message: 'Invalid activation token' });
		}

		const result = await UserService.activateUser(email);

		if(result.status === StatusEnum.FAIL) {
			return res.status(400).json({ errors: result.errors });
		}

		return res.status(200).json({ message: 'Account activated successfully!' });
});

router.get('/',
	jwtParser.verifyToken,
	async (req, res) => {
	if(req.token.role !== 'admin') {
		return res.status(403);
	}

	try {
		const users = await User.findAll();
		return res.status(200).json(users);
	}
	catch (err) {
		return res.status(500);
	}
});

module.exports = router;