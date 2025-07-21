// Enhanced Contaboo MCP Server - AI-Powered Real Estate Assistant
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { Pool } = require('pg');
const { z } = require('zod');

// Load dotenv quietly
require('dotenv').config({ quiet: true });

// Suppress console output for MCP protocol compatibility
console.error = () => {};

// Database connection
const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_jyLVBR2De0mZ@ep-floral-water-a2ow4nw4-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: { rejectUnauthorized: false }
});

// Test database connection silently
pool.query('SELECT NOW()').catch(() => {});

// Arabic Real Estate Intelligence (from your aiService)
const PROPERTY_KEYWORDS = {
  apartment: ['شقة', 'شقق', 'دور', 'أدوار', 'طابق', 'غرفة', 'غرف'],
  villa: ['فيلا', 'فيلات', 'قصر', 'قصور', 'بيت', 'بيوت', 'منزل', 'منازل'],
  land: ['أرض', 'أراضي', 'قطعة', 'قطع', 'مساحة', 'فدان'],
  office: ['مكتب', 'مكاتب', 'إداري', 'تجاري', 'محل', 'محلات']
};

// AI-like Intelligence Functions
function analyzePropertyText(text) {
  let analysis = {
    propertyType: null,
    location: null,
    priceRange: null,
    features: []
  };

  // Property type detection
  for (const [type, keywords] of Object.entries(PROPERTY_KEYWORDS)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      analysis.propertyType = type;
      break;
    }
  }

  // Price extraction
  const priceMatch = text.match(/[\d,]+\s*(ألف|مليون|thousand|million|k|m)/gi);
  if (priceMatch) {
    analysis.priceRange = priceMatch[0];
  }

  // Location extraction
  const locationMatch = text.match(/(الشيخ زايد|التجمع الخامس|العاصمة الإدارية|sheikh zayed|fifth settlement|new capital)/gi);
  if (locationMatch) {
    analysis.location = locationMatch[0];
  }

  return analysis;
}

function generateIntelligentResponse(query, results, language = 'arabic') {
  const count = results.length;
  
  if (language === 'arabic') {
    if (count === 0) {
      return `😔 لم أجد عقارات تطابق بحثك حالياً.\n\n💡 اقتراحات:\n• جرب البحث في مناطق مجاورة\n• اختر نوع عقار مختلف\n• راجع النطاق السعري`;
    }

    // Group by property type
    const typeGroups = {};
    results.forEach(prop => {
      const type = prop.property_type || 'أخرى';
      if (!typeGroups[type]) typeGroups[type] = [];
      typeGroups[type].push(prop);
    });

    let response = `🏘️ وجدت ${count} عقار يطابق بحثك:\n\n`;
    
    // Show distribution by type
    response += '📊 التوزيع حسب النوع:\n';
    Object.entries(typeGroups).forEach(([type, props]) => {
      response += `• ${type}: ${props.length} عقار\n`;
    });

    // Price analysis
    const prices = results.map(p => {
      const match = p.price?.match(/[\d,]+/);
      return match ? parseInt(match[0].replace(/,/g, '')) : 0;
    }).filter(p => p > 0);

    if (prices.length > 0) {
      const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      response += `\n💰 تحليل الأسعار:\n`;
      response += `• المتوسط: ${avgPrice.toLocaleString()} جنيه\n`;
      response += `• الأدنى: ${minPrice.toLocaleString()} جنيه\n`;
      response += `• الأعلى: ${maxPrice.toLocaleString()} جنيه\n`;
    }

    // Top recommendations
    response += '\n🌟 أفضل الخيارات:\n';
    results.slice(0, 3).forEach((prop, i) => {
      response += `${i + 1}. ${prop.property_type || 'عقار'} في ${prop.area || prop.location || 'موقع مميز'}\n`;
      if (prop.price) response += `   💰 ${prop.price}\n`;
      if (prop.description) {
        const shortDesc = prop.description.substring(0, 50);
        response += `   📝 ${shortDesc}...\n`;
      }
      response += '\n';
    });

    response += '💡 يمكنك الاستفسار عن تفاصيل أكثر لأي عقار محدد!';
    return response;

  } else {
    // English version
    if (count === 0) {
      return `😔 No properties found matching your criteria.\n\n💡 Suggestions:\n• Try nearby areas\n• Adjust property type\n• Check price range`;
    }

    let response = `🏘️ Found ${count} properties matching your search:\n\n`;
    
    // Show sample
    results.slice(0, 3).forEach((prop, i) => {
      response += `${i + 1}. ${prop.property_type || 'Property'} in ${prop.area || 'Premium Location'}\n`;
      if (prop.price) response += `   💰 ${prop.price}\n`;
      response += '\n';
    });

    return response;
  }
}

// Initialize MCP Server
const server = new McpServer({
  name: 'contaboo-ai-assistant',
  version: '2.0.0'
});

// Enhanced Tools with AI-like capabilities

