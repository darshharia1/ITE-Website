// src/routes/announcements.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { z } = require('zod');
const { sendEmail } = require('../utils/mailer');
const logger = require('../utils/logger');

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
router.post('/', authenticateToken, requireRole(['admin', 'mentor']), async (req, res) => {
  const validation = announcementSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.errors });
  }

  const { title, content, audience_scope, team_id } = validation.data;
  const userRole = req.user.role;
  const userId = req.user.id;

  try {
    // Role-based validation and security check
    if (userRole === 'mentor') {
      if (audience_scope !== 'team') {
        return res.status(403).json({ error: 'Access forbidden: Mentors can only create team-specific announcements.' });
      }
      if (!team_id) {
        return res.status(400).json({ error: 'team_id is required for team-specific announcements.' });
      }
      // Check if team exists and belongs to the mentor
      const teamCheck = await db.query('SELECT id, mentor_id FROM teams WHERE id = $1', [team_id]);
      if (teamCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Target team not found.' });
      }
      if (teamCheck.rows[0].mentor_id !== userId) {
        return res.status(403).json({ error: 'You are not authorized to post announcements to this team.' });
      }
    } else if (userRole === 'admin') {
      // If targeted to a specific team, check if team exists
      if (audience_scope === 'team' && team_id) {
        const teamCheck = await db.query('SELECT id FROM teams WHERE id = $1', [team_id]);
        if (teamCheck.rows.length === 0) {
          return res.status(404).json({ error: 'Target team not found.' });
        }
      }
    }

    const { rows } = await db.query(
      `INSERT INTO announcements (title, content, audience_scope, team_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, content, audience_scope, team_id, created_at`,
      [title, content, audience_scope, audience_scope === 'team' ? team_id : null]
    );

    // If target audience is all students, trigger a non-blocking email broadcast
    if (audience_scope === 'all-students') {
      db.query("SELECT email FROM users WHERE role = 'student'")
        .then(async studentRes => {
          const studentEmails = studentRes.rows.map(r => r.email);
          const emailPromises = studentEmails.map(email =>
            sendEmail({
              to: email,
              subject: `New Announcement: ${title}`,
              htmlBody: `
                <h3>New Announcement Posted</h3>
                <p><strong>Title:</strong> ${title}</p>
                <p>${content.replace(/\n/g, '<br/>')}</p>
                <hr/>
                <p>Please check your student dashboard on the portal for updates.</p>
                <p>Best regards,<br/>ITE Startup Launch Pad</p>
              `
            })
          );
          await Promise.allSettled(emailPromises);
        })
        .catch(emailQueryErr => {
          logger.error('Failed to retrieve student emails for announcement broadcast:', emailQueryErr);
        });
    }

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Create announcement error:', err);
    res.status(500).json({ error: 'Failed to create announcement due to a server error.' });
  }
});

/**
 * DELETE /api/announcements/:id
 * Delete an announcement (Admin only)
 */
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await db.query('DELETE FROM announcements WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Announcement not found.' });
    res.json({ message: 'Announcement deleted.' });
  } catch (err) {
    console.error('Delete announcement error:', err);
    res.status(500).json({ error: 'Failed to delete announcement.' });
  }
});

module.exports = router;
