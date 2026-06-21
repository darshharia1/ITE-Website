// src/utils/logger.js
const winston = require('winston');
const path = require('path');
const fs = require('fs');

const NODE_ENV = process.env.NODE_ENV || 'development';

// Define the logs directory path relative to the root of the project
const logDir = path.join(__dirname, '..', '..', 'logs');

// Auto-Create Directories on Boot
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Define log level based on environment
const level = NODE_ENV === 'development' ? 'debug' : 'info';

// Custom format for console logging (development)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    info => `${info.timestamp} [${info.level}]: ${info.message}${info.stack ? `\n${info.stack}` : ''}`
  )
);

// Custom format for file logging (production JSON structure)
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const transports = [];

// Write to console in all environments
transports.push(
  new winston.transports.Console({
    format: consoleFormat,
    handleExceptions: true,
    handleRejections: true
  })
);

// In production, also write logs to files
if (NODE_ENV === 'production') {
  transports.push(
    // Write errors to error.log
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: fileFormat,
      handleExceptions: true,
      handleRejections: true
    }),
    // Write all combined logs to combined.log
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      format: fileFormat
    })
  );
}

const logger = winston.createLogger({
  level,
  transports,
  exitOnError: false // Do not exit on handled exceptions
});

module.exports = logger;
