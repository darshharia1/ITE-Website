// src/db/seedDevData.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');

async function seedDevData() {
  console.log('⏳ Starting development database seeding...');
  const client = await db.getClient();

  try {
    // Start transaction
    await client.query('BEGIN');

    // 1. Truncate all tables to start from a clean slate
    console.log('🧹 Truncating existing tables...');
    await client.query(`
      TRUNCATE TABLE 
        users, 
        approved_students, 
        teams, 
        team_members, 
        invitations, 
        tasks, 
        task_submissions, 
        announcements, 
        previous_startups 
      CASCADE
    `);

    // 2. Hash password for dev users
    const defaultPassword = 'password123';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    console.log(`🔑 Generated bcrypt hash for password "${defaultPassword}"`);

    // 3. Seed Approved Students Registry (so whitelisted emails can sign up)
    console.log('📌 Seeding approved students registry...');
    const whitelistedEmails = [
      'bt25min036@students.vnit.ac.in',
      'bt25eee085@students.vnit.ac.in',
      'bt23eee026@students.vnit.ac.in',
      'bt24eee010@students.vnit.ac.in'
    ];

    for (const email of whitelistedEmails) {
      await client.query(
        'INSERT INTO approved_students (email) VALUES ($1)',
        [email]
      );
    }

    // 4. Seed Users (Admin, Mentors, Students)
    console.log('👤 Seeding users...');
    
    // Seed Admin
    const adminRes = await client.query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, role`,
      ['admin@vnit.ac.in', passwordHash, 'Admin Administrator', 'admin']
    );
    const admin = adminRes.rows[0];

    // Seed Mentors
    const mentor1Res = await client.query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, role`,
      ['mentor1@vnit.ac.in', passwordHash, 'Dr. Arpan Kumar', 'mentor']
    );
    const mentor2Res = await client.query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, role`,
      ['mentor2@vnit.ac.in', passwordHash, 'Dr. Sunita Sharma', 'mentor']
    );
    const mentor1 = mentor1Res.rows[0];
    const mentor2 = mentor2Res.rows[0];

    // Seed Students
    const student1Res = await client.query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, role`,
      ['bt25min036@students.vnit.ac.in', passwordHash, 'Aniket Deshmukh', 'student']
    );
    const student2Res = await client.query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, role`,
      ['bt25eee085@students.vnit.ac.in', passwordHash, 'Bhavana Patel', 'student']
    );
    const student3Res = await client.query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, role`,
      ['bt23eee026@students.vnit.ac.in', passwordHash, 'Chaitanya Joshi', 'student']
    );
    const student4Res = await client.query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, role`,
      ['bt24eee010@students.vnit.ac.in', passwordHash, 'Divya Nair', 'student']
    );
    const s1 = student1Res.rows[0];
    const s2 = student2Res.rows[0];
    const s3 = student3Res.rows[0];
    const s4 = student4Res.rows[0];

    // 5. Seed Teams / Startups
    console.log('🚀 Seeding teams/startups...');
    
    // Team A: Solaris Energy (Mentored by Mentor 1, CEO is Student 1)
    const teamARes = await client.query(
      `INSERT INTO teams (team_name, startup_name, industry, problem_statement, description, mentor_id, ceo_id, stage, startup_idea_description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, team_name`,
      [
        'Solaris Energy',
        'Solaris Energy',
        'CleanTech',
        'High upfront installation cost and lack of optimization in community solar grid mapping.',
        'An IoT-enabled smart local solar microgrid controller optimizing peak-load distribution for residential communities.',
        mentor1.id,
        s1.id,
        2,
        'Deploying community microgrids with peer-to-peer electricity sharing algorithms.'
      ]
    );
    const teamA = teamARes.rows[0];

    // Team B: MedTech AI (Mentored by Mentor 2, CEO is Student 3)
    const teamBRes = await client.query(
      `INSERT INTO teams (team_name, startup_name, industry, problem_statement, description, mentor_id, ceo_id, stage, startup_idea_description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, team_name`,
      [
        'MedTech AI Diagnostics',
        'MedTech AI',
        'Healthcare',
        'Delayed diagnosis of diabetic retinopathy in rural medical camps due to expert shortage.',
        'A portable retinal scanning camera powered by offline deep learning classification models.',
        mentor2.id,
        s3.id,
        3,
        'Mobile clinical trial for edge device neural networks trained on public ocular databases.'
      ]
    );
    const teamB = teamBRes.rows[0];

    // 6. Seed Team Members (Junction table mappings)
    console.log('👥 Seeding team members...');
    
    // Team A Members (CEO: Student 1, CTO: Student 2)
    await client.query(
      `INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, $3)`,
      [teamA.id, s1.id, 'CEO']
    );
    await client.query(
      `INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, $3)`,
      [teamA.id, s2.id, 'CTO']
    );

    // Team B Members (CEO: Student 3, CTO: Student 4)
    await client.query(
      `INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, $3)`,
      [teamB.id, s3.id, 'CEO']
    );
    await client.query(
      `INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, $3)`,
      [teamB.id, s4.id, 'CTO']
    );

    // 7. Seed Milestone Tasks
    console.log('📋 Seeding milestone tasks...');
    const now = new Date();

    const task1Res = await client.query(
      `INSERT INTO tasks (title, description, due_date)
       VALUES ($1, $2, $3)
       RETURNING id, title`,
      [
        'Submit Pitch Deck PDF',
        'Upload your final pitch deck in PDF format. Make sure it contains problem definition, solution overview, market validation, business model, and competitor analysis.',
        new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days in the future
      ]
    );
    const task2Res = await client.query(
      `INSERT INTO tasks (title, description, due_date)
       VALUES ($1, $2, $3)
       RETURNING id, title`,
      [
        'Submit Prototype Video Link',
        'Submit a YouTube/Vimeo video link demonstrating your working MVP/prototype. Highlight core technology and user flows. (Max 3 minutes)',
        new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000) // 14 days in the future
      ]
    );
    const task3Res = await client.query(
      `INSERT INTO tasks (title, description, due_date)
       VALUES ($1, $2, $3)
       RETURNING id, title`,
      [
        'Submit Financial Plan Worksheet',
        'Submit the detailed financial spreadsheet projections showing cash flow runway, cost structures, and unit economics validation.',
        new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days in the past (overdue/completed)
      ]
    );
    const t1 = task1Res.rows[0];
    const t2 = task2Res.rows[0];
    const t3 = task3Res.rows[0];

    // 8. Seed Task Submissions (Pending and Graded)
    console.log('📝 Seeding task submissions...');
    
    // Solaris (Team A) submits Task 1 - Pitch Deck (State: ungraded / pending mentor review)
    await client.query(
      `INSERT INTO task_submissions (task_id, team_id, submitted_by_user_id, submission_link, graded_status)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        t1.id,
        teamA.id,
        s1.id,
        'https://ite-startup-studio-pitchdecks.s3.amazonaws.com/tasks/' + t1.id + '/teams/' + teamA.id + '/solaris_pitch_deck.pdf',
        'ungraded'
      ]
    );

    // Solaris (Team A) submits Task 3 - Financial Plan (State: graded / approved)
    await client.query(
      `INSERT INTO task_submissions (task_id, team_id, submitted_by_user_id, submission_link, graded_status)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        t3.id,
        teamA.id,
        s2.id,
        'https://docs.google.com/spreadsheets/d/1BXIn_w5T5X5zB9z_solaris_financials_vnit',
        'graded'
      ]
    );

    // MedTech AI (Team B) submits Task 3 - Financial Plan (State: ungraded / pending mentor review)
    await client.query(
      `INSERT INTO task_submissions (task_id, team_id, submitted_by_user_id, submission_link, graded_status)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        t3.id,
        teamB.id,
        s3.id,
        'https://docs.google.com/spreadsheets/d/2CXIn_w6T6X6zC0z_medtech_financials_vnit',
        'ungraded'
      ]
    );

    // Commit Transaction
    await client.query('COMMIT');
    console.log('✅ Database seeded successfully with mock development data!');
    
    console.log('\n--- Mock Accounts Seeding Info ---');
    console.log(`Admin User:   admin@vnit.ac.in (Password: "${defaultPassword}")`);
    console.log(`Mentor 1:     mentor1@vnit.ac.in (Password: "${defaultPassword}")`);
    console.log(`Mentor 2:     mentor2@vnit.ac.in (Password: "${defaultPassword}")`);
    console.log(`Student 1:    bt25min036@students.vnit.ac.in (Password: "${defaultPassword}", Team: Solaris Energy, Role: CEO)`);
    console.log(`Student 2:    bt25eee085@students.vnit.ac.in (Password: "${defaultPassword}", Team: Solaris Energy, Role: CTO)`);
    console.log(`Student 3:    bt23eee026@students.vnit.ac.in (Password: "${defaultPassword}", Team: MedTech AI, Role: CEO)`);
    console.log(`Student 4:    bt24eee010@students.vnit.ac.in (Password: "${defaultPassword}", Team: MedTech AI, Role: CTO)`);
    console.log('---------------------------------\n');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding process failed. Transaction rolled back:', error);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

seedDevData();
