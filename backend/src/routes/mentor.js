// src/routes/mentor.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { z } = require('zod');

// Validation schema for advancing startup stage
const advanceStageSchema = z.object({
  stage: z.number().int().min(1).max(6)
});

// Validation schema for creating announcements
const announcementSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  target_team_id: z.string().uuid().optional()
});

/**
 * GET /api/mentor/teams
 * Fetch all teams assigned to the logged-in mentor
 */
router.get('/teams', authenticateToken, requireRole(['mentor', 'admin']), async (req, res) => {
  const mentorId = req.user.id;
  try {
    const { rows } = await db.query(
      'SELECT id, team_name, startup_name, industry, problem_statement, description, stage, created_at FROM teams WHERE mentor_id = $1 ORDER BY team_name ASC',
      [mentorId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Fetch mentor teams error:', err);
    res.status(500).json({ error: 'Failed to fetch teams.' });
  }
});

/**
 * POST /api/mentor/teams/:id/advance-stage
 * Update the startup stage for a specific team
 */
router.post('/teams/:id/advance-stage', authenticateToken, requireRole(['mentor', 'admin']), async (req, res) => {
  const { id } = req.params;
  const mentorId = req.user.id;
  
  const validation = advanceStageSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.errors });
  }
  const { stage } = validation.data;

  try {
    // Verify the team belongs to this mentor (unless they are admin)
    if (req.user.role !== 'admin') {
      const teamCheck = await db.query(
        'SELECT id FROM teams WHERE id = $1 AND mentor_id = $2',
        [id, mentorId]
      );
      if (teamCheck.rows.length === 0) {
        return res.status(403).json({ error: 'You are not authorized to manage this team.' });
      }
    }

    const { rows } = await db.query(
      'UPDATE teams SET stage = $1 WHERE id = $2 RETURNING *',
      [stage, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Team not found.' });
    }

    res.json({ message: `Successfully advanced team stage to ${stage}.`, team: rows[0] });
  } catch (err) {
    console.error('Advance stage error:', err);
    res.status(500).json({ error: 'Failed to update team stage.' });
  }
});

/**
 * POST /api/mentor/announcements
 * Create an announcement targeted to the mentor's assigned teams or a specific team
 */
router.post('/announcements', authenticateToken, requireRole(['mentor', 'admin']), async (req, res) => {
  const mentorId = req.user.id;
  const validation = announcementSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.errors });
  }
  const { title, content, target_team_id } = validation.data;

  try {
    if (target_team_id) {
      // Verify team belongs to the mentor (unless admin)
      if (req.user.role !== 'admin') {
        const teamCheck = await db.query(
          'SELECT id FROM teams WHERE id = $1 AND mentor_id = $2',
          [target_team_id, mentorId]
        );
        if (teamCheck.rows.length === 0) {
          return res.status(403).json({ error: 'You can only post announcements to your assigned teams.' });
        }
      }

      const { rows } = await db.query(
        `INSERT INTO announcements (title, content, audience_scope, team_id)
         VALUES ($1, $2, 'team', $3) RETURNING *`,
        [title, content, target_team_id]
      );
      return res.status(201).json(rows[0]);
    } else {
      // If target_team_id is not specified, post to all teams assigned to this mentor
      const teamsRes = await db.query(
        'SELECT id FROM teams WHERE mentor_id = $1',
        [mentorId]
      );
      const mentorTeams = teamsRes.rows;

      if (mentorTeams.length === 0) {
        return res.status(400).json({ error: 'You must have at least one assigned team to post a general announcement.' });
      }

      const announcements = [];
      for (const team of mentorTeams) {
        const { rows } = await db.query(
          `INSERT INTO announcements (title, content, audience_scope, team_id)
           VALUES ($1, $2, 'team', $3) RETURNING *`,
          [title, content, team.id]
        );
        announcements.push(rows[0]);
      }

      res.status(201).json({ message: `Announcement posted to ${announcements.length} teams.`, announcements });
    }
  } catch (err) {
    console.error('Post announcement error:', err);
    res.status(500).json({ error: 'Failed to create announcement.' });
  }
});

/**
 * GET /api/mentor/dashboard
 * Return statistics and recent activities/announcements for the logged-in mentor
 */
router.get('/dashboard', authenticateToken, requireRole(['mentor', 'admin']), async (req, res) => {
  const mentorId = req.user.id;

  try {
    // 1. Total count of teams assigned to them
    const teamsCountRes = await db.query(
      'SELECT COUNT(*) as count FROM teams WHERE mentor_id = $1',
      [mentorId]
    );
    const totalTeams = parseInt(teamsCountRes.rows[0].count, 10);

    // 2. Total number of pending task submissions from their teams that need grading (ungraded)
    const pendingGradingRes = await db.query(
      `SELECT COUNT(*) as count 
       FROM task_submissions ts
       JOIN teams t ON ts.team_id = t.id
       WHERE t.mentor_id = $1 AND ts.graded_status = 'ungraded'`,
      [mentorId]
    );
    const pendingGrading = parseInt(pendingGradingRes.rows[0].count, 10);

    // 3. Quick list of recent announcements they have made (last 5)
    const recentAnnouncementsRes = await db.query(
      `SELECT a.id, a.title, a.content, a.audience_scope, a.team_id, a.created_at, t.team_name
       FROM announcements a
       JOIN teams t ON a.team_id = t.id
       WHERE t.mentor_id = $1
       ORDER BY a.created_at DESC
       LIMIT 5`,
      [mentorId]
    );

    res.json({
      stats: {
        totalTeams,
        pendingGrading
      },
      recentAnnouncements: recentAnnouncementsRes.rows
    });
  } catch (err) {
    console.error('Fetch mentor dashboard error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics.' });
  }
});

module.exports = router;
