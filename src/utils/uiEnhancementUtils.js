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

/**
 * Enhanced scroll-to-top button analysis and fixes
 * @param {string} htmlContent - HTML content to analyze and fix
 * @returns {Object} Object with scroll button analysis and fixes
 */
export const enhanceScrollToTopFunctionality = (htmlContent) => {
  const enhancement = {
    originalContent: htmlContent,
    enhancedContent: htmlContent,
    analysis: {
      enhancedFloatingScrollButtons: [],
      inactiveScrollButtons: [],
      scrollButtonsWithoutJS: [],
      positionStylingIssues: [],
      missingScrollFunctionality: []
    },
    appliedFixes: [],
    recommendations: []
  };

  // Analyze existing scroll buttons
  enhancement.analysis.enhancedFloatingScrollButtons = detectEnhancedFloatingScrollButtons(htmlContent);
  enhancement.analysis.inactiveScrollButtons = detectInactiveScrollButtons(htmlContent);
  enhancement.analysis.scrollButtonsWithoutJS = detectScrollButtonsWithoutJS(htmlContent);
  enhancement.analysis.positionStylingIssues = detectPositionStylingIssues(htmlContent);
  enhancement.analysis.missingScrollFunctionality = detectMissingScrollFunctionality(htmlContent);

  // Apply fixes
  if (enhancement.analysis.missingScrollFunctionality.length > 0) {
    enhancement.enhancedContent = addScrollToTopButton(enhancement.enhancedContent);
    enhancement.appliedFixes.push('Added missing scroll-to-top button');
  }

  if (enhancement.analysis.inactiveScrollButtons.length > 0) {
    enhancement.enhancedContent = enhanceInactiveScrollButtons(enhancement.enhancedContent);
    enhancement.appliedFixes.push('Enhanced inactive scroll buttons with content and styling');
  }

  if (enhancement.analysis.scrollButtonsWithoutJS.length > 0) {
    enhancement.enhancedContent = addScrollButtonJavaScript(enhancement.enhancedContent);
    enhancement.appliedFixes.push('Added JavaScript functionality to scroll buttons');
  }

  // Generate recommendations
  if (enhancement.analysis.positionStylingIssues.length > 0) {
    enhancement.recommendations.push('Consider using position: fixed with proper z-index for scroll buttons');
  }

  if (enhancement.analysis.enhancedFloatingScrollButtons.length > 0) {
    enhancement.recommendations.push('Ensure scroll buttons have consistent styling and smooth scroll behavior');
  }

  return enhancement;
};

/**
 * Add a scroll-to-top button to HTML content
 * @param {string} htmlContent - HTML content to enhance
 * @returns {string} Enhanced HTML with scroll-to-top button
 */
const addScrollToTopButton = (htmlContent) => {
  const scrollToTopHTML = `
    <!-- Enhanced Scroll-to-Top Button -->
    <button id="scrollToTopBtn" class="scroll-to-top-btn" style="
      position: fixed;
      bottom: 1rem;
      right: 1rem;
      z-index: 40;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      display: none;
      cursor: pointer;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      transition: all 0.3s ease;
    " onclick="scrollToTop()">
      ↑
    </button>
    
    <script>
      // Show/hide scroll-to-top button based on scroll position
      window.addEventListener('scroll', function() {
        const scrollToTopBtn = document.getElementById('scrollToTopBtn');
        if (window.pageYOffset > 300) {
          scrollToTopBtn.style.display = 'block';
        } else {
          scrollToTopBtn.style.display = 'none';
        }
      });
      
      // Smooth scroll to top function
      function scrollToTop() {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    </script>
  `;

  // Add before closing body tag
  if (htmlContent.includes('</body>')) {
    return htmlContent.replace('</body>', scrollToTopHTML + '</body>');
  } else {
    return htmlContent + scrollToTopHTML;
  }
};

/**
 * Enhance inactive scroll buttons with content and styling
 * @param {string} htmlContent - HTML content to enhance
 * @returns {string} Enhanced HTML with improved scroll buttons
 */
