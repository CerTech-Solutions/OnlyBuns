const cron = require('node-cron');
const imageService = require('./imageService');
const emailService = require('./emailService');


if (process.env.ENABLE_COMPRESS === 'true')
	cron.schedule(process.env.COMPRESS_INTERVAL, () => {
		imageService.compressOldImages();
		console.log('Image compression job executed');
	});

if (process.env.ENABLE_EMAIL_SERVICE === 'true')
	cron.schedule(process.env.INACTIVITY_INTERVAL, () => {
		emailService.notifyInactiveUsers();
		console.log('Inactive users notification job executed');
	});
