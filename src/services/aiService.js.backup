// AI Service for Real Estate Data Analysis and Processing
// Integrates with OpenAI GPT API for intelligent data insights

import { getAllProperties, getPropertyTypeStats, searchAll } from './apiService';

// Configuration
const AI_CONFIG = {
  // You'll need to set your OpenAI API key in environment variables
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  model: 'gpt-3.5-turbo', // Using cheaper model to conserve quota
  baseUrl: 'https://api.openai.com/v1/chat/completions',
  maxTokens: 300, // Further reduced to save more quota
  temperature: 0.1, // Lower temperature for more consistent, shorter responses
  // Quota management
  maxDailyRequests: 50, // Limit daily requests
  requestCounter: 0,
  lastResetDate: new Date().toDateString()
};

// Arabic Real Estate Context for AI (Simplified to save tokens)
const REAL_ESTATE_CONTEXT = `
أنت مساعد عقاري مصري ذكي. تخصصك:
- أنواع العقارات: شقق، فيلات، أراضي
- المناطق: الشيخ زايد، التجمع الخامس، العاصمة الإدارية
- تحليل السوق والأسعار
- توصيات عقارية

You are an Egyptian real estate AI assistant specialized in property analysis, recommendations, and market insights.
`;

// Core AI Service Class
class AIService {
  constructor() {
    console.log('🤖 Initializing AI Service...');
    console.log('🔑 API Key from env:', import.meta.env.VITE_OPENAI_API_KEY ? 'Present' : 'Missing');
    console.log('🔑 AI_CONFIG.apiKey:', AI_CONFIG.apiKey ? 'Present' : 'Missing');
    
    this.isAvailable = !!AI_CONFIG.apiKey;
    this.conversationHistory = [];
    
    console.log('✅ AI Service availability:', this.isAvailable);
  }

  // Check if AI service is available
  isAIAvailable() {
    return this.isAvailable && this.checkQuotaLimit();
  }

  // Check daily quota limit
  checkQuotaLimit() {
    const today = new Date().toDateString();
    
    // Reset counter if it's a new day
    if (AI_CONFIG.lastResetDate !== today) {
      AI_CONFIG.requestCounter = 0;
      AI_CONFIG.lastResetDate = today;
    }
    
    return AI_CONFIG.requestCounter < AI_CONFIG.maxDailyRequests;
  }

  // Increment request counter
  incrementRequestCounter() {
    AI_CONFIG.requestCounter++;
    console.log(`📊 API Requests today: ${AI_CONFIG.requestCounter}/${AI_CONFIG.maxDailyRequests}`);
  }

  // Make AI API call
  async makeAICall(messages, options = {}) {
    if (!this.isAvailable) {
      console.error('❌ AI service not available. API key:', AI_CONFIG.apiKey ? 'Present' : 'Missing');
      throw new Error('AI service not available. Please configure OpenAI API key.');
    }

    // Check quota limit
    if (!this.checkQuotaLimit()) {
      console.error('❌ Daily quota limit reached');
      throw new Error('تم تجاوز الحد اليومي للاستخدام. يرجى المحاولة غداً.');
    }

    console.log('🤖 Making AI API call with messages:', messages.length);
    console.log('🔑 API Key available:', !!AI_CONFIG.apiKey);
    console.log('🌐 API URL:', AI_CONFIG.baseUrl);
    console.log('🤖 Model:', AI_CONFIG.model);
    console.log('📊 Quota usage:', `${AI_CONFIG.requestCounter}/${AI_CONFIG.maxDailyRequests}`);

    try {
      // Increment counter before making request
      this.incrementRequestCounter();

      const requestBody = {
        model: AI_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: REAL_ESTATE_CONTEXT
          },
          ...messages
        ],
        max_tokens: options.maxTokens || AI_CONFIG.maxTokens,
        temperature: options.temperature || AI_CONFIG.temperature,
        stream: false
      };

