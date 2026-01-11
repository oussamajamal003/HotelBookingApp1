const dotenv = require("dotenv");

dotenv.config();

const env = {
  PORT: process.env.PORT || 5000,
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_USER: process.env.DB_USER || "root",
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DB_NAME: process.env.DB_NAME || "hotelbooking",
  JWT_SECRET: process.env.JWT_SECRET || "hotel_booking_secret_key_2024",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1h",
};

module.exports = env;

