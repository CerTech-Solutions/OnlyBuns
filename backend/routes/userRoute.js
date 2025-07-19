const { Result, StatusEnum } = require('../utils/result');
const UserService = require('../services/userService');
const { parseValidationErrors } = require('../utils/errorParser');
const { registerValidator, loginValidator } = require('../validators/userValidators');
const { activeUsersGauge } = require('../utils/metrics');
const jwtParser = require('../utils/jwtParser');
const rateLimiter = require('../utils/rateLimiter');
const ms = require('ms');
const express = require('express');
const router = express.Router();

router.get('/test',
	jwtParser.verifyToken('admin'),
	async (req, res) => {
		return res.status(200).json({ message: 'Only ADMINS can se this' });
	});

router.post('/register',
	rateLimiter.rateLimit(15, 1000 * 60 * 10),
	...registerValidator,
	parseValidationErrors,
	async (req, res) => {

		const user = req.body;
		const result = await UserService.register(user, 'user');

		if (result.status === StatusEnum.FAIL) {
			return res.status(result.code).json({ errors: result.errors });
		}

		return res.status(201).json({ message: 'User registered successfully!' });
	});

router.post('/register/admin',
	rateLimiter.rateLimit(15, 1000 * 60 * 10),
	...registerValidator,
	parseValidationErrors,
	jwtParser.verifyToken('admin'),
	async (req, res) => {
		const newUser = req.body;
		const result = await UserService.register(newUser, 'admin');

		if (result.status === StatusEnum.FAIL) {
			return res.status(result.code).json({ errors: result.errors });
		}

		return res.status(201).json({ message: 'Admin registered successfully!' });
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
			maxAge: ms(process.env.COOKIE_EXPIRES_IN)
		});

		activeUsersGauge.inc();
		return res.status(result.code).json({
			message: 'Login successful!',
			username: user.username,
			role: user.role
		});
	});

router.post('/logout',
	async (req, res) => {
		res.clearCookie('token');

		activeUsersGauge.dec();
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

		if (result.status === StatusEnum.FAIL) {
			return res.status(result.code).json({ errors: result.errors });
		}

		return res.status(result.code).json({ message: 'Account activated successfully!' });
	});
	
	
	router.get('/users', jwtParser.verifyToken('admin'), async (req, res) => {
		const { name, surname, email, minPosts, maxPosts, page, limit } = req.query;
	
		console.log('Query parameters:', { name, surname, email, minPosts, maxPosts, page, limit });
		const result = await UserService.getAllUsersForAdmin(
			name, surname, email, minPosts, maxPosts, 
			parseInt(page) || 1, parseInt(limit) || 5
		);
	
		return res.status(result.code).json(result.data);
	});

router.get('/profile/:username',
	jwtParser.extractTokenUser,
	async (req, res) => {
		const username = req.params.username;
		const result = await UserService.getUserProfile(username, req.user.username);

		if (result.status === StatusEnum.FAIL) {
			return res.status(result.code).json({ errors: result.errors });
		}

		return res.status(result.code).json(result.data);
	});

router.post('/follow',
	rateLimiter.rateLimit(5, 1000 * 60),
	jwtParser.extractTokenUser,
	async (req, res) => {

		if (req.user === null) {
			return res.status(401).json({ message: 'Unauthorized' });
		}
		const followedUsername = req.body.username;
		const followerUsername = req.user.username;
		if (followedUsername === followerUsername) {
			return res.status(400).json({ message: 'You cannot follow yourself' });
		}

		const result = await UserService.followUser(followerUsername, followedUsername);


		return res.status(result.code).json(result.data);
	});


	router.get('/analytics', jwtParser.extractTokenUser, async (req, res) => {
		
		
		
		if (req.user === null) {
			return res.status(401).json({ message: 'Unauthorized' });
		}
		if( req.user.role !== 'admin'){
			return res.status(403).json({ message: 'Forbidden' });
		}
	
		const result = await UserService.getGlobalUserAnalytics();

		console.log('Analytics result:', result); // Debugging line to check the result structure	

		if (result.status === StatusEnum.FAIL) {
			return res.status(result.code).json({ errors: result.errors });
		}
		return res.status(result.code).json(result.data);
	})
	





router.post('/unfollow',
	jwtParser.extractTokenUser,
	async (req, res) => {

		if (req.user === null) {
			return res.status(401).json({ message: 'Unauthorized' });
		}
		const followedUsername = req.body.username;
		const followerUsername = req.user.username;
		if (followedUsername === followerUsername) {
			return res.status(400).json({ message: 'You cannot unfollow yourself' });
		}

		const result = await UserService.unfollowUser(followerUsername, followedUsername);

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


router.get('/followers/:username',
	async (req, res) => {
		const username = req.params.username;

		const result = await UserService.getUserFollowers(username);

		if (result.status === StatusEnum.FAIL) {
			return res.status(result.code).json({ errors: result.errors });
		}

		return res.status(result.code).json(result.data);
	});

router.get('/following/:username',
	async (req, res) => {
		const username = req.params.username;

		const result = await UserService.getUserFollowing(username);

		if (result.status === StatusEnum.FAIL) {
			return res.status(result.code).json({ errors: result.errors });
		}

		return res.status(result.code).json(result.data);
	});
router.get('/chatfollowing', 
	jwtParser.extractTokenUser,
	async (req, res) => {
		if (req.user === null) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const username = req.user.username;

		const result = await UserService.getChatFollowing(username);

		if (result.status === StatusEnum.FAIL) {
			return res.status(result.code).json({ errors: result.errors });
		}

		return res.status(result.code).json(result.data);
	});




module.exports = router;