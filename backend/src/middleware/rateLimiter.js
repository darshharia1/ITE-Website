// src/middleware/rateLimiter.js
const { rateLimit } = require('express-rate-limit');

/**
 * Strict rate limiter for authentication routes (login / register)
 * Max 15 requests per 15 minutes per IP.
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 15, // Limit each IP to 15 requests per windowMs
  standardHeaders: 'draft-7', // Use standard RateLimit headers
  legacyHeaders: false, // Disable X-RateLimit-* legacy headers
  message: {
    error: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
  },
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  }
});

module.exports = {
  authRateLimiter
};
