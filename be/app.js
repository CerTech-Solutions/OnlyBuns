const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const app = express();
const swaggerUi = require('swagger-ui-express');

const userRoute = require('./routes/userRoute');

app.use(cors());
app.use(express.json());

// Serve Swagger UI
const swaggerFile = require('./swagger-output.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.get('/test', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/user', userRoute);

app.listen(process.env.PORT, () => {
	  console.log(`Server is running on port ${process.env.PORT}`);
});
