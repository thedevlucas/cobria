// Run Database Schema Fix
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runDatabaseFix() {
  const client = new Client({
    host: process.env.DATABASE_HOST || 'localhost',
    port: process.env.DATABASE_PORT || 5432,
    database: process.env.DATABASE_NAME || 'cobraria_db',
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'password',
  });

  try {
    console.log('🔧 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    // Read the SQL file
    const sqlFile = path.join(__dirname, 'fix-database-schema.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('🔧 Running database schema fix...');
    await client.query(sql);
    console.log('✅ Database schema fixed successfully');

    // Test the fix by querying the cost table
    console.log('🧪 Testing database fix...');
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'cost' 
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Cost table columns:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });

    console.log('🎉 Database fix completed successfully!');

  } catch (error) {
    console.error('❌ Database fix failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runDatabaseFix();
