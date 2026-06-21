// src/routes/teams.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const { z } = require('zod');

// Validation schema for sending an invitation
const inviteSchema = z.object({
  team_id: z.string().uuid(),
  invitee_email: z.string().email(),
});

// Validation schema for responding to an invitation
const respondSchema = z.object({
  status: z.enum(['accepted', 'rejected']),
  role: z.enum(['CEO', 'CTO', 'CFO', 'CMO']).optional(),
});

/**
 * POST /api/teams/invitations
 * Invite another user via email to join a team
 */
router.post('/invitations', authenticateToken, async (req, res) => {
  const validation = inviteSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.errors });
  }

  const { team_id, invitee_email } = validation.data;
  const inviter_id = req.user.id;
  const normalizedEmail = invitee_email.trim().toLowerCase();

  try {
    // 1. Verify the team exists
    const teamCheck = await db.query('SELECT id FROM teams WHERE id = $1', [team_id]);
    if (teamCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found.' });
    }

    // 2. Verify the inviter is a member of that team
    const memberCheck = await db.query(
      'SELECT role FROM team_members WHERE team_id = $1 AND user_id = $2',
      [team_id, inviter_id]
    );
    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Only team members can invite new members.' });
    }

    // 3. Create the invitation record
    const { rows } = await db.query(
      `INSERT INTO invitations (team_id, inviter_id, invitee_email, status)
       VALUES ($1, $2, $3, 'pending')
       RETURNING id, team_id, inviter_id, invitee_email, status, created_at`,
      [team_id, inviter_id, normalizedEmail]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Invite error:', err);
    res.status(500).json({ error: 'Failed to create invitation due to a server error.' });
  }
});

/**
 * POST /api/teams/invitations/:id/respond
 * Respond to a pending invitation (accept/reject)
 */
router.post('/invitations/:id/respond', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const validation = respondSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.errors });
  }

  const { status, role } = validation.data;
  const user_id = req.user.id;

  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    // 1. Fetch invitation and verify it exists
    const inviteRes = await client.query(
      'SELECT * FROM invitations WHERE id = $1',
      [id]
    );
    const invite = inviteRes.rows[0];

    if (!invite) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Invitation not found.' });
    }

    if (invite.status !== 'pending') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Invitation has already been responded to.' });
    }

    // 2. Fetch invitee email to verify they match the logged-in user
    const userRes = await client.query(
      'SELECT email FROM users WHERE id = $1',
      [user_id]
    );
    const user = userRes.rows[0];

    if (!user || user.email.toLowerCase() !== invite.invitee_email.toLowerCase()) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'You are not the intended recipient of this invitation.' });
    }

    if (status === 'rejected') {
      // Simply mark as rejected
      const { rows } = await client.query(
        `UPDATE invitations SET status = 'rejected' WHERE id = $1 RETURNING *`,
        [id]
      );
      await client.query('COMMIT');
      return res.json({ message: 'Invitation rejected.', invitation: rows[0] });
    }

    // If status is 'accepted'
    if (!role) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'A role must be specified when accepting an invitation.' });
    }

    // 3. Verify user is not already on any team
    const currentMemberCheck = await client.query(
      'SELECT team_id FROM team_members WHERE user_id = $1',
      [user_id]
    );
    if (currentMemberCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'You are already a member of a team. Leave your current team first.' });
    }

    // 4. Check if role is already filled in that team (to avoid unique key violation error user-side)
    const roleCheck = await client.query(
      'SELECT user_id FROM team_members WHERE team_id = $1 AND role = $2',
      [invite.team_id, role]
    );
    if (roleCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: `The role of ${role} is already filled in this team.` });
    }

    // 5. Update invitation status to accepted
    await client.query(
      `UPDATE invitations SET status = 'accepted' WHERE id = $1`,
      [id]
    );

    // 6. Insert into team members
    const memberRes = await client.query(
      `INSERT INTO team_members (team_id, user_id, role)
       VALUES ($1, $2, $3)
       RETURNING team_id, user_id, role, joined_at`,
      [invite.team_id, user_id, role]
    );

    await client.query('COMMIT');
    res.json({
      message: 'Invitation accepted. You are now a team member.',
      membership: memberRes.rows[0]
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Respond invitation error:', err);
    res.status(500).json({ error: 'Failed to process invitation response due to a database error.' });
  } finally {
    client.release();
  }
});

module.exports = router;
