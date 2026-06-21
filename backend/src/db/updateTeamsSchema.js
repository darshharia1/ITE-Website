// src/db/updateTeamsSchema.js
const db = require('../config/db');

async function run() {
  const query = `
    ALTER TABLE teams ADD COLUMN IF NOT EXISTS startup_name VARCHAR(255);
    ALTER TABLE teams ADD COLUMN IF NOT EXISTS mentor_id UUID REFERENCES users(id) ON DELETE SET NULL;
    ALTER TABLE teams ADD COLUMN IF NOT EXISTS ceo_id UUID REFERENCES users(id) ON DELETE SET NULL;
    ALTER TABLE teams ADD COLUMN IF NOT EXISTS stage INTEGER DEFAULT 1;
    
    -- Ensure default value is 1 for stage if it already exists
    ALTER TABLE teams ALTER COLUMN stage SET DEFAULT 1;
  `;
  try {
    console.log('Running schema update for teams table...');
    await db.query(query);
    console.log('✅ Teams schema update completed successfully!');
  } catch (err) {
    console.error('❌ Schema update failed:', err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

run();
