const { Sequelize } = require('sequelize');
const { User } = require('../models');
const { parseValidationErrors } = require('../utils/parseValidationErrors');
const { registerValidator, loginValidator } = require('../validators/userValidators');
const jwtParser = require('../utils/jwtParser');

const express = require('express');
const router = express.Router();

router.post('/register',
	...registerValidator,
	parseValidationErrors,
	async (req, res) => {

		const user = req.body;
		user.role = 'user';

		try {
			const newUser = await User.create(user);

			// TODO: add mail sending
			const token = jwtParser.generateToken(newUser);

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
	parseValidationErrors,
	jwtParser.verifyToken,
	async (req, res) => {
		if(req.token.role !== 'admin') {
			return res.status(403);
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
	parseValidationErrors,
	async (req, res) => {
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