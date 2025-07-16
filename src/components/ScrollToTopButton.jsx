import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUpIcon } from '@heroicons/react/24/outline';

/**
 * Enhanced Scroll-to-Top Button Component
 * Integrates with the UI enhancement utilities and provides smooth scrolling
 * with Arabic language support
 */
const ScrollToTopButton = ({ 
  language = 'arabic', 
  showAfter = 300,
  position = 'bottom-right',
  theme = 'primary',
  size = 'medium'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollPercentage, setScrollPercentage] = useState(0);

  // Size configurations
  const sizeConfig = {
    small: { width: 40, height: 40, iconSize: 'h-4 w-4' },
    medium: { width: 50, height: 50, iconSize: 'h-5 w-5' },
    large: { width: 60, height: 60, iconSize: 'h-6 w-6' }
  };

  // Theme configurations
  const themeConfig = {
    primary: {
      background: 'from-blue-500 to-blue-600',
      hover: 'hover:from-blue-600 hover:to-blue-700',
      shadow: 'shadow-blue-500/25'
    },
    purple: {
      background: 'from-purple-500 to-purple-600',
      hover: 'hover:from-purple-600 hover:to-purple-700',
      shadow: 'shadow-purple-500/25'
    },
    green: {
      background: 'from-green-500 to-green-600',
      hover: 'hover:from-green-600 hover:to-green-700',
      shadow: 'shadow-green-500/25'
    }
  };

  // Position configurations
  const positionConfig = {
    'bottom-right': language === 'arabic' ? 'bottom-6 left-6' : 'bottom-6 right-6',
    'bottom-left': language === 'arabic' ? 'bottom-6 right-6' : 'bottom-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 transform -translate-x-1/2'
  };

  useEffect(() => {
    const toggleVisibility = () => {
      const scrolled = document.documentElement.scrollTop;
      const maxHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const percentage = (scrolled / maxHeight) * 100;

      setScrollPercentage(percentage);
      setIsVisible(scrolled > showAfter);
    };

    // Throttled scroll handler for performance
    let timeoutId = null;
    const handleScroll = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(toggleVisibility, 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [showAfter]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const currentSize = sizeConfig[size];
  const currentTheme = themeConfig[theme];
  const currentPosition = positionConfig[position];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ 
            opacity: 0, 
            scale: 0,
            rotate: -180
          }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            rotate: 0
          }}
          exit={{ 
            opacity: 0, 
            scale: 0,
            rotate: 180
          }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20
          }}
          className={`fixed ${currentPosition} z-50`}
        >
          {/* Progress Ring */}
          <div className="relative">
            <svg 
              className="absolute inset-0" 
              width={currentSize.width} 
              height={currentSize.height}
            >
              <circle
                cx={currentSize.width / 2}
                cy={currentSize.height / 2}
                r={currentSize.width / 2 - 2}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="2"
                fill="none"
              />
              <circle
                cx={currentSize.width / 2}
                cy={currentSize.height / 2}
                r={currentSize.width / 2 - 2}
                stroke="rgba(255,255,255,0.8)"
                strokeWidth="2"
                fill="none"
                strokeDasharray={`${2 * Math.PI * (currentSize.width / 2 - 2)}`}
                strokeDashoffset={`${2 * Math.PI * (currentSize.width / 2 - 2) * (1 - scrollPercentage / 100)}`}
                transform={`rotate(-90 ${currentSize.width / 2} ${currentSize.height / 2})`}
                className="transition-all duration-150"
              />
            </svg>

            {/* Main Button */}
            <motion.button
              onClick={scrollToTop}
              whileHover={{ 
                scale: 1.1,
                rotate: 5
              }}
              whileTap={{ 
                scale: 0.9,
                rotate: -5
              }}
              className={`
                relative w-${currentSize.width} h-${currentSize.height}
                bg-gradient-to-r ${currentTheme.background} ${currentTheme.hover}
                text-white rounded-full shadow-xl ${currentTheme.shadow}
                flex items-center justify-center
                backdrop-blur-sm border border-white/20
                transition-all duration-300
                hover:shadow-2xl
                group
              `}
              style={{ 
                width: currentSize.width, 
                height: currentSize.height 
              }}
              title={language === 'arabic' ? 'العودة للأعلى' : 'Back to Top'}
            >
              <motion.div
                animate={{ 
                  y: [0, -2, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <ChevronUpIcon className={`${currentSize.iconSize} group-hover:scale-110 transition-transform duration-200`} />
              </motion.div>

              {/* Ripple Effect */}
              <motion.div
                className="absolute inset-0 rounded-full bg-white/20"
                initial={{ scale: 0, opacity: 0 }}
                whileHover={{ 
                  scale: 1, 
                  opacity: [0, 0.5, 0],
                }}
                transition={{ duration: 0.6 }}
              />
            </motion.button>

            {/* Percentage Tooltip */}
            <AnimatePresence>
              {scrollPercentage > 10 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  className={`
                    absolute ${language === 'arabic' ? 'right-full mr-3' : 'left-full ml-3'}
                    top-1/2 transform -translate-y-1/2
                    bg-black/80 text-white text-xs px-2 py-1 rounded
                    backdrop-blur-sm border border-white/20
                    whitespace-nowrap
                  `}
                >
                  {Math.round(scrollPercentage)}%
                  <div 
                    className={`
                      absolute top-1/2 transform -translate-y-1/2
                      ${language === 'arabic' ? 'left-full' : 'right-full'}
                      w-0 h-0 border-t-2 border-b-2 border-transparent
                      ${language === 'arabic' ? 'border-l-2 border-l-black/80' : 'border-r-2 border-r-black/80'}
                    `}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTopButton;
