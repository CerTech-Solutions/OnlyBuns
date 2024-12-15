const { hashPassword } = require('../../utils/passwordHasher')

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [
      {
        name: 'Stefan',
        surname: 'Trkulja',
        username: 'trksi123',
        password: hashPassword('trksi123'),
        email: 'trksi123@gmail.com',
				address: JSON.stringify({
          latitude: 45.23579390,
          longitude: 19.72067296
        }),
				role: 'user',
        postsCount: 2,
        followersCount: 2,
        followingCount: 2,
        isActive: true,
        lastActivity: new Date().toISOString()
			},
      {
        name: 'Nemanja',
        surname: 'Zekanovic',
        username: 'zeka123',
				password: hashPassword('zeka123'),
        email: 'zeka123@gmail.com',
				address: JSON.stringify({
          latitude: 45.23838353,
          longitude: 19.81151278
        }),
				role: 'user',
        followersCount: 2,
        followingCount: 2,
        postsCount: 3,
        isActive: true,
        lastActivity: new Date().toISOString()
			},
      {
        name: 'Milos',
        surname: 'Milakovic',
        username: 'cico123',
				password: hashPassword('cico123'),
        email: 'cico123@gmail.com',
				address: JSON.stringify({
          latitude: 44.8572589,
          longitude: 20.5688745
        }),
				role: 'user',
        followersCount: 2,
        followingCount: 3,
        postsCount: 1,
        isActive: true,
        lastActivity: new Date().toISOString()
			},
      {
        name: 'Aljosa',
        surname: 'Kicanski',
        username: 'kico123',
				password: hashPassword('kico123'),
        email: 'kico123@gmail.com',
				address: JSON.stringify({
          latitude: 45.2531309,
          longitude: 19.8440284
        }),
				role: 'user',
        followersCount: 1,
        followingCount: 0,
        postsCount: 3,
        isActive: true,
        lastActivity: new Date().toISOString()
			},
      {
        name: 'Jovan',
        surname: 'Trkulja',
        username: 'joss123',
				password: hashPassword('joss123'),
        email: 'joss123@gmail.com',
				address: JSON.stringify({
          latitude: 45.2531309,
          longitude: 19.8440284
        }),
				role: 'user',
        followersCount: 1,
        followingCount: 0,
        postsCount: 3,
        isActive: true,
        lastActivity: new Date().toISOString()
			},
      {
        name: 'Nikola',
        surname: 'Kuslakovic',
        username: 'kule123',
				password: hashPassword('kule123'),
        email: 'kule123@gmail.com',
        address: JSON.stringify({
          latitude: 45.25307683,
          longitude: 19.80523933
        }),
				role: 'admin',
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        isActive: true,
        lastActivity: new Date().toISOString()
			},
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};