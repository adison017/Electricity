import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
  console.log('Starting database migration...');

  // Read and execute migration files
  const fs = require('fs');
  const path = require('path');
  
  // Run first migration (base tables)
  console.log('Running base schema migration...');
  const migration1 = fs.readFileSync(path.join(__dirname, '001-create-tables.sql'), 'utf8');
  await sql(migration1);
  console.log('Base schema created');

  // Run second migration (global devices)
  console.log('Running global devices migration...');
  const migration2 = fs.readFileSync(path.join(__dirname, '002-add-global-devices.sql'), 'utf8');
  await sql(migration2);
  console.log('Global devices table created');

  console.log('All migrations completed successfully!');
}

runMigration().catch(console.error);
