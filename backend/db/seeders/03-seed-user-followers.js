'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('UserFollowers', [
      {
        followerId: "trksi123",
        followingId: "cico123",
        followedAt: new Date().toISOString(),
      },
      {
        followerId: "zeka123",
        followingId: "cico123",
        followedAt: new Date().toISOString(),
      },
      {
        followerId: "kico123",
        followingId: "cico123",
        followedAt: new Date().toISOString(),
      },
      {
        followerId: "cico123",
        followingId: "trksi123",
        followedAt: new Date().toISOString(),
      },
      {
        followerId: "cico123",
        followingId: "zeka123",
        followedAt: new Date().toISOString(),
      },
      {
        followerId: "trksi123",
        followingId: "zeka123",
        followedAt: new Date().toISOString(),
      },
      {
        followerId: "zeka123",
        followingId: "trksi123",
        followedAt: new Date().toISOString(),
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
