// Trigger data extraction for existing chat messages
import pg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pg;
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function extractExistingData() {
  try {
    console.log('🔄 Triggering data extraction for existing messages...');
    
    // Update existing records to trigger the extraction function
    const result = await pool.query(`
      UPDATE chat_messages 
      SET message = message 
      WHERE id IS NOT NULL;
    `);
    
    console.log(`✅ Processed ${result.rowCount} messages`);
    
    // Check results
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(purpose) as with_purpose,
        COUNT(area) as with_area,
        COUNT(CASE WHEN price IS NOT NULL AND price > 0 THEN 1 END) as with_price,
        COUNT(broker_mobile) as with_broker
      FROM chat_messages;
    `);
    
    console.log('📊 Extraction Results:');
    const s = stats.rows[0];
    console.log(`   📝 Total Messages: ${s.total}`);
    console.log(`   🎯 With Purpose: ${s.with_purpose}`);
    console.log(`   📍 With Area: ${s.with_area}`);
    console.log(`   💰 With Price: ${s.with_price}`);
    console.log(`   📞 With Broker: ${s.with_broker}`);
    
    // Show purpose breakdown
    const purposes = await pool.query(`
      SELECT purpose, COUNT(*) as count 
      FROM chat_messages 
      WHERE purpose IS NOT NULL AND purpose != 'unknown'
      GROUP BY purpose
      ORDER BY count DESC;
    `);
    
    if (purposes.rows.length > 0) {
      console.log('\\n📈 Purpose Breakdown:');
      purposes.rows.forEach(row => {
        console.log(`   ${row.purpose}: ${row.count}`);
      });
    }
    
    // Show area breakdown
    const areas = await pool.query(`
      SELECT area, COUNT(*) as count 
      FROM chat_messages 
      WHERE area IS NOT NULL
      GROUP BY area
      ORDER BY count DESC
      LIMIT 10;
    `);
    
    if (areas.rows.length > 0) {
      console.log('\\n📍 Top Areas:');
      areas.rows.forEach(row => {
        console.log(`   ${row.area}: ${row.count}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error extracting data:', error.message);
  } finally {
    await pool.end();
  }
}

extractExistingData();
