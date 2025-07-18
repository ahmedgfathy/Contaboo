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
      // Get basic property type stats from both tables
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
        FROM properties 
        WHERE property_type IS NOT NULL
        GROUP BY property_type
      `);
      
      // Get enhanced analytics using regex patterns
      const detailedAnalytics = await pool.query(`
        SELECT 
          id,
          message,
          property_type,
          created_at
        FROM chat_messages 
        WHERE message IS NOT NULL 
          AND message != ''
        ORDER BY created_at DESC
        LIMIT 1000
      `);
      
      // Process messages for enhanced insights
      let purposeStats = { sale: 0, rent: 0, wanted: 0, unknown: 0 };
      let areaStats = {};
      let priceRanges = { low: 0, medium: 0, high: 0, unknown: 0 };
      let brokerCount = 0;
      
      detailedAnalytics.rows.forEach(row => {
        const messageText = row.message || '';
        
        // Simple purpose classification
        const purpose = messageText.toLowerCase().includes('rent') || messageText.includes('إيجار') ? 'rent' : 'sale';
        purposeStats[purpose]++;
        
        // Extract area information
        const areaMatch = messageText.match(/\b(New Cairo|6th October|Zayed|Nasr City|Maadi|Heliopolis|Tagamoa|Downtown|القاهرة الجديدة|أكتوبر|الشيخ زايد|مدينة نصر|المعادي|مصر الجديدة|التجمع|وسط البلد)\b/i);
        if (areaMatch) {
          const area = areaMatch[0];
          areaStats[area] = (areaStats[area] || 0) + 1;
        }
        
        // Simple price classification
        const priceMatch = messageText.match(/(\d+)/);
        if (priceMatch) {
          const value = parseInt(priceMatch[1]);
          if (value < 1000000) priceRanges.low++;
          else if (value < 5000000) priceRanges.medium++;
          else priceRanges.high++;
        } else {
          priceRanges.unknown++;
        }
        
        // Check for broker information
        const brokerMatch = messageText.match(/\b(Mr\.?\s\w+|Eng\.?\s\w+|Dr\.?\s\w+|[A-Z][a-z]+\s[A-Z][a-z]+)\b/i);
        const mobileMatch = messageText.match(/(\+?2?01[0-2,5]{1}[0-9]{8})/);
        if (brokerMatch || mobileMatch) {
          brokerCount++;
        }
      });
      
      // Combine and aggregate basic stats
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

      res.status(200).json({ 
        success: true, 
        stats,
        analytics: {
          purpose: purposeStats,
          areas: areaStats,
          priceRanges: priceRanges,
          totalMessagesAnalyzed: detailedAnalytics.rows.length,
          messagesWithBrokerInfo: brokerCount
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Stats error:', error);
      res.status(500).json({ success: false, message: 'Database error' });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
};
