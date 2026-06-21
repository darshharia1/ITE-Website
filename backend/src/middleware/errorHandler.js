// src/middleware/errorHandler.js
const logger = require('../utils/logger');

/**
 * Global Express centralized error handling middleware
 */
function errorHandler(err, req, res, next) {
  // Log the complete error stack trace using Winston
  logger.error(err);

  // If response headers have already been sent, delegate to default express error handler
  if (res.headersSent) {
    return next(err);
  }

  const isProduction = process.env.NODE_ENV === 'production';

  // Return a clean, standardized JSON response to the client
  res.status(err.status || 500).json({
    error: isProduction ? 'Internal Server Error' : err.message,
    ...(isProduction ? {} : { stack: err.stack })
  });
}

module.exports = errorHandler;
