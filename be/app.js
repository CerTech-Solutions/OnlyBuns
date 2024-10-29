const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const userRoute = require('./routes/userRoute');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/test', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/user', userRoute);

app.listen(process.env.PORT, () => {
	  console.log(`Server is running on port ${process.env.PORT}`);
});
