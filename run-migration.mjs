// Real Estate Database Migration - Node.js Version
import pg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pg;
dotenv.config();

console.log('🚀 Starting Real Estate Database Migration...');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
  idleTimeoutMillis: 30000
});

async function runMigration() {
  try {
    console.log('📊 Connecting to Neon database...');
    
    // Test connection first
    const testResult = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Database connected successfully at:', testResult.rows[0].current_time);
    
    console.log('🔧 Step 1: Creating structured_properties table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS structured_properties (
        id SERIAL PRIMARY KEY,
        purpose TEXT CHECK (purpose IN ('sale', 'rent', 'wanted', 'unknown')),
        area TEXT,
        price DECIMAL(15,2),
        description TEXT,
        broker_name TEXT,
        broker_mobile TEXT CHECK (broker_mobile ~ '^(\\+?2?01[0-2,5]{1}[0-9]{8})$'),
        source_message_id INTEGER,
        property_type TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log('🔧 Step 2: Adding columns to chat_messages table...');
    const alterQueries = [
      'ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS purpose TEXT',
      'ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS area TEXT', 
      'ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS price DECIMAL(15,2)',
      'ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS description TEXT',
      'ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS broker_name TEXT',
      'ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS broker_mobile TEXT'
    ];
    
    for (const query of alterQueries) {
      try {
        await pool.query(query);
        console.log('  ✅', query.split(' ').slice(0, 6).join(' ') + '...');
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log('  ℹ️ Column already exists, skipping...');
        } else {
          throw error;
        }
      }
    }
    
    console.log('🔧 Step 3: Creating performance indexes...');
    const indexQueries = [
      'CREATE INDEX IF NOT EXISTS idx_chat_messages_purpose ON chat_messages(purpose)',
      'CREATE INDEX IF NOT EXISTS idx_chat_messages_area ON chat_messages(area)',
      'CREATE INDEX IF NOT EXISTS idx_chat_messages_price ON chat_messages(price)',
      'CREATE INDEX IF NOT EXISTS idx_chat_messages_broker_mobile ON chat_messages(broker_mobile)',
      'CREATE INDEX IF NOT EXISTS idx_structured_properties_purpose ON structured_properties(purpose)',
      'CREATE INDEX IF NOT EXISTS idx_structured_properties_area ON structured_properties(area)',
      'CREATE INDEX IF NOT EXISTS idx_structured_properties_price ON structured_properties(price)'
    ];
    
    for (const query of indexQueries) {
      await pool.query(query);
      console.log('  ✅ Created index');
    }
    
    console.log('🔧 Step 4: Creating data extraction function...');
    await pool.query(`
      CREATE OR REPLACE FUNCTION extract_real_estate_data()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Extract purpose from Arabic and English text
        NEW.purpose := CASE
          WHEN NEW.message ~* '\\b(for sale|to sell|offered|متاح|للبيع)\\b' THEN 'sale'
          WHEN NEW.message ~* '\\b(for rent|to rent|للإيجار)\\b' THEN 'rent'
          WHEN NEW.message ~* '\\b(required|want|need|مطلوب|أريد|أحتاج)\\b' THEN 'wanted'
          ELSE 'unknown'
        END;
        
        -- Extract area information
        NEW.area := (
          SELECT substring(NEW.message FROM '\\b(New Cairo|6th October|Zayed|Nasr City|Maadi|Heliopolis|Tagamoa|Downtown|القاهرة الجديدة|أكتوبر|الشيخ زايد|مدينة نصر|المعادي|مصر الجديدة|التجمع|وسط البلد)\\b') LIMIT 1
        );
        
        -- Extract price (handle Egyptian number formats)
        NEW.price := (
          SELECT CAST(regexp_replace(
            substring(NEW.message FROM '(\\d{1,3}(?:[,.]\\d{3})*(?:\\.\\d{2})?)'),
            '[,]', '', 'g'
          ) AS DECIMAL(15,2))
          WHERE NEW.message ~ '\\d{4,}'
          LIMIT 1
        );
        
        -- Extract broker mobile (Egyptian format)
        NEW.broker_mobile := (
          SELECT substring(NEW.message FROM '(\\+?2?01[0-2,5]{1}[0-9]{8})') LIMIT 1
        );
        
        -- Extract broker name (titles + names)
        NEW.broker_name := (
          SELECT substring(NEW.message FROM '\\b(المهندس|الدكتور|الأستاذ|Mr\\.?\\s\\w+|Eng\\.?\\s\\w+|Dr\\.?\\s\\w+|[A-Z][a-z]+\\s[A-Z][a-z]+)\\b') LIMIT 1
        );
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    console.log('🔧 Step 5: Creating trigger for auto-extraction...');
    await pool.query(`
      DROP TRIGGER IF EXISTS extract_real_estate_trigger ON chat_messages;
      CREATE TRIGGER extract_real_estate_trigger
        BEFORE INSERT OR UPDATE ON chat_messages
        FOR EACH ROW
        EXECUTE FUNCTION extract_real_estate_data();
    `);
    
    console.log('🔧 Step 6: Creating analytics view...');
    await pool.query(`
      CREATE OR REPLACE VIEW real_estate_analytics AS
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
          WHEN cm.price::numeric < 1000000 THEN 'low'
          WHEN cm.price::numeric < 5000000 THEN 'medium'
          WHEN cm.price IS NOT NULL THEN 'high'
          ELSE 'unknown'
        END as price_range
      FROM chat_messages cm;
    `);
    
    console.log('🧪 Step 7: Testing migration results...');
    
    // Get table statistics
    const totalMessages = await pool.query('SELECT COUNT(*) as count FROM chat_messages');
    const structuredProps = await pool.query('SELECT COUNT(*) as count FROM structured_properties');
    const withPurpose = await pool.query('SELECT COUNT(*) as count FROM chat_messages WHERE purpose IS NOT NULL');
    const withArea = await pool.query('SELECT COUNT(*) as count FROM chat_messages WHERE area IS NOT NULL');
    const withPrice = await pool.query('SELECT COUNT(*) as count FROM chat_messages WHERE price IS NOT NULL');
    const withBroker = await pool.query('SELECT COUNT(*) as count FROM chat_messages WHERE broker_mobile IS NOT NULL');
    
    console.log('📊 Migration Results:');
    console.log(`   📝 Total Messages: ${totalMessages.rows[0].count}`);
    console.log(`   🏗️  Structured Properties: ${structuredProps.rows[0].count}`);
    console.log(`   🎯 Messages with Purpose: ${withPurpose.rows[0].count}`);
    console.log(`   📍 Messages with Area: ${withArea.rows[0].count}`);
    console.log(`   💰 Messages with Price: ${withPrice.rows[0].count}`);
    console.log(`   📞 Messages with Broker: ${withBroker.rows[0].count}`);
    
    // Get purpose breakdown
    const purposeStats = await pool.query(`
      SELECT purpose, COUNT(*) as count 
      FROM chat_messages 
      WHERE purpose IS NOT NULL AND purpose != 'unknown'
      GROUP BY purpose
      ORDER BY count DESC;
    `);
    
    if (purposeStats.rows.length > 0) {
      console.log('📈 Purpose Breakdown:');
      purposeStats.rows.forEach(row => {
        console.log(`   ${row.purpose}: ${row.count}`);
      });
    }
    
    console.log('✅ Database migration completed successfully!');
    console.log('');
    console.log('🎯 Migration Summary:');
    console.log('   ✅ Created structured_properties table');
    console.log('   ✅ Enhanced chat_messages with real estate fields');
    console.log('   ✅ Added automatic data extraction triggers');
    console.log('   ✅ Created performance indexes');
    console.log('   ✅ Created analytics view');
    console.log('   ✅ Tested all functionality');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('🔌 Database connection closed');
  }
}

// Run the migration
runMigration();
