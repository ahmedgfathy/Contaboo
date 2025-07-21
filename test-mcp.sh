#!/bin/bash

echo "🧪 Testing Contaboo MCP Server"
echo "=============================="

# Check if mcp-server.js exists
if [ ! -f "mcp-server.js" ]; then
    echo "❌ mcp-server.js not found"
    echo "   Please run setup-mcp.sh first"
    exit 1
fi

# Check if MCP SDK is installed
if [ ! -d "node_modules/@modelcontextprotocol" ]; then
    echo "❌ MCP SDK not installed"
    echo "   Please run: npm install @modelcontextprotocol/sdk"
    exit 1
fi

echo "🔌 Testing database connection..."
cd backend
node -e "
const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
pool.query('SELECT COUNT(*) as count FROM properties_import').then(r => {
  console.log('✅ Properties count:', r.rows[0].count);
  return pool.query('SELECT COUNT(*) as count FROM chat_messages');
}).then(r => {
  console.log('✅ Chat messages count:', r.rows[0].count);
  pool.end();
}).catch(e => {
  console.error('❌ Database error:', e.message);
  process.exit(1);
});
" 2>/dev/null

cd ..

echo ""
echo "📄 Your MCP configuration should be:"
echo "===================================="
echo ""
echo "File path: $(pwd)/mcp-server.js"
echo ""
echo "Claude Desktop config:"
echo '{'
echo '  "mcpServers": {'
echo '    "contaboo-database": {'
echo '      "command": "node",'
echo "      \"args\": [\"$(pwd)/mcp-server.js\"],"
echo '      "env": {'
echo '        "DATABASE_URL": "postgresql://neondb_owner:npg_jyLVBR2De0mZ@ep-floral-water-a2ow4nw4-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"'
echo '      }'
echo '    }'
echo '  }'
echo '}'
echo ""
echo "🔧 To configure Claude Desktop:"
echo "1. Open Claude Desktop"
echo "2. Go to Settings → Developer → Edit Config"
echo "3. Paste the configuration above (replace the path if needed)"
echo "4. Restart Claude Desktop"
echo ""
echo "🧪 Test commands for Claude Desktop:"
echo '• "Show me property statistics overview"'
echo '• "Query my database: SELECT property_category, COUNT(*) FROM properties_import GROUP BY property_category LIMIT 10"'
echo '• "Search for properties in New Cairo"'
echo '• "Analyze market trends for the last month"'
echo ""
echo "✅ MCP test completed!"
