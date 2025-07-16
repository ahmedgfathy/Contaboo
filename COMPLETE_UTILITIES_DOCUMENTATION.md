# Complete Utilities Documentation - Mobile Masking & SEO Metadata

## Overview
This document provides comprehensive documentation for both Mobile Masking and SEO Metadata extraction utilities implemented in the Real Estate Chat Search Application.

## 📱 Mobile Masking Utilities

### Mobile Regex Patterns
```json
{
  "mobile_regex": "(\\+?2?01[0-2,5]{1}[0-9]{8})",
  "detect_hashtags": "#([\\w\\d\\-_]+)",
  "html_heading_tags": "<(h1|h2|h3)[^>]*>.*?</\\1>",
  "meta_keywords_tag": "<meta\\s+name=[\"']keywords[\"']\\s+content=[\"']([^\"']*)[\"']\\s*/?>",
  "meta_description_tag": "<meta\\s+name=[\"']description[\"']\\s+content=[\"']([^\"']*)[\"']\\s*/?>",
  "og_tags": "<meta\\s+property=[\"']og:(title|description)[\"']\\s+content=[\"']([^\"']*)[\"']\\s*/?>"
}
```

### Enhanced Mobile Patterns Array
```javascript
export const MOBILE_PATTERNS = [
  /(\+?2?01[0-2,5]{1}[0-9]{8})/g,                    // Standard: 01012345678, +201012345678
  /(\+?20\s*1[0-2,5]{1}\s*[0-9]{3}\s*[0-9]{4})/g,   // International with spaces: +20 10 123 4567
  /(\d{8}\s*\d{2}\s*\d{2}\+?)/g,                     // Pattern like: 26433244 10 20+
  /(01[0-2,5]{1}\s*[0-9]{3}\s*[0-9]{4})/g,          // Local with spaces: 010 123 4567
  /(\d{3}\s*\d{3}\s*\d{4})/g,                        // Generic: 123 456 7890
  /(\d{2}\s*\d{3}\s*\d{3}\s*\d{3})/g,               // Split format: 01 012 345 678
  /(\d{8}\s*\d{2}\s*\d{1,2})/g,                     // Broken format: 12345678 90 1
];
```

### maskMobile Function
```javascript
const maskMobile = (text, isLoggedIn) => {
  const regex = /(\+?2?01[0-2,5]{1}[0-9]{8})/g;
  return isLoggedIn
    ? text
    : text.replace(regex, (match) => match.slice(0, 2) + "*********");
};
```

## 🔍 SEO Metadata Utilities

### SEO Regex Patterns
```javascript
export const SEO_PATTERNS = {
  detect_hashtags: /#([\w\d\-_]+)/g,
  html_heading_tags: /<(h1|h2|h3)[^>]*>.*?<\/\1>/gi,
  meta_keywords_tag: /<meta\s+name=["']keywords["']\s+content=["']([^"']*)["']\s*\/?>/gi,
  meta_description_tag: /<meta\s+name=["']description["']\s+content=["']([^"']*)["']\s*\/?>/gi,
  og_tags: /<meta\s+property=["']og:(title|description)["']\s+content=["']([^"']*)["']\s*\/?>/gi,
  twitter_tags: /<meta\s+name=["']twitter:(card|title|description)["']\s+content=["']([^"']*)["']\s*\/?>/gi,
  title_tag: /<title[^>]*>([^<]*)<\/title>/gi
};
```

### Example HTML Meta Tags
```html
<meta name="keywords" content="New Cairo, Apartment For Sale, Luxury Homes, Real Estate Egypt" />
<meta name="description" content="Find real estate in New Cairo. Apartments for sale, luxury homes, and more." />
<title>Real Estate in New Cairo | Apartments, Villas, Properties</title>
<meta property="og:title" content="New Cairo Properties for Sale" />
<meta property="og:description" content="Search properties, apartments, and homes in New Cairo." />
<meta name="twitter:card" content="summary_large_image" />
```

## 🚀 Core Functions

### Mobile Functions

#### `maskMobile(text, isLoggedIn)`
Masks mobile numbers in text for privacy protection.
```javascript
// Usage
const maskedText = maskMobile("اتصل بي على 01012345678", false);
// Result: "اتصل بي على 01*********"
```

#### `extractMobile(text)`
Extracts the first mobile number from text.
```javascript
// Usage
const mobile = extractMobile("رقمي 26433244 10 20+");
// Result: "26433244 10 20+"
```

#### `validateMobile(mobile)`
Validates Egyptian mobile number format.
```javascript
// Usage
const isValid = validateMobile("01012345678");
// Result: true
```

### SEO Functions

#### `extractMetaKeywords(htmlContent)`
Extracts meta keywords from HTML.
```javascript
// Usage
const keywords = extractMetaKeywords(htmlContent);
// Result: "New Cairo, Apartment For Sale, Luxury Homes, Real Estate Egypt"
```

