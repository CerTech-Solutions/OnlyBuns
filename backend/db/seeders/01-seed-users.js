'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [
      {
        name: 'Stefan',
        surname: 'Trkulja',
        username: 'trksi123',
				password: 'trksi123',
        email: 'trksi123@gmail.com',
				address: 'Futog 21000',
				role: 'user',
        isActive: true
			},
      {
        name: 'Nemanja',
        surname: 'Zekanovic',
        username: 'zeka123',
				password: 'zeka123',
        email: 'zeka123@gmail.com',
				address: 'Telep 21000',
				role: 'user',
        isActive: true
			},
      {
        name: 'Nikola',
        surname: 'Kuslakovic',
        username: 'kule123',
				password: 'kule123',
        email: 'kule123@gmail.com',
				address: 'Naselje 21000',
				role: 'admin',
        isActive: true
			},
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};