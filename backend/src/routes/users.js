// src/routes/users.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { z } = require('zod');
const { authenticateToken } = require('../middleware/auth');

// Validation schema for a user (simplified)
const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6),
  rollNo: z.string().optional(),
  branch: z.string().optional(),
  role: z.enum(['admin', 'mentor', 'student']).default('student'),
  skills: z.array(z.string()).optional(),
  teamId: z.string().uuid().optional(),
  mentorId: z.string().uuid().optional(),
});

// GET all users (Protected)
router.get('/', authenticateToken, async (req, res) => {
  const { role, id: userId } = req.user;

  try {
    if (role === 'admin') {
      // Admin sees everyone (excluding password_hash)
      const { rows } = await db.query(
        'SELECT id, email, full_name, role, created_at FROM users ORDER BY full_name ASC'
      );
      return res.json(rows);
    } else if (role === 'mentor') {
      // Mentor sees students belonging to their assigned teams
      const { rows } = await db.query(
        `SELECT DISTINCT u.id, u.email, u.full_name, u.role, u.created_at
         FROM users u
         JOIN team_members tm ON u.id = tm.user_id
         JOIN teams t ON tm.team_id = t.id
         WHERE t.mentor_id = $1 AND u.role = 'student'
         ORDER BY u.full_name ASC`,
        [userId]
      );
      return res.json(rows);
    } else {
      // Students or any other roles are blocked
      return res.status(403).json({
        error: "Access denied. You do not have permission to view the global user directory."
      });
    }
  } catch (err) {
    console.error('Fetch users error:', err);
    res.status(500).json({ error: 'Failed to fetch users due to a server error.' });
  }
});

// GET user by id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST create a new user
router.post('/', authenticateToken, async (req, res) => {
  const validation = userSchema.safeParse(req.body);
  if (!validation.success) return res.status(400).json({ error: validation.error.errors });
  const { email, name, password, rollNo, branch, role, skills, teamId, mentorId } = validation.data;
  try {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    const { rows } = await db.query(
      `INSERT INTO users (email, name, password, "rollNo", branch, role, skills, "teamId", "mentorId")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [email, name, hashedPassword, rollNo, branch, role, skills, teamId, mentorId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT update a user
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const validation = userSchema.partial().safeParse(req.body);
  if (!validation.success) return res.status(400).json({ error: validation.error.errors });
  const fields = [];
  const values = [];
  let idx = 1;
  const bcrypt = require('bcryptjs');
  for (const [key, value] of Object.entries(validation.data)) {
    if (key === 'password') {
      const hashed = await bcrypt.hash(value, 10);
      fields.push(`"${key}" = $${idx}`);
      values.push(hashed);
    } else {
      fields.push(`"${key}" = $${idx}`);
      values.push(value);
    }
    idx++;
  }
  if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
  values.push(id);
  const setClause = fields.join(', ');
  try {
    const { rows } = await db.query(`UPDATE users SET ${setClause} WHERE id = $${idx} RETURNING *`, values);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE a user
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await db.query('DELETE FROM users WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
