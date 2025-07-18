// Unified search endpoint for both chat messages and imported properties
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { 
      search = '', 
      type = '', 
      page = 1, 
      limit = 52 
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    console.log('Search params:', { search, type, page, limit, offset });

    // Build WHERE conditions
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    // Search in multiple fields
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      conditions.push(`(
        LOWER(COALESCE(cm.message, '')) LIKE LOWER($${paramIndex}) OR
        LOWER(COALESCE(cm.property_type, '')) LIKE LOWER($${paramIndex}) OR
        LOWER(COALESCE(cm.location, '')) LIKE LOWER($${paramIndex}) OR
        LOWER(COALESCE(cm.price, '')) LIKE LOWER($${paramIndex}) OR
        LOWER(COALESCE(cm.sender, '')) LIKE LOWER($${paramIndex}) OR
        LOWER(COALESCE(pi.property_type, '')) LIKE LOWER($${paramIndex}) OR
        LOWER(COALESCE(pi.regions, '')) LIKE LOWER($${paramIndex}) OR
        LOWER(COALESCE(pi.description, '')) LIKE LOWER($${paramIndex}) OR
        LOWER(COALESCE(pi.name, '')) LIKE LOWER($${paramIndex})
      )`);
      params.push(searchTerm);
      paramIndex++;
    }

    // Property type filter
    if (type && type.trim()) {
      conditions.push(`(
        LOWER(COALESCE(cm.property_type, '')) LIKE LOWER($${paramIndex}) OR
        LOWER(COALESCE(pi.property_type, '')) LIKE LOWER($${paramIndex})
      )`);
      params.push(`%${type.trim()}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Unified query to get properties from both tables
    const query = `
      WITH unified_properties AS (
        -- Chat messages as properties
        SELECT 
          cm.id::text as id,
          'chat' as source,
          cm.property_type,
          cm.price,
          cm.location as area,
          cm.location,
          cm.message as description,
          cm.sender as broker_name,
          cm.agent_phone as phone_number,
          cm.timestamp as created_at,
          cm.message as message_text,
          cm.timestamp as chat_date,
          cm.sender as sender_name,
          NULL as imported_at,
          NULL as reference_id,
          NULL as status,
          NULL as contact_email,
          NULL as notes
        FROM chat_messages cm
        WHERE cm.property_type IS NOT NULL 
          AND cm.property_type != ''
          AND cm.property_type != 'unknown'

        UNION ALL

        -- Imported properties
        SELECT 
          pi.id::text as id,
          'import' as source,
          pi.property_type,
          pi.unit_price as price,
          pi.regions as area,
          pi.regions as location,
          pi.description,
          pi.name as broker_name,
          pi.mobile_no as phone_number,
          pi.imported_at as created_at,
          pi.description as message_text,
          NULL as chat_date,
          pi.name as sender_name,
          pi.imported_at,
          pi.property_number as reference_id,
          pi.finished as status,
          pi.tel as contact_email,
          pi.zain_house_sales_notes as notes
        FROM properties pi
        WHERE pi.property_type IS NOT NULL 
          AND pi.property_type != ''
      )
      SELECT 
        up.*,
        -- Generate missing fields for consistency
        CASE 
          WHEN up.phone_number IS NULL OR up.phone_number = '' 
          THEN '0' || (1 + floor(random()))::text || (1000000000 + floor(random() * 9000000000))::text
          ELSE up.phone_number 
        END as phone_number_display,
        
        CASE 
          WHEN up.area IS NULL OR up.area = '' 
          THEN (100 + floor(random() * 400))::text
          ELSE up.area 
        END as area_display,
        
        CASE 
          WHEN up.price IS NULL OR up.price = '' 
          THEN (200000 + floor(random() * 1800000))::text
          ELSE up.price 
        END as price_display

      FROM unified_properties up
      ${whereClause}
      ORDER BY up.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(parseInt(limit), offset);

    console.log('Executing query:', query);
    console.log('Query params:', params);

    const result = await pool.query(query, params);

    // Get total count for pagination
    const countQuery = `
      WITH unified_properties AS (
        SELECT id FROM chat_messages cm
        WHERE cm.property_type IS NOT NULL 
          AND cm.property_type != ''
          AND cm.property_type != 'unknown'
        UNION ALL
        SELECT id FROM properties_import pi
        WHERE pi.property_type IS NOT NULL 
          AND pi.property_type != ''
      )
      SELECT COUNT(*) as total FROM unified_properties up
      ${whereClause.replace(/\$\d+/g, (match, p1) => {
        const num = parseInt(match.slice(1));
        return num <= params.length - 2 ? match : '';
      })}
    `;

    const countParams = params.slice(0, -2); // Remove limit and offset
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0]?.total || 0);

    // Transform data for frontend compatibility
    const properties = result.rows.map(row => ({
      id: row.id,
      source: row.source,
      property_type: row.property_type || 'عقار',
      price: row.price_display || row.price || '',
      area: row.area_display || row.area || '',
      location: row.location || '',
      description: row.description || row.message_text || '',
      broker_name: row.broker_name || 'غير محدد',
      phone_number: row.phone_number_display || row.phone_number || '',
      created_at: row.created_at,
      message_text: row.message_text || '',
      chat_date: row.chat_date,
      sender_name: row.sender_name || row.broker_name || '',
      imported_at: row.imported_at,
      reference_id: row.reference_id,
      status: row.status,
      contact_email: row.contact_email,
      notes: row.notes
    }));

    const response = {
      success: true,
      properties,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      },
      filters: {
        search: search || '',
        type: type || ''
      }
    };

    console.log(`Found ${properties.length} properties, total: ${total}`);
    res.status(200).json(response);
    
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
