const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { validationResult } = require('express-validator');
const { registerValidator } = require('../validators/userValidators');
const { generateToken } = require('../utils/jwtParser');

router.post('/register',
	...registerValidator,
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ error: errors.array() });
		}

		const { username, email, password } = req.body;
		const role = 'user';

		try {
			const newUser = await User.create({ username, email, password, role });
			const payload = {
				username: newUser.username,
				role: newUser.role,
			}
			const token = generateToken(payload);

			return res.status(201).json({ message: 'User registered successfully!', token });
		}
		catch (error) {
			return res.status(500).json({ error: error.message });
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