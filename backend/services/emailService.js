const nodemailer = require('nodemailer');
const { Op } = require('sequelize');

const { User, UserFollower } = require('../models');
const postService = require('./postService');

class EmailService {
	constructor() {
		this.transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port: process.env.SMTP_PORT,
			secure: true,
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASSWORD
			}
		});
	}

	async sendActivationEmail(email, token) {
		const activationLink = `http://localhost:3000/api/user/activate/${token}`;

		const mailOptions = {
			from: process.env.SMTP_USER,
			to: email,
			subject: 'Account activation for OnlyBuns',
			text: '',
			html: `
				<div>
					<h1>Account activation</h1>
					<p>To activate your account, please follow this link: <a href="${activationLink}">Activate account</a></p>
				</div>
			`
		};

		await this.transporter.sendMail(mailOptions);
	}

	async notifyInactiveUsers() {
		const thresholdDaysAgo = Date.now() - process.env.COMPRESS_THRESHOLD;

		const users = await User.findAll({
			where: {
				lastActivity: {
					[Op.lte]: thresholdDaysAgo,
				},
			},
		});

		for (const user of users) {
			const postsResult = await postService.findUserPosts(user.username);
			const posts = postsResult.data;

			const newLikes = posts.reduce((acc, post) => {
				const filteredLikes = post.likes.filter(like => new Date(like.likedAt) > new Date(user.lastActivity));
				return acc.concat(filteredLikes);
			}, []);
			const newLikesCount = newLikes.length;

			const newComments = posts.reduce((acc, post) => {
				const filteredComments = post.comments.filter(comment => new Date(comment.commentedAt) > new Date(user.lastActivity));
				return acc.concat(filteredComments);
			}, []);
			const newCommentsCount = newComments.length;

			const followedPostsResult = await postService.findFollowedPosts(user.username);
			const newPosts = followedPostsResult.data.filter(post => new Date(post.createdAt) > new Date(user.lastActivity))
			const newPostsCount = newPosts.length;

			const followersResult = await UserFollower.findAll({
				where: { followingId: user.username },
				attributes: ['followerId']
			});
			const followers = followersResult.map(f => f.followingId);
			const newFollowers = followers.filter(post => new Date(post.followedAt) > new Date(user.lastActivity));
			const newFollowersCount = newFollowers.length;

			const mailOptions = {
				from: process.env.SMTP_USER,
				to: user.email,
				subject: 'Inactivity Notification for OnlyBuns',
				text: '',
				html: `
						<div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; border-radius: 10px; max-width: 600px; margin: auto; color: #333;">
								<h1 style="color: #2a9df4;">We Miss You! ૮꒰｡•́︿•̀｡꒱ა</h1>
								<h2 style="color: #555;">Here’s what happened while you were inactive:</h2>
								<p style="font-size: 16px; line-height: 1.5;">👥 You got <strong>${newFollowersCount}</strong> new followers!</p>
								<p style="font-size: 16px; line-height: 1.5;">📋 You missed <strong>${newPostsCount}</strong> new posts from people you follow!</p>
								<p style="font-size: 16px; line-height: 1.5;">❤️ You received <strong>${newLikesCount}</strong> new likes!</p>
								<p style="font-size: 16px; line-height: 1.5;">💬 You received <strong>${newCommentsCount}</strong> new comments!</p>
								<pre style="font-family: monospace; font-size: 10px; line-height: 1.2; color: #888; margin-top: 20px;">
		⠀⠀⠀⠀⠀⠀⠀⣠⣤⣦⣤⣄⡀⠀⠀⠀⠀⢀⣀⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
		⠀⠀⠀⠀⠀⣰⠟⠙⠀⠀⠀⠈⢻⡆⠀⣴⠞⠋⠉⠉⠙⠳⣦⡀⠀⠀⠀⠀⠀⠀⠀
		⠀⠀⠀⠀⢸⡛⠂⠀⠀⠀⠀⠀⠈⣿⣾⠋⠀⠀⠀⠀⠀⠀⠈⣿⡄⠀⠀⠀⠀⠀⠀
		⠀⠀⠀⠀⣽⠁⠀⠀⠀⠀⠀⠀⠀⣽⢇⠀⠀⠀⠀⠀⠀⠀⠀⢸⡇⠀⠀⠀⠀⠀⠀
		⠀⠀⠀⢰⣿⠄⠀⠀⠀⠀⠀⠀⠐⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⢺⡇⠀⠀⠀⠀⠀⠀
		⠀⠀⠀⢨⡟⠀⠀⠀⠀⠀⠀⠀⢸⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⠇⠀⠀⠀⠀⠀⠀
		⠀⠀⠀⠈⣿⠀⠀⠀⠀⠀⠀⠀⢸⡇⠀⠀⠀⠀⠀⠀⠀⠀⢠⡿⠀⠀⠀⠀⠀⠀⠀
		⠀⠀⠀⠀⣿⡆⠀⠀⢀⣀⣀⡀⢸⣇⠀⠀⠀⠀⠀⠀⠀⢀⣾⠃⠀⠀⠀⠀⠀⠀⠀
		⠀⠀⠀⠀⣘⡟⠰⠛⠛⠉⠙⠉⠈⠃⠀⠀⠀⠀⠀⠀⢰⣾⡟⠚⢶⣄⠀⠀⠀⠀⠀
		⠀⠀⣤⡾⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⡁⠀⢀⡬⢹⡇⠀⠀⠀⠀
		⠀⣴⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣷⠀⠚⢷⣼⡷⠀⠀⠀⠀
		⣼⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢙⣷⠀⠀⠘⢿⣷⠀⠀⠀
		⢸⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣇⠀⠀⠀⢹⣧⠀⠀
		⣿⢣⣷⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⡏⣡⠀⠀⠀⠻⣧⠀
		⣿⡾⡿⠖⠀⠀⠀⠀⠀⠀⠀⠀⢀⣶⣿⣤⠀⠀⠀⠀⠀⠀⠀⣼⡇⠃⠀⠀⠀⠀⢹⣇
		⠹⣧⡀⠀⠀⠰⣦⣸⣶⠄⠀⠀⠸⡿⠿⠇⠀⠀⠀⠀⠀⠀⢢⡿⠅⠀⠀⠀⠀⠀⠀⣿
		⠀⠈⠻⣦⣒⠸⠛⠻⠖⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣼⠟⠁⠀⠀⠀⠀⣄⠀⠀⣾
		⠀⠀⠀⠈⢙⣷⢶⣤⣀⣀⠀⠀⠀⠀⠀⠀⠀⣀⣤⡶⠟⠁⠀⠀⠀⠀⠀⣼⢏⣠⣾⠟
		⠀⠀⠀⢀⣾⠃⠀⠀⠉⠛⠛⠻⠶⠶⠶⠶⠞⠋⠁⠀⠀⠀⠀⠀⠀⣰⡾⠛⠛⠉⠀⠀
		⠀⠀⠀⠘⣿⠀⠀⠀⠀⠀⢲⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⣠⡾⠏⠀⠀⠀⠀⠀⠀
		⠀⠀⠀⠀⠻⣧⡀⠀⠀⣡⣿⠛⠻⠶⣾⠀⠀⠀⠀⠀⠀⠈⢾⡟⠆⠀⠀⠀⠀⠀⠀⠀
		⠀⠀⠀⠀⠀⠉⠛⠛⠛⠋⠁⠀⠀⠀⢿⣦⠀⠀⠀⠀⠀⣠⡾⠁⠀⠀⠀⠀⠀⠀⠀⠀
		⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣶⣤⣀⣦⣴⡟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀
								</pre>
						</div>
				`,
			};

			await this.transporter.sendMail(mailOptions);
		}
	}
}

module.exports = new EmailService();