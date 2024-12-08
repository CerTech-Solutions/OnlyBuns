const { Result, StatusEnum } = require('../utils/result');
const LocationService = require('../services/locationService');
const express = require('express');
const router = express.Router();

router.get('/locationName/:lat/:lng', async (req, res) => {
    try {
        const { lat, lng } = req.params;
        const locationName = await LocationService.getLocationName(lat, lng);
        res.json(new Result(StatusEnum.SUCCESS, locationName));
    } catch (error) {
        res.status(500).json(new Result(StatusEnum.ERROR, error.message));
    }
});

router.get('/suggestions', async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }
    
    try {
        const suggestions = await LocationService.getSuggestions(query);
        res.json(suggestions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;