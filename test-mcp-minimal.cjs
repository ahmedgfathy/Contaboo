// Minimal MCP Server Test
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');

// Create server
const server = new Server({
  name: 'test-server',
  version: '1.0.0'
}, {
  capabilities: {}
});

console.error('Server created successfully');

// Start the server
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('✅ Test MCP Server started successfully');
  } catch (error) {
    console.error('❌ Error starting server:', error);
  }
}

main();
