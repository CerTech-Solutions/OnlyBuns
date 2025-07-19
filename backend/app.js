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
const groupRoute = require('./routes/groupRoute');
const groupMessageRoute = require('./routes/groupMessageRoute');
const sequelize = require('./models/index').sequelize;
const { register } = require('./utils/metrics');
const { Server } = require("socket.io");
const {init} = require('./utils/socket');


require('./services/scheduler');
require('./services/messageService');




const http = require('http');
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
	cors: {
		origin: process.env.CLIENT_URL,
		methods: ["GET", "POST"],
		credentials: true
	}
});
init(io);	

const setupChatSocket = require('./utils/chatSockets');
setupChatSocket(io);



app.use(cors({
	origin: process.env.CLIENT_URL,
	credentials: true
}));
app.use(cookieParser());
app.use(express.json());

if (process.env.ENABLE_GLOBAL_RATELIMITER === 'true') {
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
app.use('/api/group', groupRoute);

sequelize.authenticate().then(() => {
	console.log(`Connection to the ${process.env.DB_NAME} database has been established successfully!`);
	server.listen(process.env.PORT, () => {
		console.log(`Server is running on port ${process.env.PORT}`);
	});
}).catch(err => {
	console.error('Unable to connect to the database!', err);
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

