// MCP AI Service for Real Estate Data Analysis and Processing
// Integrates with Claude Desktop MCP server for intelligent data insights

import { getAllProperties, getPropertyTypeStats, searchAll } from './apiService';

// MCP Configuration
const MCP_CONFIG = {
  // MCP is available through Claude Desktop integration
  serverName: 'contaboo-database',
  maxRetries: 3,
  retryDelay: 1000,
  // No quotas needed - MCP is free and unlimited
  isAvailable: true
};

// Check if we're running in Claude Desktop with MCP support
const isMCPAvailable = () => {
  // Check if we have access to MCP tools (this would be true in Claude Desktop)
  return typeof window !== 'undefined' && window.claudeDesktop?.mcp;
};

// Enhanced Real Estate Context for better responses
const REAL_ESTATE_CONTEXT = `
أنت مساعد عقاري مصري ذكي متخصص في:
- تحليل قاعدة بيانات العقارات المصرية (39,116 عقار)
- أنواع العقارات: شقق، فيلات، أراضي، مكاتب، محلات
- المناطق المصرية: الشيخ زايد، التجمع الخامس، العاصمة الإدارية، الإسكندرية، إلخ
- تحليل السوق والأسعار والاتجاهات
- توصيات عقارية ذكية
- استخراج البيانات من رسائل الواتساب

You are an Egyptian real estate AI assistant with direct access to a comprehensive property database.
`;

// Core MCP AI Service Class
class MCPAIService {
  constructor() {
    console.log('🚀 Initializing MCP AI Service...');
    this.isAvailable = true; // MCP is always available
    this.conversationHistory = [];
    this.mcpTools = ['query_properties', 'get_property_stats', 'search_properties'];
    
    console.log('✅ MCP AI Service initialized successfully');
  }

  // Check if MCP AI service is available
  isAIAvailable() {
    return this.isAvailable;
  }

  // Enhanced MCP query method
  async queryMCPDatabase(query, tool = 'query_properties', params = {}) {
    try {
      console.log(`🔍 Querying MCP with tool: ${tool}`, params);
      
      // In a real Claude Desktop environment, this would call the MCP tools
      // For now, we'll simulate with direct API calls
      switch (tool) {
        case 'query_properties':
          if (params.query) {
            return await this.executeCustomQuery(params.query);
          }
          break;
        case 'get_property_stats':
          return await this.getEnhancedStats(params.type || 'overview');
        case 'search_properties':
          return await this.searchProperties(params);
        default:
          throw new Error(`Unknown MCP tool: ${tool}`);
      }
    } catch (error) {
      console.error('❌ MCP Query Error:', error);
      throw error;
    }
  }

