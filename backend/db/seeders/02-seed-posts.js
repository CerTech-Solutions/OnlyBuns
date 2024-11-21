'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Posts', [
      {
        username: 'zeka123',
        caption: 'New bun found near shopping mall',
        imagePath: 'uploads/post01.test.jpg',
        location: JSON.stringify({
          latitude: 45.2460762110518,
          longitude: 19.842463062818517
        }),
        likes: JSON.stringify([]),
        comments: JSON.stringify([])
      },
      {
        username: 'zeka123',
        caption: 'Bun hidding at Index Mirjana',
        imagePath: 'uploads/post02.test.jpg',
        location: JSON.stringify({
          latitude: 45.25885958220817,
          longitude: 19.820130045624435
        }),
        likes: JSON.stringify([]),
        comments: JSON.stringify([])
      },
      {
        username: 'trksi123',
        caption: 'Bun spotted at Dumbovo',
        imagePath: 'uploads/post03.test.jpg',
        location: JSON.stringify({
          latitude: 45.169384734663424,
          longitude: 19.74776045190645
        }),
        likes: JSON.stringify([]),
        comments: JSON.stringify([])
      },
      {
        username: 'cico123',
        caption: 'Bun hidding at the park',
        imagePath: 'uploads/post04.test.jpg',
        location: JSON.stringify({
          latitude: 45.25047307885218,
          longitude: 19.82698722853664
        }),
        likes: JSON.stringify([]),
        comments: JSON.stringify([])
      },
      {
        username: 'kico123',
        caption: 'Bun found in Night City',
        imagePath: 'uploads/post05.test.jpg',
        location: JSON.stringify({
          latitude: 45.25032138501315,
          longitude: 19.847685277307168
        }),
        likes: JSON.stringify([]),
        comments: JSON.stringify([])
      },
      {
        username: 'kico123',
        caption: 'Bun found near the river',
        imagePath: 'uploads/post06.test.jpg',
        location: JSON.stringify({
          latitude: 45.236442369295155,
          longitude: 19.848760349432972
        }),
        likes: JSON.stringify([]),
        comments: JSON.stringify([])
      },
      {
        username: 'trksi123',
        caption: 'Bun found in the sky',
        imagePath: 'uploads/post07.test.jpg',
        location: JSON.stringify({
          latitude: 45.25789815712415,
          longitude: 19.82422420751175
        }),
        likes: JSON.stringify([]),
        comments: JSON.stringify([])
      },
      {
        username: 'zeka123',
        caption: 'Grand Theft Bun VI',
        imagePath: 'uploads/post08.test.jpg',
        location: JSON.stringify({
          latitude: 45.260444204791526,
          longitude: 19.814488885138523
        }),
        likes: JSON.stringify([]),
        comments: JSON.stringify([])
      },
      {
        username: 'kico123',
        caption: 'Sir Bunnus the third',
        imagePath: 'uploads/post09.test.jpg',
        location: JSON.stringify({
          latitude: 45.25558452653821,
          longitude: 19.845535048671625
        }),
        likes: JSON.stringify([]),
        comments: JSON.stringify([])
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
