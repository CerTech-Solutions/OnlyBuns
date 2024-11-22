const cron = require('node-cron');
const { Post } = require('../models');
const { Op } = require('sequelize');
const { MongoClient } = require('mongodb');

const daysAgo = new Date();
const monthsAgo = new Date();
daysAgo.setDate(daysAgo.getDate() - 7);
monthsAgo.setMonth(monthsAgo.getMonth() - 1);
const recentMostLikedCount = 5;
const totalMostLikedCount = 10;

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

class TrendsService {
	constructor() {
		this.client = new MongoClient(mongoConfig.url, mongoConfig.options);
		this.collection = this.client.db(process.env.MONGO_NAME).collection('trends');
	}

	async generateTrendsData() {
		const totalPostsCount = await Post.count();

		const recentPostsCount = await Post.count({
			where: {
				createdAt: {
					[Op.gte]: monthsAgo
				}
			}
		});

		const recentMostLiked = await Post.findAll({
			attributes: postAttributes,
			where: {
				createdAt: {
					[Op.gte]: daysAgo
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

		const trend = {
			createdAt: new Date().toISOString(),
			totalPostsCount,
			recentPostsCount,
			recentMostLiked,
			totalMostLiked
		}

		await this.saveTrendsData(trend);
	}

	async saveTrendsData(trend) {

		try {
			await this.client.connect();
			await this.collection.insertOne(trend);
		}
		catch (error) {
			console.log(error);
		}
		finally {
			await this.client.close();
		}
	}

	async getLatestTrend() {
		try {
			await this.client.connect();
			const trend = await this.collection
				.find()
				.sort({ createdAt: -1 })
				.limit(1)
				.toArray();

			return trend;
		}
		catch (error) {
			console.log(error);
		}
		finally {
			await this.client.close();
		}
	}
}

const trendsService = new TrendsService();

cron.schedule(process.env.TRENDS_INTERVAL, async () => {
	trendsService.generateTrendsData();
});

// trendsService.generateTrendsData();
// console.log('Trends data is being generated and stored in cache');

module.exports = trendsService;