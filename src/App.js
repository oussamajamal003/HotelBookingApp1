const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const logger = require("./utils/logger");
const userroutes = require("./routes/authroutes");
//const errorHandler = require("./Middlewares/errorHandler"); 

const app = express();

// DEBUG: Log all incoming requests immediately
app.use((req, res, next) => {
  console.log(`[Incoming] ${req.method} ${req.url} | Origin: ${req.headers.origin}`);
  next();
});

app.use(cors({
  origin: true, // Reflects the request origin, useful for development with multiple localhost aliases
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enhanced HTTP Request Logging
// Custom format to include correlation ID (if added later) or more details
app.use(morgan((tokens, req, res) => {
  const logMessage = [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    `User: ${req.user ? req.user.user_id : 'Guest'}` // Log User ID if authenticated
  ].join(' ');

  // Log to Winston
  if (tokens.status(req, res) >= 400) {
    logger.error(`HTTP Error: ${logMessage}`);
  } else {
    logger.info(`HTTP Request: ${logMessage}`);
  }
  return null; // Don't output to console directly, let logger handle it
}));

if (process.env.NODE_ENV === "development") {
  const swaggerUi = require("swagger-ui-express");
  const swaggerSpecs = require("./config/swagger");
  const basicAuth = require("express-basic-auth");
  const env = require("./config/env");

  app.use(
    "/api-docs",
    basicAuth({
      users: { [env.SWAGGER_USER]: env.SWAGGER_PASSWORD },
      challenge: true,
    }),
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpecs)
  );
}

app.use("/api/auth", userroutes);
//app.use("/api/users", userroutes);
// app.use(errorHandler);


app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

module.exports = app;
