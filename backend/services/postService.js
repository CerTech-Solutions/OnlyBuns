const { Post } = require('../models');
const { Result, StatusEnum } = require('../utils/result');
const GeoCalculator = require('../utils/geoCalculator');

const searchRadius = 3000; // in meters

class PostService {
	async findNearbyPosts(location) {
		const posts = await Post.findAll();

		const nearbyPosts = posts.filter(post => {
			const distance = GeoCalculator.calculateDistance(location, post.location);
			return distance <= searchRadius;
		});

		if (nearbyPosts.length === 0) {
			return new Result(StatusEnum.FAIL, 404, null, [{ message: 'No posts found nearby' }]);
		}

		return new Result(StatusEnum.SUCCESS, 200, nearbyPosts);
	}
}

module.exports = new PostService();