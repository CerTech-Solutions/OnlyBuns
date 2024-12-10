const dotenv = require('dotenv');
dotenv.config();

const express = require('express');

const app = express();

app.get('/test', (req, res) => {
	res.send('Vets server is running!');
});

app.listen(process.env.PORT, () => {
	console.log(`Vets server is running on port ${process.env.PORT}`);
});