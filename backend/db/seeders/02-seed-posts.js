'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		function generateDate(daysAgo, monthsAgo) {
			const date = new Date();
			date.setDate(date.getDate() - daysAgo);
			date.setMonth(date.getMonth() - monthsAgo);
			return date.toISOString();
		}

		const posts = [
			{
				username: 'zeka123',
				caption: 'New bun found near shopping mall',
				imagePath: 'uploads/post01.test.jpg',
				location: {
					latitude: 45.2460762110518,
					longitude: 19.842463062818517
				},
				likes: [
					{
						username: 'kico123',
						likedAt: generateDate(0, 0)
					},
					{
						username: 'trksi123',
						likedAt: generateDate(0, 0)
					}
				],
				comments: [],
				createdAt: generateDate(0, 0)
			},
			{
				username: 'zeka123',
				caption: 'Bun hidding at Index Mirjana',
				imagePath: 'uploads/post02.test.jpg',
				location: {
					latitude: 45.25885958220817,
					longitude: 19.820130045624435
				},
				likes: [
					{
						username: 'kico123',
						likedAt: generateDate(0, 0)
					},
					{
						username: 'trksi123',
						likedAt: generateDate(0, 0)
					},
					{
						username: 'cico123',
						likedAt: generateDate(0, 0)
					}
				],
				comments: [],
				createdAt: generateDate(1, 0)
			},
			{
				username: 'trksi123',
				caption: 'Bun spotted at Dumbovo',
				imagePath: 'uploads/post03.test.jpg',
				location: {
					latitude: 45.169384734663424,
					longitude: 19.74776045190645
				},
				likes: [
					{
						username: 'cico123',
						likedAt: generateDate(0, 0)
					}
				],
				comments: [],
				createdAt: generateDate(2, 0)
			},
			{
				username: 'cico123',
				caption: 'Bun hidding at the park',
				imagePath: 'uploads/post04.test.jpg',
				location: {
					latitude: 45.25047307885218,
					longitude: 19.82698722853664
				},
				likes: [
					{
						username: 'zeka123',
						likedAt: generateDate(0, 0)
					},
					{
						username: 'trksi123',
						likedAt: generateDate(0, 0)
					}
				],
				comments: [],
				createdAt: generateDate(3, 0)
			},
			{
				username: 'kico123',
				caption: 'Bun found in Night City',
				imagePath: 'uploads/post05.test.jpg',
				location: {
					latitude: 45.25032138501315,
					longitude: 19.847685277307168
				},
				likes: [],
				comments: [],
				createdAt: generateDate(4, 0)
			},
			{
				username: 'kico123',
				caption: 'Bun found near the river',
				imagePath: 'uploads/post06.test.jpg',
				location: {
					latitude: 45.236442369295155,
					longitude: 19.848760349432972
				},
				likes: [],
				comments: [],
				createdAt: generateDate(5, 0)
			},
			{
				username: 'trksi123',
				caption: 'Bun found in the sky',
				imagePath: 'uploads/post07.test.jpg',
				location: {
					latitude: 45.25789815712415,
					longitude: 19.82422420751175
				},
				likes: [
					{
						username: 'zeka123',
						likedAt: generateDate(0, 0)
					}
				],
				comments: [],
				createdAt: generateDate(6, 0)
			},
			{
				username: 'zeka123',
				caption: 'Grand Theft Bun VI',
				imagePath: 'uploads/post08.test.jpg',
				location: {
					latitude: 45.260444204791526,
					longitude: 19.814488885138523
				},
				likes: [
					{
						username: 'zeka123',
						likedAt: generateDate(0, 0)
					},
					{
						username: 'trksi123',
						likedAt: generateDate(0, 0)
					},
					{
						username: 'cico123',
						likedAt: generateDate(0, 0)
					},
					{
						username: 'kico123',
						likedAt: generateDate(0, 0)
					}
				],
				comments: [],
				createdAt: generateDate(15, 3)
			},
			{
				username: 'kico123',
				caption: 'Sir Bunnus the third',
				imagePath: 'uploads/post09.test.jpg',
				location: {
					latitude: 45.25558452653821,
					longitude: 19.845535048671625
				},
				likes: [
					{
						username: 'zeka123',
						likedAt: generateDate(0, 0)
					},
					{
						username: 'trksi123',
						likedAt: generateDate(0, 0)
					},
					{
						username: 'cico123',
						likedAt: generateDate(0, 0)
					},
					{
						username: 'kico123',
						likedAt: generateDate(0, 0)
					},
					{
						username: 'kule123',
						likedAt: generateDate(0, 0)
					}
				],
				comments: [],
				createdAt: generateDate(15, 3)
			},
		];

		posts.forEach(post => {
			post.likesCount = post.likes.length;
			post.location = JSON.stringify(post.location);
			post.likes = JSON.stringify(post.likes);
			post.comments = JSON.stringify(post.comments);
		});

		await queryInterface.bulkInsert('Posts', posts, {});
	},

	async down(queryInterface, Sequelize) {
		/**
		 * Add commands to revert seed here.
		 *
		 * Example:
		 * await queryInterface.bulkDelete('People', null, {});
		 */
	}
};
