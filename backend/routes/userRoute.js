const { User } = require('../models');
const { Result, StatusEnum } = require('../utils/result');
const UserService = require('../services/userService');
const PostService = require('../services/postService');
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
			return res.status(result.code).json({ errors: result.errors });
		}

		return res.status(201).json({ message: 'User registered successfully!'});
});

router.post('/register/admin',
	...registerValidator,
	parseValidationErrors,
	jwtParser.verifyToken('admin'),
	async (req, res) => {
		const newUser = req.body;
		const result = await UserService.register(newUser, 'admin');

		if (result.status === StatusEnum.FAIL) {
			return res.status(result.code).json({ errors: result.errors });
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
			return res.status(result.code).json({ errors: result.errors });
		}

		const user = result.data;
		const token = jwtParser.generateToken(user);
		res.cookie('token', token, {
				httpOnly: true,
		});

		return res.status(result.code).json({
			message: 'Login successful!',
			username: user.username,
			role: user.role
		});
});

router.post('/logout',
	async (req, res) => {
		res.clearCookie('token');
		return res.status(200).json({ message: 'Logout successful!' });
});

router.get('/activate/:token',
	async (req, res) => {
		let result;

		const token = req.params.token;
		result = jwtParser.decodeToken(token);
		if (result.status === StatusEnum.FAIL) {
			return res.status(400).json({ message: 'Invalid activation token' });
		}

		const user = result.data;
		result = await UserService.activateUser(user.email);

		if(result.status === StatusEnum.FAIL) {
			return res.status(result.code).json({ errors: result.errors });
		}

		return res.status(result.code).json({ message: 'Account activated successfully!' });
});

router.get('/users',
	jwtParser.verifyToken('admin'),
	async (req, res) => {
		const { name, surname, email, minPosts, maxPosts} = req.query;

		const result = await UserService.getAllUsersForAdmin(name, surname, email, minPosts, maxPosts);

		return res.status(result.code).json(result.data);
});

router.get('/profile/:username',
	async (req, res) => {
		const username = req.params.username;

		const result = await UserService.getUserProfile(username);

		if (result.status === StatusEnum.FAIL) {
			return res.status(result.code).json({ errors: result.errors });
		}

		return res.status(result.code).json(result.data);
});

router.get('/nearby/:username',
	jwtParser.extractTokenUser,
	async (req, res) => {
		if (req.user === null) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const paramUsername = req.params.username;
		const reqUser = req.user;

		if (paramUsername !== reqUser.username) {
			return res.status(403).json({ message: 'Forbidden' });
		}

		const result = await UserService.findNearbyPosts(paramUsername);

		if (result.status === StatusEnum.FAIL) {
			return res.status(result.code).json({ errors: result.errors });
		}

		return res.status(result.code).json(result.data);
});

router.get('/test',
	jwtParser.verifyToken('admin'),
	async (req, res) => {
		return res.status(200).json({ message: 'Only ADMINS can se this' });
});

module.exports = router;