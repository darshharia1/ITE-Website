// src/routes/startups.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const { z } = require('zod');

// Validation schema for a startup/team
const startupSchema = z.object({
  startupName: z.string().min(1),
  industry: z.string().optional(),
  problemStatement: z.string().optional(),
  description: z.string().optional(),
  mentorId: z.string().uuid().optional(),
  ceoId: z.string().uuid().optional(),
  stage: z.number().int().min(1).max(6).optional()
});

// GET all startups
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM teams');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch startups' });
  }
});

// GET /previous-startups - Fetch historical previous startups ordered by batch_year DESC
router.get('/previous-startups', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, startup_name, description, batch_year, created_at FROM previous_startups ORDER BY batch_year DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Fetch previous startups error:', err);
    res.status(500).json({ error: 'Failed to fetch previous startups due to a server error.' });
  }
});

// GET startup by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query('SELECT * FROM teams WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Startup not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch startup' });
  }
});

// CREATE a new startup (protected)
router.post('/', authenticateToken, async (req, res) => {
  const validation = startupSchema.safeParse(req.body);
  if (!validation.success) return res.status(400).json({ error: validation.error.errors });
  const { startupName, industry, problemStatement, description, mentorId, ceoId, stage } = validation.data;
  try {
    const { rows } = await db.query(
      `INSERT INTO teams (startup_name, industry, problem_statement, description, mentor_id, ceo_id, stage)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [startupName, industry, problemStatement, description, mentorId, ceoId, stage ?? 1]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create startup' });
  }
});

// UPDATE a startup (protected)
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const validation = startupSchema.partial().safeParse(req.body);
  if (!validation.success) return res.status(400).json({ error: validation.error.errors });
  
  const COLUMN_MAP = {
    startupName: 'startup_name',
    industry: 'industry',
    problemStatement: 'problem_statement',
    description: 'description',
    mentorId: 'mentor_id',
    ceoId: 'ceo_id',
    stage: 'stage',
    startupIdeaDescription: 'startup_idea_description'
  };

  const fields = [];
  const values = [];
  let idx = 1;
  for (const [key, value] of Object.entries(validation.data)) {
    const columnName = COLUMN_MAP[key];
    if (columnName) {
      if (columnName === 'startup_name') {
        fields.push(`"startup_name" = $${idx}`);
        values.push(value);
        idx++;
        fields.push(`"team_name" = $${idx}`);
        values.push(value);
        idx++;
      } else {
        fields.push(`"${columnName}" = $${idx}`);
        values.push(value);
        idx++;
      }
    }
  }

  if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
  values.push(id);
  const setClause = fields.join(', ');
  try {
    const { rows } = await db.query(`UPDATE teams SET ${setClause} WHERE id = $${idx} RETURNING *`, values);
    if (rows.length === 0) return res.status(404).json({ error: 'Startup not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Update startup error:', err);
    res.status(500).json({ error: 'Failed to update startup' });
  }
});

// DELETE a startup (protected)
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await db.query('DELETE FROM teams WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Startup not found' });
    res.json({ message: 'Startup deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete startup' });
  }
});

module.exports = router;
