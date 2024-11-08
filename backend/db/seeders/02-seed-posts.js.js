'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Posts', [
      {
        username: 'zeka123',
        caption: 'New bun found near shopping mall',
        imagePath: '',
        location: JSON.stringify({
          latitude: 45.2460762110518,
          longitude: 19.842463062818517
        }),
      },
      {
        username: 'zeka123',
        caption: 'Bun hidding at Index Mirjana',
        imagePath: '',
        location: JSON.stringify({
          latitude: 45.25885958220817,
          longitude: 19.820130045624435
        }),
      },
      {
        username: 'trksi123',
        caption: 'Bun spotted at Dumbovo',
        imagePath: '',
        location: JSON.stringify({
          latitude: 45.169384734663424,
          longitude: 19.74776045190645
        }),
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
