// src/routes/auth.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middleware/auth');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

// POST /api/auth/register - Register a new user
router.post('/register', async (req, res) => {
  const { email, password, full_name } = req.body;

  if (!email || !password || !full_name) {
    return res.status(400).json({ error: 'Email, password, and full name are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    // a. Check if the email exists in approved_students table
    const approvedCheck = await db.query(
      'SELECT email FROM approved_students WHERE LOWER(TRIM(email)) = $1',
      [normalizedEmail]
    );

    if (approvedCheck.rows.length === 0) {
      return res.status(403).json({ error: 'This email is not pre-approved for signup.' });
    }

    // b. Check if user already exists
    const userCheck = await db.query(
      'SELECT id FROM users WHERE LOWER(TRIM(email)) = $1',
      [normalizedEmail]
    );

    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'A user with this email already exists.' });
    }

    // c. Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // d. Insert the user into the users table
    const { rows } = await db.query(
      `INSERT INTO users (email, password_hash, full_name)
       VALUES ($1, $2, $3)
       RETURNING id, email, full_name, role, created_at`,
      [normalizedEmail, passwordHash, full_name]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed due to a server error.' });
  }
});

// POST /api/auth/login - Authenticate user and issue JWT
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const { rows } = await db.query(
      'SELECT id, email, password_hash, full_name, role, created_at FROM users WHERE LOWER(TRIM(email)) = $1',
      [normalizedEmail]
    );
    
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Sign token with user ID and role
    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Omit password hash before returning user details
    const { password_hash: _, ...userInfo } = user;
    res.json({ token, user: userInfo });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed due to a server error.' });
  }
});

// GET /api/auth/me - Get current authenticated user details
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, email, full_name, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    
    const user = rows[0];
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    res.json({ user });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Failed to retrieve profile details.' });
  }
});

module.exports = router;
