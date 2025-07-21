// Test MCP Client to verify server functionality
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');

async function testMcpServer() {
  console.log('🧪 Testing MCP Server...');
  
  try {
    // Create client transport to connect to our server
    const transport = new StdioClientTransport({
      command: 'node',
      args: ['mcp-server-fixed.cjs']
    });

    const client = new Client({
      name: 'test-client',
      version: '1.0.0'
    });

    console.log('📡 Connecting to MCP server...');
    await client.connect(transport);
    console.log('✅ Connected successfully!');

    // Test listing tools
    console.log('📋 Listing available tools...');
    const tools = await client.listTools();
    console.log('Available tools:', JSON.stringify(tools, null, 2));

    // Test calling a simple tool
    console.log('🔧 Testing query_properties tool...');
    const result = await client.callTool({
      name: 'query_properties',
      arguments: {
        query: 'SELECT COUNT(*) as total_count FROM properties LIMIT 1'
      }
    });
    console.log('Tool result:', JSON.stringify(result, null, 2));

    // Test statistics tool
    console.log('📊 Testing get_property_stats tool...');
    const statsResult = await client.callTool({
      name: 'get_property_stats',
      arguments: {
        type: 'overview'
      }
    });
    console.log('Stats result:', JSON.stringify(statsResult, null, 2));

    console.log('🎉 All tests passed! MCP server is working correctly.');
    
    await client.close();
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testMcpServer();
