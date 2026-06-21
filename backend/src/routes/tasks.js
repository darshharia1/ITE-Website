// src/routes/tasks.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { z } = require('zod');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { s3 } = require('../config/aws');
const { PutObjectCommand } = require('@aws-sdk/client-s3');

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

/**
 * POST /api/tasks/:id/upload
 * Upload a submission file directly to S3 and save the URL to task_submissions (restricted to team members)
 */
router.post('/:id/upload', authenticateToken, upload.single('file'), async (req, res) => {
  const { id: task_id } = req.params;
  const user_id = req.user.id;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

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
      return res.status(403).json({ error: 'Only members of a startup team can upload task submissions.' });
    }

    const { team_id } = memberCheck.rows[0];

    // 3. Upload file buffer to S3
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    if (!bucketName) {
      return res.status(500).json({ error: 'AWS S3 bucket name is not configured on the server.' });
    }

    // Generate a unique key for the file to prevent collisions
    const fileExtension = file.originalname.split('.').pop();
    const uniqueKey = `tasks/${task_id}/teams/${team_id}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExtension}`;

    const uploadParams = {
      Bucket: bucketName,
      Key: uniqueKey,
      Body: file.buffer,
      ContentType: file.mimetype
    };

    await s3.send(new PutObjectCommand(uploadParams));

    // Construct public S3 URL
    const region = process.env.AWS_REGION || 'us-east-1';
    const submission_link = `https://${bucketName}.s3.${region}.amazonaws.com/${uniqueKey}`;

    // 4. Save/update to database in task_submissions table
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

    res.status(201).json({
      message: 'File uploaded and submitted successfully.',
      submission_link,
      submission: result
    });
  } catch (err) {
    console.error('File upload and submit error:', err);
    res.status(500).json({ error: 'Failed to process file upload and task submission.' });
  }
});

// Validation schema for creating/updating a task
const taskCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  due_date: z.string().optional().nullable()
});

// Validation schema for grading a task submission
const gradeSchema = z.object({
  graded_status: z.enum(['approved', 'rejected', 'needs_revision', 'graded', 'resubmission_required'])
});

/**
 * POST /api/tasks (Admin Only)
 * Create a new task
 */
router.post('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  const validation = taskCreateSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.errors });
  }
  const { title, description, due_date } = validation.data;
  try {
    const { rows } = await db.query(
      `INSERT INTO tasks (title, description, due_date)
       VALUES ($1, $2, $3) RETURNING *`,
      [title, description || null, due_date || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ error: 'Failed to create task due to a server error.' });
  }
});

/**
 * PUT /api/tasks/:id (Admin Only)
 * Update an existing task
 */
router.put('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  const { id } = req.params;
  const validation = taskCreateSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.errors });
  }
  const { title, description, due_date } = validation.data;
  try {
    const { rows } = await db.query(
      `UPDATE tasks 
       SET title = $1, description = $2, due_date = $3
       WHERE id = $4 RETURNING *`,
      [title, description || null, due_date || null, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Task not found.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ error: 'Failed to update task due to a server error.' });
  }
});

/**
 * DELETE /api/tasks/:id (Admin Only)
 * Delete an existing task
 */
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await db.query('DELETE FROM tasks WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Task not found.' });
    }
    res.json({ message: 'Task deleted successfully.' });
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({ error: 'Failed to delete task due to a server error.' });
  }
});

/**
 * PUT /api/tasks/submissions/:id/grade (Mentor/Admin Only)
 * Grade a student task submission
 */
router.put('/submissions/:id/grade', authenticateToken, requireRole(['mentor', 'admin']), async (req, res) => {
  const { id } = req.params;
  const validation = gradeSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.errors });
  }
  const { graded_status } = validation.data;
  
  // Align graded_status to database check constraints
  let statusVal = graded_status;
  if (statusVal === 'approved') statusVal = 'graded';
  if (statusVal === 'needs_revision' || statusVal === 'rejected') statusVal = 'resubmission_required';

  try {
    const { rows } = await db.query(
      `UPDATE task_submissions 
       SET graded_status = $1 
       WHERE id = $2 RETURNING *`,
      [statusVal, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Submission not found.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Grade submission error:', err);
    res.status(500).json({ error: 'Failed to grade submission due to a server error.' });
  }
});

module.exports = router;
