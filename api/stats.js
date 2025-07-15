const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
  idleTimeoutMillis: 30000
});

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      // Get stats from both chat_messages and properties_import tables
      const chatStats = await pool.query(`
        SELECT 
          CASE 
            WHEN property_type LIKE '%apartment%' OR property_type LIKE '%شقة%' THEN 'apartment'
            WHEN property_type LIKE '%villa%' OR property_type LIKE '%فيلا%' THEN 'villa'
            WHEN property_type LIKE '%land%' OR property_type LIKE '%أرض%' THEN 'land'
            WHEN property_type LIKE '%office%' OR property_type LIKE '%مكتب%' THEN 'office'
            WHEN property_type LIKE '%warehouse%' OR property_type LIKE '%مخزن%' THEN 'warehouse'
            ELSE 'other'
          END as property_type,
          COUNT(*) as count
        FROM chat_messages 
        WHERE property_type IS NOT NULL
        GROUP BY property_type
      `);
      
      const importStats = await pool.query(`
        SELECT 
          CASE 
            WHEN property_type LIKE '%apartment%' OR property_type LIKE '%شقة%' THEN 'apartment'
            WHEN property_type LIKE '%villa%' OR property_type LIKE '%فيلا%' THEN 'villa'
            WHEN property_type LIKE '%land%' OR property_type LIKE '%أرض%' THEN 'land'
            WHEN property_type LIKE '%office%' OR property_type LIKE '%مكتب%' THEN 'office'
            WHEN property_type LIKE '%warehouse%' OR property_type LIKE '%مخزن%' THEN 'warehouse'
            ELSE 'other'
          END as property_type,
          COUNT(*) as count
        FROM properties_import 
        WHERE property_type IS NOT NULL
          AND property_name IS NOT NULL 
          AND property_name != ''
        GROUP BY property_type
      `);
      
      // Combine and aggregate stats
      const combinedStats = {};
      
      chatStats.rows.forEach(row => {
        combinedStats[row.property_type] = (combinedStats[row.property_type] || 0) + parseInt(row.count);
      });
      
      importStats.rows.forEach(row => {
        combinedStats[row.property_type] = (combinedStats[row.property_type] || 0) + parseInt(row.count);
      });
      
      const stats = Object.entries(combinedStats).map(([property_type, count]) => ({
        property_type,
        count
      }));

      res.status(200).json({ success: true, stats });
    } catch (error) {
      console.error('Stats error:', error);
      res.status(500).json({ success: false, message: 'Database error' });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
};
      }

      const stats = result.rows;
      
      // Ensure we always return data
      if (!stats || stats.length === 0) {
        return res.status(200).json({
          success: true,
          stats: [
            { property_type: 'Compound Apartments', count: 0 },
            { property_type: 'Independent Villas', count: 0 },
            { property_type: 'Land & Local Villas', count: 0 },
            { property_type: 'Commercial & Administrative', count: 0 },
            { property_type: 'North Coast', count: 0 },
            { property_type: 'Ain Sokhna', count: 0 },
            { property_type: 'Rehab & Madinaty', count: 0 },
            { property_type: 'Various Areas', count: 0 }
          ],
          dataSource: 'fallback',
          migrationProgress: 'no_data',
          message: 'No data available, showing empty categories'
        });
      }
      
      res.status(200).json({
        success: true,
        stats: stats,
        dataSource: dataSource,
        migrationProgress: migrationProgress,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Stats API error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch statistics',
        details: error.message,
        dataSource: 'error',
        migrationProgress: 'error'
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
