const jwt = require('jsonwebtoken');
const { Result, StatusEnum } = require('./result');

exports.generateToken = (user) => {
	const payload = {
		username: user.username,
		email: user.email,
		role: user.role
	};

	return jwt.sign(
		payload,
		process.env.JWT_SECRET_KEY,
		{ expiresIn: process.env.JWT_EXPIRES_IN }
	);
}

exports.verifyToken = (role) => (req, res, next) => {
	const token = req.cookies ? req.cookies.token : null;

	if (!token) {
		return res.status(401).json({ message: 'Unauthorized access' });
	}

	const result = exports.decodeToken(token);
	if (result.status === StatusEnum.FAIL) {
		return res.status(result.code).json({ message: 'Unauthorized access' });
	}

	const tokenUser = result.data;
	if (role && role !== tokenUser.role) {
		return res.status(403).json({ message: 'Forbidden' });
	}

	req.user = tokenUser;
	next();
}

exports.extractTokenUser = (req, res, next) => {
	const token = req.cookies ? req.cookies.token : null;
	if (!token) {
		req.user = null;
		next();
	}

	const result = exports.decodeToken(token);
	if (result.status === StatusEnum.FAIL) {
		req.user = null;
		next();
	}

	const tokenUser = result.data;
	req.user = tokenUser;
	next();
}

exports.decodeToken = (token) => {
	let decoded = null;
	try {
		decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
	}
	catch (exception) {
		return new Result(StatusEnum.FAIL, 401);
	}

	return new Result(StatusEnum.OK, 200, decoded);
}