// Test file for enhanced mobile masking with real-world examples
import { maskMobile, extractMobile, MOBILE_PATTERNS } from '../src/utils/mobileUtils.js';

// Test cases based on the images provided
const realWorldTestCases = [
  {
    description: "Mobile from image: 26433244 10 20+",
    input: "26433244 10 20+",
    shouldMask: true
  },
  {
    description: "Standard Egyptian mobile",
    input: "01012345678",
    shouldMask: true
  },
  {
    description: "International format",
    input: "+201012345678", 
    shouldMask: true
  },
  {
    description: "Mobile with spaces",
    input: "010 123 4567",
    shouldMask: true
  },
  {
    description: "Arabic text with mobile",
    input: "تواصل معي على 01012345678 أو اتصل",
    shouldMask: true
  },
  {
    description: "Complex text with multiple formats",
    input: "معلومات الوسيط 26433244 10 20+ أو 01012345678",
    shouldMask: true
  },
  {
    description: "Property info with mobile",
    input: "شقة للبيع - مطور عقاري ومستشار في شراء وبيع العقارات 010 123 4567",
    shouldMask: true
  },
  {
    description: "Contact info pattern",
    input: "للتواصل/الوكيل 26433244 10 20+",
    shouldMask: true
  }
];

console.log("🧪 Testing Enhanced Mobile Masking with Real-World Examples\n");

console.log("📱 Available Mobile Patterns:");
MOBILE_PATTERNS.forEach((pattern, index) => {
  console.log(`${index + 1}. ${pattern.source}`);
});
console.log();

realWorldTestCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.description}`);
  console.log(`Input: "${testCase.input}"`);
  
  // Test extraction
  const extracted = extractMobile(testCase.input);
  console.log(`Extracted: ${extracted || 'None found'}`);
  
  // Test masking (authenticated)
  const maskedAuth = maskMobile(testCase.input, true);
  console.log(`Authenticated: "${maskedAuth}"`);
  
  // Test masking (unauthenticated)
  const maskedUnauth = maskMobile(testCase.input, false);
  console.log(`Unauthenticated: "${maskedUnauth}"`);
  
  // Check if masking occurred
  const wasMasked = maskedUnauth !== testCase.input;
  console.log(`Was Masked: ${wasMasked ? '✅' : '❌'}`);
  
  console.log('---');
});

// Test specific patterns from the images
console.log("\n🎯 Testing Specific Patterns from Images:");

const imagePatterns = [
  "26433244 10 20+",
  "معلومات الوسيط",
  "للتواصل/الوكيل", 
  "مطور عقاري ومستشار في شراء وبيع العقارات"
];

imagePatterns.forEach(pattern => {
  console.log(`Pattern: "${pattern}"`);
  const masked = maskMobile(pattern, false);
  console.log(`Masked: "${masked}"`);
  console.log(`Changed: ${masked !== pattern ? '✅' : '❌'}`);
  console.log('---');
});

// Test the masking effectiveness
console.log("\n📊 Masking Effectiveness Report:");
let totalTests = realWorldTestCases.length;
let successfulMasks = 0;

realWorldTestCases.forEach(testCase => {
  const original = testCase.input;
  const masked = maskMobile(original, false);
  if (masked !== original && testCase.shouldMask) {
    successfulMasks++;
  }
});

console.log(`Total Tests: ${totalTests}`);
console.log(`Successful Masks: ${successfulMasks}`);
console.log(`Success Rate: ${((successfulMasks / totalTests) * 100).toFixed(1)}%`);

export { realWorldTestCases, imagePatterns };
