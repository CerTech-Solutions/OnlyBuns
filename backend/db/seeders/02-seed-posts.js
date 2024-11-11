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
      }
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
