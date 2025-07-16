// Real Estate Chat Message Regex Patterns
// These patterns are used to extract and classify information from Arabic real estate WhatsApp messages

const REGEX_PATTERNS = {
  purpose: "\\b(offered|required|want|need|for sale|for rent|to sell|to buy)\\b",
  area: "\\b(New Cairo|6th October|Zayed|Nasr City|Maadi|Heliopolis|Tagamoa|Downtown)\\b",
  price: "(\\d{4,}\\s?(EGP|USD)?|\\bEGP\\s?\\d{4,})",
  description: "(?<=description[:\\s]).{10,}",
  broker_name: "\\b(Mr\\.?\\s\\w+|Eng\\.?\\s\\w+|Dr\\.?\\s\\w+|[A-Z][a-z]+\\s[A-Z][a-z]+)\\b",
  broker_mobile: "(\\+?2?01[0-2,5]{1}[0-9]{8})",
  // Enhanced mobile patterns for comprehensive matching
  mobile_with_spaces: "(\\+?20\\s*1[0-2,5]{1}\\s*[0-9]{3}\\s*[0-9]{4})",
  mobile_broken_format: "(\\d{8}\\s*\\d{2}\\s*\\d{2}\\+?)",
  mobile_generic: "(\\d{3}\\s*\\d{3}\\s*\\d{4})"
};

// SEO and Metadata Patterns
const SEO_PATTERNS = {
  detect_hashtags: "#([\\w\\d\\-_]+)",
  html_heading_tags: "<(h1|h2|h3)[^>]*>.*?</\\1>",
  meta_keywords_tag: "<meta\\s+name=[\"']keywords[\"']\\s+content=[\"']([^\"']*)[\"']\\s*/?>",
  meta_description_tag: "<meta\\s+name=[\"']description[\"']\\s+content=[\"']([^\"']*)[\"']\\s*/?>",
  og_tags: "<meta\\s+property=[\"']og:(title|description)[\"']\\s+content=[\"']([^\"']*)[\"']\\s*/?>"
};

