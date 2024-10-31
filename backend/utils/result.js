StatusEnum = {
	OK: 'OK',
	FAIL: 'FAIL'
};

class Result {
	constructor(status = StatusEnum.OK, code = 200, data = null, errors = []) {
		this.status = status;
		this.code = code;
		this.data = data;
		this.errors = errors;
	}
}

module.exports = { Result, StatusEnum };