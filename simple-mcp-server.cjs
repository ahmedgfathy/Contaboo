// Simple HTTP Server to test MCP connection
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'MCP HTTP Server is running'
  });
});

// Test property search
app.post('/tools/ai_property_search', async (req, res) => {
  const { arguments: args } = req.body;
  const query = args?.query || '';
  
  // Mock response for now
  let response = '';
  
  if (query.includes('150') && (query.includes('شقة') || query.includes('apartment'))) {
    response = `🏠 نتائج البحث عن شقة 150 متر:\n\n`;
    response += `1. شقة فاخرة 150 متر - النصر للاسكان\n`;
    response += `   💰 السعر: 2,500,000 جنيه\n`;
    response += `   📍 المنطقة: مدينة نصر\n`;
    response += `   🏠 3 غرف نوم + 2 حمام + صالة\n\n`;
    response += `2. شقة حديثة 150 متر - القاهرة الجديدة\n`;
    response += `   💰 السعر: 3,200,000 جنيه\n`;
    response += `   📍 المنطقة: التجمع الخامس\n`;
    response += `   🏠 3 غرف نوم + 2 حمام + مطبخ أمريكي\n\n`;
    response += `📊 تحليل ذكي: العقارات 150 متر تُعتبر من الأحجام المثالية للعائلات المتوسطة`;
  } else {
    response = `تم البحث عن: "${query}"\n\nالنتائج محدودة حالياً، جاري تطوير قاعدة البيانات...`;
  }

  res.json({
    success: true,
    result: {
      content: [{
        type: 'text',
        text: response
      }]
    }
  });
});

// Test property recommendations
app.post('/tools/ai_property_recommendations', async (req, res) => {
  res.json({
    success: true,
    result: {
      content: [{
        type: 'text',
        text: '🏡 توصيات عقارية ذكية متاحة قريباً...'
      }]
    }
  });
});

// Test market analysis
app.post('/tools/ai_market_analysis', async (req, res) => {
  res.json({
    success: true,
    result: {
      content: [{
        type: 'text',
        text: '📈 تحليل السوق العقاري متاح قريباً...'
      }]
    }
  });
});

// Generic tool handler
app.post('/tools/:toolName', (req, res) => {
  res.json({
    success: true,
    result: {
      content: [{
        type: 'text',
        text: `أداة ${req.params.toolName} قيد التطوير...`
      }]
    }
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🌐 Simple MCP HTTP Server running on http://localhost:${PORT}`);
  console.log(`📡 Ready to handle AI queries`);
});
