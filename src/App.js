const express = require("express");
const cors = require("cors");
const routes = require("./routes");
// const errorHandler = require("./Middlewares/errorHandler"); 

const app = express();

app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.use("/api", routes);

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

module.exports = app;
