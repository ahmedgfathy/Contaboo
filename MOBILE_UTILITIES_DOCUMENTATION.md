# Mobile Number Utilities Documentation - Enhanced

## Overview
This document describes the enhanced mobile number utilities implemented for the Real Estate Chat Search Application, specifically designed for Egyptian mobile numbers with comprehensive masking functionality for user privacy. The system now handles real-world patterns found in WhatsApp chat messages.

## Mobile Regex Patterns

### Primary Pattern
```javascript
{
  "mobile_regex": "(\\+?2?01[0-2,5]{1}[0-9]{8})"
}
```

### Enhanced Patterns for Real-World Data
The system now supports multiple patterns found in actual chat messages:

1. **Standard Egyptian Format**: `01012345678`, `+201012345678`
2. **Spaced Format**: `010 123 4567`, `+20 10 123 4567`
3. **Broken/Split Format**: `26433244 10 20+` (as seen in app images)
4. **Generic Number Patterns**: `123 456 7890`
5. **International Variations**: `+20 1X XXX XXXX`

### Comprehensive Pattern Array
```javascript
export const MOBILE_PATTERNS = [
  /(\+?2?01[0-2,5]{1}[0-9]{8})/g,                    // Standard: 01012345678, +201012345678
  /(\+?20\s*1[0-2,5]{1}\s*[0-9]{3}\s*[0-9]{4})/g,   // With spaces: +20 10 123 4567
  /(\d{8}\s*\d{2}\s*\d{2}\+?)/g,                     // Pattern like: 26433244 10 20+
  /(01[0-2,5]{1}\s*[0-9]{3}\s*[0-9]{4})/g,          // Local with spaces: 010 123 4567
  /(\d{3}\s*\d{3}\s*\d{4})/g,                        // Generic: 123 456 7890
  /(\d{2}\s*\d{3}\s*\d{3}\s*\d{3})/g,               // Split format: 01 012 345 678
  /(\d{8}\s*\d{2}\s*\d{1,2})/g,                     // Broken format: 12345678 90 1
];
```

### Supported Prefixes:
- `010` - Vodafone (فودافون)
- `011` - Etisalat (اتصالات)
- `012` - Orange (أورانج)
- `015` - Telecom Egypt (المصرية للاتصالات)

## Real-World Pattern Examples

### Patterns Found in Live Application
Based on actual chat message analysis, the following patterns are commonly found:

1. **Contact Information Pattern**:
   ```
   "معلومات الوسيط 26433244 10 20+ فيستو عقاري"
   ```

2. **Agent Contact Pattern**:
   ```
   "للتواصل/الوكيل 26433244 10 20+"
   ```

3. **Property Description Pattern**:
   ```
   "مطور عقاري ومستشار في شراء وبيع العقارات 010 123 4567"
   ```

4. **Detailed Description Pattern**:
   ```
   "عقار في المرحلة العاشرة مساحة 230 متر مربع موقع ممتاز ومناسب للاستثمار"
   ```

### Masking Behavior
- **Authenticated Users**: See full mobile numbers
- **Guest Users**: See masked versions (e.g., `26***********`, `01*********`)
- **Pattern Recognition**: All patterns are detected and masked consistently

## Core Functions

### `maskMobile(text, isLoggedIn)`
Masks mobile numbers in text for privacy protection.

**Parameters:**
- `text` (string): Text containing mobile numbers
- `isLoggedIn` (boolean): Whether user is authenticated

**Returns:** String with masked mobile numbers if user is not authenticated

**Example:**
```javascript
const text = "تواصل معي على 01012345678";
const masked = maskMobile(text, false);
// Result: "تواصل معي على 01*********"
```

### `extractMobile(text)`
Extracts the first mobile number found in text.

**Parameters:**
- `text` (string): Text to search for mobile numbers

**Returns:** String with first mobile number found, or null

**Example:**
```javascript
const mobile = extractMobile("رقمي 01012345678");
// Result: "01012345678"
```

### `formatMobile(mobile)`
Formats mobile number for display with proper spacing.

**Parameters:**
- `mobile` (string): Mobile number to format

**Returns:** Formatted mobile number string

**Example:**
```javascript
const formatted = formatMobile("01012345678");
// Result: "010 123 4567"
```

### `validateMobile(mobile)`
Validates if a mobile number matches Egyptian format.

**Parameters:**
- `mobile` (string): Mobile number to validate

**Returns:** Boolean indicating if mobile is valid

**Example:**
```javascript
const isValid = validateMobile("01012345678");
// Result: true
```

### `normalizeMobile(mobile)`
Normalizes mobile number to standard 11-digit format.

**Parameters:**
- `mobile` (string): Mobile number to normalize

**Returns:** Normalized mobile string or null if invalid

**Example:**
```javascript
const normalized = normalizeMobile("+201012345678");
// Result: "01012345678"
```

### `getPhoneCarrier(mobile)`
Gets the phone carrier name in Arabic based on prefix.

**Parameters:**
- `mobile` (string): Mobile number

**Returns:** Carrier name in Arabic or null

**Example:**
```javascript
const carrier = getPhoneCarrier("01012345678");
// Result: "فودافون"
```

### `isEgyptianMobile(mobile)`
Checks if mobile number is in Egyptian format.

**Parameters:**
- `mobile` (string): Mobile number to check

**Returns:** Boolean indicating if number is Egyptian

**Example:**
```javascript
const isEgyptian = isEgyptianMobile("01012345678");
// Result: true
```

## Integration with Existing System

### API Service Integration
The mobile masking functionality is integrated into `apiService.js`:

```javascript
import { maskMobile } from '../services/apiService';

// Use in components
const maskedText = maskMobile(messageText, isAuthenticated);
```

### Backward Compatibility
The existing `hideMobileNumber` function remains unchanged for backward compatibility, while the new `maskMobile` function provides enhanced functionality.

## Usage in Components

### Example Component Usage
```jsx
import React from 'react';
import { maskMobile } from '../services/apiService';
import { formatMobile, getPhoneCarrier } from '../utils/mobileUtils';

const PropertyCard = ({ message, isAuthenticated }) => {
  const displayText = maskMobile(message.text, isAuthenticated);
  const formattedPhone = formatMobile(message.agent_phone);
  const carrier = getPhoneCarrier(message.agent_phone);
  
  return (
    <div>
      <p>{displayText}</p>
      <p>Phone: {formattedPhone}</p>
      <p>Carrier: {carrier}</p>
    </div>
  );
};
```

## Security Considerations

1. **Privacy Protection**: Mobile numbers are masked with asterisks for unauthenticated users
2. **Authentication Check**: Functions automatically check authentication status if not provided
3. **Flexible Masking**: Only shows first 2 digits to maintain some context while protecting privacy

## File Locations

- **Main Utilities**: `src/utils/mobileUtils.js`
- **API Integration**: `src/services/apiService.js`
- **Regex Patterns**: `api/regex-patterns.js`
- **Example Component**: `src/components/MobileMaskingExample.jsx`
- **Test File**: `test-mobile-utils.mjs`

## Testing

Run the test file to verify all functionality:
```bash
node test-mobile-utils.mjs
```

The test file includes comprehensive test cases for all mobile number formats and edge cases.
