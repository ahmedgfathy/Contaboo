import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';
import AIChatAssistant from './AIChatAssistant';
import { isAIAvailable } from '../services/aiService';

const AIFloatingButton = ({ language = 'arabic' }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const aiAvailable = isAIAvailable();

  if (!aiAvailable) {
    return null; // Don't show the button if AI is not available
  }

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className={`fixed ${language === 'arabic' ? 'left-6' : 'right-6'} bottom-6 z-40`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <motion.button
          onClick={() => setIsChatOpen(!isChatOpen)}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          className="relative group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Button Background */}
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:shadow-blue-500/25 transition-all duration-300">
            <AnimatePresence mode="wait">
              {isChatOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <XMarkIcon className="w-7 h-7" />
                </motion.div>
              ) : (
                <motion.div
                  key="ai"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <SparklesIcon className="w-7 h-7" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Pulse Effect */}
          <div className="absolute inset-0 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-ping opacity-20"></div>
          
          {/* Tooltip */}
          <AnimatePresence>
            {isHovered && !isChatOpen && (
              <motion.div
                initial={{ opacity: 0, x: language === 'arabic' ? 10 : -10, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: language === 'arabic' ? 10 : -10, scale: 0.8 }}
                className={`absolute top-1/2 -translate-y-1/2 ${
                  language === 'arabic' ? 'right-20' : 'left-20'
                } bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg`}
              >
                {language === 'arabic' ? 'المساعد الذكي' : 'AI Assistant'}
                <div className={`absolute top-1/2 -translate-y-1/2 ${
                  language === 'arabic' ? '-left-1' : '-right-1'
                } w-2 h-2 bg-gray-900 rotate-45`}></div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Notification Dot (for new features) */}
        <motion.div
          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="text-white text-xs font-bold">!</span>
        </motion.div>
      </motion.div>

      {/* Quick Action Mini Menu */}
      <AnimatePresence>
        {isHovered && !isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed ${language === 'arabic' ? 'left-6' : 'right-6'} bottom-24 z-30`}
          >
            <div className="flex flex-col gap-2">
              {/* Quick Stats Button */}
              <motion.button
                initial={{ opacity: 0, x: language === 'arabic' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                onClick={() => {
                  setIsChatOpen(true);
                  // Auto-trigger stats analysis
                  setTimeout(() => {
                    // This could trigger a quick stats analysis
                  }, 500);
                }}
                className="w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center text-blue-500 hover:bg-blue-50 transition-colors group"
                title={language === 'arabic' ? 'تحليل سريع' : 'Quick Analysis'}
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  📊
                </motion.div>
              </motion.button>

              {/* Quick Search Button */}
              <motion.button
                initial={{ opacity: 0, x: language === 'arabic' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => setIsChatOpen(true)}
                className="w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center text-green-500 hover:bg-green-50 transition-colors"
                title={language === 'arabic' ? 'بحث ذكي' : 'Smart Search'}
              >
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  transition={{ duration: 0.2 }}
                >
                  🔍
                </motion.div>
              </motion.button>

              {/* Quick Recommendations Button */}
              <motion.button
                initial={{ opacity: 0, x: language === 'arabic' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                onClick={() => setIsChatOpen(true)}
                className="w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center text-purple-500 hover:bg-purple-50 transition-colors"
                title={language === 'arabic' ? 'توصيات' : 'Recommendations'}
              >
                <motion.div
                  whileHover={{ rotate: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  💡
                </motion.div>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Chat Assistant Modal */}
      <AIChatAssistant
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        language={language}
      />
    </>
  );
};

export default AIFloatingButton;
