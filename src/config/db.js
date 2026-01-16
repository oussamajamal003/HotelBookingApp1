/*const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

module.exports = db;*/

const mysql = require("mysql2/promise");
const env = require("./env");
const logger = require("../utils/logger");

const pool = mysql.createPool({
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.on('connection', (connection) => {
  logger.debug('New database connection established');
});

pool.on('acquire', (connection) => {
  logger.debug('Connection acquired from pool');
});

pool.on('release', (connection) => {
  logger.debug('Connection released back to pool');
});

pool.on('enqueue', () => {
  logger.warn('Waiting for available connection slot');
});

module.exports = pool;



