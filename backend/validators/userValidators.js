const { body } = require('express-validator');

exports.registerValidator = [
	body('name').notEmpty().withMessage('Name must not be empty'),
	body('surname').notEmpty().withMessage('Surname must not be empty'),
	body('username').isLength({ min: 6 }).withMessage('Username must be at least 6 characters long'),
	body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
	body('email').isEmail().withMessage('Email must be valid'),
	body('address').notEmpty().withMessage('Address must not be empty'),
];

exports.loginValidator = [
	body('email').notEmpty().withMessage('Email must not be empty'),
	body('password').notEmpty().withMessage('Password must not be empty'),
]