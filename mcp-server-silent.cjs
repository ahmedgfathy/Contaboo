// Contaboo MCP Server - Claude Desktop Compatible (No Console Output)
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { Pool } = require('pg');
const { z } = require('zod');

// Load dotenv quietly (suppress output)
require('dotenv').config({ quiet: true });

// Redirect console.error to prevent interference with MCP protocol
const originalConsoleError = console.error;
console.error = () => {}; // Suppress all console.error output

// Database connection
const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_jyLVBR2De0mZ@ep-floral-water-a2ow4nw4-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: { rejectUnauthorized: false }
});

// Test database connection silently
pool.query('SELECT NOW()').catch(() => {});

// Initialize MCP Server
const server = new McpServer({
  name: 'contaboo-database',
  version: '1.0.0'
});

// Register tool: Query properties
server.registerTool(
  'query_properties',
  {
    title: 'Query Properties',
    description: 'Query Contaboo real estate properties with Arabic support',
    inputSchema: {
      query: z.string().describe('SQL query to execute on the properties database')
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

// Register tool: Get property statistics
server.registerTool(
  'get_property_stats',
  {
    title: 'Property Statistics',
    description: 'Get comprehensive statistics about properties in the database',
    inputSchema: {
      type: z.enum(['overview', 'by_category', 'by_region', 'by_price_range'])
        .optional()
        .describe('Type of statistics to generate')
        .default('overview')
    }
  },
  async ({ type = 'overview' }) => {
    try {
      let statsQuery;
      switch (type) {
        case 'overview':
          statsQuery = `
            SELECT 
              COUNT(*) as total_properties,
              COUNT(DISTINCT property_type) as property_types,
              COUNT(DISTINCT area) as areas,
              AVG(CAST(REGEXP_REPLACE(COALESCE(price, '0'), '[^0-9]', '', 'g') AS NUMERIC)) as avg_price
            FROM properties 
            WHERE price IS NOT NULL AND price != ''
          `;
          break;
        case 'by_category':
          statsQuery = `
            SELECT 
              property_type, 
              COUNT(*) as count,
              AVG(CAST(REGEXP_REPLACE(COALESCE(price, '0'), '[^0-9]', '', 'g') AS NUMERIC)) as avg_price
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
              AVG(CAST(REGEXP_REPLACE(COALESCE(price, '0'), '[^0-9]', '', 'g') AS NUMERIC)) as avg_price
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
                  WHEN CAST(REGEXP_REPLACE(COALESCE(price, '0'), '[^0-9]', '', 'g') AS NUMERIC) < 100000 THEN 'Under 100K'
                  WHEN CAST(REGEXP_REPLACE(COALESCE(price, '0'), '[^0-9]', '', 'g') AS NUMERIC) < 500000 THEN '100K-500K'
                  WHEN CAST(REGEXP_REPLACE(COALESCE(price, '0'), '[^0-9]', '', 'g') AS NUMERIC) < 1000000 THEN '500K-1M'
                  ELSE 'Over 1M'
                END as price_range
              FROM properties 
              WHERE price IS NOT NULL AND price != ''
              AND REGEXP_REPLACE(COALESCE(price, '0'), '[^0-9]', '', 'g') != ''
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
          text: `Statistics (${type}):\n${JSON.stringify(statsResult.rows, null, 2)}`
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

// Register tool: Search properties
server.registerTool(
  'search_properties',
  {
    title: 'Search Properties',
    description: 'Search properties by text, price range, or location',
    inputSchema: {
      search_term: z.string().optional().describe('Search term for description or details'),
      min_price: z.number().optional().describe('Minimum price filter'),
      max_price: z.number().optional().describe('Maximum price filter'),
      area: z.string().optional().describe('Area/location to search in'),
      property_type: z.string().optional().describe('Type of property to search for')
    }
  },
  async ({ search_term, min_price, max_price, area, property_type }) => {
    try {
      let whereConditions = [];
      let params = [];
      let paramIndex = 1;

      if (search_term) {
        whereConditions.push(`(description ILIKE $${paramIndex} OR details ILIKE $${paramIndex})`);
        params.push(`%${search_term}%`);
        paramIndex++;
      }

      if (area) {
        whereConditions.push(`area ILIKE $${paramIndex}`);
        params.push(`%${area}%`);
        paramIndex++;
      }

      if (property_type) {
        whereConditions.push(`property_type ILIKE $${paramIndex}`);
        params.push(`%${property_type}%`);
        paramIndex++;
      }

      if (min_price) {
        whereConditions.push(`CAST(REGEXP_REPLACE(COALESCE(price, '0'), '[^0-9]', '', 'g') AS NUMERIC) >= $${paramIndex}`);
        params.push(min_price);
        paramIndex++;
      }

      if (max_price) {
        whereConditions.push(`CAST(REGEXP_REPLACE(COALESCE(price, '0'), '[^0-9]', '', 'g') AS NUMERIC) <= $${paramIndex}`);
        params.push(max_price);
        paramIndex++;
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
      const searchQuery = `
        SELECT id, property_type, area, price, description 
        FROM properties 
        ${whereClause}
        ORDER BY id 
        LIMIT 20
      `;

      const result = await pool.query(searchQuery, params);
      return {
        content: [{
          type: 'text',
          text: `Search Results (${result.rows.length} properties found):\n${JSON.stringify(result.rows, null, 2)}`
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
