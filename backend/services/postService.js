const { Post } = require('../models');
const { UserFollower } = require('../models');
const { Result, StatusEnum } = require('../utils/result');
const { parseSequelizeErrors } = require('../utils/errorParser');
const sequelize = require('../models/index').sequelize;
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

	async postComment(username, postId, comment) {

		const post = await Post.findByPk(postId);
		if (!post) {
			return new Result(StatusEnum.FAIL, 404, null, { message: 'Post not found' });
		}
		post.comments.push({ username, content: comment, commentedAt: new Date().toISOString() });
		await Post.update({ comments: post.comments }, { where: { id: postId } });

		return new Result(StatusEnum.SUCCESS, 200, post);
	}

	async deletePost(username, postId, role) {
		const post = await Post.findByPk(postId);
		if (!post) {
			return new Result(StatusEnum.FAIL, 404, null, { message: 'Post not found' });
		}
		if (post.username !== username && role !== 'admin') {
			return new Result(StatusEnum.FAIL, 403, null, { message: 'Unauthorized' });
		}

		await Post.destroy({ where: { id: postId } });
		return new Result(StatusEnum.SUCCESS, 200, post);
	}

	async likePost(username, postId) {
		const transaction = await sequelize.transaction();

		try {
			const post = await Post.findByPk(postId, {
				transaction,
				lock: transaction.LOCK.UPDATE
			});

			if (!post) {
				await transaction.rollback();
				return new Result(StatusEnum.FAIL, 404, null, { message: 'Post not found' });
			}

			if (!post.likes.some(like => like.username === username)) {
				post.likes.push({ username, likedAt: new Date().toISOString() });
			} else {
				post.likes = post.likes.filter(like => like.username !== username);
			}

			await Post.update({ likes: post.likes }, { where: { id: postId }, transaction });

			await transaction.commit();
			return new Result(StatusEnum.SUCCESS, 200, post);

		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	async updatePost(username, postId, caption) {

		const post = await Post.findByPk(postId);
		if (!post) {
			return new Result(StatusEnum.FAIL, 404, null, { message: 'Post not found' });
		}
		if (post.username !== username) {
			return new Result(StatusEnum.FAIL, 403, null, { message: 'Unauthorized' });
		}
		post.caption = caption;

		await Post.update({ caption:post.caption }, { where: { id: postId } });

		return new Result(StatusEnum.SUCCESS, 200, post);
	}

	async findGuestPosts(){
		const posts = await Post.findAll({ order: [['createdAt', 'DESC']] });
		return new Result(StatusEnum.SUCCESS, 200, posts);
	}

	async findSortedPosts(username) {
		const posts = await Post.findAll({ order: [['createdAt', 'DESC']] });

		const following = await UserFollower.findAll({
			where: { followerId: username },
			attributes: ['followingId']
		});

		const followingIds = following.map(f => f.followingId);

		const postsWithIsLiked = posts.map(post => {
			const isLiked = post.likes.some(like => like.username === username);
			return {
				...post.dataValues,
				isLiked
			};
		});

		const followedPosts = postsWithIsLiked.filter(post => followingIds.includes(post.username));
		const unfollowedPosts = postsWithIsLiked.filter(post => !followingIds.includes(post.username));

		const sortedPosts = [...followedPosts, ...unfollowedPosts];

		return new Result(StatusEnum.SUCCESS, 200, sortedPosts);
	}

	async findFollowedPosts(username) {
		const posts = await Post.findAll({ order: [['createdAt', 'DESC']] });

		const following = await UserFollower.findAll({
			where: { followerId: username },
			attributes: ['followingId']
		});

		const followingIds = following.map(f => f.followingId);

		const postsWithIsLiked = posts.map(post => {
			const isLiked = post.likes.some(like => like.username === username);
			return {
				...post.dataValues,
				isLiked
			};
		});

		const followedPosts = postsWithIsLiked.filter(post => followingIds.includes(post.username));

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

	async findUserPosts(username) {
		const posts = await Post.findAll({ where: { username }, order: [['createdAt', 'DESC']] });
		return new Result(StatusEnum.SUCCESS, 200, posts);
	}
}

module.exports = new PostService();