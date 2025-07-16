// Mobile number utilities for Real Estate Chat Application
// Support for Egyptian mobile numbers with masking functionality

// Comprehensive mobile regex patterns for Egyptian numbers
export const MOBILE_REGEX = /(\+?2?01[0-2,5]{1}[0-9]{8})/g;

// Additional patterns for different mobile formats
export const MOBILE_PATTERNS = [
  /(\+?2?01[0-2,5]{1}[0-9]{8})/g,                    // Standard: 01012345678, +201012345678
  /(\+?20\s*1[0-2,5]{1}\s*[0-9]{3}\s*[0-9]{4})/g,   // With spaces: +20 10 123 4567
  /(\d{8}\s*\d{2}\s*\d{2}\+?)/g,                     // Pattern like: 26433244 10 20+
  /(01[0-2,5]{1}\s*[0-9]{3}\s*[0-9]{4})/g,          // Local with spaces: 010 123 4567
  /(\d{3}\s*\d{3}\s*\d{4})/g,                        // Generic: 123 456 7890
  /(\d{2}\s*\d{3}\s*\d{3}\s*\d{3})/g,               // Split format: 01 012 345 678
  /(\d{8}\s*\d{2}\s*\d{1,2})/g,                     // Broken format: 12345678 90 1
];

/**
 * Mask mobile numbers for non-authenticated users with comprehensive pattern matching
 * @param {string} text - Text containing mobile numbers
 * @param {boolean} isLoggedIn - Whether user is authenticated
 * @returns {string} Text with masked mobile numbers if not authenticated
 */
export const maskMobile = (text, isLoggedIn) => {
  if (!text) return text;
  
  if (isLoggedIn) return text;
  
  let maskedText = text;
  
  // Apply all mobile patterns for comprehensive masking
  MOBILE_PATTERNS.forEach(pattern => {
    maskedText = maskedText.replace(pattern, (match) => {
      // Keep first 2-3 characters and mask the rest
      const keepChars = Math.min(3, match.length);
      return match.slice(0, keepChars) + "*".repeat(Math.max(0, match.length - keepChars));
    });
  });
  
  return maskedText;
};

/**
 * Extract mobile number from text using comprehensive patterns
 * @param {string} text - Text to extract mobile from
 * @returns {string|null} Extracted mobile number or null
 */
export const extractMobile = (text) => {
  if (!text) return null;
  
  // Try each pattern to find a mobile number
  for (const pattern of MOBILE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      return match[0];
    }
  }
  
  return null;
};

/**
 * Format Egyptian mobile number for display
 * @param {string} mobile - Mobile number to format
 * @returns {string} Formatted mobile number
 */
export const formatMobile = (mobile) => {
  if (!mobile) return '';
  
  // Remove all non-digit characters
  const cleaned = mobile.replace(/\D/g, '');
  
  // Handle international format with +20 prefix
  if (cleaned.startsWith('20') && cleaned.length === 13) {
    const number = cleaned.slice(2); // Remove country code
    return `+20 ${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`;
  }
  
  // Handle local format (11 digits)
  if (cleaned.length === 11 && cleaned.startsWith('01')) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  
  // Return original if no formatting pattern matches
  return mobile;
};

/**
 * Validate Egyptian mobile number
 * @param {string} mobile - Mobile number to validate
 * @returns {boolean} Whether mobile number is valid
 */
export const validateMobile = (mobile) => {
  if (!mobile) return false;
  return MOBILE_REGEX.test(mobile);
};

/**
 * Normalize mobile number to standard format (remove spaces, formatting)
 * @param {string} mobile - Mobile number to normalize
 * @returns {string|null} Normalized mobile number
 */
export const normalizeMobile = (mobile) => {
  if (!mobile) return null;
  
  // Extract all digits
  const allDigits = mobile.replace(/[^\d]/g, '');
  
  // Handle international format (+20 prefix)
  if (allDigits.startsWith('20')) {
    if (allDigits.length === 13) {
      // +20 10XXXXXXXX -> 010XXXXXXXX
      return allDigits.substring(2);
    } else if (allDigits.length === 12) {
      // +20 1XXXXXXXX -> 01XXXXXXXX (missing leading zero)
      return '0' + allDigits.substring(2);
    }
  }
  
  // Handle local format
  if (allDigits.length === 11 && /^(010|011|012|015)/.test(allDigits)) {
    return allDigits;
  }
  
  // Handle 10-digit format (missing leading zero)
  if (allDigits.length === 10 && /^(10|11|12|15)/.test(allDigits)) {
    return '0' + allDigits;
  }
  
  return null;
};

/**
 * Get phone carrier based on prefix
 * @param {string} mobile - Mobile number
 * @returns {string|null} Carrier name in Arabic
 */
export const getPhoneCarrier = (mobile) => {
  const normalized = normalizeMobile(mobile);
  if (!normalized) return null;
  
  const carriers = {
    '010': 'فودافون',
    '011': 'اتصالات', 
    '012': 'أورانج',
    '015': 'المصرية للاتصالات'
  };
  
  const prefix = normalized.substring(0, 3);
  return carriers[prefix] || null;
};

/**
 * Check if mobile number is Egyptian
 * @param {string} mobile - Mobile number to check
 * @returns {boolean} Whether number is Egyptian format
 */
export const isEgyptianMobile = (mobile) => {
  if (!mobile) return false;
  const normalized = normalizeMobile(mobile);
  return normalized !== null;
};
