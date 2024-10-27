'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [
      {
        username: 'trksi123',
				password: 'trksi123',
        email: 'trksi123@gmail.com',
				address: 'Futog 21000',
				role: 'user',
				followers: 0
			},
      {
        username: 'zeka123',
				password: 'zeka123',
        email: 'zeka123@gmail.com',
				address: 'Telep 21000',
				role: 'user',
				followers: 0
			},
      {
        username: 'admin123',
				password: 'admin123',
        email: 'admin123@gmail.com',
				address: 'Admin land 21000',
				role: 'admin',
				followers: 0
			},
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};