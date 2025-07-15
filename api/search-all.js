// Vercel serverless function for combined search across chat_messages and properties
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
      const { q, type, limit = 50 } = req.query;
      
      // Search chat_messages table (WhatsApp data)
      let chatQuery = `
        SELECT 
          id,
          sender,
          message,
          created_at,
          property_type,
          'chat' as source_type
        FROM chat_messages 
        WHERE 1=1
      `;
      
      // Search properties_import table (CSV data)  
      let propertiesQuery = `
        SELECT 
          id,
          property_name,
          created_time as created_at,
          property_category,
          'property' as source_type,
          name,
          description,
          regions,
          unit_price,
          bedroom,
          bathroom,
          mobile_no
        FROM properties_import 
        WHERE 1=1
      `;
      
      const params = [];
      let paramIndex = 1;
      
      // Add search filters
      if (q && q.trim()) {
        const searchTerm = `%${q.trim()}%`;
        params.push(searchTerm);
        
        chatQuery += ` AND (message ILIKE $${paramIndex} OR sender ILIKE $${paramIndex})`;
        propertiesQuery += ` AND (property_name ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR regions ILIKE $${paramIndex})`;
        paramIndex++;
      }
      
      // Add type filter
      if (type && type !== 'all') {
        params.push(`%${type}%`);
        chatQuery += ` AND property_type ILIKE $${paramIndex}`;
        propertiesQuery += ` AND property_category ILIKE $${paramIndex}`;
        paramIndex++;
      }
      
      // Add ordering and limits
      const halfLimit = Math.floor(parseInt(limit) / 2);
      chatQuery += ` ORDER BY created_at DESC LIMIT ${halfLimit}`;
      propertiesQuery += ` ORDER BY created_time DESC LIMIT ${halfLimit}`;
      
      console.log('Executing chat query:', chatQuery);
      console.log('Executing properties query:', propertiesQuery);
      console.log('Parameters:', params);
      
      // Execute both queries in parallel
      const [chatResults, propertyResults] = await Promise.all([
        pool.query(chatQuery, params),
        pool.query(propertiesQuery, params)
      ]);
      
      console.log(`Found ${chatResults.rows.length} chat messages and ${propertyResults.rows.length} properties`);
      
      // Format chat messages
      const formattedChatMessages = chatResults.rows.map(row => ({
        id: `chat_${row.id}`,
        message: row.message,
        sender: row.sender,
        timestamp: row.created_at,
        property_type: mapPropertyType(row.property_type),
        location: extractLocationFromMessage(row.message),
        price: extractPriceFromMessage(row.message),
        source_type: 'chat',
        agent_phone: extractPhoneFromMessage(row.message),
        full_description: row.message
      }));
      
      // Format properties  
      const formattedProperties = propertyResults.rows.map(row => ({
        id: `property_${row.id}`,
        message: row.property_name || 'عقار متاح للبيع',
        sender: row.name || 'وكيل عقاري', 
        timestamp: row.created_at,
        property_type: mapPropertyCategory(row.property_category),
        location: row.regions || 'غير محدد',
        price: row.unit_price || null,
        source_type: 'property',
        agent_phone: row.mobile_no || null,
        full_description: row.description || row.property_name,
        bedrooms: row.bedroom,
        bathrooms: row.bathroom
      }));
      
      // Combine and sort results
      const combinedResults = [...formattedChatMessages, ...formattedProperties];
      combinedResults.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      res.status(200).json({
        success: true,
        count: combinedResults.length,
        properties: combinedResults,
        chatCount: chatResults.rows.length,
        propertyCount: propertyResults.rows.length,
        chatMessages: formattedChatMessages,
        importedProperties: formattedProperties,
        total: combinedResults.length
      });
      
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Search-All API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Helper function to extract location from message text
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

// Helper function to extract price from message text
function extractPriceFromMessage(message) {
  if (!message) return null;
  
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
  
  const phonePattern = /(?:\+20|0)?(?:10|11|12|15)\d{8}/g;
  const match = message.match(phonePattern);
  
  return match ? match[0] : null;
}

// Helper function to map property types from chat messages
function mapPropertyType(type) {
  if (!type) return 'other';
  
  const lowerType = type.toLowerCase();
  
  if (lowerType.includes('apartment') || lowerType.includes('شقة')) return 'apartment';
  if (lowerType.includes('villa') || lowerType.includes('فيلا')) return 'villa';
  if (lowerType.includes('land') || lowerType.includes('أرض')) return 'land';
  if (lowerType.includes('office') || lowerType.includes('مكتب')) return 'office';
  if (lowerType.includes('warehouse') || lowerType.includes('مخزن')) return 'warehouse';
  
  return type;
}

// Helper function to map property categories from CSV imports
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
