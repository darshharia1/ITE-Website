// src/middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

/**
 * Middleware to authenticate JWT tokens
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token is missing.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Access token is invalid or expired.' });
    }
    
    req.user = user; // user payload contains { id, role }
    next();
  });
}

/**
 * Higher-order middleware to require specific role(s)
 * @param {string|string[]} allowedRoles - Single role or array of allowed roles
 */
function requireRole(allowedRoles) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access forbidden: Insufficient permissions.' });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  requireRole
};
