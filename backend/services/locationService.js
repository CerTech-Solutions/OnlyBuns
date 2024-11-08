const axios = require('axios');

const apiKey = '7288d9ea8a0145e9a92b6afa8645b474';

class LocationService {
    async getLocationName(lat, lng) {
        try {
            const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}`);
            const locationName = response.data.results[0]?.formatted || "Unknown location";
            return locationName;
        } catch (error) {
            throw new Error(`Error fetching location name: ${error.message}`);
        }
    }

    async getSuggestions(query) {
        try {
            const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json`, {
                params: {
                    q: query,
                    key: apiKey,
                    limit: 5
                }
            });
            return response.data.results;
        } catch (error) {
            throw new Error(`Error fetching location suggestions: ${error.message}`);
        }
    }
}



module.exports = new LocationService();
