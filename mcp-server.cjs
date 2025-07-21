// Contaboo MCP Server - Fixed Version
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { Pool } = require('pg');
require('dotenv').config();

// Database connection
const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_jyLVBR2De0mZ@ep-floral-water-a2ow4nw4-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: { rejectUnauthorized: false }
});

// Test database connection
pool.query('SELECT NOW()')
  .then(() => console.error('✅ Database connected successfully'))
  .catch(err => console.error('❌ Database connection failed:', err.message));

// Initialize MCP Server
const server = new Server({
  name: 'contaboo-database',
  version: '1.0.0'
}, {
  capabilities: { 
    tools: {}
  }
});

// List available tools
server.setRequestHandler('tools/list', async () => {
  return {
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
      }
    ]
  };
});

// Handle tool calls
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
                COUNT(*) as total_properties,
                COUNT(DISTINCT purpose) as purpose_types,
                COUNT(DISTINCT property_type) as property_types,
                COUNT(DISTINCT area) as areas,
                AVG(CAST(REGEXP_REPLACE(price, '[^0-9]', '', 'g') AS NUMERIC)) as avg_price
              FROM properties 
              WHERE price IS NOT NULL AND price != ''
            `;
            break;
          case 'by_category':
            statsQuery = `
              SELECT 
                property_type, 
                COUNT(*) as count,
                AVG(CAST(REGEXP_REPLACE(price, '[^0-9]', '', 'g') AS NUMERIC)) as avg_price
              FROM properties 
              WHERE property_type IS NOT NULL 
              GROUP BY property_type 
              ORDER BY count DESC
            `;
            break;
          case 'by_region':
            statsQuery = `
              SELECT 
                area, 
                COUNT(*) as count,
                AVG(CAST(REGEXP_REPLACE(price, '[^0-9]', '', 'g') AS NUMERIC)) as avg_price
              FROM properties 
              WHERE area IS NOT NULL 
              GROUP BY area 
              ORDER BY count DESC
              LIMIT 20
            `;
            break;
          case 'by_price_range':
            statsQuery = `
              WITH price_ranges AS (
                SELECT 
                  CASE 
                    WHEN CAST(REGEXP_REPLACE(price, '[^0-9]', '', 'g') AS NUMERIC) < 100000 THEN 'Under 100K'
                    WHEN CAST(REGEXP_REPLACE(price, '[^0-9]', '', 'g') AS NUMERIC) < 500000 THEN '100K-500K'
                    WHEN CAST(REGEXP_REPLACE(price, '[^0-9]', '', 'g') AS NUMERIC) < 1000000 THEN '500K-1M'
                    ELSE 'Over 1M'
                  END as price_range
                FROM properties 
                WHERE price IS NOT NULL AND price != ''
                AND REGEXP_REPLACE(price, '[^0-9]', '', 'g') != ''
              )
              SELECT price_range, COUNT(*) as count
              FROM price_ranges
              GROUP BY price_range
              ORDER BY count DESC
            `;
            break;
        }
        
        const statsResult = await pool.query(statsQuery);
        return {
          content: [{
            type: 'text',
            text: `Statistics (${args.type || 'overview'}):\n${JSON.stringify(statsResult.rows, null, 2)}`
          }]
        };
        
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error: ${error.message}`
      }],
      isError: true
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('🚀 Contaboo MCP Server started successfully');
}

// Handle process termination
process.on('SIGINT', async () => {
  console.error('🛑 Shutting down MCP server...');
  await pool.end();
  process.exit(0);
});

main().catch(error => {
  console.error('💥 Server startup failed:', error);
  process.exit(1);
});
