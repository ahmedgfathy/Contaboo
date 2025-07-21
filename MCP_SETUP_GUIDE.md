# 🤖 Claude Desktop MCP Setup for Contaboo Real Estate CRM

## Quick Setup Guide

### 1. Install MCP Dependencies
```bash
cd /home/xinreal/Contaboo
chmod +x setup-mcp.sh
./setup-mcp.sh
```

### 2. Test Database Connection
```bash
node test-mcp-connection.js
```
You should see ✅ confirmations that your database is connected.

### 3. Configure Claude Desktop

**Open Claude Desktop Settings:**
- Go to **Settings → Developer → Edit Config**
- This opens your `claude_desktop_config.json` file

**For WSL/Windows systems, use this configuration:**

```json
{
  "mcpServers": {
    "contaboo-database": {
      "command": "node",
      "args": ["\\\\wsl.localhost\\Ubuntu\\home\\xinreal\\Contaboo\\mcp-server-windows.js"]
    }
  }
}
```

**Alternative path formats to try if the above doesn't work:**

Option 1 - Direct Windows path:
```json
{
  "mcpServers": {
    "contaboo-database": {
      "command": "node",
      "args": ["C:\\\\Users\\\\YourUserName\\\\AppData\\\\Local\\\\Packages\\\\CanonicalGroupLimited.Ubuntu_*\\\\LocalState\\\\rootfs\\\\home\\\\xinreal\\\\Contaboo\\\\mcp-server-windows.js"]
    }
  }
}
```

Option 2 - WSL mount path:
```json
{
  "mcpServers": {
    "contaboo-database": {
      "command": "node",
      "args": ["/mnt/c/Users/YourUserName/path/to/Contaboo/mcp-server-windows.js"]
    }
  }
}
```

### 4. Restart Claude Desktop
- **Close Claude Desktop completely**
- **Reopen it**
- Look for connection messages in the interface

### 5. Test the Connection

Try these commands in Claude Desktop:

```
"Show me property statistics overview"
```

```
"Query my database: SELECT property_category, COUNT(*) FROM properties_import GROUP BY property_category LIMIT 10"
```

```
"Search chat messages for properties in New Cairo"
```

## Available MCP Tools

### 🔍 `query_properties`
Execute custom SQL queries on your Neon PostgreSQL database
- **Usage**: "Query my database: SELECT * FROM properties_import LIMIT 5"

### 📊 `get_property_stats` 
Get comprehensive database statistics
- **Types**: overview, by_category, by_region, by_price_range
- **Usage**: "Show me property statistics by region"

### 💬 `search_chat_messages`
Search through WhatsApp messages with extracted real estate data
- **Usage**: "Search chat messages for apartments in Nasr City"

### 📈 `analyze_market_trends`
Analyze market trends over time periods
- **Usage**: "Analyze market trends for the last month"

## Troubleshooting

### MCP Server Not Connecting
1. Check if the file path in claude_desktop_config.json is correct
2. Ensure you have the MCP SDK installed: `npm install @modelcontextprotocol/sdk`
3. Verify your DATABASE_URL is working
4. Restart Claude Desktop completely

### Database Connection Issues
1. Test your database connection:
```bash
cd backend
node -e "
const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
pool.query('SELECT NOW()').then(r => console.log('✅ Connected:', r.rows[0])).catch(e => console.error('❌ Error:', e.message));
"
```

### Permission Issues
1. Make sure Node.js can access the mcp-server.js file
2. Check that the path doesn't contain special characters
3. Try using forward slashes instead: `C:/Users/YOUR_USERNAME/path/to/Contaboo/mcp-server.js`

## Example Queries You Can Try

Once connected, ask Claude:

- "How many properties do I have in my database?"
- "Show me the most expensive properties"
- "Find all villas in Sheikh Zayed"
- "What are the top 5 most popular areas?"
- "Show me recent chat messages about apartments for rent"
- "Analyze price trends for the last 6 months"
- "Find properties with broker contact information"

## Next Steps

After successful connection:
1. Claude Desktop will have direct access to your 58K+ property records
2. You can ask complex questions about your real estate data
3. Claude can analyze trends, generate reports, and help with business insights
4. All queries are executed securely through the MCP protocol

🎉 **Your Contaboo CRM is now connected to Claude Desktop!**
