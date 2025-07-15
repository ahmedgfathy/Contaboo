const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// PostgreSQL connection (Production Database)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000, // Increased timeout for Neon connections
});

// Test database connection on startup
pool.connect()
  .then(client => {
    console.log('✅ Connected to PostgreSQL database');
    client.release();
  })
  .catch(err => {
    console.error('❌ PostgreSQL connection error:', err.message);
    process.exit(1);
  });

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM chat_messages) as chat_messages,
        (SELECT COUNT(*) FROM properties_import) as properties_import,
        (SELECT COUNT(*) FROM users) as users
    `);
    
    res.json({
      success: true,
      message: 'Contaboo Production API is running',
      timestamp: result.rows[0].now,
      database: 'PostgreSQL (Neon)',
      version: '4.0 - Production',
      features: [
        'PostgreSQL as default database',
        'Full data migration completed',
        'Production-ready performance',
        '22,500+ property records',
        'Arabic language support',
        'WhatsApp chat processing'
      ],
      stats: {
        chat_messages: parseInt(stats.rows[0].chat_messages),
        properties_import: parseInt(stats.rows[0].properties_import),
        users: parseInt(stats.rows[0].users),
        total: parseInt(stats.rows[0].chat_messages) + parseInt(stats.rows[0].properties_import) + parseInt(stats.rows[0].users)
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ success: false, message: 'Database connection failed', error: error.message });
  }
});

// Authentication endpoint
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );
    
    if (result.rows.length > 0) {
      res.json({
        success: true,
        message: 'تم تسجيل الدخول بنجاح',
        user: {
          id: result.rows[0].id,
          username: result.rows[0].username,
          role: result.rows[0].role || 'user'
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Property statistics endpoint
app.get('/api/stats', async (req, res) => {
  try {
    // Get stats from both chat_messages and properties_import
    const chatStats = await pool.query(`
      SELECT 
        CASE 
          WHEN property_type = 'apartment' OR property_type LIKE '%شقة%' THEN 'apartment'
          WHEN property_type = 'villa' OR property_type LIKE '%فيلا%' OR property_type LIKE '%villa%' THEN 'villa'
          WHEN property_type = 'land' OR property_type LIKE '%أرض%' OR property_type LIKE '%land%' THEN 'land'
          WHEN property_type = 'office' OR property_type LIKE '%مكتب%' OR property_type LIKE '%office%' THEN 'office'
          WHEN property_type = 'warehouse' OR property_type LIKE '%مخزن%' OR property_type LIKE '%warehouse%' THEN 'warehouse'
          ELSE 'other'
        END as property_type,
        COUNT(*) as count
      FROM chat_messages
      WHERE property_type IS NOT NULL
      GROUP BY 
        CASE 
          WHEN property_type = 'apartment' OR property_type LIKE '%شقة%' THEN 'apartment'
          WHEN property_type = 'villa' OR property_type LIKE '%فيلا%' OR property_type LIKE '%villa%' THEN 'villa'
          WHEN property_type = 'land' OR property_type LIKE '%أرض%' OR property_type LIKE '%land%' THEN 'land'
          WHEN property_type = 'office' OR property_type LIKE '%مكتب%' OR property_type LIKE '%office%' THEN 'office'
          WHEN property_type = 'warehouse' OR property_type LIKE '%مخزن%' OR property_type LIKE '%warehouse%' THEN 'warehouse'
          ELSE 'other'
        END
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
      GROUP BY 
        CASE 
          WHEN property_type LIKE '%apartment%' OR property_type LIKE '%شقة%' THEN 'apartment'
          WHEN property_type LIKE '%villa%' OR property_type LIKE '%فيلا%' THEN 'villa'
          WHEN property_type LIKE '%land%' OR property_type LIKE '%أرض%' THEN 'land'
          WHEN property_type LIKE '%office%' OR property_type LIKE '%مكتب%' THEN 'office'
          WHEN property_type LIKE '%warehouse%' OR property_type LIKE '%مخزن%' THEN 'warehouse'
          ELSE 'other'
        END
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
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Combined search endpoint with unified structure
app.get('/api/search-all', async (req, res) => {
  const { q, type, limit = 50 } = req.query;
  
  try {
    let chatQuery = 'SELECT * FROM chat_messages WHERE 1=1';
    let importQuery = `SELECT * FROM properties_import WHERE 1=1 
                       AND property_name IS NOT NULL 
                       AND property_name != '' 
                       AND property_name NOT LIKE '%admin%'
                       AND property_name NOT LIKE '%hazem%'`;
    const params = [];
    
    if (q) {
      params.push(`%${q}%`);
      chatQuery += ` AND (message ILIKE $${params.length} OR sender ILIKE $${params.length})`;
      importQuery += ` AND (property_name ILIKE $${params.length} OR description ILIKE $${params.length})`;
    }
    
    if (type && type !== 'all') {
      params.push(`%${type}%`);
      chatQuery += ` AND property_type ILIKE $${params.length}`;
      importQuery += ` AND property_type ILIKE $${params.length}`;
    }
    
    chatQuery += ` ORDER BY created_at DESC LIMIT ${Math.floor(limit/2)}`;
    importQuery += ` ORDER BY created_time DESC LIMIT ${Math.floor(limit/2)}`;
    
    const [chatResults, importResults] = await Promise.all([
      pool.query(chatQuery, params),
      pool.query(importQuery, params)
    ]);
    
    // Transform both result sets to unified structure
    const unifiedChatMessages = chatResults.rows.map(row => transformToUnifiedStructure(row, 'chat'));
    const unifiedImportedProperties = importResults.rows.map(row => transformToUnifiedStructure(row, 'import'));
    
    res.json({ 
      success: true, 
      chatMessages: unifiedChatMessages,
      importedProperties: unifiedImportedProperties,
      total: unifiedChatMessages.length + unifiedImportedProperties.length
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Search messages endpoint (for backward compatibility)
app.get('/api/messages/search', async (req, res) => {
  const { q, type, limit = 50 } = req.query;
  
  try {
    let query = 'SELECT * FROM chat_messages WHERE 1=1';
    const params = [];
    
    if (q) {
      params.push(`%${q}%`);
      query += ` AND (message ILIKE $${params.length} OR sender ILIKE $${params.length})`;
    }
    
    if (type && type !== 'all') {
      params.push(`%${type}%`);
      query += ` AND property_type ILIKE $${params.length}`;
    }
    
    query += ` ORDER BY created_at DESC LIMIT ${limit}`;
    
    const result = await pool.query(query, params);
    res.json({ success: true, messages: result.rows, total: result.rows.length });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Get all messages endpoint with unified structure
app.get('/api/messages', async (req, res) => {
  const { type, limit = 100 } = req.query;
  
  try {
    let query = `SELECT * FROM properties_import WHERE 1=1 
                 AND property_name IS NOT NULL 
                 AND property_name != '' 
                 AND property_name NOT LIKE '%admin%'
                 AND property_name NOT LIKE '%hazem%'`;
    const params = [];
    
    if (type && type !== 'all') {
      params.push(`%${type}%`);
      query += ` AND property_type ILIKE $${params.length}`;
    }
    
    query += ` ORDER BY created_time DESC LIMIT ${limit}`;
    
    const result = await pool.query(query, params);
    
    // Transform to unified structure
    const unifiedMessages = result.rows.map(row => transformToUnifiedStructure(row, 'import'));
    
    res.json({ success: true, messages: unifiedMessages, total: unifiedMessages.length });
  } catch (error) {
    console.error('Messages error:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Unified data structure transformer
const transformToUnifiedStructure = (rawData, sourceType) => {
  if (sourceType === 'chat') {
    // Extract location from message if not in location field
    const extractedLocation = rawData.location || extractLocationFromText(rawData.message);
    
    // Chat messages already have the expected structure
    return {
      id: rawData.id,
      sender: rawData.sender,
      message: rawData.message,
      timestamp: rawData.timestamp,
      property_type: rawData.property_type,
      keywords: rawData.keywords,
      location: extractedLocation,
      price: rawData.price,
      agent_phone: rawData.agent_phone,
      agent_description: rawData.agent_description,
      full_description: rawData.full_description,
      created_at: rawData.created_at,
      source_type: 'chat',
      // Additional standardized fields
      property_name: rawData.message,
      description: rawData.full_description,
      unit_price: rawData.price,
      regions: extractedLocation,
      bedrooms: extractFromText(rawData.message, 'غرف|غرفة|bedrooms?'),
      bathrooms: extractFromText(rawData.message, 'حمام|حمامات|bathroom?'),
      area_size: extractFromText(rawData.message, 'متر|م\\d+|\\d+م|square'),
      floor_number: extractFromText(rawData.message, 'دور|طابق|floor'),
      // All chat_messages table fields
      property_id: rawData.property_id,
      agent_id: rawData.agent_id,
      property_type_id: rawData.property_type_id,
      area_id: rawData.area_id
    };
  } else {
    // Transform properties_import to match chat structure
    const extractedLocation = rawData.regions || extractLocationFromText(rawData.property_name || rawData.description);
    
    return {
      id: rawData.id,
      sender: rawData.name || rawData.property_offered_by || 'مالك العقار',
      message: rawData.property_name || rawData.description || 'عقار مستورد',
      timestamp: rawData.created_time || rawData.modified_time || new Date().toISOString(),
      property_type: rawData.property_type || rawData.property_category || 'other',
      keywords: generateKeywords(rawData),
      location: extractedLocation,
      price: rawData.unit_price || rawData.amount || rawData.payment,
      agent_phone: rawData.mobile_no || rawData.tel,
      agent_description: `${rawData.name || 'مالك العقار'} - ${rawData.handler || 'وسيط عقاري'}`,
      full_description: buildFullDescription(rawData),
      created_at: rawData.imported_at || rawData.created_time,
      source_type: 'import',
      // All properties_import fields (preserved)
      property_name: rawData.property_name,
      property_number: rawData.property_number,
      property_category: rawData.property_category,
      created_time: rawData.created_time,
      regions: extractedLocation,
      modified_time: rawData.modified_time,
      floor_no: rawData.floor_no,
      building: rawData.building,
      bedroom: rawData.bedroom,
      land_garden: rawData.land_garden,
      bathroom: rawData.bathroom,
      finished: rawData.finished,
      last_modified_by: rawData.last_modified_by,
      update_unit: rawData.update_unit,
      property_offered_by: rawData.property_offered_by,
      name: rawData.name,
      mobile_no: rawData.mobile_no,
      tel: rawData.tel,
      unit_price: rawData.unit_price,
      payment_type: rawData.payment_type,
      deposit: rawData.deposit,
      payment: rawData.payment,
      paid_every: rawData.paid_every,
      amount: rawData.amount,
      description: rawData.description,
      zain_house_sales_notes: rawData.zain_house_sales_notes,
      sales: rawData.sales,
      handler: rawData.handler,
      property_image: rawData.property_image,
      imported_at: rawData.imported_at
    };
  }
};

// Helper function to extract location from text
const extractLocationFromText = (text) => {
  if (!text) return null;
  
  // Common Egyptian areas and locations
  const locations = [
    'القاهرة', 'الجيزة', 'الإسكندرية', 'مدينة نصر', 'مصر الجديدة', 'الزمالك', 'وسط البلد', 
    'المعادي', 'حدائق الأهرام', 'مدينة الشيخ زايد', 'مدينة 6 أكتوبر', 'التجمع الخامس', 
    'العاشر من رمضان', 'الهرم', 'فيصل', 'الدقي', 'المهندسين', 'إمبابة', 'العجمي', 
    'المنتزه', 'سيدي جابر', 'أسوان', 'الأقصر', 'أسيوط', 'المنيا', 'بني سويف', 'الفيوم',
    'طنطا', 'المنصورة', 'الزقازيق', 'بورسعيد', 'السويس', 'الإسماعيلية', 'دمياط',
    'كفر الشيخ', 'قنا', 'سوهاج', 'البحر الأحمر', 'الغردقة', 'شرم الشيخ', 'دهب',
    'مرسى علم', 'اللوتس', 'الرحاب', 'كمبوند', 'ريحانة', 'بيت الوطن'
  ];
  
  // Check for location patterns in Arabic text
  for (const location of locations) {
    if (text.includes(location)) {
      return location;
    }
  }
  
  // Check for common location patterns
  const patterns = [
    /في\s+(\w+)/g,  // في المعادي
    /بـ\s*(\w+)/g,   // بالمعادي  
    /(\w+)\s+الجديدة/g // مصر الجديدة
  ];
  
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      return matches[0].replace(/في\s+|بـ\s*/, '').trim();
    }
  }
  
  return null;
};

// Helper function to generate keywords from properties data
const generateKeywords = (rawData) => {
  const keywords = [];
  if (rawData.property_type) keywords.push(rawData.property_type);
  if (rawData.regions) keywords.push(rawData.regions);
  if (rawData.bedroom) keywords.push(`${rawData.bedroom} غرف`);
  if (rawData.bathroom) keywords.push(`${rawData.bathroom} حمام`);
  if (rawData.unit_price) keywords.push(rawData.unit_price);
  return keywords.join(', ');
};

// Helper function to build full description from properties data
const buildFullDescription = (rawData) => {
  const parts = [];
  
  if (rawData.property_name) parts.push(rawData.property_name);
  if (rawData.bedroom) parts.push(`${rawData.bedroom} غرف نوم`);
  if (rawData.bathroom) parts.push(`${rawData.bathroom} حمام`);
  if (rawData.floor_no) parts.push(`الدور ${rawData.floor_no}`);
  if (rawData.finished) parts.push(`التشطيب: ${rawData.finished}`);
  if (rawData.land_garden) parts.push(`حديقة: ${rawData.land_garden}`);
  if (rawData.building) parts.push(`المبنى: ${rawData.building}`);
  if (rawData.regions) parts.push(`الموقع: ${rawData.regions}`);
  if (rawData.description) parts.push(rawData.description);
  if (rawData.zain_house_sales_notes) parts.push(`ملاحظات: ${rawData.zain_house_sales_notes}`);
  
  return parts.length > 0 ? parts.join(' | ') : 'لا توجد تفاصيل إضافية متاحة';
};

// Get individual message endpoint with unified structure
app.get('/api/messages/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Try chat_messages first
    let result = await pool.query('SELECT * FROM chat_messages WHERE id = $1', [id]);
    let sourceType = 'chat';
    
    if (result.rows.length === 0) {
      // Check properties_import with quality filter
      result = await pool.query(`
        SELECT * FROM properties_import 
        WHERE id = $1 
        AND property_name IS NOT NULL 
        AND property_name != ''
        AND property_name NOT LIKE '%admin%'
        AND property_name NOT LIKE '%hazem%'
      `, [id]);
      sourceType = 'import';
    }
    
    if (result.rows.length > 0) {
      const rawData = result.rows[0];
      
      // Transform to unified structure
      const unifiedProperty = transformToUnifiedStructure(rawData, sourceType);
      
      res.json({ success: true, message: unifiedProperty });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'Property not found',
        details: `لم يتم العثور على العقار رقم ${id} أو أن بياناته غير مكتملة`
      });
    }
  } catch (error) {
    console.error('Message error:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// WhatsApp import endpoint
app.post('/api/import/whatsapp', async (req, res) => {
  const { messages } = req.body;
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ success: false, message: 'Invalid messages format' });
  }
  
  try {
    let imported = 0;
    let skipped = 0;
    
    for (const messageData of messages) {
      const { sender, message, timestamp } = messageData;
      
      if (!sender || !message) {
        skipped++;
        continue;
      }
      
      try {
        await pool.query(`
          INSERT INTO chat_messages (
            sender, message, timestamp, property_type, keywords,
            location, price, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          sender,
          message,
          timestamp || new Date().toISOString(),
          messageData.property_type || 'other',
          messageData.keywords || '',
          messageData.location || '',
          messageData.price || '',
          new Date().toISOString()
        ]);
        imported++;
      } catch (err) {
        if (!err.message.includes('duplicate')) {
          console.error('Import error for message:', err.message);
        }
        skipped++;
      }
    }
    
    res.json({ 
      success: true, 
      message: `تم استيراد ${imported} رسالة، تم تخطي ${skipped} رسالة`,
      imported,
      skipped
    });
  } catch (error) {
    console.error('WhatsApp import error:', error);
    res.status(500).json({ success: false, message: 'خطأ في استيراد البيانات' });
  }
});

// Admin endpoint for removing duplicates
app.post('/api/admin/remove-duplicates', async (req, res) => {
  try {
    console.log('Admin: Starting duplicate removal process...');
    
    // Get total count before cleanup
    const beforeCountQuery = `
      SELECT 
        (SELECT COUNT(*) FROM chat_messages) as chat_count,
        (SELECT COUNT(*) FROM properties_import) as properties_count
    `;
    const beforeResult = await pool.query(beforeCountQuery);
    const totalBefore = parseInt(beforeResult.rows[0].chat_count) + parseInt(beforeResult.rows[0].properties_count);
    
    // Remove duplicates from chat_messages based on message content and sender
    const chatDuplicatesQuery = `
      DELETE FROM chat_messages 
      WHERE id NOT IN (
        SELECT MIN(id) 
        FROM chat_messages 
        GROUP BY message, sender, property_type
      )
    `;
    const chatResult = await pool.query(chatDuplicatesQuery);
    console.log(`Removed ${chatResult.rowCount} duplicate chat messages`);
    
    // Remove duplicates from properties_import based on property name and description
    const propertiesDuplicatesQuery = `
      DELETE FROM properties_import 
      WHERE id NOT IN (
        SELECT MIN(id) 
        FROM properties_import 
        GROUP BY property_name, description, property_type
      )
    `;
    const propertiesResult = await pool.query(propertiesDuplicatesQuery);
    console.log(`Removed ${propertiesResult.rowCount} duplicate imported properties`);
    
    // Get total count after cleanup
    const afterResult = await pool.query(beforeCountQuery);
    const totalAfter = parseInt(afterResult.rows[0].chat_count) + parseInt(afterResult.rows[0].properties_count);
    
    const totalRemoved = chatResult.rowCount + propertiesResult.rowCount;
    
    console.log(`✅ Duplicate removal completed: ${totalRemoved} total duplicates removed`);
    
    res.json({
      success: true,
      message: `تم حذف ${totalRemoved} رسالة مكررة بنجاح`,
      removed: totalRemoved,
      totalBefore,
      totalAfter,
      details: {
        chatDuplicatesRemoved: chatResult.rowCount,
        propertiesDuplicatesRemoved: propertiesResult.rowCount
      }
    });
    
  } catch (error) {
    console.error('Admin: Error removing duplicates:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف الرسائل المكررة',
      error: error.message
    });
  }
});

// Enhanced CSV Import endpoint with dynamic column creation
app.post('/api/import-csv', async (req, res) => {
  try {
    const { tableName, headers, data } = req.body;
    
    if (!tableName || !headers || !data || !Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: tableName, headers, data'
      });
    }

    // Validate table name (security)
    if (tableName !== 'properties_import') {
      return res.status(400).json({
        success: false,
        message: 'Invalid table name'
      });
    }

    console.log(`CSV Import - Processing ${data.length} rows with ${headers.length} columns`);

    // Clean and prepare headers (remove spaces, special characters)
    const cleanHeaders = headers.map(header => 
      header.toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .slice(0, 63) // PostgreSQL column name limit
    );

    console.log('Original headers:', headers);
    console.log('Clean headers:', cleanHeaders);

    // Get existing table columns
    const existingColumnsResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = $1 AND table_schema = 'public'
    `, [tableName]);
    
    const existingColumns = existingColumnsResult.rows.map(row => row.column_name);
    console.log('Existing columns:', existingColumns);

    // Find missing columns and add them
    const missingColumns = cleanHeaders.filter(header => !existingColumns.includes(header));
    console.log('Missing columns to add:', missingColumns);

    // Add missing columns dynamically
    for (const missingColumn of missingColumns) {
      try {
        console.log(`Adding new column: ${missingColumn}`);
        await pool.query(`ALTER TABLE ${tableName} ADD COLUMN ${missingColumn} TEXT`);
        console.log(`✅ Successfully added column: ${missingColumn}`);
      } catch (alterError) {
        console.error(`Error adding column ${missingColumn}:`, alterError.message);
        // Continue with other columns even if one fails
      }
    }

    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    const addedColumns = [];

    // Process data in smaller batches
    const batchSize = 10;
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      try {
        // Process each row individually within the batch
        for (const row of batch) {
          try {
            // Prepare values for this row
            const values = [];
            const placeholders = [];
            const columnNames = [];
            let placeholderIndex = 1;
            
            // Map row data to clean headers
            for (let j = 0; j < cleanHeaders.length; j++) {
              const cleanHeader = cleanHeaders[j];
              const value = Array.isArray(row) ? row[j] : row[headers[j]];
              
              if (value !== undefined && value !== null && value !== '') {
                columnNames.push(cleanHeader);
                values.push(String(value).trim());
                placeholders.push(`$${placeholderIndex++}`);
              }
            }
            
            // Add imported_at timestamp
            columnNames.push('imported_at');
            values.push(new Date().toISOString());
            placeholders.push(`$${placeholderIndex++}`);

            // Create INSERT query with only non-empty columns
            if (columnNames.length > 1) { // More than just imported_at
              const query = `
                INSERT INTO ${tableName} (${columnNames.join(', ')})
                VALUES (${placeholders.join(', ')})
              `;

              await pool.query(query, values);
              successCount++;
            } else {
              console.log('Skipping empty row');
              errorCount++;
            }
            
          } catch (rowError) {
            console.error(`Error processing row in batch ${i}:`, rowError);
            errorCount++;
            errors.push({
              row: successCount + errorCount,
              error: rowError.message
            });
          }
        }
        
      } catch (batchError) {
        console.error(`Error processing batch ${i}-${i + batch.length}:`, batchError);
        errorCount += batch.length;
        errors.push({
          batch: `${i}-${i + batch.length}`,
          error: batchError.message
        });
      }
    }

    const response = {
      success: true,
      imported: successCount,
      message: `CSV import completed: ${successCount} imported, ${errorCount} failed`,
      stats: {
        totalRows: data.length,
        successCount,
        errorCount,
        tableName,
        columnsAdded: missingColumns.length,
        newColumns: missingColumns
      }
    };

    if (errors.length > 0) {
      response.errors = errors.slice(0, 10); // Limit errors in response
      response.message += ` (${errors.length} errors)`;
    }

    if (missingColumns.length > 0) {
      response.message += ` (${missingColumns.length} new columns added)`;
    }

    console.log('CSV Import completed:', response);
    res.status(200).json(response);
    
  } catch (error) {
    console.error('CSV import error:', error);
    res.status(500).json({
      success: false,
      message: 'CSV import failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    
    app.listen(PORT, () => {
      console.log(`🚀 Contaboo Production Server running on port ${PORT}`);
      console.log(`🔗 Database: PostgreSQL (Neon)`);
      console.log(`📡 API endpoints: http://localhost:${PORT}/api/`);
      console.log(`🌐 Production ready with PostgreSQL as default database`);
      console.log(`📊 Features: WhatsApp import, CSV import, Arabic support, 22,500+ properties`);
      console.log(`🔧 Version: 4.0 - Production with PostgreSQL`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  await pool.end();
  console.log('✅ Database connections closed.');
  process.exit(0);
});

// Helper function to extract information from text
const extractFromText = (text, pattern) => {
  if (!text) return null;
  const regex = new RegExp(`(\\d+)\\s*${pattern}`, 'gi');
  const match = text.match(regex);
  return match ? match[0] : null;
};

module.exports = app;
