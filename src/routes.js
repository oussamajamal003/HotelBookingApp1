const express = require("express");
const usersRoutes = require("./routes/users-routes");

const router = express.Router();

router.use("/users", usersRoutes);

module.exports = router;
