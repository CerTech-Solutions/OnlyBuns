const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimiter = require('./utils/rateLimiter');

const userRoute = require('./routes/userRoute');
const postRoute = require('./routes/postRoute');
const locationRoute = require('./routes/locationRoute');
const imageRoute = require('./routes/imageRoute');
const statsRoute = require('./routes/statsRoute');
const sequelize = require('./models/index').sequelize;
const promClient = require('prom-client');

require('./services/scheduler');
require('./services/messageService');

const app = express();
app.use(cors({
	origin: process.env.CLIENT_URL,
	credentials: true
}));
app.use(cookieParser());
app.use(express.json());

if(process.env.ENABLE_GLOBAL_RATELIMITER === 'true')
  app.use(rateLimiter.rateLimit(5, 10 * 1000));

app.get('/test', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/user', userRoute);
app.use('/api/post', postRoute);
app.use('/api/location', locationRoute);
app.use('/api/image', imageRoute);
app.use('/api/stats', statsRoute);

sequelize.authenticate().then(() => {
  console.log(`Connection to the ${process.env.DB_NAME} database has been established successfully!`);
  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
}).catch(err => {
  console.error('Unable to connect to the database!', err);
});

const postCreateRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds_create_post',
  help: 'Duration of HTTP requests for creating a new post in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5, 10], 
});
promClient.register.registerMetric(postCreateRequestDuration);

app.use((req, res, next) => {
  if (req.method === 'POST' && req.path.includes('/api/post/create')) {
    const end = postCreateRequestDuration.startTimer(); 
    res.on('finish', () => {
      end({ method: req.method, route: req.path, status: res.statusCode }); 
    });
  }
  next();
});

const { collectDefaultMetrics } = promClient;

collectDefaultMetrics();

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});