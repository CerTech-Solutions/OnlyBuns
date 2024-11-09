const { Post } = require('../models');
const { UserFollower } = require('../models');
const { Result, StatusEnum } = require('../utils/result');
const { parseSequelizeErrors } = require('../utils/errorParser');
const GeoCalculator = require('../utils/geoCalculator');

const searchRadius = 3000; // in meters

class PostService {
	async findNearbyPosts(location) {
		const posts = await Post.findAll();

		const nearbyPosts = posts.filter(post => {
			const distance = GeoCalculator.calculateDistance(location, post.location);
			return distance <= searchRadius;
		});

		return new Result(StatusEnum.SUCCESS, 200, nearbyPosts);
	}

	async findFollowedPosts(username) {
		const posts = await Post.findAll();
		
		const following = await UserFollower.findAll({ where: { followerId: username }, attributes: ['followingId']});
	
		const followedPosts = posts
			.filter(post => following.some(f => f.followingId === post.username))
	
		return new Result(StatusEnum.SUCCESS, 200, followedPosts);
	}

	async create(post) {
		try {
			if (post.image && !(post.image instanceof Buffer)) {
				throw new Error("Image data must be in buffer format.");
			}
	
			post = await Post.create(post);
		} catch (exception) {
			const errors = parseSequelizeErrors(exception);
			return new Result(StatusEnum.FAIL, 500, null, errors);
		}
	
		return new Result(StatusEnum.SUCCESS, 201, post);
	}
}

module.exports = new PostService();