const promClient = require('prom-client');

const register = promClient.register;
promClient.collectDefaultMetrics({ register });

const activeUsersGauge = new promClient.Gauge({
  name: 'current_active_users',
  help: 'Current number of logged-in users'
});

activeUsersGauge.set(0);

const httpRequestDurationSeconds = new promClient.Histogram({
  name: 'http_createpost_duration_seconds',
  help: 'Trajanje HTTP zahteva u sekundama',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 3, 5] 
});

module.exports = {
  register,
  activeUsersGauge,
	httpRequestDurationSeconds
};