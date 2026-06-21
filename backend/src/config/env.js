// src/config/env.js
require('dotenv').config();

const REQUIRED_ENV_VARS = [
  'PORT',
  'DATABASE_URL',
  'JWT_SECRET',
  'FRONTEND_URL',
  'AWS_REGION',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'SES_FROM_EMAIL',
  'AWS_S3_BUCKET_NAME'
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
  AWS_REGION: process.env.AWS_REGION,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  SES_FROM_EMAIL: process.env.SES_FROM_EMAIL,
  AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
  NODE_ENV: process.env.NODE_ENV || 'development'
};