const enhanceInactiveScrollButtons = (htmlContent) => {
  // Add arrow icon and styling to empty scroll buttons
  return htmlContent.replace(
    /<(button|div|a)([^>]*class=["'][^"']*(scroll.*?top|back.*?top)[^"']*["'][^>]*)>\s*<\/\1>/gi,
    '<$1$2 style="position: fixed; bottom: 1rem; right: 1rem; z-index: 40;">↑</$1>'
  );
};

/**
 * Add JavaScript functionality to scroll buttons
 * @param {string} htmlContent - HTML content to enhance
 * @returns {string} Enhanced HTML with JavaScript functionality
 */
const addScrollButtonJavaScript = (htmlContent) => {
  const scrollJS = `
    <script>
      // Enhanced scroll-to-top functionality
      document.addEventListener('DOMContentLoaded', function() {
        const scrollButtons = document.querySelectorAll('[class*="scroll"], [class*="top"], [class*="back"]');
        
        scrollButtons.forEach(button => {
          if (button.textContent.includes('↑') || button.className.includes('scroll') || button.className.includes('top')) {
            button.addEventListener('click', function(e) {
              e.preventDefault();
              window.scrollTo({
                top: 0,
                behavior: 'smooth'
              });
            });
            
            // Style the button if not already styled
            if (!button.style.position) {
              button.style.position = 'fixed';
              button.style.bottom = '1rem';
              button.style.right = '1rem';
              button.style.zIndex = '40';
            }
          }
        });
      });
    </script>
  `;

  // Add before closing body tag
  if (htmlContent.includes('</body>')) {
    return htmlContent.replace('</body>', scrollJS + '</body>');
  } else {
    return htmlContent + scrollJS;
  }
};

/**
 * Generate comprehensive scroll-to-top CSS
 * @param {Object} options - CSS generation options
 * @returns {string} Generated CSS for scroll-to-top functionality
 */
export const generateScrollToTopCSS = (options = {}) => {
  const {
    buttonSize = '50px',
    bottomPosition = '1rem',
    rightPosition = '1rem',
    backgroundColor = '#3b82f6',
    textColor = 'white',
    zIndex = '40'
  } = options;

  return `
    /* Enhanced Scroll-to-Top Button Styles */
    .scroll-to-top-btn, 
    .scroll-top,
    .back-to-top,
    .to-top {
      position: fixed !important;
      bottom: ${bottomPosition} !important;
      right: ${rightPosition} !important;
      z-index: ${zIndex} !important;
      width: ${buttonSize};
      height: ${buttonSize};
      background: ${backgroundColor};
      color: ${textColor};
      border: none;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      transition: all 0.3s ease;
      font-size: 18px;
      font-weight: bold;
    }
    
    .scroll-to-top-btn:hover,
    .scroll-top:hover,
    .back-to-top:hover,
    .to-top:hover {
      background: ${backgroundColor}dd;
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    }
    
    /* Hide by default, show on scroll */
    .scroll-to-top-btn.hidden {
      opacity: 0;
      pointer-events: none;
    }
    
    .scroll-to-top-btn.visible {
      opacity: 1;
      pointer-events: auto;
    }
    
    /* Mobile responsiveness */
    @media (max-width: 768px) {
      .scroll-to-top-btn, 
      .scroll-top,
      .back-to-top,
      .to-top {
        width: 45px;
        height: 45px;
        bottom: 1rem;
        right: 1rem;
        font-size: 16px;
      }
    }
    
    /* Arabic RTL support */
    [dir="rtl"] .scroll-to-top-btn,
    [dir="rtl"] .scroll-top,
    [dir="rtl"] .back-to-top,
    [dir="rtl"] .to-top {
      right: auto;
      left: ${rightPosition} !important;
    }
  `;
};

export default {
  fixUILayoutIssues,
  handleMobileNumber,
  cleanArabicContent,
  generateResponsiveCSS,
  formatEgyptianMobile: formatEgyptianMobile
};
