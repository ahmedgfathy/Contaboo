// MCP Client for Browser - Connects to MCP Server via HTTP API
class MCPClient {
  constructor() {
    this.isConnected = false;
    this.apiUrl = 'http://localhost:3002'; // MCP server HTTP endpoint
  }

  async connect() {
    try {
      // Test connection to MCP server
      const response = await fetch(`${this.apiUrl}/health`);
      if (response.ok) {
        this.isConnected = true;
        console.log('✅ Connected to MCP Server');
        return true;
      }
    } catch (error) {
      console.error('Failed to connect to MCP server:', error);
      this.isConnected = false;
    }
    return false;
  }

  async callTool(name, arguments_) {
    if (!this.isConnected) {
      await this.connect();
    }

    if (!this.isConnected) {
      throw new Error('MCP Server not connected');
    }

    try {
      const response = await fetch(`${this.apiUrl}/tools/${name}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ arguments: arguments_ })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`MCP tool call failed: ${name}`, error);
      throw error;
    }
  }

  // AI Property Search
  async aiPropertySearch(query, language = 'arabic', maxResults = 20) {
    return this.callTool('ai_property_search', {
      query,
      language,
      max_results: maxResults
    });
  }

  // AI Property Recommendations
  async aiPropertyRecommendations(criteria) {
    return this.callTool('ai_property_recommendations', {
      ...criteria,
      language: criteria.language || 'arabic'
    });
  }

  // AI Market Analysis
  async aiMarketAnalysis(options = {}) {
    return this.callTool('ai_market_analysis', {
      analysis_type: options.analysisType || 'overview',
      area: options.area,
      property_type: options.propertyType,
      language: options.language || 'arabic'
    });
  }

  // Direct SQL Query
  async queryProperties(sqlQuery) {
    return this.callTool('query_properties', {
      query: sqlQuery
    });
  }

  // Generic analysis method
  async analyzeData(data, analysisType = 'general') {
    try {
      // Use appropriate MCP tool based on analysis type
      switch (analysisType) {
        case 'market':
          return this.aiMarketAnalysis({ analysisType: 'trends' });
        case 'recommendations':
          return this.aiPropertyRecommendations(data);
        case 'search':
          return this.aiPropertySearch(data.query || data.searchTerm);
        default:
          // General property search
          return this.aiPropertySearch(JSON.stringify(data));
      }
    } catch (error) {
      console.error('MCP analysis failed:', error);
      return {
        success: false,
        error: error.message,
        fallback: 'MCP analysis temporarily unavailable'
      };
    }
  }

  // Generate insights
  async generateInsights(properties, context = '') {
    try {
      const query = `تحليل العقارات: ${context}\n${JSON.stringify(properties, null, 2)}`;
      return this.aiPropertySearch(query);
    } catch (error) {
      console.error('MCP insights generation failed:', error);
      return {
        success: false,
        insights: ['تحليل البيانات غير متاح حالياً'],
        error: error.message
      };
    }
  }

  // Chat with AI about properties
  async chatWithAI(message, context = {}) {
    try {
      const query = `${message}\nالسياق: ${JSON.stringify(context)}`;
      return this.aiPropertySearch(query);
    } catch (error) {
      console.error('MCP chat failed:', error);
      return {
        success: false,
        response: 'عذراً، الذكي الاصطناعي غير متاح حالياً',
        error: error.message
      };
    }
  }

  // Get recommendations based on criteria
  async getRecommendations(criteria) {
    try {
      return this.aiPropertyRecommendations({
        budget: criteria.budget,
        area: criteria.area,
        property_type: criteria.propertyType,
        purpose: criteria.purpose || 'buy',
        language: 'arabic'
      });
    } catch (error) {
      console.error('MCP recommendations failed:', error);
      return {
        success: false,
        recommendations: [],
        error: error.message
      };
    }
  }

  // Analyze market trends
  async getMarketTrends(area = null, propertyType = null) {
    try {
      return this.aiMarketAnalysis({
        analysisType: 'trends',
        area,
        propertyType,
        language: 'arabic'
      });
    } catch (error) {
      console.error('MCP market trends failed:', error);
      return {
        success: false,
        trends: [],
        error: error.message
      };
    }
  }

  // Check if connected
  isConnectionActive() {
    return this.isConnected;
  }

  // Disconnect (cleanup)
  disconnect() {
    this.isConnected = false;
    console.log('🔌 Disconnected from MCP Server');
  }
}

// Create singleton instance
const mcpClient = new MCPClient();

export default mcpClient;
export { MCPClient };
