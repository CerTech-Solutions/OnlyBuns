const { Post } = require('../models');
const { Op } = require('sequelize');
const { MongoClient } = require('mongodb');

const weekAgo = new Date();
const monthAgo = new Date();
weekAgo.setDate(weekAgo.getDate() - 7);
monthAgo.setMonth(monthAgo.getMonth() - 1);
const recentMostLikedCount = 5;
const totalMostLikedCount = 10;
const recentTopUsersCount = 10;

const postAttributes = [
	'id',
	'username',
	'imagePath',
	'caption',
	'likesCount',
];

const mongoConfig = {
	url: `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_NAME}`,
	options: {
		auth: {
			username: process.env.MONGO_USERNAME,
			password: process.env.MONGO_PASSWORD
		},
		authSource: 'admin'
	}
};

class StatsService {
	constructor() {
		this.client = new MongoClient(mongoConfig.url, mongoConfig.options);
		this.trendsCollection = this.client.db(process.env.MONGO_NAME).collection('trends');

		// create new collection here
	}

	async withConnection(operation) {
		try {
			await this.client.connect();
			return await operation();
		} catch (error) {
			throw error;
		} finally {
			await this.client.close();
		}
	}

	async getRecentActiveUsers() {
    const posts = await Post.findAll({
        attributes: ['likes'],
        raw: true
    });

		const allLikes = posts.reduce((acc, post) => {
        if (post.likes && Array.isArray(post.likes)) {
            return acc.concat(post.likes);
        }
        return acc;
    }, []);

		const recentLikes = allLikes.filter(like => {
			const likedAt = new Date(like.likedAt);
			return likedAt >= weekAgo;
		});

		const likesByUsername = {};
		recentLikes.forEach(like => {
			if (!likesByUsername[like.username]) {
				likesByUsername[like.username] = 0;
			}
			likesByUsername[like.username]++;
		});

		const sortedUsers = Object.entries(likesByUsername)
			.sort(([, a], [, b]) => b - a);

		const recentActiveUsers = sortedUsers.slice(0, recentTopUsersCount)
		.map(([username, likesCount]) => ({
			username,
			likesCount
		}));

		return recentActiveUsers;
	}

	async generateTrendsData() {
		const totalPostsCount = await Post.count();

		const recentPostsCount = await Post.count({
			where: {
				createdAt: {
					[Op.gte]: monthAgo
				}
			}
		});

		const recentMostLiked = await Post.findAll({
			attributes: postAttributes,
			where: {
				createdAt: {
					[Op.gte]: weekAgo
				}
			},
			order: [['likesCount', 'DESC']],
			limit: recentMostLikedCount,
			raw: true
		});

		const totalMostLiked = await Post.findAll({
			attributes: postAttributes,
			order: [['likesCount', 'DESC']],
			limit: totalMostLikedCount,
			raw: true
		});

		const recentActiveUsers = await this.getRecentActiveUsers();

		const trend = {
			createdAt: new Date().toISOString(),
			totalPostsCount,
			recentPostsCount,
			recentMostLiked,
			totalMostLiked,
			recentActiveUsers
		}

		await this.saveTrendsData(trend);
	}

	async saveTrendsData(trend) {
		return this.withConnection(async () => {
			await this.trendsCollection.insertOne(trend);
		});
	}

	async getLatestTrend() {
		return this.withConnection(async () => {
			const trend = await this.trendsCollection
				.find()
				.sort({ createdAt: -1 })
				.limit(1)
				.toArray();

			return trend[0];
		});
	}
}

const statsService = new StatsService();
console.log('Generating trends data');
statsService.generateTrendsData();

module.exports = statsService;