// Data Quality and Duplicate Detection Patterns
const DATA_QUALITY_PATTERNS = {
  // Duplicate field detection
  duplicate_fields: "\\b(title|location|price|description|agent_name|mobile)\\b(?=.*\\b\\1\\b)",
  duplicate_field_values: "([a-zA-Z0-9_]+)\\s*:\\s*([^,\\n]+).*?\\1\\s*:\\s*\\2",
  repeated_property_entries: "(property_id|listing_id)\\s*:\\s*(\\d+).*?\\1\\s*:\\s*\\2",
  
  // HTML structure duplication
  html_repeated_blocks: "<div[^>]*class=[\"'][^\"']*(unit-detail|repeated-block)[^\"']*[\"'][^>]*>.*?</div>\\s*(?=.*\\1)",
  repeated_labels: "(<label[^>]*>[^<]+</label>\\s*<[^>]+>.*?</[^>]+>)\\s*(?=\\1)",
  repeated_section_blocks: "<section[^>]*>(.*?)</section>\\s*(?=\\1)",
  duplicate_labels: "<label[^>]*>(.*?)</label>\\s*<[^>]+>.*?</[^>]+>\\s*(?=\\1)",
  repeated_form_elements: "(<input[^>]*name=[\"']([^\"']+)[\"'][^>]*>).*?\\1",
  
  // Enhanced content repetition patterns
  inline_repetition: "\\b(\\w{3,})\\b\\s+\\1\\b",
  inline_field_duplication: "(<p[^>]*>\\s*(Price|Location|Agent):[^<]+</p>)\\s*(?=\\1)",
  repeated_paragraphs: "(<p[^>]*>.*?</p>)\\s*\\1",
  duplicate_text_blocks: "([A-Za-z0-9\\s]{20,})\\s*\\1",
  same_paragraph_twice: "(<p[^>]*>.*?</p>)\\s*(?=\\1)",
  field_duplication: "(مطلوب شقه.*?)\\1",
  
  // Mobile number patterns (enhanced)
  mobile_patterns: "(\\+?2?01[0-2,5]{1}[0-9]{8}|1[0-9]{7,8}|\\+2\\s?1[0-9\\s\\-]+)",
  duplicate_mobile_blocks: "(?:(\\+?2?01[0-2,5]{1}[0-9]{8}).*?){2,}",
  mask_if_not_logged: "(\\+?2?01[0-2,5]{1}[0-9]{8})",
  
  // Empty and null content
  empty_fields: "<(p|span|div)[^>]*>\\s*(null|undefined|empty)?\\s*</\\1>",
  null_or_empty_blocks: "<(div|p|span)[^>]*>\\s*(null|undefined|empty)?\\s*</\\1>",
  empty_form_fields: "<input[^>]*value=[\"']\\s*[\"'][^>]*>",
  placeholder_content: "<[^>]*>\\s*(TODO|PLACEHOLDER|XXX|TBD)\\s*</[^>]*>",
  
  // UI and Layout Issues
  floating_header: "<(div|header)[^>]*class=[\"'][^\"']*(top-header|toolbar|page-header)[^\"']*[\"'][^>]*>.*?</\\1>",
  fix_header_to_sticky: "(position\\s*:\\s*(absolute|relative))",
  floating_button_detect: "<button[^>]*class=[\"'][^\"']*(scroll-top|to-top)[^\"']*[\"'][^>]*>.*?</button>",
  missing_back_to_top: "<body[^>]*>((?!<button[^>]*scroll-top).)*</body>",
  
  // Enhanced scroll-to-top button patterns
  floating_scroll_button: "<(button|div|a)[^>]*class=[\"'][^\"']*(scroll.*?top|back.*?top|to.*?top|up.*?arrow|floating.*?button)[^\"']*[\"'][^>]*>.*?</\\1>",
  scroll_button_positioning: "(position\\s*:\\s*(fixed|absolute|sticky)).*?(bottom\\s*:\\s*\\d+|right\\s*:\\s*\\d+|top\\s*:\\s*\\d+)",
  missing_scroll_functionality: "<body[^>]*>((?!.*?(scroll.*?top|back.*?top|to.*?top)).)*</body>",
  inactive_scroll_button: "<(button|div|a)[^>]*class=[\"'][^\"']*(scroll.*?top|back.*?top)[^\"']*[\"'][^>]*>\\s*</\\1>",
  scroll_button_without_js: "<(button|div|a)[^>]*class=[\"'][^\"']*(scroll.*?top)[^\"']*[\"'][^>]*>(?!.*?onclick|.*?addEventListener).*?</\\1>",
  
  // Position styling detection
  position_absolute_or_relative: "(position\\s*:\\s*(absolute|relative))(?!.*?fixed|.*?sticky)",
  should_be_fixed_position: "(position\\s*:\\s*(absolute|relative)).*?(top\\s*:\\s*0|bottom\\s*:\\s*0)",
  missing_z_index: "(position\\s*:\\s*(fixed|absolute|sticky))(?!.*?z-index)",
  overlay_positioning_issues: "(position\\s*:\\s*fixed).*?(background.*?rgba|opacity\\s*:)",
  
  // Data quality issues
  cluttered_data_dump: "<div[^>]*class=[\"']?(unit-info|property-data)[^\"']?[\"']?[^>]*>(.*?)\\2</div>",
  malformed_html_tags: "<([a-zA-Z]+)[^>]*>[^<]*(?!</\\1>)",
  broken_links: "href=[\"'][^\"']*\\.(jpg|png|gif|pdf)[\"'][^>]*>\\s*</a>",
  incomplete_data_entries: "([a-zA-Z_]+)\\s*:\\s*$",
  
  // Mobile number quality issues
  incomplete_mobile_numbers: "\\+?20\\s*1[0-2,5]?\\s*\\d{0,7}\\b",
  malformed_mobile_format: "\\d{2,4}[-\\s]\\d{2,4}[-\\s]\\d{2,4}[-\\s]\\d{0,4}",
  
  // Arabic text issues
  mixed_language_confusion: "[a-zA-Z]+[\\u0600-\\u06FF]+[a-zA-Z]+",
  broken_arabic_text: "[\\u0600-\\u06FF]\\s+[a-zA-Z]\\s+[\\u0600-\\u06FF]",
  
  // Data validation patterns
  invalid_price_format: "price\\s*:\\s*[^0-9$£€]",
  inconsistent_units: "(sqm|m²|square meters?|متر مربع).*?(sqft|ft²|square feet|قدم مربع)",
  missing_currency_indicators: "\\d{4,}\\s*(?![EGP|USD|£|$|€|جنيه|دولار])"
};

