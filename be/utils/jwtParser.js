const jwt = require('jsonwebtoken');

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

exports.verifyToken = (req, res, next) => {
	let token = '';

	try {
		const authHeader = req.header('Authorization');
		token = authHeader.split(' ')[1];
	}
	catch (err) {
		return res.status(401).json({ message: 'No Authorization header' });
	}

	if(token === '') {
		return res.status(401).json({ message: 'No token in the Authorization header' });
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
		req.token = decoded;
	}
	catch(err) {
		return res.status(403).json({ message: 'Forbidden' });
	}

	next();
}

exports.decodeToken = (token) => {
	return jwt.verify(token, process.env.JWT_SECRET_KEY);
}