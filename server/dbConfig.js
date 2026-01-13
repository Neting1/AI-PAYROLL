
const mysql = require('mysql2');
require('dotenv').config();

// Create the connection pool. The pool allows executing queries.
// XAMPP Defaults: user: 'root', password: '', port: 3306
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'twinhill_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log(`[Database] Connected to MySQL DB: ${process.env.DB_NAME || 'twinhill_db'}`);

module.exports = pool.promise();
