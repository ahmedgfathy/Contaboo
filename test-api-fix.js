#!/usr/bin/env node

// Quick test script to verify the API column fix

async function testAPI() {
  console.log('🔍 Testing API endpoints for column errors...\n');
  
  const tests = [
    {
      name: 'Vercel Dev Server /search-all',
      url: 'http://localhost:3000/api/search-all?limit=5'
    },
    {
      name: 'Vercel Dev Server /health',
      url: 'http://localhost:3000/api/health'
    },
    {
      name: 'Production Vercel /health', 
      url: 'https://contaboo.vercel.app/api/health'
    }
  ];
  
  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}`);
      const response = await fetch(test.url, {
        timeout: 5000,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (test.name.includes('health')) {
          console.log(`✅ ${test.name}: Status ${response.status} - ${data.message || 'OK'}`);
        } else {
          const count = data.chatMessages?.length + data.importedProperties?.length || data.properties?.length || 0;
          console.log(`✅ ${test.name}: Status ${response.status} - Found ${count} properties`);
        }
      } else {
        console.log(`❌ ${test.name}: Status ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: Error - ${error.message}`);
    }
    console.log('');
  }
  
  console.log('🏁 Test completed! If all tests pass, the column error fix is working.');
}

testAPI().catch(console.error);
