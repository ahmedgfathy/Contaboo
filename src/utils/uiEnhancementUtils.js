// UI Enhancement Utilities
// Specific utilities for fixing common UI issues in Arabic real estate applications

import { 
  detectFloatingHeaders, 
  fixFloatingHeaders, 
  advancedMobileMasking,
  detectEnhancedMobilePatterns,
  cleanDuplicateMobileBlocks,
  detectEnhancedFloatingScrollButtons,
  detectScrollButtonPositioning,
  detectInactiveScrollButtons,
  detectScrollButtonsWithoutJS,
  detectPositionStylingIssues,
  detectMissingScrollFunctionality
} from './dataQualityUtils.js';

/**
 * Fix common UI layout issues
 * @param {string} htmlContent - HTML content to fix
 * @returns {Object} Object with fixed HTML and applied fixes
 */
export const fixUILayoutIssues = (htmlContent) => {
  const fixes = {
    originalContent: htmlContent,
    fixedContent: htmlContent,
    appliedFixes: []
  };

  // Fix floating headers
  const floatingHeaders = detectFloatingHeaders(htmlContent);
  if (floatingHeaders.length > 0) {
    fixes.fixedContent = fixFloatingHeaders(fixes.fixedContent);
    fixes.appliedFixes.push(`Fixed ${floatingHeaders.length} floating header(s)`);
  }

  // Add responsive mobile fixes
  fixes.fixedContent = addResponsiveMobileFixes(fixes.fixedContent);
  fixes.appliedFixes.push('Added responsive mobile CSS fixes');

  return fixes;
};

/**
 * Add responsive mobile CSS fixes to content
 * @param {string} content - Content to enhance
 * @returns {string} Enhanced content with mobile fixes
 */
const addResponsiveMobileFixes = (content) => {
  const mobileCSSFixes = `
    <style>
      /* Responsive Header Fixes */
      .top-header, .toolbar, .page-header {
        position: sticky !important;
        top: 0 !important;
        z-index: 50 !important;
        background: white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }

      /* Mobile-first responsive design */
      @media (max-width: 768px) {
        .property-card {
          margin: 0.5rem;
          padding: 1rem;
        }
        
        .property-grid {
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        
        .mobile-hidden {
          display: none;
        }
        
        .arabic-text {
          direction: rtl;
          text-align: right;
        }
      }

      /* Prevent text overflow in Arabic content */
      .property-description {
        word-wrap: break-word;
        overflow-wrap: break-word;
        hyphens: auto;
      }

      /* Ensure proper mobile number display */
      .mobile-number {
        font-family: monospace;
        direction: ltr;
        unicode-bidi: embed;
      }
    </style>
  `;

  // Only add if not already present
  if (!content.includes('Responsive Header Fixes')) {
    return content + mobileCSSFixes;
  }
  return content;
};

/**
 * Enhanced mobile number handling for components
 * @param {string} mobileNumber - Mobile number to process
 * @param {boolean} isLoggedIn - Whether user is logged in
 * @param {Object} options - Additional options
 * @returns {Object} Processed mobile number data
 */
export const handleMobileNumber = (mobileNumber, isLoggedIn = false, options = {}) => {
  const result = {
    original: mobileNumber,
    displayed: '',
    isValid: false,
    formatted: '',
    masked: ''
  };

  if (!mobileNumber) return result;

  // Detect mobile patterns
  const patterns = detectEnhancedMobilePatterns(mobileNumber);
  result.isValid = patterns.length > 0;

  // Format the number
  result.formatted = formatEgyptianMobile(mobileNumber);
  
  // Apply masking based on login status
  result.masked = advancedMobileMasking(mobileNumber, isLoggedIn);
  
  // Set displayed value
  result.displayed = isLoggedIn ? result.formatted : result.masked;

  return result;
};

/**
 * Format Egyptian mobile numbers consistently
 * @param {string} mobileNumber - Mobile number to format
 * @returns {string} Formatted mobile number
 */
