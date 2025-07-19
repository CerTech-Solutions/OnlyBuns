const crypto = require('crypto');

class BloomFilter {
	constructor(expectedElements = 10000, falsePositiveRate = 0.01) {
		this.size = Math.ceil(-(expectedElements * Math.log(falsePositiveRate)) / (Math.log(2) ** 2));
		this.hashFunctions = Math.ceil((this.size / expectedElements) * Math.log(2));
		this.bits = new Array(this.size).fill(0);
	}

	_hash(item, seed) {
		return crypto.createHash('md5').update(item + seed).digest('hex');
	}

	add(item) {
		for (let i = 0; i < this.hashFunctions; i++) {
			const hash = parseInt(this._hash(item, i), 16);
			const index = hash % this.size;
			this.bits[index] = 1;
		}
	}

	mightContain(item) {
		for (let i = 0; i < this.hashFunctions; i++) {
			const hash = parseInt(this._hash(item, i), 16);
			const index = hash % this.size;
			if (this.bits[index] === 0) {
				return false; // Definitely not in set
			}
		}
		return true; // Might be in set
	}
}

module.exports = BloomFilter;