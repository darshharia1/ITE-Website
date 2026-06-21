// src/routes/tasks.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const { z } = require('zod');

// Schema validation for submission
const submissionSchema = z.object({
  submission_link: z.string().url(),
});

/**
 * GET /api/tasks
 * Fetch all active tasks
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    
    // Get team_id for the user
    const memberCheck = await db.query(
      'SELECT team_id FROM team_members WHERE user_id = $1',
      [user_id]
    );
    const team_id = memberCheck.rows[0]?.team_id || null;

    let rows;
    if (team_id) {
      const result = await db.query(
        `SELECT t.id, t.title, t.description, t.due_date, t.created_at,
                ts.submission_link, ts.graded_status, ts.created_at as submitted_at
         FROM tasks t
         LEFT JOIN task_submissions ts ON t.id = ts.task_id AND ts.team_id = $1
         ORDER BY t.due_date ASC`,
        [team_id]
      );
      rows = result.rows;
    } else {
      const result = await db.query(
        `SELECT id, title, description, due_date, created_at FROM tasks ORDER BY due_date ASC`
      );
      rows = result.rows;
    }
    
    res.json(rows);
  } catch (err) {
    console.error('Fetch tasks error:', err);
    res.status(500).json({ error: 'Failed to fetch tasks due to a server error.' });
  }
});

/**
 * POST /api/tasks/:id/submit
 * Submit a solution link for a specific task (restricted to team members)
 */
router.post('/:id/submit', authenticateToken, async (req, res) => {
  const { id: task_id } = req.params;
  const user_id = req.user.id;

  const validation = submissionSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.errors });
  }

  const { submission_link } = validation.data;

  try {
    // 1. Verify the task exists
    const taskCheck = await db.query('SELECT id FROM tasks WHERE id = $1', [task_id]);
    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    // 2. Retrieve user's team membership details
    const memberCheck = await db.query(
      'SELECT team_id FROM team_members WHERE user_id = $1',
      [user_id]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Only members of a startup team can submit tasks.' });
    }

    const { team_id } = memberCheck.rows[0];

    // 3. Check if team has already submitted this task (Optional but good UX)
    const existingCheck = await db.query(
      'SELECT id FROM task_submissions WHERE task_id = $1 AND team_id = $2',
      [task_id, team_id]
    );

    let result;
    if (existingCheck.rows.length > 0) {
      // Overwrite/update the existing submission
      const updateRes = await db.query(
        `UPDATE task_submissions 
         SET submitted_by_user_id = $1, submission_link = $2, graded_status = 'ungraded', created_at = NOW()
         WHERE task_id = $3 AND team_id = $4
         RETURNING id, task_id, team_id, submitted_by_user_id, submission_link, graded_status, created_at`,
        [user_id, submission_link, task_id, team_id]
      );
      result = updateRes.rows[0];
    } else {
      // Create new submission
      const insertRes = await db.query(
        `INSERT INTO task_submissions (task_id, team_id, submitted_by_user_id, submission_link, graded_status)
         VALUES ($1, $2, $3, $4, 'ungraded')
         RETURNING id, task_id, team_id, submitted_by_user_id, submission_link, graded_status, created_at`,
        [task_id, team_id, user_id, submission_link]
      );
      result = insertRes.rows[0];
    }

    res.status(201).json(result);
  } catch (err) {
    console.error('Submit task error:', err);
    res.status(500).json({ error: 'Failed to process task submission due to a server error.' });
  }
});

module.exports = router;
