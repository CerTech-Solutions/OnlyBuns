const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const cookieParser = require('cookie-parser');
const rateLimiter = require('./utils/rateLimiter');

const userRoute = require('./routes/userRoute');
const postRoute = require('./routes/postRoute');
const locationRoute = require('./routes/locationRoute');
const imageRoute = require('./routes/imageRoute');
const statsRoute = require('./routes/statsRoute');
const sequelize = require('./models/index').sequelize;

const imageService = require('./services/imageService');

const app = express();
app.use(cors({
	origin: process.env.CLIENT_URL,
	credentials: true
}));
app.use(cookieParser());
app.use(express.json());

if(process.env.ENABLE_RATELIMITER === 'true') {
  app.use(rateLimiter.rateLimit(5, 10 * 1000));
}

app.get('/test', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/user', userRoute);
app.use('/api/post', postRoute);
app.use('/api/location', locationRoute);
app.use('/api/image', imageRoute);
app.use('/api/stats', statsRoute);

cron.schedule(process.env.COMPRESS_INTERVAL, () => {
    imageService.compressOldImages();
    console.log('Daily compression job executed');
});

sequelize.authenticate().then(() => {
  console.log('Connection to the database has been established successfully!');
  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
}).catch(err => {
  console.error('Unable to connect to the database!', err);
});
