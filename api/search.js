// Vercel serverless function for property search
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
  idleTimeoutMillis: 30000
});

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const { q, type, listing_type, min_price, max_price, bedrooms, bathrooms, location, limit = 50 } = req.query;
      
      // Combined search across both chat_messages and properties_import tables
      let chatQuery = `
        SELECT 
          id,
          sender as sender_name,
          message as message_text,
          created_at,
          property_type,
          'chat' as source_type,
          sender as broker_name,
          message as full_description
        FROM chat_messages 
        WHERE 1=1
      `;
      
      let propertiesQuery = `
        SELECT 
          id,
          property_name as message_text,
          created_time as created_at,
          property_category as property_type,
          'property' as source_type,
          name as broker_name,
          description as full_description,
          regions,
          unit_price,
          bedroom,
          bathroom,
          mobile_no as agent_phone
        FROM properties_import 
        WHERE 1=1
      `;
      
      const params = [];
      let paramIndex = 1;
      
      // Add search filters for both queries
      if (q) {
        const searchParam = `%${q}%`;
        params.push(searchParam);
        
        chatQuery += ` AND (message ILIKE $${paramIndex} OR sender ILIKE $${paramIndex})`;
        propertiesQuery += ` AND (property_name ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR regions ILIKE $${paramIndex})`;
        paramIndex++;
      }
      
      if (type && type !== 'all') {
        params.push(`%${type}%`);
        chatQuery += ` AND property_type ILIKE $${paramIndex}`;
        propertiesQuery += ` AND property_category ILIKE $${paramIndex}`;
        paramIndex++;
      }
      
      if (location) {
        params.push(`%${location}%`);
        chatQuery += ` AND message ILIKE $${paramIndex}`; // Location might be in message text
        propertiesQuery += ` AND regions ILIKE $${paramIndex}`;
        paramIndex++;
      }
      
      // Add ORDER BY and LIMIT
      const halfLimit = Math.floor(parseInt(limit) / 2);
      chatQuery += ` ORDER BY created_at DESC LIMIT ${halfLimit}`;
      propertiesQuery += ` ORDER BY created_time DESC LIMIT ${halfLimit}`;
      
      // Execute both queries in parallel
      const [chatResults, propertyResults] = await Promise.all([
        pool.query(chatQuery, params),
        pool.query(propertiesQuery, params)
      ]);
      
      // Combine and format results
      const combinedResults = [
        ...chatResults.rows.map(row => ({
          id: `chat_${row.id}`,
          message: row.message_text,
          sender: row.sender_name || row.broker_name,
          timestamp: row.created_at,
          property_type: row.property_type || 'other',
          location: extractLocationFromMessage(row.message_text),
          price: extractPriceFromMessage(row.message_text),
          source_type: 'chat',
          agent_phone: extractPhoneFromMessage(row.message_text),
          full_description: row.full_description
        })),
        ...propertyResults.rows.map(row => ({
          id: `property_${row.id}`,
          message: row.message_text || 'عقار متاح للبيع',
          sender: row.broker_name || 'وكيل عقاري',
          timestamp: row.created_at,
          property_type: mapPropertyCategory(row.property_type),
          location: row.regions || 'غير محدد',
          price: row.unit_price || null,
          source_type: 'property',
          agent_phone: row.agent_phone || null,
          full_description: row.full_description,
          bedrooms: row.bedroom,
          bathrooms: row.bathroom
        }))
      ];
      
      // Sort combined results by timestamp (most recent first)
      combinedResults.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      res.status(200).json({
        success: true,
        count: combinedResults.length,
        properties: combinedResults,
        chatCount: chatResults.rows.length,
        propertyCount: propertyResults.rows.length
      });
      
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Search API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Helper function to extract location from WhatsApp message text
function extractLocationFromMessage(message) {
  if (!message) return null;
  
  const egyptianAreas = [
    'القاهرة', 'الجيزة', 'الإسكندرية', 'المعادي', 'الزمالك', 'مصر الجديدة', 'المهندسين',
    'الدقي', 'العجوزة', 'المقطم', 'الرحاب', 'الشيخ زايد', 'التجمع الخامس', 'أكتوبر',
    'العبور', 'بدر', 'العاصمة الإدارية', 'الحي الثامن', 'الحي العاشر', 'مدينة نصر',
    'حلوان', 'الخانكة', 'القليوبية', 'شبرا الخيمة', 'الفيوم', 'بني سويف'
  ];
  
  for (const area of egyptianAreas) {
    if (message.includes(area)) {
      return area;
    }
  }
  
  return null;
}

// Helper function to extract price from WhatsApp message text
function extractPriceFromMessage(message) {
  if (!message) return null;
  
  // Look for price patterns in Arabic
  const pricePatterns = [
    /(\d+(?:\.\d+)?)\s*(?:مليون|ألف|جنيه)/g,
    /السعر[:\s]*(\d+(?:\.\d+)?)/g,
    /(\d+(?:\.\d+)?)\s*(?:ك|م)/g
  ];
  
  for (const pattern of pricePatterns) {
    const match = message.match(pattern);
    if (match) {
      return match[0];
    }
  }
  
  return null;
}

// Helper function to extract phone number from message
function extractPhoneFromMessage(message) {
  if (!message) return null;
  
  // Egyptian phone patterns
  const phonePattern = /(?:\+20|0)?(?:10|11|12|15)\d{8}/g;
  const match = message.match(phonePattern);
  
  return match ? match[0] : null;
}

// Helper function to map property categories to standard types
function mapPropertyCategory(category) {
  if (!category) return 'other';
  
  const lowerCategory = category.toLowerCase();
  
  if (lowerCategory.includes('apartment') || lowerCategory.includes('شقة') || 
      lowerCategory.includes('compound') || lowerCategory.includes('duplex')) {
    return 'apartment';
  }
  
  if (lowerCategory.includes('villa') || lowerCategory.includes('فيلا') || 
      lowerCategory.includes('townhouse') || lowerCategory.includes('twin')) {
    return 'villa';
  }
  
  if (lowerCategory.includes('land') || lowerCategory.includes('أرض')) {
    return 'land';
  }
  
  if (lowerCategory.includes('office') || lowerCategory.includes('مكتب') || 
      lowerCategory.includes('commercial') || lowerCategory.includes('administrative')) {
    return 'office';
  }
  
  if (lowerCategory.includes('warehouse') || lowerCategory.includes('مخزن')) {
    return 'warehouse';
  }
  
  return 'other';
}
