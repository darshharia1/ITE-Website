// src/db/init-db.js
const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function initializeDatabase() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  console.log(`Reading database schema from: ${schemaPath}`);

  try {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Connecting to PostgreSQL database and initializing schema...');
    
    // Execute the schema SQL
    await db.query(schemaSql);
    
    console.log('✅ Database schema initialized successfully!');
  } catch (error) {
    console.error('❌ Failed to initialize database schema:', error);
    process.exit(1);
  } finally {
    // If the pool is exported directly or we need to close it, let's handle exit.
    // Note: Since db module exports a query helper and doesn't export the pool itself,
    // we can exit the process to release the pool connection client.
    process.exit(0);
  }
}

initializeDatabase();