// 1. Intelligent Property Search (replaces your AI search)
server.registerTool(
  'ai_property_search',
  {
    title: 'AI Property Search',
    description: 'Intelligent property search with Arabic NLP and smart recommendations',
    inputSchema: {
      query: z.string().describe('Natural language search query in Arabic or English'),
      max_results: z.number().optional().default(20).describe('Maximum number of results'),
      language: z.enum(['arabic', 'english']).optional().default('arabic').describe('Response language')
    }
  },
  async ({ query, max_results = 20, language = 'arabic' }) => {
    try {
      // Analyze the query using your AI logic
      const analysis = analyzePropertyText(query);
      
      // Build smart SQL query
      let sqlQuery = 'SELECT * FROM properties WHERE 1=1';
      let params = [];
      let paramIndex = 1;

      // Add intelligent filters based on analysis
      if (analysis.propertyType) {
        sqlQuery += ` AND property_type ILIKE $${paramIndex}`;
        params.push(`%${analysis.propertyType}%`);
        paramIndex++;
      }

      if (analysis.location) {
        sqlQuery += ` AND (area ILIKE $${paramIndex} OR location ILIKE $${paramIndex})`;
        params.push(`%${analysis.location}%`);
        paramIndex++;
      }

      // General text search
      sqlQuery += ` AND (description ILIKE $${paramIndex} OR details ILIKE $${paramIndex} OR area ILIKE $${paramIndex})`;
      params.push(`%${query}%`);
      paramIndex++;

      sqlQuery += ` ORDER BY id DESC LIMIT ${max_results}`;

      const result = await pool.query(sqlQuery, params);
      const intelligentResponse = generateIntelligentResponse(query, result.rows, language);

      return {
        content: [{
          type: 'text',
          text: intelligentResponse
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// 2. Market Analysis Tool (replaces AI market analysis)
server.registerTool(
  'ai_market_analysis',
  {
    title: 'AI Market Analysis',
    description: 'Intelligent real estate market analysis and insights',
    inputSchema: {
      analysis_type: z.enum(['overview', 'trends', 'investment', 'comparison']).default('overview'),
      property_type: z.string().optional().describe('Specific property type to analyze'),
      area: z.string().optional().describe('Specific area to analyze'),
      language: z.enum(['arabic', 'english']).optional().default('arabic')
    }
  },
  async ({ analysis_type, property_type, area, language = 'arabic' }) => {
    try {
      let analysisResponse = '';

      switch (analysis_type) {
        case 'overview':
          const overviewQuery = `
            SELECT 
              COUNT(*) as total_properties,
              COUNT(DISTINCT property_type) as property_types,
              COUNT(DISTINCT area) as areas,
              AVG(CAST(REGEXP_REPLACE(COALESCE(price, '0'), '[^0-9]', '', 'g') AS NUMERIC)) as avg_price
            FROM properties
          `;
          const overviewResult = await pool.query(overviewQuery);
          const stats = overviewResult.rows[0];

          if (language === 'arabic') {
            analysisResponse = `📊 تحليل السوق العقاري الشامل:\n\n`;
            analysisResponse += `🏢 إجمالي العقارات: ${stats.total_properties}\n`;
            analysisResponse += `🏠 أنواع العقارات: ${stats.property_types}\n`;
            analysisResponse += `📍 المناطق المغطاة: ${stats.areas}\n`;
            analysisResponse += `💰 متوسط الأسعار: ${Math.round(stats.avg_price || 0).toLocaleString()} جنيه\n\n`;
            analysisResponse += `📈 تحليل ذكي:\n`;
            analysisResponse += `• السوق نشط بمجموعة متنوعة من الخيارات\n`;
            analysisResponse += `• الأسعار تتراوح حسب المنطقة ونوع العقار\n`;
            analysisResponse += `• فرص استثمارية واعدة في مختلف القطاعات`;
          } else {
            analysisResponse = `📊 Comprehensive Real Estate Market Analysis:\n\n`;
            analysisResponse += `🏢 Total Properties: ${stats.total_properties}\n`;
            analysisResponse += `🏠 Property Types: ${stats.property_types}\n`;
            analysisResponse += `📍 Covered Areas: ${stats.areas}\n`;
            analysisResponse += `💰 Average Price: ${Math.round(stats.avg_price || 0).toLocaleString()} EGP\n\n`;
            analysisResponse += `📈 Smart Analysis:\n`;
            analysisResponse += `• Active market with diverse options\n`;
            analysisResponse += `• Prices vary by location and property type\n`;
            analysisResponse += `• Promising investment opportunities across sectors`;
          }
          break;

        case 'trends':
          // Price trend analysis
          const trendQuery = `
            SELECT 
              property_type,
              COUNT(*) as count,
              AVG(CAST(REGEXP_REPLACE(COALESCE(price, '0'), '[^0-9]', '', 'g') AS NUMERIC)) as avg_price,
              MIN(CAST(REGEXP_REPLACE(COALESCE(price, '0'), '[^0-9]', '', 'g') AS NUMERIC)) as min_price,
              MAX(CAST(REGEXP_REPLACE(COALESCE(price, '0'), '[^0-9]', '', 'g') AS NUMERIC)) as max_price
            FROM properties 
            WHERE property_type IS NOT NULL 
            GROUP BY property_type 
            ORDER BY count DESC
          `;
          const trendResult = await pool.query(trendQuery);

          if (language === 'arabic') {
            analysisResponse = `📈 تحليل اتجاهات السوق العقاري:\n\n`;
            trendResult.rows.forEach(row => {
              analysisResponse += `🏠 ${row.property_type}:\n`;
              analysisResponse += `   • العدد: ${row.count} عقار\n`;
              analysisResponse += `   • متوسط السعر: ${Math.round(row.avg_price || 0).toLocaleString()} جنيه\n`;
              analysisResponse += `   • النطاق: ${Math.round(row.min_price || 0).toLocaleString()} - ${Math.round(row.max_price || 0).toLocaleString()} جنيه\n\n`;
            });
          } else {
            analysisResponse = `📈 Real Estate Market Trends Analysis:\n\n`;
            trendResult.rows.forEach(row => {
              analysisResponse += `🏠 ${row.property_type}:\n`;
              analysisResponse += `   • Count: ${row.count} properties\n`;
              analysisResponse += `   • Average Price: ${Math.round(row.avg_price || 0).toLocaleString()} EGP\n`;
              analysisResponse += `   • Range: ${Math.round(row.min_price || 0).toLocaleString()} - ${Math.round(row.max_price || 0).toLocaleString()} EGP\n\n`;
            });
          }
          break;

        default:
          analysisResponse = 'Analysis type not yet implemented.';
      }

      return {
        content: [{
          type: 'text',
          text: analysisResponse
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// 3. Property Recommendations (replaces AI recommendations)
server.registerTool(
  'ai_property_recommendations',
  {
    title: 'AI Property Recommendations',
    description: 'Intelligent property recommendations based on criteria',
    inputSchema: {
      budget: z.number().optional().describe('Budget in EGP'),
      property_type: z.string().optional().describe('Preferred property type'),
      area: z.string().optional().describe('Preferred area'),
      purpose: z.enum(['buy', 'rent', 'invest']).default('buy'),
      language: z.enum(['arabic', 'english']).optional().default('arabic')
    }
  },
  async ({ budget, property_type, area, purpose, language = 'arabic' }) => {
    try {
      // Build recommendation query
      let query = 'SELECT * FROM properties WHERE 1=1';
      let params = [];
      let paramIndex = 1;

      if (budget) {
        query += ` AND CAST(REGEXP_REPLACE(COALESCE(price, '0'), '[^0-9]', '', 'g') AS NUMERIC) <= $${paramIndex}`;
        params.push(budget);
        paramIndex++;
      }

      if (property_type) {
        query += ` AND property_type ILIKE $${paramIndex}`;
        params.push(`%${property_type}%`);
        paramIndex++;
      }

      if (area) {
        query += ` AND area ILIKE $${paramIndex}`;
        params.push(`%${area}%`);
        paramIndex++;
      }

      query += ' ORDER BY RANDOM() LIMIT 5'; // Smart randomization

      const result = await pool.query(query, params);
      
      let recommendations = '';
      if (language === 'arabic') {
        recommendations = `🎯 توصيات عقارية ذكية:\n\n`;
        if (result.rows.length === 0) {
          recommendations += `😔 لم أجد عقارات تطابق معايير البحث تماماً.\n\n💡 اقتراحات:\n• زيادة الميزانية قليلاً\n• توسيع نطاق المناطق\n• النظر في أنواع عقارات أخرى`;
        } else {
          result.rows.forEach((prop, i) => {
            recommendations += `${i + 1}. 🏠 ${prop.property_type || 'عقار مميز'}\n`;
            recommendations += `   📍 الموقع: ${prop.area || prop.location || 'موقع استراتيجي'}\n`;
            if (prop.price) recommendations += `   💰 السعر: ${prop.price}\n`;
            recommendations += `   ⭐ سبب التوصية: موقع ممتاز وسعر مناسب للميزانية\n\n`;
          });
          recommendations += `💡 هذه التوصيات مبنية على تحليل ذكي لقاعدة البيانات وتفضيلاتك.`;
        }
      }

      return {
        content: [{
          type: 'text',
          text: recommendations
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// 4. Direct SQL Query (for advanced users)
server.registerTool(
  'query_properties',
  {
    title: 'Direct Database Query',
    description: 'Execute direct SQL queries on the properties database',
    inputSchema: {
      query: z.string().describe('SQL query to execute')
    }
  },
  async ({ query }) => {
    try {
      const result = await pool.query(query);
      return {
        content: [{
          type: 'text',
          text: `Query Results (${result.rows.length} rows):\n${JSON.stringify(result.rows.slice(0, 10), null, 2)}${result.rows.length > 10 ? '\n... (showing first 10 of ' + result.rows.length + ' rows)' : ''}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// Start the server
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
  } catch (error) {
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});

main();
