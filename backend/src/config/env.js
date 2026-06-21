// src/config/env.js
require('dotenv').config();

const REQUIRED_ENV_VARS = [
  'PORT',
  'DATABASE_URL',
  'JWT_SECRET',
  'FRONTEND_URL'
];

const missingVars = [];

for (const envVar of REQUIRED_ENV_VARS) {
  if (!process.env[envVar]) {
    missingVars.push(envVar);
  }
}

if (missingVars.length > 0) {
  console.error('\n❌ FATAL: Missing required environment variables on startup:');
  missingVars.forEach(v => console.error(`  - ${v}`));
  console.error('\nPlease ensure these variables are defined in your environment or .env file.\n');
  process.exit(1);
}

module.exports = {
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  FRONTEND_URL: process.env.FRONTEND_URL,
  NODE_ENV: process.env.NODE_ENV || 'development'
};
