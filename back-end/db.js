// Import mysql2/promise for promise-based MySQL interaction
const mysql = require("mysql2/promise");

// Load environment variables from .env file
require("dotenv").config();

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST, // Database host
  user: process.env.DB_USER, // Database user
  password: process.env.DB_PASSWORD, // Database password
  database: process.env.DB_NAME, // Database name
  waitForConnections: true, // Wait for connection if pool is full
  connectionLimit: 10, // Max number of connections
  queueLimit: 0, // Unlimited queue size
});

// Export the connection pool for use in other parts of the app
module.exports = pool;
