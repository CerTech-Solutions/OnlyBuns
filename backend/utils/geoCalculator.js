

class GeoCalculator {
	static degToRad(degrees) {
		return degrees * Math.PI / 180;
	}

	static calculateDistance(location1, location2) {

		const lat1 = location1.latitude;
		const lon1 = location1.longitude;
		const lat2 = location2.latitude;
		const lon2 = location2.longitude;

		const R = 6371e3; // metres
		const φ1 = GeoCalculator.degToRad(lat1); // φ, λ in radians
		const φ2 = GeoCalculator.degToRad(lat2);
		const Δφ = GeoCalculator.degToRad(lat2 - lat1);
		const Δλ = GeoCalculator.degToRad(lon2 - lon1);

		const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
			Math.cos(φ1) * Math.cos(φ2) *
			Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		const distance = R * c; // in metres

		return distance;
	}
}

module.exports = GeoCalculator;