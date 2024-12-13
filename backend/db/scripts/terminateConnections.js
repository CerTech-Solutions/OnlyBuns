const { Sequelize } = require('sequelize');
const config = require('../config/config.js')[process.env.NODE_ENV];

const sequelize = new Sequelize(config);

async function terminateConnections() {
	try {
		await sequelize.query(`
			SELECT pg_terminate_backend(pg_stat_activity.pid)
			FROM pg_stat_activity
			WHERE pg_stat_activity.datname = '${config.database}'
				AND pid <> pg_backend_pid();
		`);
		console.log('All connections terminated');
	} catch (error) {
		console.error('Error terminating connections:', error);
	} finally {
		await sequelize.close();
	}
}

terminateConnections();