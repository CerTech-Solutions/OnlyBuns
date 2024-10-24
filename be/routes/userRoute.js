const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { validationResult } = require('express-validator');
const { registerValidator, loginValidator } = require('../validators/userValidators');
const { generateToken } = require('../utils/jwtParser');

router.post('/register',
	...registerValidator,
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ error: errors.array() });
		}

		req.body.role = 'user';
		const user = req.body;

		try {
			const newUser = await User.create(user);

			return res.status(201).json({ message: 'User registered successfully!'});
		}
		catch (err) {
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

			const payload = {
				username: user.username,
				email: user.email,
				role: user.role
			};
			const token = generateToken(payload);
			return res.status(200).json({ token });
		}
		catch (err) {
			return res.status(500).json({ error: err.message });
		}
});

router.get('/', async (req, res) => {
	try {
		const users = await User.findAll();
		return res.status(200).json(users);
	}
	catch (error) {
		return res.status(500).json({ error: error.message });
	}
});

module.exports = router;