// Arabic equivalents for enhanced matching
const ARABIC_PATTERNS = {
  purpose: "\\b(مطلوب|متاح|للبيع|للإيجار|أريد|أحتاج)\\b",
  area: "\\b(القاهرة الجديدة|أكتوبر|الشيخ زايد|مدينة نصر|المعادي|مصر الجديدة|التجمع|وسط البلد)\\b",
  property_type: "\\b(شقة|فيلا|أرض|مكتب|محل|مخزن|عقار)\\b"
};

// Function to extract information from message text
function extractMessageData(messageText) {
  const extracted = {};
  
  Object.entries(REGEX_PATTERNS).forEach(([key, pattern]) => {
    const regex = new RegExp(pattern, 'gi');
    const matches = messageText.match(regex);
    if (matches && matches.length > 0) {
      extracted[key] = matches[0];
    }
  });
  
  // Also check Arabic patterns
  Object.entries(ARABIC_PATTERNS).forEach(([key, pattern]) => {
    const regex = new RegExp(pattern, 'gi');
    const matches = messageText.match(regex);
    if (matches && matches.length > 0) {
      extracted[`${key}_arabic`] = matches[0];
    }
  });
  
  return extracted;
}

// Function to classify message purpose
function classifyPurpose(messageText) {
  const saleKeywords = /\b(for sale|to sell|offered|متاح|للبيع)\b/i;
  const rentKeywords = /\b(for rent|to rent|للإيجار)\b/i;
  const wantedKeywords = /\b(required|want|need|مطلوب|أريد|أحتاج)\b/i;
  
  if (saleKeywords.test(messageText)) return 'sale';
  if (rentKeywords.test(messageText)) return 'rent';
  if (wantedKeywords.test(messageText)) return 'wanted';
  
  return 'unknown';
}

// Function to extract price information
function extractPrice(messageText) {
  const priceRegex = /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s?(EGP|USD|جنيه|دولار)?/gi;
  const matches = messageText.match(priceRegex);
  
  if (matches && matches.length > 0) {
    const price = matches[0];
    const numericValue = price.replace(/[^\d]/g, '');
    const currency = /USD|دولار/i.test(price) ? 'USD' : 'EGP';
    
    return {
      raw: price,
      value: parseInt(numericValue),
      currency: currency
    };
  }
  
  return null;
}

// Mobile regex for easy access
const MOBILE_REGEX = "(\\+?2?01[0-2,5]{1}[0-9]{8})";

// Function to extract SEO metadata from HTML content
function extractSEOMetadata(htmlContent) {
  const seoData = {};
  
  Object.entries(SEO_PATTERNS).forEach(([key, pattern]) => {
    const regex = new RegExp(pattern, 'gi');
    const matches = htmlContent.match(regex);
    if (matches && matches.length > 0) {
      if (key === 'detect_hashtags') {
        // Extract hashtags without the # symbol
        seoData[key] = matches.map(match => match.replace('#', ''));
      } else if (key === 'meta_keywords_tag' || key === 'meta_description_tag') {
        // Extract content from meta tags
        const contentMatch = matches[0].match(/content=[\"']([^\"']*)[\"']/i);
        seoData[key] = contentMatch ? contentMatch[1] : matches[0];
      } else if (key === 'og_tags') {
        // Extract Open Graph data
        const ogMatches = [];
        matches.forEach(match => {
          const typeMatch = match.match(/property=[\"']og:([^\"']*)[\"']/i);
          const contentMatch = match.match(/content=[\"']([^\"']*)[\"']/i);
          if (typeMatch && contentMatch) {
            ogMatches.push({
              type: typeMatch[1],
              content: contentMatch[1]
            });
          }
        });
        seoData[key] = ogMatches;
      } else {
        seoData[key] = matches;
      }
    }
  });
  
  return seoData;
}

module.exports = {
  REGEX_PATTERNS,
  ARABIC_PATTERNS,
  SEO_PATTERNS,
  DATA_QUALITY_PATTERNS,
  MOBILE_REGEX,
  extractMessageData,
  classifyPurpose,
  extractPrice,
  extractSEOMetadata
};
