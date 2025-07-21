// Contaboo MCP Server - Windows/WSL Compatible
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { Pool } = require('pg');
require('dotenv').config();

// Initialize MCP Server
const server = new Server({
  name: 'contaboo-database',
  version: '1.0.0'
}, {
  capabilities: { 
    tools: {},
    resources: {},
    prompts: {}
  }
});

// Database connection with hardcoded URL for MCP
const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_jyLVBR2De0mZ@ep-floral-water-a2ow4nw4-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: { rejectUnauthorized: false }
});

// Test database connection on startup
pool.query('SELECT NOW()')
  .then(() => console.error('✅ Database connected successfully'))
  .catch(err => console.error('❌ Database connection failed:', err.message));

// Available tools for Claude Desktop
server.setRequestHandler('tools/list', async () => ({
  tools: [
    {
      name: 'query_properties',
      description: 'Query Contaboo real estate properties with Arabic support',
      inputSchema: {
        type: 'object',
        properties: {
          query: { 
            type: 'string', 
            description: 'SQL query to execute on the properties database' 
          }
        },
        required: ['query']
      }
    },
    {
      name: 'get_property_stats',
      description: 'Get comprehensive statistics about properties in the database',
      inputSchema: {
        type: 'object',
        properties: {
          type: { 
            type: 'string', 
            description: 'Type of statistics: overview, by_category, by_region, by_price_range',
            enum: ['overview', 'by_category', 'by_region', 'by_price_range']
          }
        }
      }
    },
    {
      name: 'search_chat_messages',
      description: 'Search through chat messages with real estate data extraction',
      inputSchema: {
        type: 'object',
        properties: {
          search_term: { 
            type: 'string', 
            description: 'Search term in Arabic or English' 
          },
          purpose: { 
            type: 'string', 
            description: 'Property purpose: sale, rent, wanted',
            enum: ['sale', 'rent', 'wanted']
          },
          area: { 
            type: 'string', 
            description: 'Area/location to search for' 
          }
        }
      }
    }
  ]
}));

// Tool execution handler
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    switch (name) {
      case 'query_properties':
        const result = await pool.query(args.query);
        return {
          content: [{
            type: 'text',
            text: `Query Results (${result.rows.length} rows):\n${JSON.stringify(result.rows.slice(0, 10), null, 2)}${result.rows.length > 10 ? '\n... (showing first 10 of ' + result.rows.length + ' rows)' : ''}`
          }]
        };
        
      case 'get_property_stats':
        let statsQuery;
        switch (args.type || 'overview') {
          case 'overview':
            statsQuery = `
              SELECT 
                'properties_import' as table_name,
                COUNT(*) as total_count,
                COUNT(DISTINCT property_category) as unique_categories,
                COUNT(DISTINCT regions) as unique_regions,
                COUNT(CASE WHEN unit_price IS NOT NULL AND unit_price != '' THEN 1 END) as with_price
              FROM properties_import
              UNION ALL
              SELECT 
                'chat_messages' as table_name,
                COUNT(*) as total_count,
                COUNT(DISTINCT purpose) as unique_purposes,
                COUNT(DISTINCT area) as unique_areas,
                COUNT(CASE WHEN price IS NOT NULL THEN 1 END) as with_price
              FROM chat_messages;
            `;
            break;
          case 'by_category':
            statsQuery = `
              SELECT property_category, COUNT(*) as count 
              FROM properties_import 
              WHERE property_category IS NOT NULL 
              GROUP BY property_category 
              ORDER BY count DESC 
              LIMIT 20;
            `;
            break;
          case 'by_region':
            statsQuery = `
              SELECT regions, COUNT(*) as count 
              FROM properties_import 
              WHERE regions IS NOT NULL 
              GROUP BY regions 
              ORDER BY count DESC 
              LIMIT 20;
            `;
            break;
        }
        
        const statsResult = await pool.query(statsQuery);
        return {
          content: [{
            type: 'text',
            text: `Property Statistics (${args.type || 'overview'}):\n${JSON.stringify(statsResult.rows, null, 2)}`
          }]
        };
        
      case 'search_chat_messages':
        let searchQuery = `
          SELECT id, message, purpose, area, price, broker_name, broker_mobile, created_at
          FROM chat_messages 
          WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;
        
        if (args.search_term) {
          searchQuery += ` AND message ILIKE $${paramIndex}`;
          params.push(`%${args.search_term}%`);
          paramIndex++;
        }
        
        if (args.purpose) {
          searchQuery += ` AND purpose = $${paramIndex}`;
          params.push(args.purpose);
          paramIndex++;
        }
        
        if (args.area) {
          searchQuery += ` AND area ILIKE $${paramIndex}`;
          params.push(`%${args.area}%`);
          paramIndex++;
        }
        
        searchQuery += ` ORDER BY created_at DESC LIMIT 20`;
        
        const searchResult = await pool.query(searchQuery, params);
        return {
          content: [{
            type: 'text',
            text: `Chat Messages Search Results (${searchResult.rows.length} found):\n${JSON.stringify(searchResult.rows, null, 2)}`
          }]
        };
        
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error executing ${name}: ${error.message}`
      }],
      isError: true
    };
  }
});

// Start the MCP server
const transport = new StdioServerTransport();
server.connect(transport);

console.error('🚀 Contaboo MCP Server started successfully!');
