const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    console.log('Connected to DB');
    
    // Check tables list
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    console.log('Tables in DB:', tablesRes.rows.map(r => r.table_name));

    // Check columns of teams
    const teamsCols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'teams' AND table_schema = 'public';
    `);
    console.log('teams columns:');
    teamsCols.rows.forEach(r => console.log(`  ${r.column_name} (${r.data_type})`));

    // Check columns of announcements
    const annCols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'announcements' AND table_schema = 'public';
    `);
    console.log('announcements columns:');
    annCols.rows.forEach(r => console.log(`  ${r.column_name} (${r.data_type})`));

    // Check columns of task_submissions
    const subCols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'task_submissions' AND table_schema = 'public';
    `);
    console.log('task_submissions columns:');
    subCols.rows.forEach(r => console.log(`  ${r.column_name} (${r.data_type})`));
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