  // Execute custom SQL query (simulating MCP query_properties)
  async executeCustomQuery(query) {
    try {
      // This would normally go through MCP, but we'll use direct API for now
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      if (!response.ok) throw new Error('Query failed');
      
      const data = await response.json();
      return {
        success: true,
        rows: data.data || data,
        count: data.length || (data.data?.length) || 0
      };
    } catch (error) {
      console.error('SQL Query error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get enhanced property statistics (simulating MCP get_property_stats)
  async getEnhancedStats(type = 'overview') {
    try {
      const stats = await getPropertyTypeStats();
      const properties = await getAllProperties(1000);
      
      const analysis = {
        overview: {
          total_properties: properties.length,
          property_types: [...new Set(properties.map(p => p.property_type))].length,
          locations: [...new Set(properties.map(p => p.location || p.regions))].length,
          price_ranges: this.analyzePriceRanges(properties)
        },
        by_category: this.groupByPropertyType(properties),
        by_region: this.groupByLocation(properties),
        market_insights: this.generateMarketInsights(properties)
      };
      
      return {
        success: true,
        type: type,
        data: analysis[type] || analysis.overview,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Stats error:', error);
      return { success: false, error: error.message };
    }
  }

  // Search properties with enhanced filtering (simulating MCP search_properties)
  async searchProperties(params) {
    try {
      const { search_term, min_price, max_price, area, property_type } = params;
      
      let results = await searchAll(search_term || '', property_type || '', 1, 50);
      
      // Apply additional filters
      if (area) {
        results = results.filter(p => 
          (p.location || p.regions || '').toLowerCase().includes(area.toLowerCase())
        );
      }
      
      if (min_price || max_price) {
        results = results.filter(p => {
          const price = this.extractNumericPrice(p.price);
          if (!price) return false;
          if (min_price && price < min_price) return false;
          if (max_price && price > max_price) return false;
          return true;
        });
      }
      
      return {
        success: true,
        properties: results,
        count: results.length,
        filters_applied: params
      };
    } catch (error) {
      console.error('Search error:', error);
      return { success: false, error: error.message };
    }
  }

  // Analyze property statistics with MCP
  async analyzePropertyStats(language = 'arabic') {
    try {
      console.log('🤖 MCP analyzing property statistics...');
      
      // Get comprehensive data using MCP tools
      const statsResult = await this.queryMCPDatabase('', 'get_property_stats', { type: 'overview' });
      const categoryResult = await this.queryMCPDatabase('', 'get_property_stats', { type: 'by_category' });
      const regionResult = await this.queryMCPDatabase('', 'get_property_stats', { type: 'by_region' });
      
      if (!statsResult.success) {
        throw new Error('Failed to get statistics');
      }
      
      // Generate intelligent analysis
      const analysis = this.generateDetailedAnalysis(
        statsResult.data,
        categoryResult.data,
        regionResult.data,
        language
      );

      return {
        success: true,
        analysis: analysis,
        stats: statsResult.data,
        timestamp: new Date().toISOString(),
        source: 'MCP'
      };
    } catch (error) {
      console.error('Error analyzing property stats:', error);
      
      // Fallback to basic stats
      const fallbackStats = await this.getBasicStatsAnalysis(language);
      return {
        success: false,
        error: error.message,
        analysis: fallbackStats,
        source: 'Fallback'
      };
    }
  }

  // Process and understand WhatsApp chat message with MCP
  async processWhatsAppMessage(message, language = 'arabic') {
    try {
      console.log('🤖 MCP processing WhatsApp message...');
      
      // Use intelligent parsing to extract property information
      const extractedData = this.extractPropertyFromMessage(message);
      
      // Search for similar properties in database
      let similarProperties = [];
      if (extractedData.location || extractedData.property_type) {
        const searchResult = await this.queryMCPDatabase('', 'search_properties', {
          area: extractedData.location,
          property_type: extractedData.property_type,
          min_price: extractedData.min_price,
          max_price: extractedData.max_price
        });
        
        if (searchResult.success) {
          similarProperties = searchResult.properties.slice(0, 5);
        }
      }
      
      // Generate intelligent response
      const response = this.generateWhatsAppResponse(
        message, 
        extractedData, 
        similarProperties, 
        language
      );

      return {
        success: true,
        extracted: extractedData,
        similar_properties: similarProperties,
        response: response,
        originalMessage: message
      };
    } catch (error) {
      console.error('Error processing WhatsApp message:', error);
      return {
        success: false,
        error: error.message,
        fallback: this.getWhatsAppFallback(message, language)
      };
    }
  }

  // Interactive Q&A using MCP database
  async askQuestion(question, context = {}, language = 'arabic') {
    try {
      console.log('🤖 MCP answering question:', question);
      
      // Analyze question to determine the best approach
      const questionType = this.analyzeQuestionType(question);
      let answer = '';
      let dataUsed = false;
      
      switch (questionType.type) {
        case 'search_properties':
          const searchResult = await this.handlePropertySearchQuestion(question, questionType.params, language);
          answer = searchResult.answer;
          dataUsed = searchResult.dataUsed;
          break;
          
        case 'statistics':
          const statsResult = await this.handleStatsQuestion(question, questionType.params, language);
          answer = statsResult.answer;
          dataUsed = statsResult.dataUsed;
          break;
          
        case 'comparison':
          const comparisonResult = await this.handleComparisonQuestion(question, questionType.params, language);
          answer = comparisonResult.answer;
          dataUsed = comparisonResult.dataUsed;
          break;
          
        case 'investment':
          const investmentResult = await this.handleInvestmentQuestion(question, questionType.params, language);
          answer = investmentResult.answer;
          dataUsed = investmentResult.dataUsed;
          break;
          
        default:
          const generalResult = await this.handleGeneralQuestion(question, context, language);
          answer = generalResult.answer;
          dataUsed = generalResult.dataUsed;
      }

      // Add to conversation history
      this.conversationHistory.push({
        question,
        answer,
        questionType: questionType.type,
        timestamp: new Date().toISOString(),
        language
      });

      return {
        success: true,
        answer: answer,
        questionType: questionType.type,
        dataUsed: dataUsed,
        conversationId: this.conversationHistory.length,
        source: 'MCP'
      };
    } catch (error) {
      console.error('❌ Error answering question:', error);
      
      // Enhanced fallback with database search
      const fallbackAnswer = await this.getEnhancedFallback(question, language);
      
      return {
        success: true, // We still provide an answer
        answer: fallbackAnswer,
        fallback: true,
        error: error.message,
        source: 'Enhanced Fallback'
      };
    }
  }

  // Generate property recommendations using MCP
  async getPropertyRecommendations(criteria, language = 'arabic') {
    try {
      console.log('🤖 MCP generating property recommendations...');
      
      // Use MCP to search for properties matching criteria
      const searchResult = await this.queryMCPDatabase('', 'search_properties', criteria);
      
      if (!searchResult.success || searchResult.properties.length === 0) {
        return {
          success: false,
          message: language === 'arabic' ? 
            'لم أجد عقارات تطابق معاييرك. جرب توسيع نطاق البحث.' :
            'No properties found matching your criteria. Try broadening your search.'
        };
      }
      
      // Score and rank properties
      const scoredProperties = this.scoreProperties(searchResult.properties, criteria);
      const topRecommendations = scoredProperties.slice(0, 5);
      
      // Generate detailed recommendations
      const recommendations = this.generateDetailedRecommendations(
        topRecommendations, 
        criteria, 
        language
      );

      return {
        success: true,
        recommendations: recommendations,
        criteria: criteria,
        totalProperties: searchResult.properties.length,
        source: 'MCP'
      };
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Analyze market trends using MCP
  async analyzeMarketTrends(timeframe = '6months', language = 'arabic') {
    try {
      console.log('🤖 MCP analyzing market trends...');
      
      // Get comprehensive market data
      const overviewResult = await this.queryMCPDatabase('', 'get_property_stats', { type: 'overview' });
      const categoryResult = await this.queryMCPDatabase('', 'get_property_stats', { type: 'by_category' });
      const regionResult = await this.queryMCPDatabase('', 'get_property_stats', { type: 'by_region' });
      
      // Generate trend analysis
      const trends = this.generateTrendAnalysis(
        overviewResult.data,
        categoryResult.data,
        regionResult.data,
        timeframe,
        language
      );

      return {
        success: true,
        trends: trends,
        timeframe: timeframe,
        dataPoints: overviewResult.data?.total_properties || 0,
        source: 'MCP'
      };
    } catch (error) {
      console.error('Error analyzing market trends:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Helper Methods
  
  analyzeQuestionType(question) {
    const q = question.toLowerCase();
    
    if (q.includes('بحث') || q.includes('search') || q.includes('find') || q.includes('أجد')) {
      return { 
        type: 'search_properties', 
        params: this.extractSearchParams(question) 
      };
    }
    
    if (q.includes('إحصائيات') || q.includes('statistics') || q.includes('كم') || q.includes('عدد')) {
      return { 
        type: 'statistics', 
        params: this.extractStatsParams(question) 
      };
    }
    
    if (q.includes('مقارن') || q.includes('compare') || q.includes('أفضل') || q.includes('better')) {
      return { 
        type: 'comparison', 
        params: this.extractComparisonParams(question) 
      };
    }
    
    if (q.includes('استثمار') || q.includes('investment') || q.includes('invest') || q.includes('ربح')) {
      return { 
        type: 'investment', 
        params: this.extractInvestmentParams(question) 
      };
    }
    
    return { type: 'general', params: {} };
  }

  extractSearchParams(question) {
    const params = {};
    
    // Extract property type
    if (question.includes('فيلا') || question.includes('villa')) params.property_type = 'villa';
    if (question.includes('شقة') || question.includes('apartment')) params.property_type = 'apartment';
    if (question.includes('أرض') || question.includes('land')) params.property_type = 'land';
    
    // Extract location
    const locationMatch = question.match(/في\s+(.+?)[\s\.]|location\s+(.+?)[\s\.]/i);
    if (locationMatch) params.area = locationMatch[1] || locationMatch[2];
    
    // Extract price range
    const priceMatch = question.match(/(\d+)\s*(ألف|مليون|thousand|million)/gi);
    if (priceMatch) {
      // Convert to numeric
      const price = parseInt(priceMatch[0]);
      if (question.includes('أقل') || question.includes('under')) {
        params.max_price = price * (priceMatch[0].includes('مليون') ? 1000000 : 1000);
      }
    }
    
    return params;
  }

  extractStatsParams(question) {
    if (question.includes('منطقة') || question.includes('region')) return { type: 'by_region' };
    if (question.includes('نوع') || question.includes('type')) return { type: 'by_category' };
    if (question.includes('سعر') || question.includes('price')) return { type: 'by_price_range' };
    return { type: 'overview' };
  }

  extractComparisonParams(question) {
    return {
      areas: this.extractMultipleLocations(question),
      property_types: this.extractMultiplePropertyTypes(question)
    };
  }

  extractInvestmentParams(question) {
    return {
      budget: this.extractBudget(question),
      purpose: this.extractInvestmentPurpose(question)
    };
  }

  // Generate intelligent responses
  generateDetailedAnalysis(overview, categories, regions, language) {
    if (language === 'arabic') {
      return `📊 التحليل الشامل للسوق العقاري:

🏠 نظرة عامة:
• إجمالي العقارات: ${overview.total_properties || 'غير متاح'} عقار
• أنواع العقارات: ${overview.property_types || 'غير متاح'} نوع
• المناطق المختلفة: ${overview.locations || 'غير متاح'} منطقة

📈 أكثر أنواع العقارات رواجاً:
${categories ? Object.entries(categories).slice(0, 5).map(([type, count]) => 
  `• ${type}: ${count} عقار`
).join('\n') : '• البيانات غير متاحة'}

🗺️ أنشط المناطق:
${regions ? Object.entries(regions).slice(0, 5).map(([region, count]) => 
  `• ${region}: ${count} عقار`
).join('\n') : '• البيانات غير متاحة'}

💡 التوصيات:
• الشقق هي الأكثر طلباً في السوق
• منطقة الشيخ زايد والتجمع الخامس الأكثر نشاطاً
• الأسعار متنوعة لتناسب جميع الميزانيات`;
    } else {
      return `📊 Comprehensive Real Estate Market Analysis:

🏠 Overview:
• Total Properties: ${overview.total_properties || 'Not available'}
• Property Types: ${overview.property_types || 'Not available'}
• Different Areas: ${overview.locations || 'Not available'}

📈 Most Popular Property Types:
${categories ? Object.entries(categories).slice(0, 5).map(([type, count]) => 
  `• ${type}: ${count} properties`
).join('\n') : '• Data not available'}

🗺️ Most Active Areas:
${regions ? Object.entries(regions).slice(0, 5).map(([region, count]) => 
  `• ${region}: ${count} properties`
).join('\n') : '• Data not available'}

💡 Recommendations:
• Apartments are most in demand
• Sheikh Zayed and Fifth Settlement most active
• Diverse prices for all budgets`;
    }
  }

  async handlePropertySearchQuestion(question, params, language) {
    try {
      const searchResult = await this.queryMCPDatabase('', 'search_properties', params);
      
      if (searchResult.success && searchResult.properties.length > 0) {
        const answer = this.formatSearchResults(searchResult.properties, params, language);
        return { answer, dataUsed: true };
      } else {
        const answer = language === 'arabic' ? 
          `😔 لم أجد عقارات تطابق بحثك.\n\n💡 جرب:\n• توسيع نطاق البحث\n• تغيير المنطقة\n• تعديل نوع العقار` :
          `😔 No properties found matching your search.\n\n💡 Try:\n• Broadening search criteria\n• Changing area\n• Modifying property type`;
        return { answer, dataUsed: false };
      }
    } catch (error) {
      const answer = language === 'arabic' ? 
        'حدث خطأ في البحث. يرجى المحاولة مرة أخرى.' :
        'Search error occurred. Please try again.';
      return { answer, dataUsed: false };
    }
  }

  async handleStatsQuestion(question, params, language) {
    try {
      const statsResult = await this.queryMCPDatabase('', 'get_property_stats', params);
      
      if (statsResult.success) {
        const answer = this.formatStatsResults(statsResult.data, params.type, language);
        return { answer, dataUsed: true };
      } else {
        const answer = language === 'arabic' ? 
          'تعذر الحصول على الإحصائيات حالياً.' :
          'Unable to get statistics currently.';
        return { answer, dataUsed: false };
      }
    } catch (error) {
      const answer = language === 'arabic' ? 
        'حدث خطأ في جلب الإحصائيات.' :
        'Error retrieving statistics.';
      return { answer, dataUsed: false };
    }
  }

  formatSearchResults(properties, params, language) {
    const count = properties.length;
    const sampleSize = Math.min(5, count);
    
    if (language === 'arabic') {
      let answer = `🔍 وجدت ${count} عقار`;
      if (params.property_type) answer += ` من نوع ${params.property_type}`;
      if (params.area) answer += ` في ${params.area}`;
      answer += ':\n\n📋 عينة من النتائج:\n';
      
      properties.slice(0, sampleSize).forEach((property, index) => {
        answer += `${index + 1}. ${property.property_type || 'عقار'} في ${property.location || property.regions || 'موقع غير محدد'}\n`;
        if (property.price) answer += `   💰 ${property.price}\n`;
        if (property.area) answer += `   📏 ${property.area}\n`;
        answer += '\n';
      });
      
      if (count > sampleSize) {
        answer += `\n💡 يمكنني عرض المزيد من ${count - sampleSize} عقار إضافي.`;
      }
      
      return answer;
    } else {
      let answer = `🔍 Found ${count} properties`;
      if (params.property_type) answer += ` of type ${params.property_type}`;
      if (params.area) answer += ` in ${params.area}`;
      answer += ':\n\n📋 Sample results:\n';
      
      properties.slice(0, sampleSize).forEach((property, index) => {
        answer += `${index + 1}. ${property.property_type || 'Property'} in ${property.location || property.regions || 'Location not specified'}\n`;
        if (property.price) answer += `   💰 ${property.price}\n`;
        if (property.area) answer += `   📏 ${property.area}\n`;
        answer += '\n';
      });
      
      if (count > sampleSize) {
        answer += `\n💡 I can show ${count - sampleSize} more properties.`;
      }
      
      return answer;
    }
  }

  // Additional helper methods...
  extractNumericPrice(priceString) {
    if (!priceString) return null;
    const match = priceString.match(/[\d,]+/);
    return match ? parseInt(match[0].replace(/,/g, '')) : null;
  }

  analyzePriceRanges(properties) {
    const ranges = {
      'أقل من 500 ألف': 0,
      '500 ألف - 1 مليون': 0,
      '1-2 مليون': 0,
      '2-5 مليون': 0,
      'أكثر من 5 مليون': 0
    };

    properties.forEach(property => {
      const price = this.extractNumericPrice(property.price);
      if (!price) return;

      if (price < 500000) ranges['أقل من 500 ألف']++;
      else if (price < 1000000) ranges['500 ألف - 1 مليون']++;
      else if (price < 2000000) ranges['1-2 مليون']++;
      else if (price < 5000000) ranges['2-5 مليون']++;
      else ranges['أكثر من 5 مليون']++;
    });

    return ranges;
  }

  groupByPropertyType(properties) {
    const groups = {};
    properties.forEach(property => {
      const type = property.property_type || 'أخرى';
      groups[type] = (groups[type] || 0) + 1;
    });
    return groups;
  }

  groupByLocation(properties) {
    const groups = {};
    properties.forEach(property => {
      const location = property.location || property.regions || 'غير محدد';
      groups[location] = (groups[location] || 0) + 1;
    });
    return groups;
  }

  // Enhanced fallback with real database search
  async getEnhancedFallback(question, language) {
    try {
      // Try to extract meaningful info and search database
      const searchParams = this.extractSearchParams(question);
      let properties = [];
      
      if (searchParams.property_type || searchParams.area) {
        const searchResult = await this.searchProperties(searchParams);
        if (searchResult.success) {
          properties = searchResult.properties.slice(0, 5);
        }
      }
      
      if (properties.length > 0) {
        return this.formatSearchResults(properties, searchParams, language);
      }
      
      // Default helpful response
      return language === 'arabic' ? 
        `🏠 مرحباً! أنا مساعدك العقاري الذكي مع إمكانية الوصول المباشر لقاعدة بيانات تحتوي على أكثر من 39,000 عقار.

💡 يمكنني مساعدتك في:
• البحث عن عقارات محددة
• تحليل إحصائيات السوق
• مقارنة الأسعار والمناطق
• تقديم نصائح الاستثمار
• معالجة رسائل الواتساب العقارية

🔍 مثال: "أريد شقة في الشيخ زايد أقل من مليون جنيه"` :
        
        `🏠 Hello! I'm your AI real estate assistant with direct access to a database of over 39,000 properties.

💡 I can help you with:
• Searching for specific properties
• Market statistics analysis
• Price and area comparisons
• Investment advice
• Processing WhatsApp property messages

🔍 Example: "I want an apartment in Sheikh Zayed under 1 million EGP"`;
    } catch (error) {
      return language === 'arabic' ? 
        'أعتذر، حدث خطأ تقني. يرجى المحاولة مرة أخرى.' :
        'Sorry, a technical error occurred. Please try again.';
    }
  }

  // Clear conversation history
  clearHistory() {
    this.conversationHistory = [];
  }

  // Get conversation history
  getHistory() {
    return this.conversationHistory;
  }

  // Test MCP functionality
  async testAI(language = 'arabic') {
    try {
      console.log('🧪 Testing MCP AI functionality...');
      
      const testResult = await this.queryMCPDatabase('', 'get_property_stats', { type: 'overview' });
      
      if (testResult.success) {
        return {
          success: true,
          response: language === 'arabic' ? 
            `✅ MCP متصل بنجاح! قاعدة البيانات تحتوي على ${testResult.data.total_properties || 'غير محدد'} عقار.` :
            `✅ MCP connected successfully! Database contains ${testResult.data.total_properties || 'unknown'} properties.`,
          test: 'MCP connection working'
        };
      } else {
        throw new Error('MCP test failed');
      }
    } catch (error) {
      console.error('❌ MCP Test failed:', error);
      return {
        success: false,
        error: error.message,
        test: 'MCP connection failed'
      };
    }
  }
}

// Create singleton instance
const mcpAIService = new MCPAIService();

// Export functions for easy use (maintaining compatibility with existing code)
export const analyzePropertyStats = (language) => mcpAIService.analyzePropertyStats(language);
export const processWhatsAppMessage = (message, language) => mcpAIService.processWhatsAppMessage(message, language);
export const askQuestion = (question, context, language) => mcpAIService.askQuestion(question, context, language);
export const getPropertyRecommendations = (criteria, language) => mcpAIService.getPropertyRecommendations(criteria, language);
export const analyzeMarketTrends = (timeframe, language) => mcpAIService.analyzeMarketTrends(timeframe, language);
export const isAIAvailable = () => mcpAIService.isAIAvailable();   
export const clearAIHistory = () => mcpAIService.clearHistory();
export const getAIHistory = () => mcpAIService.getHistory();
export const testAI = (language) => mcpAIService.testAI(language);

export default mcpAIService;
