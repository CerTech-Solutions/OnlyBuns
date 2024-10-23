const { body } = require('express-validator');

exports.registerValidator = [
	body('username').isLength({ min: 4, max: 10 }).withMessage('Username must be between 4 and 10 characters long'),
	body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
	body('email').isEmail().withMessage('Email must be valid'),
];