const express = require('express');
const router = express.Router();
const StatsService = require('../services/statsService');
const jwtParser = require('../utils/jwtParser');

router.get('/trends',
	jwtParser.extractTokenUser,
	async (req, res) => {
		if (req.user == null) {
			return res.status(401).json({ message: 'Unauthorized!' });
		}

		const stats = await StatsService.getLatestTrend();
		return res.status(200).json(stats);
	});

module.exports = router;