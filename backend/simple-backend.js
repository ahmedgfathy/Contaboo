const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all interfaces
const SERVER_IP = '35.193.103.185'; // Your server IP

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_jyLVBR2De0mZ@ep-floral-water-a2ow4nw4-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
  idleTimeoutMillis: 30000
});

// CORS configuration for production deployment
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:3000',
    'https://*.vercel.app',
    'https://contaboo.vercel.app',
    'https://your-app-name.vercel.app', // Replace with your actual Vercel URL
    `http://${SERVER_IP}:3001`,
    `http://${SERVER_IP}`,
    /\.vercel\.app$/  // Allow all Vercel subdomains
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health endpoint
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      success: true,
      message: 'API is running',
      database: 'PostgreSQL connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Stats endpoint
app.get('/api/stats', async (req, res) => {
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
    
    // Combine stats
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
    
    res.json({
      success: true,
      stats,
      analytics: {
        purpose: { sale: 0, rent: 0, wanted: 0, unknown: 0 },
        areas: {},
        priceRanges: { low: 0, medium: 0, high: 0, unknown: 0 },
        totalMessagesAnalyzed: 0,
        messagesWithBrokerInfo: 0
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Messages bulk import endpoint (for frontend compatibility)
app.post('/api/messages/bulk', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid messages format' 
      });
    }

    console.log(`📱 Bulk Import: Processing ${messages.length} messages`);
    
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
            location, price, agent_phone, agent_description, 
            full_description, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          sender,
          message,
          timestamp || new Date().toISOString(),
          messageData.property_type || 'other',
          messageData.keywords || '',
          messageData.location || '',
          messageData.price || '',
          messageData.agent_phone || '',
          messageData.agent_description || '',
          messageData.full_description || '',
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
    console.error('Bulk import error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'حدث خطأ أثناء استيراد الرسائل: ' + error.message 
    });
  }
});

// WhatsApp import endpoint
app.post('/api/import/whatsapp', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid messages format' 
      });
    }

    console.log(`📱 WhatsApp Import: Processing ${messages.length} messages`);
    
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
    res.status(500).json({ 
      success: false, 
      message: 'حدث خطأ أثناء استيراد الرسائل: ' + error.message 
    });
  }
});

// Search-all endpoint
app.get('/api/search-all', async (req, res) => {
  try {
    const { limit = 52, search = '', type = '' } = req.query;
    
    console.log('Search params:', { search, type, limit });
    
    const query = `
      SELECT 
        cm.id::text as id,
        'chat' as source,
        cm.property_type,
        cm.price,
        cm.location,
        cm.message as description,
        cm.sender as broker_name,
        cm.agent_phone as phone_number,
        cm.timestamp::text as created_at
      FROM chat_messages cm
      WHERE cm.property_type IS NOT NULL 
        AND cm.property_type != ''
        AND cm.property_type != 'unknown'
      
      UNION ALL
      
      SELECT 
        pi.id::text as id,
        'import' as source,
        pi.property_type,
        pi.unit_price::text as price,
        pi.regions as location,
        pi.description,
        pi.name as broker_name,
        pi.mobile_no as phone_number,
        pi.imported_at::text as created_at
      FROM properties pi
      WHERE pi.property_type IS NOT NULL 
        AND pi.property_type != ''
      
      ORDER BY created_at DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [parseInt(limit)]);
    
    res.json({
      success: true,
      chatMessages: result.rows.filter(r => r.source === 'chat'),
      importedProperties: result.rows.filter(r => r.source === 'import'),
      total: result.rows.length
    });
    
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
});

// Messages endpoint (for individual property lookup)
app.get('/api/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Property ID is required'
      });
    }

    // Try chat_messages first
    let result = await pool.query(`
      SELECT * FROM chat_messages WHERE id = $1
    `, [id]);
    
    if (result.rows.length > 0) {
      return res.json({ success: true, data: result.rows[0] });
    }
    
    // Try properties table
    result = await pool.query(`
      SELECT * FROM properties WHERE id = $1
    `, [id]);
    
    if (result.rows.length > 0) {
      return res.json({ success: true, data: result.rows[0] });
    }
    
    res.status(404).json({
      success: false,
      message: 'Property not found'
    });
    
  } catch (error) {
    console.error('Message error:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Real Estate CRM - Simple Backend Server',
    status: 'running',
    endpoints: [
      'GET /api/health',
      'GET /api/stats', 
      'GET /api/search-all',
      'GET /api/messages/:id',
      'POST /api/import/whatsapp'
    ]
  });
});

// Error handling
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  });
});

// Start server
app.listen(PORT, HOST, () => {
  console.log(`🚀 Simple Backend Server running on http://${HOST}:${PORT}`);
  console.log(`🌐 External access: http://${SERVER_IP}:${PORT}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   - GET http://${SERVER_IP}:${PORT}/api/health`);
  console.log(`   - GET http://${SERVER_IP}:${PORT}/api/stats`);
  console.log(`   - GET http://${SERVER_IP}:${PORT}/api/search-all`);
  console.log(`   - GET http://${SERVER_IP}:${PORT}/api/messages/:id`);
  console.log(`   - POST http://${SERVER_IP}:${PORT}/api/import/whatsapp`);
  console.log(`   - POST http://${SERVER_IP}:${PORT}/api/messages/bulk`);
  console.log(`\n🔗 Frontend should connect to: http://${SERVER_IP}:${PORT}/api`);
  console.log(`\n📱 Ready for WhatsApp chat imports!`);
  console.log(`\n🚀 For Vercel deployment, set VITE_API_URL=http://${SERVER_IP}:${PORT}/api`);
});

module.exports = app;
