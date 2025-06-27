const bcrypt = require('bcrypt');
const dotenv = require('dotenv')
dotenv.config()
const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10);

function hashPassword(password) {
	return bcrypt.hashSync(password, saltRounds);
}

function checkPasswordHash(password, hash) {
	return bcrypt.compareSync(password, hash);
}

module.exports = { hashPassword, checkPasswordHash }