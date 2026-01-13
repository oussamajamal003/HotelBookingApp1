const express = require("express");
const cors = require("cors");
const userroutes = require("./routes/authroutes");
//const errorHandler = require("./Middlewares/errorHandler"); 

const app = express();

app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

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
