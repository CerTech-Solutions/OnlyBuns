const { validationResult } = require('express-validator');

exports.parseValidationErrors = (req, res, next) => {
	const result = validationResult(req)

	const errors = result.array().map(error => {
		return {
			path: error.path,
			message: error.msg,
		}
	});

	if(errors.length !== 0) {
		return res.status(400).json({ errors: errors });
	}

	next();
}

exports.parseSequelizeErrors = (exception) => {
	const errors = exception.errors.map(error => {
		return {
			path: error.path,
			message: error.message,
	}});

	return errors;
}
