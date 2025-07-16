// Fix analytics view and check results
import pg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pg;
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixAndCheck() {
  try {
    console.log('🔧 Fixing analytics view...');
    
    // Drop and recreate the view with proper type casting
    await pool.query(`
      DROP VIEW IF EXISTS real_estate_analytics;
      CREATE VIEW real_estate_analytics AS
      SELECT 
        cm.id,
        cm.message,
        cm.purpose,
        cm.area,
        cm.price,
        cm.description,
        cm.broker_name,
        cm.broker_mobile,
        cm.property_type,
        cm.created_at,
        CASE 
          WHEN cm.price IS NOT NULL AND cm.price::numeric < 1000000 THEN 'low'
          WHEN cm.price IS NOT NULL AND cm.price::numeric < 5000000 THEN 'medium'
          WHEN cm.price IS NOT NULL THEN 'high'
          ELSE 'unknown'
        END as price_range
      FROM chat_messages cm;
    `);
    
    console.log('✅ Analytics view fixed');
    
    // Check extraction results
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(purpose) as with_purpose,
        COUNT(area) as with_area,
        COUNT(CASE WHEN price IS NOT NULL AND price::numeric > 0 THEN 1 END) as with_price,
        COUNT(broker_mobile) as with_broker
      FROM chat_messages;
    `);
    
    console.log('\\n📊 Current Data Status:');
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
    
    // Show some sample extracted data
    const samples = await pool.query(`
      SELECT message, purpose, area, price, broker_mobile
      FROM chat_messages 
      WHERE purpose IS NOT NULL OR area IS NOT NULL OR broker_mobile IS NOT NULL
      LIMIT 5;
    `);
    
    if (samples.rows.length > 0) {
      console.log('\\n📋 Sample Extracted Data:');
      samples.rows.forEach((row, i) => {
        console.log(`   ${i+1}. Message: "${row.message?.substring(0, 50)}..."`);
        if (row.purpose) console.log(`      Purpose: ${row.purpose}`);
        if (row.area) console.log(`      Area: ${row.area}`);
        if (row.price) console.log(`      Price: ${row.price}`);
        if (row.broker_mobile) console.log(`      Broker: ${row.broker_mobile}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixAndCheck();
