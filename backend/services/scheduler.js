const cron = require('node-cron');
const imageService = require('./imageService');
const emailService = require('./emailService');
const statsService = require('./statsService');

if (process.env.ENABLE_COMPRESS === 'true') {
	cron.schedule(process.env.COMPRESS_INTERVAL, () => {
		imageService.compressOldImages();
		console.log('Image compression job executed');
	});
}

if (process.env.ENABLE_EMAIL_SERVICE === 'true') {
	cron.schedule(process.env.INACTIVITY_INTERVAL, () => {
		emailService.notifyInactiveUsers();
		console.log('Inactive users notification job executed');
	});
}

cron.schedule(process.env.TRENDS_INTERVAL, async () => {
	console.log('Trends data is being generated and stored in cache');
	statsService.generateTrendsData();
});


// cron.schedule(process.env.INACTIVE_USER_INTERVAL, () => {
// 	const today = new Date();
// 	const currentMonth = today.getMonth();
// 	const lastDayOfMonth = new Date(today.getFullYear(), currentMonth + 1, 0);

// 	if (today.getDate() === lastDayOfMonth.getDate()) {
// 		console.log('Monthly job executed');
// 		userService.deactivateInactiveUsers();

// 	}
// });