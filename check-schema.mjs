// Check database schema first
import pg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pg;
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
  try {
    console.log('🔍 Checking database schema...');
    
    // Check what tables exist
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('📋 Available tables:');
    tables.rows.forEach(row => console.log(`  - ${row.table_name}`));
    
    // Check chat_messages columns
    const chatColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'chat_messages'
      ORDER BY ordinal_position;
    `);
    
    console.log('\\n📋 chat_messages columns:');
    if (chatColumns.rows.length === 0) {
      console.log('  ❌ chat_messages table does not exist!');
    } else {
      chatColumns.rows.forEach(row => {
        console.log(`  - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    }
    
    // Check properties_import columns
    const propColumns = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'properties_import'
      ORDER BY ordinal_position;
    `);
    
    console.log('\\n📋 properties_import columns:');
    if (propColumns.rows.length === 0) {
      console.log('  ❌ properties_import table does not exist!');
    } else {
      propColumns.rows.forEach(row => {
        console.log(`  - ${row.column_name} (${row.data_type})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking schema:', error.message);
  } finally {
    await pool.end();
  }
}

checkSchema();
