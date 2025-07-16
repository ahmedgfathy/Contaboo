const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('🚀 Starting Real Estate Chat App Migration...');
  
  // Load environment variables
  require('dotenv').config();
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found. Please set it in .env file.');
    process.exit(1);
  }
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log('📊 Running database migration...');
    
    // Read and execute migration SQL
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'database', 'complete-migration.sql'), 
      'utf8'
    );
    
    await pool.query(migrationSQL);
    console.log('✅ Database migration completed successfully!');
    
    // Test the migration
    console.log('🧪 Testing migration...');
    
    const totalMessages = await pool.query('SELECT COUNT(*) as total_messages FROM chat_messages;');
    console.log(`Total messages: ${totalMessages.rows[0].total_messages}`);
    
    const structuredProps = await pool.query('SELECT COUNT(*) as structured_properties FROM structured_properties;');
    console.log(`Structured properties: ${structuredProps.rows[0].structured_properties}`);
    
    const purposeStats = await pool.query(`
      SELECT purpose, COUNT(*) as count 
      FROM chat_messages 
      WHERE purpose IS NOT NULL 
      GROUP BY purpose;
    `);
    console.log('Purpose statistics:');
    purposeStats.rows.forEach(row => {
      console.log(`  ${row.purpose}: ${row.count}`);
    });
    
    console.log('✅ Migration and testing completed!');
    
    console.log('🎯 Migration Summary:');
    console.log('   - Added structured_properties table');
    console.log('   - Enhanced chat_messages with real estate fields');
    console.log('   - Created automatic data extraction triggers');
    console.log('   - Added performance indexes');
    console.log('   - Created analytics view');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };
