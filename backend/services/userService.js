const { User, UserFollower } = require('../models');
const { Result, StatusEnum } = require('../utils/result');
const { parseSequelizeErrors } = require('../utils/errorParser');
const EmailService = require('./emailService');
const PostService = require('./postService');
const jwtParser = require('../utils/jwtParser');
const { hashPassword, checkPasswordHash } = require('../utils/passwordHasher');
const { use, lock } = require('../routes/postRoute');
const sequelize = require('../models/index').sequelize;
const { raw } = require('express');

const { Op } = require('sequelize');

class UserService {
	async register(user, role) {
		user.role = role;
		user.isActive = true;

		user.password = hashPassword(user.password);

		if (process.env.ENABLE_EMAIL_SERVICE === 'true') {
			user.isActive = false;
		}

		try {
			user = await User.create(user);
		}
		catch (exception) {
			const errors = parseSequelizeErrors(exception);
			return new Result(StatusEnum.FAIL, 500, null, errors);
		}

		if (process.env.ENABLE_EMAIL_SERVICE === 'true') {
			const token = jwtParser.generateToken(user);
			EmailService.sendActivationEmail(user.email, token);
		}

		return new Result(StatusEnum.OK, 201, user);
	}

	async followUser(username, userToFollow) {
		const transaction = await sequelize.transaction();

		try {
			const user = await User.findOne({ where: { username }, transaction: transaction, lock: transaction.LOCK.UPDATE });
			const userToFollowRecord = await User.findOne({ where: { username: userToFollow }, transaction: transaction, lock: transaction.LOCK.UPDATE });

			if (!user || !userToFollowRecord) {
				await transaction.rollback();
				return new Result(StatusEnum.FAIL, 404, null, [{ message: 'User not found' }]);
			}

			const alreadyFollowing = await UserFollower.findOne({
				where: { followerId: username, followingId: userToFollowRecord.username },
				transaction: transaction, lock: transaction.LOCK.UPDATE
			});

			if (alreadyFollowing) {
				await transaction.rollback();
				return new Result(StatusEnum.FAIL, 400, null, [{ message: 'Already following this user' }]);
			}

			await UserFollower.create(
				{ followerId: username, followingId: userToFollowRecord.username },
				{ transaction: transaction, lock: transaction.LOCK.UPDATE }
			);
			user.followingCount += 1;
			userToFollowRecord.followersCount += 1;



			await User.update(
				{ followingCount: user.followingCount },
				{ where: { username: user.username }, transaction: transaction, lock: transaction.LOCK.UPDATE }
			);

			const result = await User.update(
				{ followersCount: userToFollowRecord.followersCount },
				{ where: { username: userToFollowRecord.username }, transaction: transaction, lock: transaction.LOCK.UPDATE }
			);

			await transaction.commit();
			return new Result(StatusEnum.OK, 200, userToFollowRecord);

		} catch (error) {
			await Promise.allSettled([
				transaction.rollback(),
			]);

			console.error("Error during followUser operation:", error);
			const errors = parseSequelizeErrors(error);
			return new Result(StatusEnum.FAIL, 500, null, errors);
		}
	}

	async unfollowUser(username, userToUnfollow) {
		const transaction = await sequelize.transaction(); // Use a single transaction

		try {
			// Fetch the user and the target user within the same transaction
			const user = await User.findOne({ where: { username }, transaction });
			const userToUnfollowRecord = await User.findOne({ where: { username: userToUnfollow }, transaction: transaction, lock: transaction.LOCK.UPDATE });

			if (!user || !userToUnfollowRecord) {
				await transaction.rollback();
				return new Result(StatusEnum.FAIL, 404, null, [{ message: 'User not found' }]);
			}

			// Check if the user is currently following the target user
			const existingFollow = await UserFollower.findOne({
				where: { followerId: username, followingId: userToUnfollowRecord.username },
				transaction,
				lock: transaction.LOCK.UPDATE
			});

			if (!existingFollow) {
				await transaction.rollback();
				return new Result(StatusEnum.FAIL, 400, null, [{ message: 'Not following this user' }]);
			}

			// Delete the follower relationship
			await UserFollower.destroy({
				where: { followerId: username, followingId: userToUnfollowRecord.username },
				transaction: transaction,
				lock: transaction.LOCK.UPDATE
			});

			// Update follower and following counts
			user.followingCount -= 1;
			userToUnfollowRecord.followersCount -= 1;

			await User.update(
				{ followingCount: user.followingCount },
				{
					where: { username: user.username }, transaction: transaction,
					lock: transaction.LOCK.UPDATE
				}
			);

			await User.update(
				{ followersCount: userToUnfollowRecord.followersCount },
				{ where: { username: userToUnfollowRecord.username }, transaction: transaction, lock: transaction.LOCK.UPDATE }
			);

			// Commit the transaction
			await transaction.commit();
			return new Result(StatusEnum.OK, 200, userToUnfollowRecord);

		} catch (error) {
			// Rollback the transaction in case of any error
			await transaction.rollback();

			console.error("Error during unfollowUser operation:", error);
			const errors = parseSequelizeErrors(error);
			return new Result(StatusEnum.FAIL, 500, null, errors);
		}
	}