#### `extractMetaDescription(htmlContent)`
Extracts meta description from HTML.
```javascript
// Usage
const description = extractMetaDescription(htmlContent);
// Result: "Find real estate in New Cairo. Apartments for sale, luxury homes, and more."
```

#### `extractOpenGraphTags(htmlContent)`
Extracts Open Graph tags from HTML.
```javascript
// Usage
const ogTags = extractOpenGraphTags(htmlContent);
// Result: { title: "New Cairo Properties for Sale", description: "Search properties..." }
```

#### `extractHashtags(text)`
Extracts hashtags from text content.
```javascript
// Usage
const hashtags = extractHashtags("شقة للبيع #NewCairo #RealEstate #ApartmentForSale");
// Result: ["NewCairo", "RealEstate", "ApartmentForSale"]
```

#### `generatePropertySEOMetadata(property)`
Generates SEO metadata for property listings.
```javascript
// Usage
const seoData = generatePropertySEOMetadata({
  property_type: "Apartment",
  location: "New Cairo",
  price: "2,500,000 EGP"
});
// Result: { title: "Apartment for Sale in New Cairo - 2,500,000 EGP | Real Estate Egypt", ... }
```

## 🧪 Testing Components

### Available Test Components
1. **`EnhancedMobileMaskingTest.jsx`** - Interactive mobile masking test
2. **`SEOMetadataTest.jsx`** - SEO metadata extraction test
3. **`CombinedUtilitiesTest.jsx`** - Combined functionality test

### Running Tests
```javascript
// Import test components
import EnhancedMobileMaskingTest from './components/EnhancedMobileMaskingTest';
import SEOMetadataTest from './components/SEOMetadataTest';
import CombinedUtilitiesTest from './components/CombinedUtilitiesTest';

// Use in your app for testing
<CombinedUtilitiesTest />
```

## 🎯 Real-World Examples

### Mobile Patterns from Live Data
```javascript
// Patterns found in actual app images:
"معلومات الوسيط 26433244 10 20+"     → "معلومات الوسيط 264***********"
"للتواصل/الوكيل 26433244 10 20+"     → "للتواصل/الوكيل 264***********"
"اتصل بي على 01012345678"            → "اتصل بي على 01*********"
"هاتف 010 123 4567"                  → "هاتف 010***********"
```

### SEO Metadata Extraction Examples
```javascript
// Input HTML:
`<meta name="keywords" content="New Cairo, Apartment For Sale, Luxury Homes" />`

// Output:
extractMetaKeywords(html) → "New Cairo, Apartment For Sale, Luxury Homes"
extractHashtags("#NewCairo #RealEstate") → ["NewCairo", "RealEstate"]
```

## 📁 File Structure

```
src/
├── utils/
│   ├── mobileUtils.js           # Mobile masking utilities
│   └── seoUtils.js             # SEO metadata utilities
├── services/
│   └── apiService.js           # API integration with masking
├── components/
│   ├── EnhancedMobileMaskingTest.jsx
│   ├── SEOMetadataTest.jsx
│   └── CombinedUtilitiesTest.jsx
└── api/
    └── regex-patterns.js       # Centralized regex patterns
```

## 🔧 Integration Guide

### In React Components
```javascript
import { maskMobile } from '../services/apiService';
import { extractHashtags, generatePropertySEOMetadata } from '../utils/seoUtils';

// In component:
const displayText = maskMobile(property.description, isAuthenticated);
const hashtags = extractHashtags(property.message);
const seoMeta = generatePropertySEOMetadata(property);
```

### In API/Backend
```javascript
const { MOBILE_REGEX, SEO_PATTERNS } = require('./api/regex-patterns');

// Use patterns for server-side processing
const mobileMatch = text.match(MOBILE_REGEX);
const hashtagMatches = text.match(SEO_PATTERNS.detect_hashtags);
```

## 🛡️ Security & Privacy

### Privacy Protection Features
- ✅ Mobile numbers masked for unauthorized users
- ✅ Context preservation (first 2-3 characters shown)
- ✅ Authentication-based access control
- ✅ Comprehensive pattern coverage
- ✅ Backward compatibility maintained

### Data Processing
- ✅ Client-side masking for immediate privacy
- ✅ Server-side extraction for data processing
- ✅ No sensitive data logged in masked state
- ✅ SEO data safely extractable without privacy concerns

## 📊 Performance Considerations

### Optimizations
- ✅ Regex patterns compiled once and reused
- ✅ Efficient pattern matching with early exits
- ✅ Minimal DOM manipulation for SEO extraction
- ✅ Cached authentication status checks
- ✅ Batch processing for multiple patterns

### Best Practices
- ✅ Use specific patterns before generic ones
- ✅ Validate extracted data before processing
- ✅ Handle edge cases gracefully
- ✅ Provide fallbacks for failed extractions
- ✅ Test with real-world data regularly

This comprehensive utility system provides robust mobile privacy protection and SEO metadata extraction capabilities for your Real Estate Chat Search Application.
