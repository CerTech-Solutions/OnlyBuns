const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Your API Title',
    description: 'API documentation',
  },
  host: 'localhost:3000',
  schemes: ['http'],
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./routes/userRoute.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);