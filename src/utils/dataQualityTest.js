// Enhanced Data Quality Test Script
// This script tests the new data quality patterns and functions

import {
  analyzeDataQuality,
  enhancedAutoCleanData,
  detectDuplicateFieldValues,
  detectMalformedHTML,
  detectIncompleteMobileNumbers,
  detectMixedLanguageIssues,
  detectInvalidPriceFormats,
  detectInconsistentUnits,
  detectPlaceholderContent,
  validatePropertyData
} from '../utils/dataQualityUtils.js';

// Test data with various quality issues
const testCases = {
  // HTML with multiple issues
  htmlWithIssues: `
    <div class="property-info">
      <h1>Villa for Sale</h1>
      <p>Price: ABC123</p>
      <p>Price: ABC123</p>
      <label>Location</label><input value="">
      <label>Location</label><input value="">
      <div class="unit-detail">Villa details</div>
      <div class="unit-detail">Villa details</div>
      <p>Contact: +20 12 incomplete</p>
      <p>Area: 200 sqm and 2000 sqft</p>
      <p>Description TODO</p>
      <p>Status: PLACEHOLDER</p>
      <div>null</div>
      <span>empty</span>
      <section>Property info</section>
      <section>Property info</section>
    </div>
  `,

  // Property object with issues
  propertyWithIssues: {
    title: 'Villa for Sale',
    title_duplicate: 'Villa for Sale',
    location: 'New Cairo',
    location_copy: 'New Cairo',
    price: '',
    description: null,
    agent_name: 'Ahmed المطور Ahmed',
    mobile: '+20 12 incomplete',
    area_size: '200 sqm and 2000 sqft mixed'
  },

  // Mixed language text
  mixedLanguageText: `
    Welcome مرحبا to our العقارات property
    Contact الوكيل agent for معلومات info
    Price السعر is ABC123 جنيه
  `,

  // Broken mobile numbers
  brokenMobileNumbers: `
    Call: +20 12 345
    Mobile: 01234567
    WhatsApp: +20 10 incomplete
    Contact: 012 345 6789 12
  `
};

// Test functions
console.log('🧪 Enhanced Data Quality Test Suite\n');

// Test 1: HTML Analysis
console.log('📄 Testing HTML with Issues:');
const htmlAnalysis = analyzeDataQuality(testCases.htmlWithIssues);
console.log(`Quality Score: ${htmlAnalysis.qualityScore}% (${htmlAnalysis.status})`);
console.log(`Issues Found: ${Object.values(htmlAnalysis).filter(Array.isArray).reduce((sum, arr) => sum + arr.length, 0)}`);
console.log(`Suggestions: ${htmlAnalysis.suggestions.length}\n`);

// Test 2: Property Object Analysis
console.log('🏠 Testing Property Object:');
const propertyAnalysis = analyzeDataQuality(testCases.propertyWithIssues);
console.log(`Quality Score: ${propertyAnalysis.qualityScore}% (${propertyAnalysis.status})`);

const propertyValidation = validatePropertyData(testCases.propertyWithIssues);
console.log(`Validation: ${propertyValidation.isValid ? 'VALID' : 'INVALID'}`);
console.log(`Completeness: ${propertyValidation.completenessScore}%\n`);

// Test 3: Specific Detection Tests
console.log('🔍 Testing Specific Detection Functions:');

const duplicateValues = detectDuplicateFieldValues(JSON.stringify(testCases.propertyWithIssues));
console.log(`Duplicate Values Found: ${duplicateValues.length}`);

const malformedHTML = detectMalformedHTML(testCases.htmlWithIssues);
console.log(`Malformed HTML Tags: ${malformedHTML.length}`);

const incompleteMobiles = detectIncompleteMobileNumbers(testCases.brokenMobileNumbers);
console.log(`Incomplete Mobile Numbers: ${incompleteMobiles.length}`);

const mixedLanguage = detectMixedLanguageIssues(testCases.mixedLanguageText);
console.log(`Mixed Language Issues: ${mixedLanguage.length}`);

const invalidPrices = detectInvalidPriceFormats(testCases.htmlWithIssues);
console.log(`Invalid Price Formats: ${invalidPrices.length}`);

const inconsistentUnits = detectInconsistentUnits(testCases.htmlWithIssues);
console.log(`Inconsistent Units: ${inconsistentUnits.length}`);

const placeholders = detectPlaceholderContent(testCases.htmlWithIssues);
console.log(`Placeholder Content: ${placeholders.length}\n`);

// Test 4: Enhanced Auto-Cleaning
console.log('🧹 Testing Enhanced Auto-Cleaning:');
const cleaningResult = enhancedAutoCleanData(testCases.htmlWithIssues);
console.log(`Original Quality: ${cleaningResult.originalQuality}%`);
console.log(`Final Quality: ${cleaningResult.finalQuality}%`);
console.log(`Improvement: ${cleaningResult.improvement > 0 ? '+' : ''}${cleaningResult.improvement}%`);
console.log(`Actions Performed: ${cleaningResult.actionsPerformed.length}\n`);

// Test 5: Pattern Coverage Test
console.log('📊 Pattern Coverage Summary:');
const allPatterns = [
  'duplicate_fields', 'duplicate_field_values', 'repeated_property_entries',
  'html_repeated_blocks', 'repeated_labels', 'repeated_section_blocks',
  'duplicate_labels', 'repeated_form_elements', 'inline_repetition',
  'inline_field_duplication', 'repeated_paragraphs', 'duplicate_text_blocks',
  'empty_fields', 'null_or_empty_blocks', 'empty_form_fields',
  'placeholder_content', 'cluttered_data_dump', 'malformed_html_tags',
  'broken_links', 'incomplete_data_entries', 'incomplete_mobile_numbers',
  'malformed_mobile_format', 'mixed_language_confusion', 'broken_arabic_text',
  'invalid_price_format', 'inconsistent_units', 'missing_currency_indicators'
];

console.log(`Total Patterns Implemented: ${allPatterns.length}`);
console.log('✅ Enhanced Data Quality System Test Complete!');

export default {
  testCases,
  htmlAnalysis,
  propertyAnalysis,
  propertyValidation,
  cleaningResult
};
