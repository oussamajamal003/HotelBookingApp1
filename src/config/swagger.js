const swaggerJsdoc = require('swagger-jsdoc');
const env = require('./env');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hotel Booking API',
      version: '1.0.0',
      description: 'API documentation for the Hotel Booking App',
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Local server'
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: <token_only>'
        },
      },
    },
  },
  // Path to the API docs
  apis: ['./src/routes/*.js', './src/docs/*.js'], 
};

const swaggerSpecs = swaggerJsdoc(options);

module.exports = swaggerSpecs;
