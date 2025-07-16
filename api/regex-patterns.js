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
  MOBILE_REGEX,
  extractMessageData,
  classifyPurpose,
  extractPrice,
  extractSEOMetadata
};
