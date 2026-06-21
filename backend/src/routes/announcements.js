// src/routes/announcements.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { z } = require('zod');

// Schema validation for creating an announcement
const announcementSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  audience_scope: z.enum(['all-students', 'all-mentors', 'team']),
  team_id: z.string().uuid().optional().nullable(),
}).refine(data => {
  if (data.audience_scope === 'team' && !data.team_id) {
    return false;
  }
  return true;
}, {
  message: "team_id is required when audience_scope is 'team'",
  path: ['team_id']
});

/**
 * GET /api/announcements
 * Retrieve announcements filtered by user role and team membership
 */
router.get('/', authenticateToken, async (req, res) => {
  const user_id = req.user.id;
  const role = req.user.role;

  try {
    let queryText = '';
    let queryParams = [];

    if (role === 'admin') {
      // Admins can see all announcements
      queryText = 'SELECT * FROM announcements ORDER BY created_at DESC';
    } else if (role === 'mentor') {
      // Mentors see all-mentors announcements
      queryText = "SELECT * FROM announcements WHERE audience_scope = 'all-mentors' ORDER BY created_at DESC";
    } else {
      // Students see all-students announcements, plus their team specific ones
      // First find user's team if any
      const teamRes = await db.query(
        'SELECT team_id FROM team_members WHERE user_id = $1',
        [user_id]
      );
      
      const team_id = teamRes.rows.length > 0 ? teamRes.rows[0].team_id : null;

      if (team_id) {
        queryText = `
          SELECT * FROM announcements 
          WHERE audience_scope = 'all-students' 
             OR (audience_scope = 'team' AND team_id = $1)
          ORDER BY created_at DESC`;
        queryParams = [team_id];
      } else {
        queryText = `
          SELECT * FROM announcements 
          WHERE audience_scope = 'all-students'
          ORDER BY created_at DESC`;
      }
    }

    const { rows } = await db.query(queryText, queryParams);
    res.json(rows);
  } catch (err) {
    console.error('Fetch announcements error:', err);
    res.status(500).json({ error: 'Failed to fetch announcements due to a server error.' });
  }
});

/**
 * POST /api/announcements
 * Create a new announcement (Admin only)
 */
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
  const validation = announcementSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.errors });
  }

  const { title, content, audience_scope, team_id } = validation.data;

  try {
    // If targeted to a specific team, check if team exists
    if (audience_scope === 'team' && team_id) {
      const teamCheck = await db.query('SELECT id FROM teams WHERE id = $1', [team_id]);
      if (teamCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Target team not found.' });
      }
    }

    const { rows } = await db.query(
      `INSERT INTO announcements (title, content, audience_scope, team_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, content, audience_scope, team_id, created_at`,
      [title, content, audience_scope, audience_scope === 'team' ? team_id : null]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Create announcement error:', err);
    res.status(500).json({ error: 'Failed to create announcement due to a server error.' });
  }
});

module.exports = router;
