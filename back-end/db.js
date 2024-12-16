const mysql = require("mysql2/promise");

// Hardcoded database configuration
const pool = mysql.createPool({
  host: "localhost", // Replace with your DB host
  user: "root", // Replace with your DB user
  password: "", // Replace with your DB password
  database: "toll_balance", // Replace with your DB name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
