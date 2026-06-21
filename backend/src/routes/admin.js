// src/routes/admin.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const multer = require('multer');
const { parse } = require('csv-parse/sync');

// Configure multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 } // Limit file size to 2MB
});

/**
 * POST /api/admin/upload-approved
 * Upload CSV of student emails to whitelist them for registration (Admin only)
 */
router.post('/upload-approved', authenticateToken, requireRole('admin'), upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a CSV file.' });
  }

  try {
    // Parse CSV records from buffer
    const csvContent = req.file.buffer.toString('utf-8');
    const records = parse(csvContent, {
      skip_empty_lines: true,
      trim: true
    });

    if (records.length === 0) {
      return res.status(400).json({ error: 'Uploaded CSV file is empty.' });
    }

    // Determine the index of the email column.
    // If the first row is a header containing 'email', we find its index; otherwise we assume index 0.
    const firstRow = records[0];
    let emailColIdx = 0;
    let startIdx = 0;

    const hasHeader = firstRow.some(cell => cell.toLowerCase() === 'email');
    if (hasHeader) {
      emailColIdx = firstRow.findIndex(cell => cell.toLowerCase() === 'email');
      startIdx = 1; // Skip header row
    }

    // Extract valid emails
    const emails = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (let i = startIdx; i < records.length; i++) {
      const emailVal = records[i][emailColIdx];
      if (emailVal) {
        const cleanedEmail = emailVal.trim().toLowerCase();
        if (emailRegex.test(cleanedEmail)) {
          emails.push(cleanedEmail);
        }
      }
    }

    if (emails.length === 0) {
      return res.status(400).json({ error: 'No valid emails found in the uploaded CSV file.' });
    }

    // Insert emails into database (ignoring duplicates)
    const client = await db.getClient();
    let insertedCount = 0;

    try {
      await client.query('BEGIN');
      
      for (const email of emails) {
        const result = await client.query(
          'INSERT INTO approved_students (email) VALUES ($1) ON CONFLICT (email) DO NOTHING RETURNING id',
          [email]
        );
        if (result.rows.length > 0) {
          insertedCount++;
        }
      }

      await client.query('COMMIT');
    } catch (dbErr) {
      await client.query('ROLLBACK');
      throw dbErr;
    } finally {
      client.release();
    }

    res.json({
      message: 'CSV file processed successfully.',
      total_rows: records.length - startIdx,
      valid_emails_found: emails.length,
      new_emails_approved: insertedCount
    });
  } catch (err) {
    console.error('CSV upload error:', err);
    res.status(500).json({ error: 'Failed to process CSV file due to a server error.' });
  }
});

module.exports = router;
