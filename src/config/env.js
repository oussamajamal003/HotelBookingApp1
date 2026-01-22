const dotenv = require("dotenv");

dotenv.config();

const env = {
  PORT: process.env.PORT || 5000,
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_USER: process.env.DB_USER || "root",
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DB_NAME: process.env.DB_NAME || "studentmanagement",
  JWT_SECRET: process.env.JWT_SECRET || "student_management_secret_key_2024",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "24h",
  SWAGGER_USER: process.env.SWAGGER_USER || "admin",
  SWAGGER_PASSWORD: process.env.SWAGGER_PASSWORD || "admin",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  BASE_URL: process.env.BASE_URL || "http://localhost:5000/api/auth",
  SCENARIO: process.env.SCENARIO || "normal",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@example.com",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "admin123",
};

module.exports = env;

