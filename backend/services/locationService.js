const axios = require('axios');

class LocationService {
  async getLocationName(lat, lng) {
    try {
      const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${process.env.LOCATION_API_KEY}`);
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
          key: process.env.LOCATION_API_KEY,
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
