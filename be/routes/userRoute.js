const express = require('express');
const router = express.Router();
const { Sequelize } = require('sequelize');
const { User } = require('../models');
const { validationResult } = require('express-validator');
const { registerValidator, loginValidator } = require('../validators/userValidators');
const jwtParser = require('../utils/jwtParser');

router.post('/register',
	...registerValidator,
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ error: errors.array() });
		}

		const user = req.body;
		user.role = 'user';

		try {
			const newUser = await User.create(user);
			const token = jwtParser.generateToken(newUser);

			// TODO: add mail sending

			return res.status(201).json({ message: 'User registered successfully!'});
		}
		catch (err) {
			if(err instanceof Sequelize.UniqueConstraintError) {
				return res.status(400).json({ error: 'Username or email already exists' });
			}

			return res.status(500).json({ error: err.message });
		}
});

router.post('/register/admin',
	...registerValidator,
	jwtParser.verifyToken,
	async (req, res) => {
		if(req.token.role !== 'admin') {
			return res.status(403);
		}

		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ error: errors.array() });
		}

		const user = req.body;
		user.role = 'admin';

		try {
			const newUser = await User.create(user);

			return res.status(201).json({ message: 'Admin registered successfully!'});
		}
		catch (err) {
			if(err instanceof Sequelize.UniqueConstraintError) {
				return res.status(400).json({ error: 'Username or email already exists' });
			}

			return res.status(500).json({ error: err.message });
		}
});

router.post('/login',
	...loginValidator,
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ error: errors.array() });
		}

		const { email, password } = req.body;

		try {
			const user = await User.findOne({ where: { email, password } });

			if (!user) {
				return res.status(401).json({ error: 'Invalid email or password' });
			}

			if(!user.isActive) {
				return res.status(403).json({ error: 'Email address of user is not verified'});
			}

			const token = jwtParser.generateToken(user);
			return res.status(200).json({ token });
		}
		catch (err) {
			return res.status(500).json({ error: err.message });
		}
});

router.post('/activate/:token',
	async (req, res) => {
		let decoded = '';

		try {
			const token = req.params.token;
			decoded = jwtParser.decodeToken(token);
		}
		catch (err) {
			return res.status(400).json({ error: 'Invalid activation token' });
		}

		try {
			const user = await User.findOne({ where: { email: decoded.email }});

			user.isActive = true;
			await user.save();

			return res.status(200).json({ message: 'Account activated successfully!' });
		}
		catch (err) {
			return res.status(500).json({ error: err.message });
		}
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
	catch (error) {
		return res.status(500).json({ error: error.message });
	}
});

module.exports = router;