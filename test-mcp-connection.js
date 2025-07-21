// Test MCP Server Connection
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_jyLVBR2De0mZ@ep-floral-water-a2ow4nw4-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    console.log('🧪 Testing MCP Server Database Connection...');
    
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Database connected at:', result.rows[0].current_time.toISOString());
    
    const propertiesCount = await pool.query('SELECT COUNT(*) as count FROM properties_import');
    console.log('✅ Properties in database:', propertiesCount.rows[0].count);
    
    const messagesCount = await pool.query('SELECT COUNT(*) as count FROM chat_messages');
    console.log('✅ Chat messages in database:', messagesCount.rows[0].count);
    
    console.log('');
    console.log('🎉 MCP Server database connection is working!');
    console.log('Ready for Claude Desktop integration.');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();
