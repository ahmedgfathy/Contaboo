// Test script for enhanced AI service with database fallback
import aiService, { askQuestion } from './src/services/aiService.js';

// Mock API service functions for testing
const mockSearchAll = async (query, propertyType, page, limit) => {
  console.log('🔍 Mock searchAll called with:', { query, propertyType, page, limit });
  
  // Mock property data
  const mockProperties = [
    {
      id: 1,
      property_type: 'فيلا',
      location: 'الحي ٢٢',
      regions: 'الحي ٢٢',
      price: '3,500,000 جنيه',
      area: '300 متر مربع',
      bedrooms: 4,
      bathrooms: 3,
      phone_number: '01234567890'
    },
    {
      id: 2,
      property_type: 'شقة',
      location: 'الحي ٢٢',
      regions: 'الحي ٢٢',
      price: '1,200,000 جنيه',
      area: '150 متر مربع',
      bedrooms: 3,
      bathrooms: 2,
      phone_number: '01234567891'
    },
    {
      id: 3,
      property_type: 'فيلا',
      location: 'الشيخ زايد',
      regions: 'الشيخ زايد',
      price: '5,800,000 جنيه',
      area: '450 متر مربع',
      bedrooms: 5,
      bathrooms: 4,
      phone_number: '01234567892'
    }
  ];

  // Filter based on query and property type
  let filtered = mockProperties;
  
  if (propertyType) {
    filtered = filtered.filter(p => 
      p.property_type === propertyType || 
      p.property_type.includes(propertyType)
    );
  }
  
  if (query) {
    filtered = filtered.filter(p => 
      p.location.includes(query) || 
      p.regions.includes(query) ||
      p.property_type.includes(query)
    );
  }
  
  return filtered.slice(0, limit);
};

const mockGetPropertyTypeStats = async () => {
  return {
    totalProperties: 150,
    propertyTypes: {
      'فيلا': 45,
      'شقة': 89,
      'أرض': 16
    }
  };
};

// Replace API service functions with mocks
global.searchAll = mockSearchAll;
global.getPropertyTypeStats = mockGetPropertyTypeStats;

// Test questions
const testQuestions = [
  'كم فيلا في الحي ٢٢؟',
  'شقق متاحة في الشيخ زايد',
  'أريد عقار في منطقة الحي ٢٢',
  'How many villas are available?',
  'Tell me about investment opportunities'
];

async function testAIService() {
  console.log('🧪 Testing Enhanced AI Service with Database Fallback\n');
  
  for (const question of testQuestions) {
    console.log(`\n🤔 Question: ${question}`);
    console.log('─'.repeat(50));
    
    try {
      const response = await askQuestion(question, {}, 'arabic');
      console.log('✅ Response:', response);
      console.log('📝 Answer:', response.answer);
      console.log('🔄 Fallback:', response.fallback ? 'Yes' : 'No');
      if (response.fallbackMessage) {
        console.log('⚠️ Fallback Message:', response.fallbackMessage);
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
    
    console.log('\n');
  }
}

// Run the test
testAIService().catch(console.error);
