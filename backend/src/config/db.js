// src/config/db.js
const { Pool } = require('pg');
require('dotenv').config();

// Expect DATABASE_URL in the form of postgres://user:pass@host:port/dbname
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Optional: SSL for RDS
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
};
