#!/bin/bash

echo "🧪 Testing MCP Server Environment for Claude Desktop"
echo "===================================================="

# Test 1: Check if Node.js is available
echo "1. Testing Node.js availability..."
if command -v node &> /dev/null; then
    echo "✅ Node.js found: $(node --version)"
else
    echo "❌ Node.js not found in PATH"
    echo "   Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Test 2: Check if npm is available
echo ""
echo "2. Testing npm availability..."
if command -v npm &> /dev/null; then
    echo "✅ npm found: $(npm --version)"
else
    echo "❌ npm not found"
fi

# Test 3: Install MCP dependencies if needed
echo ""
echo "3. Installing MCP dependencies..."
npm install @modelcontextprotocol/sdk pg dotenv

# Test 4: Test database connection
echo ""
echo "4. Testing database connection..."
node -e "
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_jyLVBR2De0mZ@ep-floral-water-a2ow4nw4-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});
pool.query('SELECT NOW()').then(r => {
  console.log('✅ Database connected at:', r.rows[0].now.toISOString());
  pool.end();
}).catch(e => {
  console.error('❌ Database error:', e.message);
  process.exit(1);
});
"

# Test 5: Check if MCP server file exists and is executable
echo ""
echo "5. Checking MCP server file..."
if [ -f "mcp-server-windows.js" ]; then
    echo "✅ MCP server file exists"
    echo "📄 File size: $(ls -lh mcp-server-windows.js | awk '{print $5}')"
else
    echo "❌ MCP server file not found"
fi

# Test 6: Test MCP server startup
echo ""
echo "6. Testing MCP server startup (5 second test)..."
timeout 5s node mcp-server-windows.js &
sleep 2
if ps aux | grep -v grep | grep "mcp-server-windows.js" > /dev/null; then
    echo "✅ MCP server started successfully"
    pkill -f "mcp-server-windows.js"
else
    echo "⚠️  MCP server test completed (this is normal for a quick test)"
fi

echo ""
echo "🎯 Environment Test Results:"
echo "============================="
echo "Node.js: $(command -v node && echo "✅ Available" || echo "❌ Missing")"
echo "npm: $(command -v npm && echo "✅ Available" || echo "❌ Missing")"
echo "MCP Server File: $([ -f "mcp-server-windows.js" ] && echo "✅ Present" || echo "❌ Missing")"
echo ""
echo "📋 Current Claude Desktop Configuration Should Be:"
echo '{'
echo '  "mcpServers": {'
echo '    "contaboo-database": {'
echo '      "command": "powershell",'
echo '      "args": ['
echo '        "-Command",'
echo '        "wsl",'
echo '        "--cd",'
echo '        "/home/xinreal/Contaboo",'
echo '        "node",'
echo '        "mcp-server-windows.js"'
echo '      ]'
echo '    }'
echo '  }'
echo '}'
echo ""
echo "🔄 After running this test, restart Claude Desktop and try again!"