      console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(AI_CONFIG.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_CONFIG.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        
        // Handle specific OpenAI errors
        if (response.status === 429) {
          const error = JSON.parse(errorText);
          if (error.error?.code === 'insufficient_quota') {
            throw new Error('تم تجاوز حد الاستخدام المسموح. يرجى فحص فاتورة OpenAI أو استخدام مفتاح API جديد.');
          }
        }
        
        throw new Error(`AI API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ AI Response data:', data);
      
      const content = data.choices[0]?.message?.content;
      if (!content) {
        console.error('❌ No content in AI response:', data);
        throw new Error('No response content generated');
      }

      return content;
    } catch (error) {
      console.error('❌ AI Service Error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        apiKey: AI_CONFIG.apiKey ? 'Present' : 'Missing'
      });
      throw error;
    }
  }

  // Analyze property statistics with AI
  async analyzePropertyStats(language = 'arabic') {
    try {
      console.log('🤖 AI analyzing property statistics...');
      
      // Get current statistics
      const stats = await getPropertyTypeStats();
      const properties = await getAllProperties(100); // Sample for analysis

      const prompt = language === 'arabic' ? 
        `تحليل إحصائيات العقارات التالية:
        ${JSON.stringify(stats, null, 2)}
        
        عينة من العقارات:
        ${properties.slice(0, 10).map(p => `${p.property_type} في ${p.location} - ${p.price}`).join('\n')}
        
        قدم تحليلاً شاملاً يشمل:
        1. نظرة عامة على السوق
        2. الاتجاهات والأنماط
        3. التوصيات للمستثمرين
        4. النصائح للمشترين
        5. توقعات السوق` :
        
        `Analyze the following property statistics:
        ${JSON.stringify(stats, null, 2)}
        
        Property sample:
        ${properties.slice(0, 10).map(p => `${p.property_type} in ${p.location} - ${p.price}`).join('\n')}
        
        Provide comprehensive analysis including:
        1. Market overview
        2. Trends and patterns  
        3. Investment recommendations
        4. Buyer advice
        5. Market predictions`;

      const response = await this.makeAICall([
        { role: 'user', content: prompt }
      ]);

      return {
        success: true,
        analysis: response,
        stats: stats,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error analyzing property stats:', error);
      return {
        success: false,
        error: error.message,
        fallback: language === 'arabic' ? 
          'تعذر تحليل الإحصائيات. يرجى المحاولة لاحقاً.' :
          'Unable to analyze statistics. Please try again later.'
      };
    }
  }

  // Process and understand WhatsApp chat message
  async processWhatsAppMessage(message, language = 'arabic') {
    try {
      const prompt = language === 'arabic' ?
        `حلل رسالة الواتساب العقارية التالية واستخرج المعلومات:
        "${message}"
        
        استخرج:
        1. نوع العقار (شقة/فيلا/أرض/مكتب/مخزن)
        2. الموقع
        3. السعر
        4. المساحة
        5. تفاصيل إضافية
        6. معلومات الاتصال
        
        أعد التفاصيل بصيغة JSON منظمة.` :
        
        `Analyze the following WhatsApp real estate message and extract information:
        "${message}"
        
        Extract:
        1. Property type (apartment/villa/land/office/warehouse)
        2. Location
        3. Price
        4. Area/size
        5. Additional details
        6. Contact information
        
        Return details in structured JSON format.`;

      const response = await this.makeAICall([
        { role: 'user', content: prompt }
      ]);

      return {
        success: true,
        extracted: response,
        originalMessage: message
      };
    } catch (error) {
      console.error('Error processing WhatsApp message:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Interactive Q&A about property data
  async askQuestion(question, context = {}, language = 'arabic') {
    try {
      console.log('🤖 AI answering question:', question);
      
      // Check if AI is available first
      if (!this.isAIAvailable()) {
        console.log('⚠️ AI not available, using database fallback immediately');
        const fallbackAnswer = await this.getFallbackResponse(question, language);
        
        return {
          success: true,
          answer: fallbackAnswer,
          fallback: true,
          fallbackMessage: language === 'arabic' ? 
            '⚠️ الذكاء الاصطناعي غير متاح حالياً. إليك إجابة مبنية على قاعدة البيانات:' :
            '⚠️ AI is currently unavailable. Here\'s a database-driven answer:'
        };
      }
      
      // Get relevant data based on question context (with error handling)
      let dataContext = '';
      
      try {
        if (question.toLowerCase().includes('statistics') || question.includes('إحصائيات')) {
          console.log('📊 Fetching property statistics...');
          const stats = await getPropertyTypeStats();
          dataContext += `Current statistics: ${JSON.stringify(stats)}`;
        }
        
        if (question.toLowerCase().includes('search') || question.includes('بحث')) {
          console.log('🔍 Performing search...');
          const searchResults = await searchAll(question, '', 1, 10);
          dataContext += `\nSearch results: ${JSON.stringify(searchResults.slice(0, 5))}`;
        }
      } catch (apiError) {
        console.warn('⚠️ API call failed, continuing with limited context:', apiError.message);
        dataContext = 'Limited data available due to API issues.';
      }

      // Add any additional context provided
      if (context.properties) {
        dataContext += `\nProperty data: ${JSON.stringify(context.properties.slice(0, 10))}`;
      }

      // If no data context, use a simple prompt
      if (!dataContext.trim()) {
        dataContext = 'No specific data context available. Please provide general real estate guidance.';
      }

      const prompt = language === 'arabic' ?
        `السؤال: ${question}
        
        البيانات المتاحة:
        ${dataContext}
        
        أجب بشكل مفصل ومفيد. إذا كان السؤال يتطلب إحصائيات، قدم أرقام دقيقة. إذا كان يتطلب نصائح، قدم توصيات عملية.` :
        
        `Question: ${question}
        
        Available data:
        ${dataContext}
        
        Answer in detail and helpfully. If the question requires statistics, provide accurate numbers. If it requires advice, give practical recommendations.`;

      console.log('📤 Sending prompt to AI:', prompt);

      const response = await this.makeAICall([
        { role: 'user', content: prompt }
      ]);

      // Add to conversation history
      this.conversationHistory.push({
        question,
        answer: response,
        timestamp: new Date().toISOString(),
        context: dataContext
      });

      return {
        success: true,
        answer: response,
        dataUsed: !!dataContext,
        conversationId: this.conversationHistory.length
      };
    } catch (error) {
      console.error('❌ Error answering question:', error);
      
      // Use fallback response instead of generic error
      const fallbackAnswer = await this.getFallbackResponse(question, language);
      
      return {
        success: false,
        error: error.message,
        answer: fallbackAnswer,
        fallback: true,
        fallbackMessage: language === 'arabic' ? 
          '⚠️ الذكاء الاصطناعي غير متاح حالياً. إليك إجابة مبنية على قاعدة البيانات:' :
          '⚠️ AI is currently unavailable. Here\'s a database-driven answer:'
      };
    }
  }

  // Generate property recommendations based on criteria
  async getPropertyRecommendations(criteria, language = 'arabic') {
    try {
      console.log('🤖 AI generating property recommendations...');
      
      // Get properties that might match
      const allProperties = await getAllProperties(500);
      
      const prompt = language === 'arabic' ?
        `بناءً على المعايير التالية:
        ${JSON.stringify(criteria)}
        
        ومن العقارات المتاحة:
        ${allProperties.slice(0, 20).map(p => 
          `${p.property_type} في ${p.location} - ${p.price} - ${p.area || 'غير محدد'}`
        ).join('\n')}
        
        قدم 5 توصيات للعقارات الأنسب مع شرح سبب التوصية لكل عقار.` :
        
        `Based on the following criteria:
        ${JSON.stringify(criteria)}
        
        From available properties:
        ${allProperties.slice(0, 20).map(p => 
          `${p.property_type} in ${p.location} - ${p.price} - ${p.area || 'Not specified'}`
        ).join('\n')}
        
        Provide 5 recommendations for the most suitable properties with explanation for each recommendation.`;

      const response = await this.makeAICall([
        { role: 'user', content: prompt }
      ]);

      return {
        success: true,
        recommendations: response,
        criteria: criteria,
        totalProperties: allProperties.length
      };
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Analyze market trends
  async analyzeMarketTrends(timeframe = '6months', language = 'arabic') {
    try {
      const properties = await getAllProperties(1000);
      const stats = await getPropertyTypeStats();
      
      const prompt = language === 'arabic' ?
        `حلل اتجاهات السوق العقاري المصري خلال ${timeframe} الماضية:
        
        الإحصائيات الحالية:
        ${JSON.stringify(stats)}
        
        عينة من العقارات (${properties.length} عقار):
        ${properties.slice(0, 30).map(p => `${p.property_type} - ${p.location} - ${p.price}`).join('\n')}
        
        قدم تحليلاً يشمل:
        1. الاتجاهات السعرية
        2. أكثر المناطق طلباً
        3. أنواع العقارات الأكثر رواجاً
        4. توقعات الفترة القادمة
        5. نصائح للاستثمار` :
        
        `Analyze Egyptian real estate market trends for the past ${timeframe}:
        
        Current statistics:
        ${JSON.stringify(stats)}
        
        Property sample (${properties.length} properties):
        ${properties.slice(0, 30).map(p => `${p.property_type} - ${p.location} - ${p.price}`).join('\n')}
        
        Provide analysis including:
        1. Price trends
        2. Most demanded areas
        3. Most popular property types
        4. Future predictions
        5. Investment advice`;

      const response = await this.makeAICall([
        { role: 'user', content: prompt }
      ]);

      return {
        success: true,
        trends: response,
        dataPoints: properties.length,
        timeframe: timeframe
      };
    } catch (error) {
      console.error('Error analyzing market trends:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Test AI functionality with simple question
  async testAI(language = 'arabic') {
    try {
      console.log('🧪 Testing AI functionality...');
      
      const testQuestion = language === 'arabic' ? 
        'مرحبا، هل يمكنك مساعدتي في العقارات؟' : 
        'Hello, can you help me with real estate?';

      const response = await this.makeAICall([
        { role: 'user', content: testQuestion }
      ]);

      return {
        success: true,
        response: response,
        test: 'AI connection working'
      };
    } catch (error) {
      console.error('❌ AI Test failed:', error);
      return {
        success: false,
        error: error.message,
        test: 'AI connection failed'
      };
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

  // Helper method to group properties by price range
  groupByPriceRange(properties) {
    const ranges = {
      'أقل من 500 ألف': 0,
      '500 ألف - 1 مليون': 0,
      '1-2 مليون': 0,
      '2-5 مليون': 0,
      'أكثر من 5 مليون': 0,
      'سعر غير محدد': 0
    };

    properties.forEach(property => {
      if (!property.price) {
        ranges['سعر غير محدد']++;
        return;
      }

      const priceMatch = property.price.match(/[\d,]+/);
      if (!priceMatch) {
        ranges['سعر غير محدد']++;
        return;
      }

      const price = parseInt(priceMatch[0].replace(/,/g, ''));
      if (price < 500000) {
        ranges['أقل من 500 ألف']++;
      } else if (price < 1000000) {
        ranges['500 ألف - 1 مليون']++;
      } else if (price < 2000000) {
        ranges['1-2 مليون']++;
      } else if (price < 5000000) {
        ranges['2-5 مليون']++;
      } else {
        ranges['أكثر من 5 مليون']++;
      }
    });

    // Filter out zero counts
    return Object.fromEntries(
      Object.entries(ranges).filter(([, count]) => count > 0)
    );
  }

  // Helper method to translate property types
  translatePropertyType(type, language = 'arabic') {
    const translations = {
      'villa': { arabic: 'فيلا', english: 'villa' },
      'apartment': { arabic: 'شقة', english: 'apartment' },
      'land': { arabic: 'أرض', english: 'land' },
      'office': { arabic: 'مكتب', english: 'office' },
      'shop': { arabic: 'محل', english: 'shop' },
      'فيلا': { arabic: 'فيلا', english: 'villa' },
      'شقة': { arabic: 'شقة', english: 'apartment' },
      'أرض': { arabic: 'أرض', english: 'land' },
      'مكتب': { arabic: 'مكتب', english: 'office' },
      'محل': { arabic: 'محل', english: 'shop' }
    };

    return translations[type]?.[language] || type;
  }

  // Format property type specific response with enhanced data
  formatPropertyTypeResponse(results, propertyType, language = 'arabic') {
    const count = results.length;
    const translatedType = this.translatePropertyType(propertyType, language);
    
    if (count === 0) {
      return language === 'arabic' ? 
        `😔 لم أجد ${translatedType} متاحة حالياً.\n\n💡 جرب البحث في مناطق أخرى أو أنواع عقارات مختلفة.` :
        `😔 No ${translatedType} found currently.\n\n💡 Try searching in other areas or different property types.`;
    }
    
    // Group by location
    const locationCount = {};
    results.forEach(property => {
      const location = property.location || property.regions || 'موقع غير محدد';
      locationCount[location] = (locationCount[location] || 0) + 1;
    });
    
    let response = '';
    
    if (language === 'arabic') {
      response = `🏠 يوجد ${count} ${translatedType} متاح:\n\n`;
      
      // Show top locations
      const topLocations = Object.entries(locationCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
      
      response += '📍 أهم المواقع:\n';
      topLocations.forEach(([location, count]) => {
        response += `• ${location}: ${count} ${translatedType}\n`;
      });
      
      // Price analysis
      const priceRanges = this.groupByPriceRange(results);
      if (Object.keys(priceRanges).length > 1) {
        response += '\n💰 توزيع الأسعار:\n';
        Object.entries(priceRanges).forEach(([range, count]) => {
          response += `• ${range}: ${count} عقار\n`;
        });
      }
      
      response += '\n📋 عينة من العقارات:\n';
      results.slice(0, 5).forEach((property, index) => {
        response += `${index + 1}. ${property.location || property.regions || 'موقع غير محدد'}: ${property.price || 'السعر غير محدد'}\n`;
        if (property.area) response += `   📏 المساحة: ${property.area}\n`;
        if (property.phone_number) response += `   📞 للتواصل: ${property.phone_number}\n`;
        response += '\n';
      });
      
      response += `💡 يمكنني البحث في منطقة محددة أو عرض المزيد من التفاصيل.`;
    } else {
      response = `🏠 There are ${count} ${translatedType} available:\n\n`;
      
      // Show top locations
      const topLocations = Object.entries(locationCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
      
      response += '📍 Top locations:\n';
      topLocations.forEach(([location, count]) => {
        response += `• ${location}: ${count} ${translatedType}\n`;
      });
      
      response += '\n📋 Sample properties:\n';
      results.slice(0, 5).forEach((property, index) => {
        response += `${index + 1}. ${property.location || property.regions || 'Location not specified'}: ${property.price || 'Price not specified'}\n`;
        if (property.area) response += `   📏 Area: ${property.area}\n`;
        if (property.phone_number) response += `   📞 Contact: ${property.phone_number}\n`;
        response += '\n';
      });
      
      response += `💡 I can search in a specific area or show more details.`;
    }
    
    return response;
  }

  // Fallback responses when AI is not available - with database integration
  async getFallbackResponse(question, language = 'arabic') {
    try {
      console.log('🔍 Getting fallback response with database search for:', question);
      
      // Try to search the actual database for relevant properties
      let databaseResults = [];
      let propertyTypeFilter = '';
      
      // Enhanced property type detection
      if (question.includes('فيلا') || question.includes('villa')) {
        propertyTypeFilter = 'villa';
      } else if (question.includes('شقة') || question.includes('شقق') || question.includes('apartment')) {
        propertyTypeFilter = 'apartment';
      } else if (question.includes('أرض') || question.includes('land')) {
        propertyTypeFilter = 'land';
      } else if (question.includes('مكتب') || question.includes('office')) {
        propertyTypeFilter = 'office';
      } else if (question.includes('محل') || question.includes('shop')) {
        propertyTypeFilter = 'shop';
      }
      
      // Extract area/location from question
      let locationQuery = '';
      const areaMatches = question.match(/الحي\s*(\d+)|منطقة\s*(.+?)\s|في\s*(.+?)\s|area\s*(\d+)/gi);
      if (areaMatches) {
        locationQuery = areaMatches[0];
        console.log('🏘️ Detected location query:', locationQuery);
      }
      
      try {
        // Search for properties based on the question
        console.log('🔍 Searching with params:', { question, propertyTypeFilter, locationQuery });
        const searchResults = await searchAll(locationQuery || question, propertyTypeFilter, 1, 20);
        databaseResults = searchResults || [];
        console.log('📊 Found database results:', databaseResults.length);
        
        // If no results with specific filters, try broader search
        if (databaseResults.length === 0 && (propertyTypeFilter || locationQuery)) {
          console.log('🔍 Trying broader search...');
          const broadResults = await searchAll(question, '', 1, 20);
          databaseResults = broadResults || [];
          console.log('📊 Broad search results:', databaseResults.length);
        }
      } catch (error) {
        console.warn('⚠️ Database search failed:', error.message);
      }

      // Also try to get statistics for context
      let stats = null;
      try {
        stats = await getPropertyTypeStats();
        console.log('📈 Got property stats:', stats);
      } catch (error) {
        console.warn('⚠️ Stats fetch failed:', error.message);
      }

      const responses = {
        arabic: {
          // Database-driven responses with enhanced formatting
          withData: (type, location, count, results) => {
            if (count > 0) {
              let response = `🏠 وجدت ${count} ${type} ${location ? `في ${location}` : 'متاح'}:\n\n`;
              
              // Group by price ranges for better insights
              const priceRanges = this.groupByPriceRange(results);
              if (Object.keys(priceRanges).length > 1) {
                response += '💰 توزيع الأسعار:\n';
                Object.entries(priceRanges).forEach(([range, count]) => {
                  response += `• ${range}: ${count} عقار\n`;
                });
                response += '\n';
              }
              
              // Show detailed property samples
              response += '📋 عينة من العقارات المتاحة:\n';
              results.slice(0, 5).forEach((property, index) => {
                response += `${index + 1}. ${property.property_type || type} في ${property.location || property.regions || 'موقع غير محدد'}\n`;
                if (property.price) response += `   💰 السعر: ${property.price}\n`;
                if (property.area) response += `   📏 المساحة: ${property.area}\n`;
                if (property.bedrooms) response += `   🛏️ غرف النوم: ${property.bedrooms}\n`;
                if (property.bathrooms) response += `   🚿 الحمامات: ${property.bathrooms}\n`;
                if (property.phone_number) response += `   📞 للتواصل: ${property.phone_number}\n`;
                response += '\n';
              });
              
              if (count > 5) {
                response += `📋 يمكنني عرض المزيد من التفاصيل حول ${count - 5} عقار إضافي. `;
              }
              
              response += '\n💡 استخدم البحث المتقدم في التطبيق لمزيد من الخيارات والفلترة.';
              return response;
            } else {
              return `😔 لم أجد ${type} ${location ? `في ${location}` : ''} حالياً.\n\n💡 اقتراحات:\n• جرب البحث في مناطق أخرى\n• ابحث عن أنواع عقارات مختلفة\n• تحقق من العقارات الجديدة قريباً`;
            }
          },
          
          // Area-specific responses with more details
          areaInfo: (area, count, results) => {
            if (count > 0) {
              // Analyze property types in the area
              const typeCount = {};
              const priceStats = { min: Infinity, max: 0, avg: 0, total: 0 };
              
              results.forEach(property => {
                const type = property.property_type || 'أخرى';
                typeCount[type] = (typeCount[type] || 0) + 1;
                
                // Extract numeric price for statistics
                const priceMatch = property.price?.match(/[\d,]+/);
                if (priceMatch) {
                  const price = parseInt(priceMatch[0].replace(/,/g, ''));
                  if (price > 0) {
                    priceStats.min = Math.min(priceStats.min, price);
                    priceStats.max = Math.max(priceStats.max, price);
                    priceStats.total += price;
                  }
                }
              });
              
              if (priceStats.total > 0) {
                priceStats.avg = Math.round(priceStats.total / results.filter(p => p.price?.match(/[\d,]+/)).length);
              }
              
              let response = `🏘️ معلومات شاملة عن ${area}:\n\n`;
              response += `📊 إجمالي العقارات: ${count} عقار\n\n`;
              
              response += '🏠 توزيع أنواع العقارات:\n';
              Object.entries(typeCount).forEach(([type, count]) => {
                response += `• ${type}: ${count} عقار\n`;
              });
              
              if (priceStats.total > 0) {
                response += `\n💰 إحصائيات الأسعار:\n`;
                if (priceStats.min < Infinity) response += `• أقل سعر: ${priceStats.min.toLocaleString()} جنيه\n`;
                if (priceStats.max > 0) response += `• أعلى سعر: ${priceStats.max.toLocaleString()} جنيه\n`;
                if (priceStats.avg > 0) response += `• متوسط السعر: ${priceStats.avg.toLocaleString()} جنيه\n`;
              }
              
              response += '\n📋 عينة من العقارات المميزة:\n';
              results.slice(0, 3).forEach((property, index) => {
                response += `${index + 1}. ${property.property_type || 'عقار'} - ${property.price || 'السعر غير محدد'}\n`;
                if (property.area) response += `   � ${property.area}\n`;
                if (property.phone_number) response += `   📞 ${property.phone_number}\n`;
                response += '\n';
              });
              
              response += `�💡 يمكنني عرض المزيد من التفاصيل أو البحث عن نوع عقار محدد في ${area}.`;
              return response;
            } else {
              return `😔 لا توجد عقارات متاحة حالياً في ${area}.\n\n💡 اقتراحات:\n• تحقق من المناطق المجاورة\n• اشترك في التنبيهات للعقارات الجديدة\n• تواصل مع وكلاء العقارات المحليين`;
            }
          },

          investment: 'أفضل المناطق للاستثمار العقاري في مصر:\n• الشيخ زايد - منطقة راقية بإقبال عالي\n• التجمع الخامس - نمو سريع ومرافق متطورة\n• العاصمة الإدارية - استثمار المستقبل\n• الساحل الشمالي - عقارات سياحية مربحة',
          villa: 'الفيلات في مصر:\n• الشيخ زايد: 3-8 مليون جنيه\n• التجمع الخامس: 2.5-6 مليون جنيه\n• العاصمة الإدارية: 4-10 مليون جنيه\n• يُنصح بفحص الموقع والتشطيب',
          apartment: 'الشقق في مصر:\n• الشيخ زايد: 800 ألف - 3 مليون\n• التجمع الخامس: 600 ألف - 2.5 مليون\n• العاصمة الإدارية: 1-4 مليون\n• مراعاة قرب المواصلات والخدمات',
          general: 'مرحباً بك! أنا مساعدك العقاري الذكي. يمكنني مساعدتك في:\n• البحث في قاعدة بيانات العقارات\n• تحليل الأسعار والإحصائيات\n• اختيار أفضل المناطق\n• نصائح الاستثمار العقاري\n\n💡 اسأل عن منطقة محددة أو نوع عقار لأحصل على بيانات دقيقة من النظام.'
        },
        english: {
          // Database-driven responses
          withData: (type, location, count, results) => {
            if (count > 0) {
              const sampleProperties = results.slice(0, 3).map(p => 
                `• ${p.property_type} in ${p.location || p.regions} - ${p.price || 'Price not specified'}`
              ).join('\n');
              
              return `Found ${count} ${type} in ${location}:\n\n${sampleProperties}\n\n${count > 3 ? `And ${count - 3} more properties available.` : ''}\n\n💡 You can search the system for more details or contact agents.`;
            } else {
              return `No ${type} found in ${location} currently.\n\n💡 Try searching in other areas like:\n• Sheikh Zayed\n• Fifth Settlement\n• New Capital`;
            }
          },
          
          // Area-specific responses  
          areaInfo: (area, count) => {
            if (count > 0) {
              return `${area} Area:\n• ${count} properties available\n• Active real estate market\n• Various prices by property type\n\n💡 Use search for more details.`;
            } else {
              return `${area} Area:\n• No properties currently available\n• New listings may be added soon\n\n💡 Try searching nearby areas.`;
            }
          },

          investment: 'Best areas for real estate investment in Egypt:\n• Sheikh Zayed - upscale area with high demand\n• Fifth Settlement - rapid growth and modern facilities\n• New Capital - future investment opportunity\n• North Coast - profitable tourist properties',
          villa: 'Villas in Egypt:\n• Sheikh Zayed: 3-8 million EGP\n• Fifth Settlement: 2.5-6 million EGP\n• New Capital: 4-10 million EGP\n• Check location and finishing quality',
          apartment: 'Apartments in Egypt:\n• Sheikh Zayed: 800K - 3M EGP\n• Fifth Settlement: 600K - 2.5M EGP\n• New Capital: 1-4M EGP\n• Consider transport and services proximity',
          general: 'Welcome! I\'m your real estate assistant. I can help with:\n• Price evaluation\n• Area selection\n• Investment advice\n• Property comparison'
        }
      };

      const langResponses = responses[language] || responses.arabic;
      
      // If we have database results, provide data-driven answers
      if (databaseResults && databaseResults.length > 0) {
        
        // Check if asking about specific property type + location
        if (propertyTypeFilter && locationQuery) {
          const filteredResults = databaseResults.filter(p => 
            !propertyTypeFilter || p.property_type?.includes(propertyTypeFilter) || 
            p.property_type?.includes(this.translatePropertyType(propertyTypeFilter))
          );
          return langResponses.withData(
            this.translatePropertyType(propertyTypeFilter, language), 
            locationQuery, 
            filteredResults.length, 
            filteredResults
          );
        }
        
        // Check if asking about specific area
        if (locationQuery) {
          return langResponses.areaInfo(locationQuery, databaseResults.length, databaseResults);
        }
        
        // Check if asking about specific property type
        if (propertyTypeFilter) {
          const filteredResults = databaseResults.filter(p => 
            p.property_type?.includes(propertyTypeFilter) || 
            p.property_type?.includes(this.translatePropertyType(propertyTypeFilter))
          );
          return this.formatPropertyTypeResponse(filteredResults, propertyTypeFilter, language);
        }
        
        // General search results with comprehensive analysis
        if (databaseResults.length > 0) {
          const propertyTypes = [...new Set(databaseResults.map(p => p.property_type))].filter(Boolean);
          const locations = [...new Set(databaseResults.map(p => p.location || p.regions))].filter(Boolean);
          
          let response = language === 'arabic' ? 
            `🔍 وجدت ${databaseResults.length} عقار يطابق بحثك:\n\n` :
            `🔍 Found ${databaseResults.length} properties matching your search:\n\n`;
          
          if (propertyTypes.length > 0) {
            response += language === 'arabic' ? '🏠 الأنواع المتاحة:\n' : '🏠 Available types:\n';
            propertyTypes.slice(0, 5).forEach(type => {
              const count = databaseResults.filter(p => p.property_type === type).length;
              response += `• ${type}: ${count} ${language === 'arabic' ? 'عقار' : 'properties'}\n`;
            });
            response += '\n';
          }
          
          if (locations.length > 0) {
            response += language === 'arabic' ? '� المناطق المتاحة:\n' : '📍 Available areas:\n';
            locations.slice(0, 5).forEach(location => {
              const count = databaseResults.filter(p => (p.location || p.regions) === location).length;
              response += `• ${location}: ${count} ${language === 'arabic' ? 'عقار' : 'properties'}\n`;
            });
            response += '\n';
          }
          
          // Show sample properties
          response += language === 'arabic' ? '📋 عينة من العقارات:\n' : '📋 Sample properties:\n';
          databaseResults.slice(0, 3).forEach((property, index) => {
            response += `${index + 1}. ${property.property_type || 'Property'} ${language === 'arabic' ? 'في' : 'in'} ${property.location || property.regions || 'Unknown'}\n`;
            if (property.price) response += `   💰 ${property.price}\n`;
            response += '\n';
          });
          
          response += language === 'arabic' ? 
            '💡 استخدم البحث المتقدم في التطبيق لمزيد من التفاصيل والفلترة.' :
            '💡 Use advanced search in the app for more details and filtering.';
          
          return response;
        }
      }
      
      // Fallback to pattern matching for general questions
      if (question.includes('استثمار') || question.includes('المناطق') || question.includes('investment') || question.includes('areas')) {
        return langResponses.investment;
      }
      if (question.includes('فيلا') || question.includes('villa')) {
        return langResponses.villa;
      }
      if (question.includes('شقة') || question.includes('apartment')) {
        return langResponses.apartment;
      }
      
      return langResponses.general;
      
    } catch (error) {
      console.error('❌ Error in fallback response:', error);
      
      // Ultimate fallback
      return language === 'arabic' ? 
        'عذراً، حدث خطأ في النظام. يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني.' :
        'Sorry, a system error occurred. Please try again or contact technical support.';
    }
  }
}

// Create singleton instance
const aiService = new AIService();

// Export functions for easy use
export const analyzePropertyStats = (language) => aiService.analyzePropertyStats(language);
export const processWhatsAppMessage = (message, language) => aiService.processWhatsAppMessage(message, language);
export const askQuestion = (question, context, language) => aiService.askQuestion(question, context, language);
export const getPropertyRecommendations = (criteria, language) => aiService.getPropertyRecommendations(criteria, language);
export const analyzeMarketTrends = (timeframe, language) => aiService.analyzeMarketTrends(timeframe, language);
export const isAIAvailable = () => aiService.isAIAvailable();   
export const clearAIHistory = () => aiService.clearHistory();
export const getAIHistory = () => aiService.getHistory();
export const testAI = (language) => aiService.testAI(language);

export default aiService;
