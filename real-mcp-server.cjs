// Real MCP Server with Neon Database Connection
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Real Neon Database Connection
const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_jyLVBR2De0mZ@ep-floral-water-a2ow4nw4-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: { rejectUnauthorized: false }
});

// Test database connection
pool.connect()
  .then(client => {
    console.log('✅ Connected to Neon PostgreSQL database');
    client.release();
  })
  .catch(err => {
    console.error('❌ Database connection error:', err);
  });

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Real MCP Server with Neon DB'
  });
});

// REAL AI Property Search with Database
app.post('/tools/ai_property_search', async (req, res) => {
  try {
    const { arguments: args } = req.body;
    const query = args?.query || '';
    
    console.log('🔍 Searching for:', query);
    
    // Build SQL query based on user input
    let sqlQuery = 'SELECT * FROM properties WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    // Search for size (150, 120, etc.)
    const sizeMatch = query.match(/(\d+)\s*(?:متر|م|meter|m)/i);
    if (sizeMatch) {
      const size = parseInt(sizeMatch[1]);
      sqlQuery += ` AND (size >= $${paramIndex} AND size <= $${paramIndex + 1})`;
      params.push(size - 20, size + 20); // Allow 20m range
      paramIndex += 2;
    }
    
    // Search for property type
    if (query.includes('شقة') || query.includes('apartment')) {
      sqlQuery += ` AND property_type ILIKE $${paramIndex}`;
      params.push('%apartment%');
      paramIndex++;
    }
    
    if (query.includes('فيلا') || query.includes('villa')) {
      sqlQuery += ` AND property_type ILIKE $${paramIndex}`;
      params.push('%villa%');
      paramIndex++;
    }
    
    // General text search
    if (params.length === 0) {
      sqlQuery += ` AND (description ILIKE $${paramIndex} OR area ILIKE $${paramIndex} OR details ILIKE $${paramIndex})`;
      params.push(`%${query}%`);
    }
    
    sqlQuery += ' ORDER BY id DESC LIMIT 10';
    
    console.log('📊 SQL Query:', sqlQuery);
    console.log('📋 Parameters:', params);
    
    // Execute the query
    const result = await pool.query(sqlQuery, params);
    const properties = result.rows;
    
    console.log(`📊 Found ${properties.length} properties`);
    
    // Generate intelligent Arabic response
    let response = '';
    
    if (properties.length === 0) {
      response = `عذراً، لم أجد عقارات تطابق البحث "${query}". يرجى المحاولة بمعايير أخرى.`;
    } else {
      response = `🏠 نتائج البحث عن "${query}":\n\n`;
      
      properties.slice(0, 5).forEach((property, index) => {
        response += `${index + 1}. ${property.property_type || 'عقار'}\n`;
        
        if (property.price) {
          response += `   💰 السعر: ${parseInt(property.price).toLocaleString()} جنيه\n`;
        }
        
        if (property.area) {
          response += `   📍 المنطقة: ${property.area}\n`;
        }
        
        if (property.size) {
          response += `   📐 المساحة: ${property.size} متر مربع\n`;
        }
        
        if (property.description) {
          const desc = property.description.substring(0, 100);
          response += `   📝 التفاصيل: ${desc}${property.description.length > 100 ? '...' : ''}\n`;
        }
        
        response += '\n';
      });
      
      response += `📊 تم العثور على ${properties.length} عقار في قاعدة البيانات.`;
      
      if (sizeMatch) {
        response += `\n🔍 البحث عن المساحة: ${sizeMatch[1]} متر مربع`;
      }
    }

    res.json({
      success: true,
      result: {
        content: [{
          type: 'text',
          text: response
        }]
      }
    });
    
  } catch (error) {
    console.error('❌ Database query error:', error);
    res.json({
      success: false,
      result: {
        content: [{
          type: 'text',
          text: `حدث خطأ في البحث: ${error.message}`
        }]
      }
    });
  }
});

// Start server
const PORT = 3002;
app.listen(PORT, () => {
  console.log(`🌐 Real MCP Server with Neon DB running on http://localhost:${PORT}`);
  console.log(`📡 Connected to real property database`);
});
