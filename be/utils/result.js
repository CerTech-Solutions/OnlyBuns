const StatusEnum = {
	OK: 'OK',
	FAIL: 'FAIL',
}

class Result {
	constructor(status = StatusEnum.OK, data = null, errors = []) {
		this.status = status;
		this.data = data;
		this.errors = errors;
	}
}

module.exports = { Result, StatusEnum };