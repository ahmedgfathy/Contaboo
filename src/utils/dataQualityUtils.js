// Data Quality and Duplicate Detection Utilities
// Handles detection and cleanup of duplicate content, repeated fields, and data validation

// Data quality regex patterns
export const DATA_QUALITY_PATTERNS = {
  // Duplicate field detection
  duplicate_fields: /\b(title|location|price|description|agent_name|mobile)\b(?=.*\b\1\b)/gi,
  duplicate_field_values: /([a-zA-Z0-9_]+)\s*:\s*([^,\n]+).*?\1\s*:\s*\2/gi,
  repeated_property_entries: /(property_id|listing_id)\s*:\s*(\d+).*?\1\s*:\s*\2/gi,
  
  // HTML structure duplication
  html_repeated_blocks: /<div[^>]*class=["'][^"']*(unit-detail|repeated-block)[^"']*["'][^>]*>.*?<\/div>\s*(?=.*\1)/gi,
  repeated_labels: /(<label[^>]*>[^<]+<\/label>\s*<[^>]+>.*?<\/[^>]+>)\s*(?=\1)/gi,
  repeated_section_blocks: /<section[^>]*>(.*?)<\/section>\s*(?=\1)/gi,
  duplicate_labels: /<label[^>]*>(.*?)<\/label>\s*<[^>]+>.*?<\/[^>]+>\s*(?=\1)/gi,
  repeated_form_elements: /(<input[^>]*name=["']([^"']+)["'][^>]*>).*?\1/gi,
  
  // Enhanced content repetition patterns
  inline_repetition: /\b(\w{3,})\b\s+\1\b/gi,
  inline_field_duplication: /(<p[^>]*>\s*(Price|Location|Agent):[^<]+<\/p>)\s*(?=\1)/gi,
  repeated_paragraphs: /(<p[^>]*>.*?<\/p>)\s*\1/gi,
  duplicate_text_blocks: /([A-Za-z0-9\s]{20,})\s*\1/gi,
  same_paragraph_twice: /(<p[^>]*>.*?<\/p>)\s*(?=\1)/gi,
  field_duplication: /(مطلوب شقه.*?)\1/gi,
  
  // Enhanced mobile number patterns
  mobile_patterns: /(\+?2?01[0-2,5]{1}[0-9]{8}|1[0-9]{7,8}|\+2\s?1[0-9\s\-]+)/gi,
  duplicate_mobile_blocks: /(?:(\+?2?01[0-2,5]{1}[0-9]{8}).*?){2,}/gi,
  mask_if_not_logged: /(\+?2?01[0-2,5]{1}[0-9]{8})/gi,
  
  // Empty and null content
  empty_fields: /<(p|span|div)[^>]*>\s*(null|undefined|empty)?\s*<\/\1>/gi,
  null_or_empty_blocks: /<(div|p|span)[^>]*>\s*(null|undefined|empty)?\s*<\/\1>/gi,
  empty_form_fields: /<input[^>]*value=["']\s*["'][^>]*>/gi,
  placeholder_content: /<[^>]*>\s*(TODO|PLACEHOLDER|XXX|TBD)\s*<\/[^>]*>/gi,
  
  // UI and Layout Issues
  floating_header: /<(div|header)[^>]*class=["'][^"']*(top-header|toolbar|page-header)[^"']*["'][^>]*>.*?<\/\1>/gi,
  fix_header_to_sticky: /(position\s*:\s*(absolute|relative))/gi,
  floating_button_detect: /<button[^>]*class=["'][^"']*(scroll-top|to-top)[^"']*["'][^>]*>.*?<\/button>/gi,
  missing_back_to_top: /<body[^>]*>((?!<button[^>]*scroll-top).)*<\/body>/gi,
  
  // Enhanced scroll-to-top button patterns
  floating_scroll_button: /<(button|div|a)[^>]*class=["'][^"']*(scroll.*?top|back.*?top|to.*?top|up.*?arrow|floating.*?button)[^"']*["'][^>]*>.*?<\/\1>/gi,
  scroll_button_positioning: /(position\s*:\s*(fixed|absolute|sticky)).*?(bottom\s*:\s*\d+|right\s*:\s*\d+|top\s*:\s*\d+)/gi,
  missing_scroll_functionality: /<body[^>]*>((?!.*?(scroll.*?top|back.*?top|to.*?top)).)*<\/body>/gi,
  inactive_scroll_button: /<(button|div|a)[^>]*class=["'][^"']*(scroll.*?top|back.*?top)[^"']*["'][^>]*>\s*<\/\1>/gi,
  scroll_button_without_js: /<(button|div|a)[^>]*class=["'][^"']*(scroll.*?top)[^"']*["'][^>]*>(?!.*?onclick|.*?addEventListener).*?<\/\1>/gi,
  
  // Position styling detection
  position_absolute_or_relative: /(position\s*:\s*(absolute|relative))(?!.*?fixed|.*?sticky)/gi,
  should_be_fixed_position: /(position\s*:\s*(absolute|relative)).*?(top\s*:\s*0|bottom\s*:\s*0)/gi,
  missing_z_index: /(position\s*:\s*(fixed|absolute|sticky))(?!.*?z-index)/gi,
  overlay_positioning_issues: /(position\s*:\s*fixed).*?(background.*?rgba|opacity\s*:)/gi,
  
  // Data quality issues
  cluttered_data_dump: /<div[^>]*class=["']?(unit-info|property-data)[^"']?["']?[^>]*>(.*?)\2<\/div>/gi,
  malformed_html_tags: /<([a-zA-Z]+)[^>]*>[^<]*(?!<\/\1>)/gi,
  broken_links: /href=["'][^"']*\.(jpg|png|gif|pdf)["'][^>]*>\s*<\/a>/gi,
  incomplete_data_entries: /([a-zA-Z_]+)\s*:\s*$/gm,
  
  // Mobile number quality issues
  incomplete_mobile_numbers: /\+?20\s*1[0-2,5]?\s*\d{0,7}\b/gi,
  malformed_mobile_format: /\d{2,4}[-\s]\d{2,4}[-\s]\d{2,4}[-\s]\d{0,4}/gi,
  
  // Arabic text issues
  mixed_language_confusion: /[a-zA-Z]+[\u0600-\u06FF]+[a-zA-Z]+/gi,
  broken_arabic_text: /[\u0600-\u06FF]\s+[a-zA-Z]\s+[\u0600-\u06FF]/gi,
  
  // Data validation patterns
  invalid_price_format: /price\s*:\s*[^0-9$£€]/gi,
  inconsistent_units: /(sqm|m²|square meters?|متر مربع).*?(sqft|ft²|square feet|قدم مربع)/gi,
  missing_currency_indicators: /\d{4,}\s*(?![EGP|USD|£|$|€|جنيه|دولار])/gi
};

/**
 * Detect duplicate fields in property data
 * @param {Object} propertyData - Property object to check
 * @returns {string[]} Array of duplicate field names
 */
export const detectDuplicateFields = (propertyData) => {
  if (!propertyData || typeof propertyData !== 'object') return [];
  
  const duplicates = [];
  const fieldCounts = {};
  
  // Count occurrences of each field
  Object.keys(propertyData).forEach(key => {
    const normalizedKey = key.toLowerCase().replace(/[_-]/g, '');
    fieldCounts[normalizedKey] = (fieldCounts[normalizedKey] || 0) + 1;
  });
  
  // Find duplicates
  Object.entries(fieldCounts).forEach(([key, count]) => {
    if (count > 1) {
      duplicates.push(key);
    }
  });
  
  return duplicates;
};

/**
 * Detect repeated blocks in HTML content
 * @param {string} htmlContent - HTML content to analyze
 * @returns {Object[]} Array of repeated block information
 */
export const detectRepeatedBlocks = (htmlContent) => {
  if (!htmlContent) return [];
  
  const repeatedBlocks = [];
  
  Object.entries(DATA_QUALITY_PATTERNS).forEach(([patternName, pattern]) => {
    if (patternName.includes('repeated') || patternName.includes('duplicate')) {
      const matches = [...htmlContent.matchAll(pattern)];
      if (matches.length > 0) {
        repeatedBlocks.push({
          pattern: patternName,
          count: matches.length,
          examples: matches.slice(0, 3).map(match => match[0].substring(0, 100) + '...')
        });
      }
    }
  });
  
  return repeatedBlocks;
};

/**
 * Detect empty or null fields in HTML content
 * @param {string} htmlContent - HTML content to analyze
 * @returns {Object[]} Array of empty field information
 */
export const detectEmptyFields = (htmlContent) => {
  if (!htmlContent) return [];
  
  const emptyFields = [];
  const matches = [...htmlContent.matchAll(DATA_QUALITY_PATTERNS.empty_fields)];
  
  matches.forEach(match => {
    emptyFields.push({
      tag: match[1],
      content: match[2] || 'empty',
      fullMatch: match[0]
    });
  });
  
  return emptyFields;
};

/**
 * Detect inline repetition in text content
 * @param {string} text - Text content to analyze
 * @returns {string[]} Array of repeated words/phrases
 */
export const detectInlineRepetition = (text) => {
  if (!text) return [];
  
  const repetitions = [];
  const matches = [...text.matchAll(DATA_QUALITY_PATTERNS.inline_repetition)];
  
  matches.forEach(match => {
    repetitions.push(match[1]);
  });
  
  return [...new Set(repetitions)]; // Remove duplicates
};

/**
 * Clean duplicate content from property data
 * @param {Object} propertyData - Property object to clean
 * @returns {Object} Cleaned property data
 */
export const cleanDuplicateFields = (propertyData) => {
  if (!propertyData || typeof propertyData !== 'object') return propertyData;
  
  const cleaned = {};
  const seenFields = new Set();
  
  Object.entries(propertyData).forEach(([key, value]) => {
    const normalizedKey = key.toLowerCase().replace(/[_-]/g, '');
    
    if (!seenFields.has(normalizedKey)) {
      cleaned[key] = value;
      seenFields.add(normalizedKey);
    }
  });
  
  return cleaned;
};

/**
 * Clean repeated HTML blocks
 * @param {string} htmlContent - HTML content to clean
 * @returns {string} Cleaned HTML content
 */
export const cleanRepeatedBlocks = (htmlContent) => {
  if (!htmlContent) return htmlContent;
  
  let cleanedContent = htmlContent;
  
  // Remove repeated div blocks
  cleanedContent = cleanedContent.replace(DATA_QUALITY_PATTERNS.html_repeated_blocks, '$1');
  
  // Remove repeated labels
  cleanedContent = cleanedContent.replace(DATA_QUALITY_PATTERNS.repeated_labels, '$1');
  
  // Remove repeated sections
  cleanedContent = cleanedContent.replace(DATA_QUALITY_PATTERNS.repeated_section_blocks, '<section>$1</section>');
  
  return cleanedContent;
};

/**
 * Clean empty fields from HTML content
 * @param {string} htmlContent - HTML content to clean
 * @returns {string} Cleaned HTML content
 */
export const cleanEmptyFields = (htmlContent) => {
  if (!htmlContent) return htmlContent;
  
  return htmlContent.replace(DATA_QUALITY_PATTERNS.null_or_empty_blocks, '');
};

/**
 * Fix inline repetition in text
 * @param {string} text - Text content to fix
 * @returns {string} Fixed text content
 */
export const fixInlineRepetition = (text) => {
  if (!text) return text;
  
  return text.replace(DATA_QUALITY_PATTERNS.inline_repetition, '$1');
};

/**
 * Clean duplicate field values from content
 * @param {string} content - Content to clean
 * @returns {string} Cleaned content
 */
export const cleanDuplicateFieldValues = (content) => {
  if (!content) return content;
  
  return content.replace(DATA_QUALITY_PATTERNS.duplicate_field_values, '$1: $2');
};

/**
 * Fix malformed HTML tags
 * @param {string} htmlContent - HTML content to fix
 * @returns {string} Fixed HTML content
 */
export const fixMalformedHTML = (htmlContent) => {
  if (!htmlContent) return htmlContent;
  
  // This is a basic fix - in real scenarios, you'd want more sophisticated HTML parsing
  return htmlContent.replace(DATA_QUALITY_PATTERNS.malformed_html_tags, '<$1>$2</$1>');
};

/**
 * Clean incomplete mobile numbers
 * @param {string} content - Content to clean
 * @returns {string} Cleaned content with mobile numbers removed or completed
 */
export const cleanIncompleteMobileNumbers = (content) => {
  if (!content) return content;
  
  // Remove incomplete mobile numbers (less aggressive approach)
  return content.replace(DATA_QUALITY_PATTERNS.incomplete_mobile_numbers, '');
};

/**
 * Fix mixed language issues
 * @param {string} content - Content to fix
 * @returns {string} Fixed content
 */
export const fixMixedLanguageIssues = (content) => {
  if (!content) return content;
  
  let fixedContent = content;
  
  // Fix broken Arabic text by removing interrupting English characters
  fixedContent = fixedContent.replace(DATA_QUALITY_PATTERNS.broken_arabic_text, '$1 $3');
  
  return fixedContent;
};

/**
 * Clean placeholder content
 * @param {string} htmlContent - HTML content to clean
 * @returns {string} Cleaned HTML content
 */
export const cleanPlaceholderContent = (htmlContent) => {
  if (!htmlContent) return htmlContent;
  
  return htmlContent.replace(DATA_QUALITY_PATTERNS.placeholder_content, '');
};

/**
 * Detect duplicate field values in data
 * @param {string} content - Content to analyze
 * @returns {Object[]} Array of duplicate field value information
 */
export const detectDuplicateFieldValues = (content) => {
  if (!content) return [];
  
  const duplicateValues = [];
  const matches = [...content.matchAll(DATA_QUALITY_PATTERNS.duplicate_field_values)];
  
  matches.forEach(match => {
    duplicateValues.push({
      fieldName: match[1],
      value: match[2],
      fullMatch: match[0]
    });
  });
  
  return duplicateValues;
};

/**
 * Detect malformed HTML tags
 * @param {string} htmlContent - HTML content to analyze
 * @returns {Object[]} Array of malformed tag information
 */
export const detectMalformedHTML = (htmlContent) => {
  if (!htmlContent) return [];
  
  const malformedTags = [];
  const matches = [...htmlContent.matchAll(DATA_QUALITY_PATTERNS.malformed_html_tags)];
  
  matches.forEach(match => {
    malformedTags.push({
      tagName: match[1],
      fullMatch: match[0],
      issue: 'Missing closing tag'
    });
  });
  
  return malformedTags;
};

/**
 * Detect incomplete mobile numbers
 * @param {string} content - Content to analyze
 * @returns {Object[]} Array of incomplete mobile number information
 */
export const detectIncompleteMobileNumbers = (content) => {
  if (!content) return [];
  
  const incompleteMobiles = [];
  const matches = [...content.matchAll(DATA_QUALITY_PATTERNS.incomplete_mobile_numbers)];
  
  matches.forEach(match => {
    incompleteMobiles.push({
      number: match[0],
      issue: 'Incomplete mobile number format',
      suggestion: 'Complete the mobile number or remove if invalid'
    });
  });
  
  return incompleteMobiles;
};

/**
 * Detect mixed language issues in Arabic content
 * @param {string} content - Content to analyze
 * @returns {Object[]} Array of mixed language issues
 */
export const detectMixedLanguageIssues = (content) => {
  if (!content) return [];
  
  const mixedLanguageIssues = [];
  
  // Check for mixed language confusion
  const confusionMatches = [...content.matchAll(DATA_QUALITY_PATTERNS.mixed_language_confusion)];
  confusionMatches.forEach(match => {
    mixedLanguageIssues.push({
      text: match[0],
      issue: 'Mixed Arabic and English characters in single word',
      type: 'language_confusion'
    });
  });
  
  // Check for broken Arabic text
  const brokenMatches = [...content.matchAll(DATA_QUALITY_PATTERNS.broken_arabic_text)];
  brokenMatches.forEach(match => {
    mixedLanguageIssues.push({
      text: match[0],
      issue: 'Arabic text interrupted by English characters',
      type: 'broken_arabic'
    });
  });
  
  return mixedLanguageIssues;
};

/**
 * Detect invalid price formats
 * @param {string} content - Content to analyze
 * @returns {Object[]} Array of invalid price format information
 */
export const detectInvalidPriceFormats = (content) => {
  if (!content) return [];
  
  const invalidPrices = [];
  const matches = [...content.matchAll(DATA_QUALITY_PATTERNS.invalid_price_format)];
  
  matches.forEach(match => {
    invalidPrices.push({
      text: match[0],
      issue: 'Price field contains non-numeric characters',
      suggestion: 'Use numeric values with proper currency indicators'
    });
  });
  
  return invalidPrices;
};

/**
 * Detect inconsistent unit formats
 * @param {string} content - Content to analyze
 * @returns {Object[]} Array of inconsistent unit information
 */
export const detectInconsistentUnits = (content) => {
  if (!content) return [];
  
  const inconsistentUnits = [];
  const matches = [...content.matchAll(DATA_QUALITY_PATTERNS.inconsistent_units)];
  
  matches.forEach(match => {
    inconsistentUnits.push({
      text: match[0],
      issue: 'Mixed unit formats in same content',
      suggestion: 'Use consistent unit format throughout the content'
    });
  });
  
  return inconsistentUnits;
};

/**
 * Detect placeholder content
 * @param {string} htmlContent - HTML content to analyze
 * @returns {Object[]} Array of placeholder content information
 */
export const detectPlaceholderContent = (htmlContent) => {
  if (!htmlContent) return [];
  
  const placeholders = [];
  const matches = [...htmlContent.matchAll(DATA_QUALITY_PATTERNS.placeholder_content)];
  
  matches.forEach(match => {
    placeholders.push({
      content: match[1],
      fullMatch: match[0],
      issue: 'Placeholder content not replaced with actual data'
    });
  });
  
  return placeholders;
};

/**
 * Detect floating header elements that need sticky positioning
 * @param {string} htmlContent - HTML content to analyze
 * @returns {Object[]} Array of floating header information
 */
export const detectFloatingHeaders = (htmlContent) => {
  if (!htmlContent) return [];
  
  const floatingHeaders = [];
  const matches = [...htmlContent.matchAll(DATA_QUALITY_PATTERNS.floating_header)];
  
  matches.forEach(match => {
    floatingHeaders.push({
      element: match[1],
      classes: match[2],
      fullMatch: match[0],
      issue: 'Header element may need sticky positioning',
      suggestion: 'Consider adding position: sticky; top: 0; z-index: 50;'
    });
  });
  
  return floatingHeaders;
};

/**
 * Detect enhanced mobile number patterns
 * @param {string} content - Content to analyze
 * @returns {Object[]} Array of mobile number information
 */
export const detectEnhancedMobilePatterns = (content) => {
  if (!content) return [];
  
  const mobileNumbers = [];
  const matches = [...content.matchAll(DATA_QUALITY_PATTERNS.mobile_patterns)];
  
  matches.forEach(match => {
    mobileNumbers.push({
      number: match[0],
      type: 'enhanced_mobile_pattern',
      suggestion: 'Validate and format mobile number consistently'
    });
  });
  
  return mobileNumbers;
};

/**
 * Detect duplicate mobile number blocks
 * @param {string} content - Content to analyze
 * @returns {Object[]} Array of duplicate mobile block information
 */
export const detectDuplicateMobileBlocks = (content) => {
  if (!content) return [];
  
  const duplicateMobileBlocks = [];
  const matches = [...content.matchAll(DATA_QUALITY_PATTERNS.duplicate_mobile_blocks)];
  
  matches.forEach(match => {
    duplicateMobileBlocks.push({
      number: match[1],
      fullMatch: match[0],
      issue: 'Mobile number appears multiple times',
      suggestion: 'Remove duplicate mobile number entries'
    });
  });
  
  return duplicateMobileBlocks;
};

/**
 * Detect Arabic field duplication
 * @param {string} content - Content to analyze
 * @returns {Object[]} Array of Arabic field duplication information
 */
export const detectArabicFieldDuplication = (content) => {
  if (!content) return [];
  
  const arabicDuplication = [];
  const matches = [...content.matchAll(DATA_QUALITY_PATTERNS.field_duplication)];
  
  matches.forEach(match => {
    arabicDuplication.push({
      text: match[0],
      duplicatedPart: match[1],
      issue: 'Arabic text field is duplicated',
      suggestion: 'Remove duplicate Arabic text content'
    });
  });
  
  return arabicDuplication;
};

/**
 * Detect same paragraph repetition
 * @param {string} htmlContent - HTML content to analyze
 * @returns {Object[]} Array of repeated paragraph information
 */
export const detectSameParagraphTwice = (htmlContent) => {
  if (!htmlContent) return [];
  
  const repeatedParagraphs = [];
  const matches = [...htmlContent.matchAll(DATA_QUALITY_PATTERNS.same_paragraph_twice)];
  
  matches.forEach(match => {
    repeatedParagraphs.push({
      paragraph: match[1],
      issue: 'Paragraph content is repeated',
      suggestion: 'Remove duplicate paragraph content'
    });
  });
  
  return repeatedParagraphs;
};

/**
 * Detect floating scroll-to-top buttons
 * @param {string} htmlContent - HTML content to analyze
 * @returns {Object[]} Array of floating button information
 */
export const detectFloatingButtons = (htmlContent) => {
  if (!htmlContent) return [];
  
  const floatingButtons = [];
  const matches = [...htmlContent.matchAll(DATA_QUALITY_PATTERNS.floating_button_detect)];
  
  matches.forEach(match => {
    floatingButtons.push({
      button: match[0],
      classes: match[1],
      issue: 'Floating button detected - may need position optimization',
      suggestion: 'Ensure proper fixed positioning: bottom: 1rem; right: 1rem; z-index: 40;'
    });
  });
  
  return floatingButtons;
};

/**
 * Detect enhanced floating scroll-to-top buttons
 * @param {string} htmlContent - HTML content to analyze
 * @returns {Object[]} Array of enhanced floating button information
 */
export const detectEnhancedFloatingScrollButtons = (htmlContent) => {
  if (!htmlContent) return [];
  
  const scrollButtons = [];
  const matches = [...htmlContent.matchAll(DATA_QUALITY_PATTERNS.floating_scroll_button)];
  
  matches.forEach(match => {
    scrollButtons.push({
      element: match[1], // button, div, or a
      button: match[0],
      classes: match[2],
      issue: 'Enhanced scroll button detected',
      suggestion: 'Ensure proper styling and functionality for scroll-to-top behavior'
    });
  });
  
  return scrollButtons;
};

/**
 * Detect scroll button positioning issues
 * @param {string} cssContent - CSS content to analyze
 * @returns {Object[]} Array of positioning information
 */
export const detectScrollButtonPositioning = (cssContent) => {
  if (!cssContent) return [];
  
  const positioningIssues = [];
  const matches = [...cssContent.matchAll(DATA_QUALITY_PATTERNS.scroll_button_positioning)];
  
  matches.forEach(match => {
    positioningIssues.push({
      position: match[2], // fixed, absolute, sticky
      coordinates: match[3], // bottom/right/top values
      fullMatch: match[0],
      issue: 'Scroll button positioning detected',
      suggestion: 'Verify positioning is optimal for scroll-to-top functionality'
    });
  });
  
  return positioningIssues;
};

/**
 * Detect inactive scroll buttons (empty or without functionality)
 * @param {string} htmlContent - HTML content to analyze
 * @returns {Object[]} Array of inactive button information
 */
export const detectInactiveScrollButtons = (htmlContent) => {
  if (!htmlContent) return [];
  
  const inactiveButtons = [];
  const matches = [...htmlContent.matchAll(DATA_QUALITY_PATTERNS.inactive_scroll_button)];
  
  matches.forEach(match => {
    inactiveButtons.push({
      element: match[1], // button, div, or a
      classes: match[2],
      fullMatch: match[0],
      issue: 'Empty scroll button detected',
      suggestion: 'Add content/icon to scroll button and ensure click functionality'
    });
  });
  
  return inactiveButtons;
};

/**
 * Detect scroll buttons without JavaScript functionality
 * @param {string} htmlContent - HTML content to analyze
 * @returns {Object[]} Array of non-functional button information
 */
export const detectScrollButtonsWithoutJS = (htmlContent) => {
  if (!htmlContent) return [];
  
  const nonFunctionalButtons = [];
  const matches = [...htmlContent.matchAll(DATA_QUALITY_PATTERNS.scroll_button_without_js)];
  
  matches.forEach(match => {
    nonFunctionalButtons.push({
      element: match[1], // button, div, or a
      classes: match[2],
      fullMatch: match[0],
      issue: 'Scroll button without JavaScript functionality',
      suggestion: 'Add onclick handler or addEventListener for scroll-to-top behavior'
    });
  });
  
  return nonFunctionalButtons;
};

/**
 * Detect position styling issues (absolute/relative that should be fixed)
 * @param {string} cssContent - CSS content to analyze
 * @returns {Object[]} Array of position styling issues
 */
export const detectPositionStylingIssues = (cssContent) => {
  if (!cssContent) return [];
  
  const positionIssues = [];
  
  // Check for absolute/relative that should be fixed
  const shouldBeFixedMatches = [...cssContent.matchAll(DATA_QUALITY_PATTERNS.should_be_fixed_position)];
  
  shouldBeFixedMatches.forEach(match => {
    positionIssues.push({
      currentPosition: match[2], // absolute or relative
      coordinates: match[3], // top:0 or bottom:0
      fullMatch: match[0],
      issue: 'Position should likely be fixed instead of ' + match[2],
      suggestion: 'Consider using position: fixed for elements at viewport edges'
    });
  });
  
  // Check for missing z-index
  const missingZIndexMatches = [...cssContent.matchAll(DATA_QUALITY_PATTERNS.missing_z_index)];
  
  missingZIndexMatches.forEach(match => {
    positionIssues.push({
      position: match[2], // fixed, absolute, sticky
      fullMatch: match[0],
      issue: 'Positioned element missing z-index',
      suggestion: 'Add z-index to ensure proper layering (e.g., z-index: 40;)'
    });
  });
  
  return positionIssues;
};

/**
 * Detect missing scroll functionality in page body
 * @param {string} htmlContent - HTML content to analyze
 * @returns {Object[]} Array of missing scroll functionality information
 */
export const detectMissingScrollFunctionality = (htmlContent) => {
  if (!htmlContent) return [];
  
  const missingScroll = [];
  const matches = [...htmlContent.matchAll(DATA_QUALITY_PATTERNS.missing_scroll_functionality)];
  
  matches.forEach(match => {
    missingScroll.push({
      bodyContent: match[0].substring(0, 200) + '...',
      issue: 'Page body missing scroll-to-top functionality',
      suggestion: 'Add scroll-to-top button for better user experience on long pages'
    });
  });
  
  return missingScroll;
};

/**
 * Detect missing back-to-top functionality
 * @param {string} htmlContent - HTML content to analyze
 * @returns {Object[]} Array of missing back-to-top information
 */
export const detectMissingBackToTop = (htmlContent) => {
  if (!htmlContent) return [];
  
  const missingBackToTop = [];
  
  // Check if body exists but no scroll-top button
  const hasBody = /<body[^>]*>/i.test(htmlContent);
  const hasScrollTopButton = /<button[^>]*scroll-top/i.test(htmlContent);
  
  if (hasBody && !hasScrollTopButton) {
    missingBackToTop.push({
      issue: 'Missing back-to-top button',
      suggestion: 'Add scroll-to-top functionality for better UX on long pages',
      recommendedCSS: 'position: fixed; bottom: 1rem; right: 1rem; z-index: 40;'
    });
  }
  
  return missingBackToTop;
};

/**
 * Comprehensive data quality analysis
 * @param {Object} data - Data object to analyze (can be property data, HTML, etc.)
 * @returns {Object} Complete quality analysis report
 */
export const analyzeDataQuality = (data) => {
  const analysis = {
    duplicateFields: [],
    duplicateFieldValues: [],
    repeatedBlocks: [],
    emptyFields: [],
    inlineRepetitions: [],
    malformedHTML: [],
    incompleteMobileNumbers: [],
    mixedLanguageIssues: [],
    invalidPriceFormats: [],
    inconsistentUnits: [],
    placeholderContent: [],
    floatingHeaders: [],
    enhancedMobilePatterns: [],
    duplicateMobileBlocks: [],
    arabicFieldDuplication: [],
    sameParagraphTwice: [],
    // New scroll-to-top and positioning analysis
    enhancedFloatingScrollButtons: [],
    scrollButtonPositioning: [],
    inactiveScrollButtons: [],
    scrollButtonsWithoutJS: [],
    positionStylingIssues: [],
    missingScrollFunctionality: [],
    qualityScore: 100,
    suggestions: []
  };
  
  if (!data) {
    analysis.qualityScore = 0;
    analysis.suggestions.push('No data provided for analysis');
    return analysis;
  }
  
  // Analyze object properties if it's an object
  if (typeof data === 'object' && !Array.isArray(data)) {
    analysis.duplicateFields = detectDuplicateFields(data);
    
    if (analysis.duplicateFields.length > 0) {
      analysis.qualityScore -= 20;
      analysis.suggestions.push(`Remove duplicate fields: ${analysis.duplicateFields.join(', ')}`);
    }
    
    // Check for empty values
    const emptyValues = Object.entries(data).filter(([key, value]) => 
      !value || value === '' || value === null || value === undefined
    );
    
    if (emptyValues.length > 0) {
      analysis.qualityScore -= 10;
      analysis.suggestions.push(`Fill empty fields: ${emptyValues.map(([key]) => key).join(', ')}`);
    }
    
    // Convert object to string for further analysis
    const stringData = JSON.stringify(data);
    analysis.duplicateFieldValues = detectDuplicateFieldValues(stringData);
    analysis.incompleteMobileNumbers = detectIncompleteMobileNumbers(stringData);
    analysis.mixedLanguageIssues = detectMixedLanguageIssues(stringData);
    analysis.invalidPriceFormats = detectInvalidPriceFormats(stringData);
    analysis.inconsistentUnits = detectInconsistentUnits(stringData);
    analysis.enhancedMobilePatterns = detectEnhancedMobilePatterns(stringData);
    analysis.duplicateMobileBlocks = detectDuplicateMobileBlocks(stringData);
    analysis.arabicFieldDuplication = detectArabicFieldDuplication(stringData);
  }
  
  // Analyze string content (HTML or text)
  if (typeof data === 'string') {
    analysis.repeatedBlocks = detectRepeatedBlocks(data);
    analysis.emptyFields = detectEmptyFields(data);
    analysis.inlineRepetitions = detectInlineRepetition(data);
    analysis.duplicateFieldValues = detectDuplicateFieldValues(data);
    analysis.malformedHTML = detectMalformedHTML(data);
    analysis.incompleteMobileNumbers = detectIncompleteMobileNumbers(data);
    analysis.mixedLanguageIssues = detectMixedLanguageIssues(data);
    analysis.invalidPriceFormats = detectInvalidPriceFormats(data);
    analysis.inconsistentUnits = detectInconsistentUnits(data);
    analysis.placeholderContent = detectPlaceholderContent(data);
    analysis.floatingHeaders = detectFloatingHeaders(data);
    analysis.enhancedMobilePatterns = detectEnhancedMobilePatterns(data);
    analysis.duplicateMobileBlocks = detectDuplicateMobileBlocks(data);
    analysis.arabicFieldDuplication = detectArabicFieldDuplication(data);
    analysis.sameParagraphTwice = detectSameParagraphTwice(data);
    
    // New scroll-to-top and positioning detections
    analysis.enhancedFloatingScrollButtons = detectEnhancedFloatingScrollButtons(data);
    analysis.scrollButtonPositioning = detectScrollButtonPositioning(data);
    analysis.inactiveScrollButtons = detectInactiveScrollButtons(data);
    analysis.scrollButtonsWithoutJS = detectScrollButtonsWithoutJS(data);
    analysis.positionStylingIssues = detectPositionStylingIssues(data);
    analysis.missingScrollFunctionality = detectMissingScrollFunctionality(data);
    
    // Quality score deductions
    if (analysis.repeatedBlocks.length > 0) {
      analysis.qualityScore -= 15;
      analysis.suggestions.push('Remove repeated HTML blocks');
    }
    
    if (analysis.emptyFields.length > 0) {
      analysis.qualityScore -= 10;
      analysis.suggestions.push('Remove or fill empty HTML elements');
    }
    
    if (analysis.inlineRepetitions.length > 0) {
      analysis.qualityScore -= 5;
      analysis.suggestions.push('Fix repeated words in text');
    }
    
    if (analysis.duplicateFieldValues.length > 0) {
      analysis.qualityScore -= 15;
      analysis.suggestions.push('Remove duplicate field values');
    }
    
    if (analysis.malformedHTML.length > 0) {
      analysis.qualityScore -= 20;
      analysis.suggestions.push('Fix malformed HTML tags');
    }
    
    if (analysis.incompleteMobileNumbers.length > 0) {
      analysis.qualityScore -= 10;
      analysis.suggestions.push('Complete or remove invalid mobile numbers');
    }
    
    if (analysis.mixedLanguageIssues.length > 0) {
      analysis.qualityScore -= 8;
      analysis.suggestions.push('Fix mixed language text issues');
    }
    
    if (analysis.invalidPriceFormats.length > 0) {
      analysis.qualityScore -= 12;
      analysis.suggestions.push('Use proper numeric price formats');
    }
    
    if (analysis.inconsistentUnits.length > 0) {
      analysis.qualityScore -= 5;
      analysis.suggestions.push('Use consistent unit formats');
    }
    
    if (analysis.placeholderContent.length > 0) {
      analysis.qualityScore -= 15;
      analysis.suggestions.push('Replace placeholder content with actual data');
    }
    
    if (analysis.floatingHeaders.length > 0) {
      analysis.qualityScore -= 8;
      analysis.suggestions.push('Fix header positioning for better UX');
    }
    
    if (analysis.duplicateMobileBlocks.length > 0) {
      analysis.qualityScore -= 12;
      analysis.suggestions.push('Remove duplicate mobile number blocks');
    }
    
    if (analysis.arabicFieldDuplication.length > 0) {
      analysis.qualityScore -= 10;
      analysis.suggestions.push('Remove Arabic text field duplication');
    }
    
    if (analysis.sameParagraphTwice.length > 0) {
      analysis.qualityScore -= 8;
      analysis.suggestions.push('Remove repeated paragraph content');
    }
    
    // New scroll-to-top and positioning quality checks
    if (analysis.enhancedFloatingScrollButtons.length > 0) {
      analysis.qualityScore -= 5;
      analysis.suggestions.push('Optimize floating scroll button styling and positioning');
    }
    
    if (analysis.inactiveScrollButtons.length > 0) {
      analysis.qualityScore -= 10;
      analysis.suggestions.push('Add content and functionality to empty scroll buttons');
    }
    
    if (analysis.scrollButtonsWithoutJS.length > 0) {
      analysis.qualityScore -= 12;
      analysis.suggestions.push('Add JavaScript functionality to scroll-to-top buttons');
    }
    
    if (analysis.positionStylingIssues.length > 0) {
      analysis.qualityScore -= 8;
      analysis.suggestions.push('Fix position styling issues (use fixed positioning, add z-index)');
    }
    
    if (analysis.missingScrollFunctionality.length > 0) {
      analysis.qualityScore -= 6;
      analysis.suggestions.push('Add scroll-to-top button for better user experience');
    }
  }
  
  // Ensure quality score doesn't go below 0
  analysis.qualityScore = Math.max(0, analysis.qualityScore);
  
  // Overall quality assessment
  if (analysis.qualityScore >= 90) {
    analysis.status = 'Excellent';
  } else if (analysis.qualityScore >= 75) {
    analysis.status = 'Good';
  } else if (analysis.qualityScore >= 60) {
    analysis.status = 'Fair';
  } else {
    analysis.status = 'Poor';
  }
  
  return analysis;
};

/**
 * Auto-clean data based on quality analysis
 * @param {Object|string} data - Data to clean
 * @returns {Object} Object with cleaned data and cleaning report
 */
export const autoCleanData = (data) => {
  const cleaningReport = {
    originalQuality: 0,
    finalQuality: 0,
    actionsPerformed: [],
    cleanedData: data
  };
  
  // Analyze original quality
  const originalAnalysis = analyzeDataQuality(data);
  cleaningReport.originalQuality = originalAnalysis.qualityScore;
  
  // Clean object data
  if (typeof data === 'object' && !Array.isArray(data)) {
    cleaningReport.cleanedData = cleanDuplicateFields(data);
    cleaningReport.actionsPerformed.push('Removed duplicate fields');
  }
  
  // Clean string data
  if (typeof data === 'string') {
    let cleanedString = data;
    
    // Clean repeated blocks
    const originalLength = cleanedString.length;
    cleanedString = cleanRepeatedBlocks(cleanedString);
    if (cleanedString.length !== originalLength) {
      cleaningReport.actionsPerformed.push('Removed repeated HTML blocks');
    }
    
    // Clean empty fields
    cleanedString = cleanEmptyFields(cleanedString);
    cleaningReport.actionsPerformed.push('Removed empty HTML elements');
    
    // Fix inline repetitions
    cleanedString = fixInlineRepetition(cleanedString);
    cleaningReport.actionsPerformed.push('Fixed inline text repetitions');
    
    cleaningReport.cleanedData = cleanedString;
  }
  
  // Analyze final quality
  const finalAnalysis = analyzeDataQuality(cleaningReport.cleanedData);
  cleaningReport.finalQuality = finalAnalysis.qualityScore;
  cleaningReport.improvement = cleaningReport.finalQuality - cleaningReport.originalQuality;
  
  return cleaningReport;
};

/**
 * Enhanced auto-clean data with new patterns
 * @param {Object|string} data - Data to clean
 * @returns {Object} Object with cleaned data and cleaning report
 */
export const enhancedAutoCleanData = (data) => {
  const cleaningReport = {
    originalQuality: 0,
    finalQuality: 0,
    actionsPerformed: [],
    cleanedData: data
  };
  
  // Analyze original quality
  const originalAnalysis = analyzeDataQuality(data);
  cleaningReport.originalQuality = originalAnalysis.qualityScore;
  
  // Clean object data
  if (typeof data === 'object' && !Array.isArray(data)) {
    cleaningReport.cleanedData = cleanDuplicateFields(data);
    cleaningReport.actionsPerformed.push('Removed duplicate fields');
  }
  
  // Clean string data
  if (typeof data === 'string') {
    let cleanedString = data;
    
    // Clean repeated blocks
    const originalLength = cleanedString.length;
    cleanedString = cleanRepeatedBlocks(cleanedString);
    if (cleanedString.length !== originalLength) {
      cleaningReport.actionsPerformed.push('Removed repeated HTML blocks');
    }
    
    // Clean empty fields
    cleanedString = cleanEmptyFields(cleanedString);
    cleaningReport.actionsPerformed.push('Removed empty HTML elements');
    
    // Fix inline repetitions
    cleanedString = fixInlineRepetition(cleanedString);
    cleaningReport.actionsPerformed.push('Fixed inline text repetitions');
    
    // Clean duplicate field values
    cleanedString = cleanDuplicateFieldValues(cleanedString);
    cleaningReport.actionsPerformed.push('Cleaned duplicate field values');
    
    // Fix malformed HTML
    cleanedString = fixMalformedHTML(cleanedString);
    cleaningReport.actionsPerformed.push('Fixed malformed HTML tags');
    
    // Clean incomplete mobile numbers
    cleanedString = cleanIncompleteMobileNumbers(cleanedString);
    cleaningReport.actionsPerformed.push('Removed incomplete mobile numbers');
    
    // Fix mixed language issues
    cleanedString = fixMixedLanguageIssues(cleanedString);
    cleaningReport.actionsPerformed.push('Fixed mixed language issues');
    
    // Clean placeholder content
    cleanedString = cleanPlaceholderContent(cleanedString);
    cleaningReport.actionsPerformed.push('Removed placeholder content');
    
    // Fix floating headers (new)
    cleanedString = fixFloatingHeaders(cleanedString);
    cleaningReport.actionsPerformed.push('Fixed floating header positioning');
    
    // Clean duplicate mobile blocks (new)
    cleanedString = cleanDuplicateMobileBlocks(cleanedString);
    cleaningReport.actionsPerformed.push('Removed duplicate mobile number blocks');
    
    // Clean Arabic field duplication (new)
    cleanedString = cleanArabicFieldDuplication(cleanedString);
    cleaningReport.actionsPerformed.push('Removed Arabic field duplication');
    
    // Clean repeated paragraphs (new)
    cleanedString = cleanSameParagraphTwice(cleanedString);
    cleaningReport.actionsPerformed.push('Removed repeated paragraph content');
    
    cleaningReport.cleanedData = cleanedString;
  }
  
  // Analyze final quality
  const finalAnalysis = analyzeDataQuality(cleaningReport.cleanedData);
  cleaningReport.finalQuality = finalAnalysis.qualityScore;
  cleaningReport.improvement = cleaningReport.finalQuality - cleaningReport.originalQuality;
  
  return cleaningReport;
};

/**
 * Validate property data completeness
 * @param {Object} property - Property data to validate
 * @returns {Object} Validation result with missing fields and score
 */
export const validatePropertyData = (property) => {
  const requiredFields = ['title', 'location', 'price', 'property_type'];
  const optionalFields = ['description', 'agent_name', 'mobile', 'area_size', 'rooms'];
  
  const validation = {
    isValid: true,
    missingRequired: [],
    missingOptional: [],
    completenessScore: 0,
    suggestions: []
  };
  
  if (!property || typeof property !== 'object') {
    validation.isValid = false;
    validation.suggestions.push('Property data is required');
    return validation;
  }
  
  // Check required fields
  requiredFields.forEach(field => {
    if (!property[field] || property[field] === '' || property[field] === null) {
      validation.missingRequired.push(field);
      validation.isValid = false;
    }
  });
  
  // Check optional fields
  optionalFields.forEach(field => {
    if (!property[field] || property[field] === '' || property[field] === null) {
      validation.missingOptional.push(field);
    }
  });
  
  // Calculate completeness score
  const totalFields = requiredFields.length + optionalFields.length;
  const filledFields = totalFields - validation.missingRequired.length - validation.missingOptional.length;
  validation.completenessScore = Math.round((filledFields / totalFields) * 100);
  
  // Generate suggestions
  if (validation.missingRequired.length > 0) {
    validation.suggestions.push(`Add required fields: ${validation.missingRequired.join(', ')}`);
  }
  
  if (validation.missingOptional.length > 0) {
    validation.suggestions.push(`Consider adding optional fields: ${validation.missingOptional.join(', ')}`);
  }
  
  return validation;
};
