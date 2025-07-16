// Test file for mobile utilities and masking functionality
import { 
  MOBILE_REGEX,
  maskMobile,
  extractMobile,
  formatMobile,
  validateMobile,
  normalizeMobile,
  getPhoneCarrier,
  isEgyptianMobile 
} from '../src/utils/mobileUtils.js';

// Test data
const testCases = [
  {
    description: "Standard Egyptian mobile (Vodafone)",
    input: "01012345678",
    expected: {
      valid: true,
      carrier: "فودافون",
      normalized: "01012345678"
    }
  },
  {
    description: "International format (+20)",
    input: "+201012345678",
    expected: {
      valid: true,
      carrier: "فودافون", 
      normalized: "01012345678"
    }
  },
  {
    description: "Orange mobile",
    input: "01234567890",
    expected: {
      valid: true,
      carrier: "أورانج",
      normalized: "01234567890"
    }
  },
  {
    description: "Etisalat mobile",
    input: "01123456789",
    expected: {
      valid: true,
      carrier: "اتصالات",
      normalized: "01123456789"
    }
  },
  {
    description: "Text with multiple mobiles",
    input: "تواصل معي على 01012345678 أو على +201234567890",
    expected: {
      masked: "تواصل معي على 01********* أو على +2*********"
    }
  }
];

// Test functions
console.log("🧪 Testing Mobile Utilities\n");

console.log("📱 Mobile Regex Pattern:");
console.log(MOBILE_REGEX.source);
console.log();

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.description}`);
  console.log(`Input: ${testCase.input}`);
  
  // Test validation
  const isValid = validateMobile(testCase.input);
  console.log(`Valid: ${isValid ? '✅' : '❌'}`);
  
  // Test normalization
  const normalized = normalizeMobile(testCase.input);
  console.log(`Normalized: ${normalized}`);
  
  // Test carrier detection
  const carrier = getPhoneCarrier(testCase.input);
  console.log(`Carrier: ${carrier || 'Unknown'}`);
  
  // Test formatting
  const formatted = formatMobile(testCase.input);
  console.log(`Formatted: ${formatted}`);
  
  // Test extraction
  const extracted = extractMobile(testCase.input);
  console.log(`Extracted: ${extracted}`);
  
  // Test masking
  const maskedAuth = maskMobile(testCase.input, true);
  const maskedUnauth = maskMobile(testCase.input, false);
  console.log(`Masked (authenticated): ${maskedAuth}`);
  console.log(`Masked (unauthenticated): ${maskedUnauth}`);
  
  // Test Egyptian check
  const isEgyptian = isEgyptianMobile(testCase.input);
  console.log(`Is Egyptian: ${isEgyptian ? '🇪🇬' : '❌'}`);
  
  console.log('---');
});

// Test JSON structure for mobile regex
console.log("\n📋 JSON Structure for Mobile Regex:");
const mobileRegexJSON = {
  "mobile_regex": "(\\+?2?01[0-2,5]{1}[0-9]{8})"
};
console.log(JSON.stringify(mobileRegexJSON, null, 2));

// Test the maskMobile function exactly as provided
console.log("\n🎭 Testing maskMobile function:");
const testText = "أهلا، رقمي 01012345678 و أيضا +201234567890";
console.log(`Original: ${testText}`);
console.log(`Logged in: ${maskMobile(testText, true)}`);
console.log(`Not logged in: ${maskMobile(testText, false)}`);

export { testCases, mobileRegexJSON };
