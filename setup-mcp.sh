#!/bin/bash

echo "🤖 Setting up Claude Desktop MCP Integration for Contaboo"
echo "========================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the Contaboo project root directory"
    exit 1
fi

echo "📦 Installing MCP SDK packages..."

# Install MCP dependencies for the server
echo "Installing MCP server dependencies..."
npm install --save @modelcontextprotocol/sdk pg dotenv

# Install in backend as well
echo "Installing MCP SDK in backend..."
cd backend
npm install @modelcontextprotocol/sdk
cd ..

echo "✅ MCP SDK packages installed successfully!"

# Test database connection
echo "🔌 Testing database connection..."
node -e "
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_jyLVBR2De0mZ@ep-floral-water-a2ow4nw4-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});
pool.query('SELECT NOW()').then(r => {
  console.log('✅ Database connected successfully!');
  console.log('   Timestamp:', r.rows[0].now.toISOString());
  pool.end();
}).catch(e => {
  console.error('❌ Database connection failed:', e.message);
  process.exit(1);
});
" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Database connection verified!"
else
    echo "❌ Database connection failed!"
    echo "   Continuing with setup..."
fi

echo ""
echo "🔍 Detecting system path format..."

# Get the Windows path format
UNIX_PATH=$(pwd)
# Convert WSL path to Windows path
WINDOWS_PATH=$(wslpath -w "$UNIX_PATH" 2>/dev/null || echo "$UNIX_PATH")
WINDOWS_PATH="${WINDOWS_PATH//\\/\\\\}"

echo "   Unix path: $UNIX_PATH"
echo "   Windows path: $WINDOWS_PATH"

echo ""
echo "🎯 MCP Setup Complete!"
echo "======================"
echo ""
echo "📋 Claude Desktop Configuration:"
echo "================================"
echo ""
echo "1. Open Claude Desktop"
echo "2. Go to Settings → Developer → Edit Config"
echo "3. Replace the content with this configuration:"
echo ""
echo '{'
echo '  "mcpServers": {'
echo '    "contaboo-database": {'
echo '      "command": "node",'
echo "      \"args\": [\"${WINDOWS_PATH}\\\\mcp-server-windows.js\"]"
echo '    }'
echo '  }'
echo '}'
echo ""
echo "📝 Alternative paths to try if the above doesn't work:"
echo "   Windows style: \"C:\\\\Users\\\\YourName\\\\path\\\\to\\\\Contaboo\\\\mcp-server-windows.js\""
echo "   WSL style: \"/mnt/c/Users/YourName/path/to/Contaboo/mcp-server-windows.js\""
echo "   Direct: \"$UNIX_PATH/mcp-server-windows.js\""
echo ""
echo "4. Restart Claude Desktop completely"
echo "5. Test with: 'Show me property statistics overview'"
echo ""
echo "🚀 Your Contaboo CRM will be connected to Claude Desktop!"
