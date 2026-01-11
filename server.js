const express = require("express");
const cors = require("cors");
const livereload = require("livereload");
const connectLivereload = require("connect-livereload");
require("dotenv").config();
const usersRoutes = require("./routes/users-routes");

const app = express();

// CORS configuration - allow frontend to connect
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
/*
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(__dirname);
app.use(connectLivereload());

liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100);
});*/

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Mount user routes
app.use('/api/users', usersRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