const formatEgyptianMobile = (mobileNumber) => {
  if (!mobileNumber) return '';

  // Remove all non-digits
  const digits = mobileNumber.replace(/\D/g, '');
  
  // Handle different Egyptian mobile formats
  if (digits.startsWith('2010') || digits.startsWith('2011') || digits.startsWith('2012') || digits.startsWith('2015')) {
    // Full international format: +20 10 xxxx xxxx
    return `+${digits.substring(0, 2)} ${digits.substring(2, 4)} ${digits.substring(4, 8)} ${digits.substring(8)}`;
  } else if (digits.startsWith('010') || digits.startsWith('011') || digits.startsWith('012') || digits.startsWith('015')) {
    // Local format: 010 xxxx xxxx -> +20 10 xxxx xxxx
    return `+20 ${digits.substring(1, 3)} ${digits.substring(3, 7)} ${digits.substring(7)}`;
  } else if (digits.length === 10 && (digits.startsWith('10') || digits.startsWith('11') || digits.startsWith('12') || digits.startsWith('15'))) {
    // Without country code: 10 xxxx xxxx -> +20 10 xxxx xxxx
    return `+20 ${digits.substring(0, 2)} ${digits.substring(2, 6)} ${digits.substring(6)}`;
  }

  return mobileNumber; // Return original if no pattern matches
};

/**
 * Clean and validate Arabic content
 * @param {string} content - Arabic content to clean
 * @returns {Object} Cleaned content with validation results
 */
export const cleanArabicContent = (content) => {
  const result = {
    original: content,
    cleaned: content,
    issues: [],
    improvements: []
  };

  if (!content) return result;

  // Remove duplicate Arabic field content
  const arabicDuplicationPattern = /(مطلوب شقه.*?)\1/g;
  if (arabicDuplicationPattern.test(content)) {
    result.cleaned = content.replace(arabicDuplicationPattern, '$1');
    result.improvements.push('Removed duplicate Arabic field content');
  }

  // Fix mixed language issues within words
  const mixedLanguagePattern = /([a-zA-Z]+[\u0600-\u06FF]+[a-zA-Z]+)/g;
  const mixedMatches = content.match(mixedLanguagePattern);
  if (mixedMatches) {
    result.issues.push(`Found ${mixedMatches.length} mixed language word(s)`);
  }

  // Ensure proper RTL direction for Arabic text
  if (/[\u0600-\u06FF]/.test(content)) {
    if (!content.includes('dir="rtl"') && !content.includes('direction: rtl')) {
      result.issues.push('Arabic content may need RTL direction');
    }
  }

  return result;
};

/**
 * Generate CSS for sticky headers and mobile responsiveness
 * @param {Object} options - CSS generation options
 * @returns {string} Generated CSS
 */
export const generateResponsiveCSS = (options = {}) => {
  const {
    headerSelector = '.top-header, .toolbar, .page-header',
    mobileBreakpoint = '768px',
    includeArabicSupport = true
  } = options;

  return `
    /* Auto-generated responsive CSS for real estate platform */
    ${headerSelector} {
      position: sticky !important;
      top: 0 !important;
      z-index: 50 !important;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
    }

    @media (max-width: ${mobileBreakpoint}) {
      .property-container {
        padding: 0.5rem;
      }
      
      .property-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      
      .mobile-number {
        font-size: 0.9rem;
        font-family: monospace;
        direction: ltr;
      }
    }

    ${includeArabicSupport ? `
    /* Arabic text support */
    .arabic-content {
      direction: rtl;
      text-align: right;
      font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
    }
    
    .property-description {
      word-wrap: break-word;
      overflow-wrap: break-word;
      hyphens: auto;
    }
    ` : ''}
  `;
};

export default {
  fixUILayoutIssues,
  handleMobileNumber,
  cleanArabicContent,
  generateResponsiveCSS,
  formatEgyptianMobile: formatEgyptianMobile
};
