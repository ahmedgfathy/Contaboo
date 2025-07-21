// Contaboo MCP Server - Direct Database Access for Claude Desktop
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import pg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pg;
dotenv.config();

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

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

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
    },
    {
      name: 'analyze_market_trends',
      description: 'Analyze real estate market trends from the database',
      inputSchema: {
        type: 'object',
        properties: {
          period: { 
            type: 'string', 
            description: 'Time period for analysis: last_month, last_3_months, last_year',
            enum: ['last_month', 'last_3_months', 'last_year']
          },
          property_type: { 
            type: 'string', 
            description: 'Property type to analyze (optional)' 
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
            text: `Query Results (${result.rows.length} rows):\n${JSON.stringify(result.rows, null, 2)}`
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
          case 'by_price_range':
            statsQuery = `
              SELECT 
                CASE 
                  WHEN CAST(REGEXP_REPLACE(unit_price, '[^0-9]', '', 'g') AS INTEGER) < 500000 THEN 'Under 500K'
                  WHEN CAST(REGEXP_REPLACE(unit_price, '[^0-9]', '', 'g') AS INTEGER) < 1000000 THEN '500K - 1M'
                  WHEN CAST(REGEXP_REPLACE(unit_price, '[^0-9]', '', 'g') AS INTEGER) < 2000000 THEN '1M - 2M'
                  ELSE 'Over 2M'
                END as price_range,
                COUNT(*) as count
              FROM properties_import 
              WHERE unit_price IS NOT NULL 
                AND unit_price != '' 
                AND unit_price ~ '[0-9]'
              GROUP BY price_range 
              ORDER BY count DESC;
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
        
        searchQuery += ` ORDER BY created_at DESC LIMIT 50`;
        
        const searchResult = await pool.query(searchQuery, params);
        return {
          content: [{
            type: 'text',
            text: `Chat Messages Search Results (${searchResult.rows.length} found):\n${JSON.stringify(searchResult.rows, null, 2)}`
          }]
        };
        
      case 'analyze_market_trends':
        let trendQuery;
        const period = args.period || 'last_3_months';
        
        switch (period) {
          case 'last_month':
            trendQuery = `
              SELECT 
                DATE_TRUNC('day', created_at) as date,
                purpose,
                COUNT(*) as message_count,
                AVG(CASE WHEN price IS NOT NULL THEN price ELSE NULL END) as avg_price
              FROM chat_messages 
              WHERE created_at >= NOW() - INTERVAL '1 month'
                AND purpose IS NOT NULL
              GROUP BY DATE_TRUNC('day', created_at), purpose
              ORDER BY date DESC, purpose;
            `;
            break;
          case 'last_3_months':
            trendQuery = `
              SELECT 
                DATE_TRUNC('week', created_at) as week,
                purpose,
                COUNT(*) as message_count,
                COUNT(CASE WHEN price IS NOT NULL THEN 1 END) as with_price_count
              FROM chat_messages 
              WHERE created_at >= NOW() - INTERVAL '3 months'
                AND purpose IS NOT NULL
              GROUP BY DATE_TRUNC('week', created_at), purpose
              ORDER BY week DESC, purpose;
            `;
            break;
          case 'last_year':
            trendQuery = `
              SELECT 
                DATE_TRUNC('month', created_at) as month,
                purpose,
                COUNT(*) as message_count,
                COUNT(CASE WHEN area IS NOT NULL THEN 1 END) as with_area_count
              FROM chat_messages 
              WHERE created_at >= NOW() - INTERVAL '1 year'
                AND purpose IS NOT NULL
              GROUP BY DATE_TRUNC('month', created_at), purpose
              ORDER BY month DESC, purpose;
            `;
            break;
        }
        
        const trendResult = await pool.query(trendQuery);
        return {
          content: [{
            type: 'text',
            text: `Market Trends Analysis (${period}):\n${JSON.stringify(trendResult.rows, null, 2)}`
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

console.error('Contaboo MCP Server started successfully!');