	async deactivateInactiveUsers() {
		const inactivityPeriod = 30;
		const result = await User.destroy({
			where: {
				isActive: false,
				registrationDate: {
					[Sequelize.Op.lt]: Sequelize.literal(`NOW() - INTERVAL ${inactivityPeriod} DAY`)
				}
			}
		});


	}

	async login(email, password) {
		const user = await User.findOne({ where: { email } });

		if (!user) {
			return new Result(StatusEnum.FAIL, 400, null, [{ message: 'Invalid email or password' }]);
		}

		const passwordsMatch = checkPasswordHash(password, user.password);
		if (!passwordsMatch) {
			return new Result(StatusEnum.FAIL, 400, null, [{ message: 'Invalid email or password' }]);
		}

		if (!user.isActive) {
			return new Result(StatusEnum.FAIL, 403, null, [{ message: 'Email address is not verified' }]);
		}

		await user.update({ lastActivity: new Date().toISOString() });

		return new Result(StatusEnum.OK, 200, user);
	}

	async activateUser(email) {
		const user = await User.findOne({ where: { email: email } });
		if (!user) {
			return new Result(StatusEnum.FAIL, 404, null, [{ message: 'User not found' }]);
		}

		user.isActive = true;
		await user.save();
		return new Result(StatusEnum.OK);
	}

	async getAllUsersForAdmin(name, surname, email, minPosts, maxPosts, page = 1, limit = 5) {
		const whereConditions = {};
		if (name) {
			whereConditions.name = { [Op.iLike]: `%${name}%` };
		}
		if (surname) {
			whereConditions.surname = { [Op.iLike]: `%${surname}%` };
		}
		if (email) {
			whereConditions.email = { [Op.iLike]: `%${email}%` };
		}
		if (minPosts || maxPosts) {
			whereConditions.postsCount = {};
			if (minPosts) {
				whereConditions.postsCount[Op.gte] = minPosts;
			}
			if (maxPosts) {
				whereConditions.postsCount[Op.lte] = maxPosts;
			}
		}
		try {
			const offset = (page - 1) * limit;
			const { count, rows } = await User.findAndCountAll({
				attributes: ['name', 'surname', 'email', 'postsCount', 'followingCount'],
				where: whereConditions,
				limit: limit,
				offset: offset,
			});
	
			const totalPages = Math.ceil(count / limit);
	
			return new Result(StatusEnum.OK, 200, { users: rows, totalPages });
		} catch (exception) {
			const errors = parseSequelizeErrors(exception);
			return new Result(StatusEnum.FAIL, 500, null, errors);
		}
	}

	async getUserProfile(username, requesterUsername) {
		const isFollowing = await UserFollower.findOne({ where: { followerId: requesterUsername, followingId: username } });

		const user = await User.findOne({
			where: { username },
			attributes: ['name', 'surname', 'username', 'email', 'followersCount', 'followingCount']
		});

		if (!user) {
			return new Result(StatusEnum.FAIL, 404, null, [{ message: 'User not found' }]);
		}
		// Add the isFollowing boolean to the user object
		user.dataValues.isFollowing = !!isFollowing;
		return new Result(StatusEnum.OK, 200, user);
	}

	async findNearbyPosts(username) {
		const userAddress = await User.findOne({ where: { username }, attributes: ['address'] });
		if (!userAddress) {
			return new Result(StatusEnum.FAIL, 404, null, [{ message: 'User not found' }]);
		}

		const result = await PostService.findNearbyPosts(userAddress.address);

		result.data = {
			userAddress: userAddress.address,
			posts: result.data.posts,
			vets: result.data.vets
		}

		return result;
	}

	async getUserFollowers(username) {
		const user = await User.findOne({ where: { username } });
		if (!user) {
			return new Result(StatusEnum.FAIL, 404, null, [{ message: 'User not found' }]);
		}

		const followers = await UserFollower.findAll({
			where: { followingId: username },
			include: [{
				model: User,
				as: 'follower',
				attributes: ['username', 'name', 'surname', 'email']
			}],
			attributes: []
		});

		const formattedFollowers = followers.map(f => f.follower);

		return new Result(StatusEnum.OK, 200, formattedFollowers);
	}

	async getUserFollowing(username) {
		const user = await User.findOne({ where: { username } });
		if (!user) {
			return new Result(StatusEnum.FAIL, 404, null, [{ message: 'User not found' }]);
		}

		const following = await UserFollower.findAll({
			where: { followerId: username },
			include: [{
				model: User,
				as: 'following',
				attributes: ['username', 'name', 'surname', 'email']
			}],
			attributes: []
		});

		const formattedFollowing = following.map(f => f.following);

		return new Result(StatusEnum.OK, 200, formattedFollowing);
	}
}

module.exports = new UserService();