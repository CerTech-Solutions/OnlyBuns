const { body } = require('express-validator');

exports.registerValidator = [
	body('username').isLength({ min: 5, max: 15 }).withMessage('Username must be between 5 and 15 characters long'),
	body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
	body('email').isEmail().withMessage('Email must be valid'),
	body('address').notEmpty().withMessage('Address must not be empty'),
];

exports.loginValidator = [
	body('email').isEmail().withMessage('Email must be valid'),
	body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
]