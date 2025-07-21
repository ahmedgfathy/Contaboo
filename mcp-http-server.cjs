// HTTP Wrapper for MCP Server - Allows browser clients to connect
const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');

class MCPHttpServer {
  constructor() {
    this.app = express();
    this.mcpProcess = null;
    this.isConnected = false;
    this.requestId = 0;
    this.pendingRequests = new Map();
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        mcpConnected: this.isConnected,
        timestamp: new Date().toISOString()
      });
    });

    // Tool calling endpoint
    this.app.post('/tools/:toolName', async (req, res) => {
      try {
        const { toolName } = req.params;
        const { arguments: args } = req.body;

        const result = await this.callMCPTool(toolName, args);
        res.json({ success: true, result });
      } catch (error) {
        console.error('Tool call error:', error);
        res.status(500).json({ 
          success: false, 
          error: error.message || 'Tool call failed' 
        });
      }
    });

    // Generic MCP request endpoint
    this.app.post('/mcp', async (req, res) => {
      try {
        const { method, params } = req.body;
        const result = await this.sendMCPRequest(method, params);
        res.json({ success: true, result });
      } catch (error) {
        console.error('MCP request error:', error);
        res.status(500).json({ 
          success: false, 
          error: error.message || 'MCP request failed' 
        });
      }
    });
  }

  async connectToMCP() {
    if (this.isConnected) return true;

    try {
      // Start MCP server process
      this.mcpProcess = spawn('node', ['mcp-server-ai-enhanced.cjs'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
      });

      this.mcpProcess.stdout.on('data', (data) => {
        this.handleMCPResponse(data.toString());
      });

      this.mcpProcess.stderr.on('data', (data) => {
        console.error('MCP Server error:', data.toString());
      });

      this.mcpProcess.on('close', (code) => {
        console.log(`MCP Server process exited with code ${code}`);
        this.isConnected = false;
      });

      // Initialize MCP connection
      await this.sendMCPRequest('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        clientInfo: { name: 'http-wrapper', version: '1.0.0' }
      });

      this.isConnected = true;
      console.log('✅ Connected to MCP Server');
      return true;
    } catch (error) {
      console.error('❌ Failed to connect to MCP:', error);
      return false;
    }
  }

  async sendMCPRequest(method, params = {}) {
    if (!this.isConnected && method !== 'initialize') {
      await this.connectToMCP();
    }

    const id = ++this.requestId;
    const request = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      
      const requestJson = JSON.stringify(request) + '\n';
      this.mcpProcess.stdin.write(requestJson);

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  }

  handleMCPResponse(data) {
    const lines = data.trim().split('\n');
    
    for (const line of lines) {
      if (!line.trim()) continue;
      
      try {
        const response = JSON.parse(line);
        
        if (response.id && this.pendingRequests.has(response.id)) {
          const { resolve, reject } = this.pendingRequests.get(response.id);
          this.pendingRequests.delete(response.id);
          
          if (response.error) {
            reject(new Error(response.error.message || 'MCP Server error'));
          } else {
            resolve(response.result);
          }
        }
      } catch (error) {
        console.error('Failed to parse MCP response:', error, line);
      }
    }
  }

  async callMCPTool(toolName, args) {
    return this.sendMCPRequest('tools/call', {
      name: toolName,
      arguments: args
    });
  }

  async start(port = 3001) {
    // Connect to MCP first
    await this.connectToMCP();

    this.app.listen(port, () => {
      console.log(`🌐 MCP HTTP Server running on http://localhost:${port}`);
      console.log(`📡 MCP Connection: ${this.isConnected ? 'Connected' : 'Disconnected'}`);
    });
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  const server = new MCPHttpServer();
  server.start().catch(console.error);
}

module.exports = MCPHttpServer;
