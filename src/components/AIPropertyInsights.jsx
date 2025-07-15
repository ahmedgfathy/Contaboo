import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  SparklesIcon, 
  EyeIcon, 
  ArrowTrendingUpIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  HomeIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { askQuestion } from '../services/aiService';

const AIPropertyInsights = ({ property, language = 'arabic' }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

  const getPropertyInsights = async () => {
    if (insights) {
      setShowInsights(!showInsights);
      return;
    }

    setLoading(true);
    try {
      const question = language === 'arabic' 
        ? `حلل هذا العقار وقدم نصائح ذكية: ${property.property_type} في ${property.location} بسعر ${property.price}`
        : `Analyze this property and provide smart insights: ${property.property_type} in ${property.location} at ${property.price}`;

      const response = await askQuestion(question, { properties: [property] }, language);
      
      if (response.success) {
        setInsights(response.answer);
        setShowInsights(true);
      }
    } catch (error) {
      console.error('Error getting AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      {/* AI Insights Button */}
      <motion.button
        onClick={getPropertyInsights}
        disabled={loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50"
      >
        {loading ? (
          <>
            <SparklesIcon className="w-4 h-4 animate-pulse" />
            <span className="text-sm">
              {language === 'arabic' ? 'جاري التحليل...' : 'Analyzing...'}
            </span>
          </>
        ) : (
          <>
            <EyeIcon className="w-4 h-4" />
            <span className="text-sm font-medium">
              {language === 'arabic' ? 'رؤى ذكية' : 'AI Insights'}
            </span>
            <SparklesIcon className="w-4 h-4" />
          </>
        )}
      </motion.button>

      {/* AI Insights Panel */}
      {showInsights && insights && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1 bg-blue-500 rounded-full">
              <LightBulbIcon className="w-4 h-4 text-white" />
            </div>
            <h4 className="font-semibold text-blue-900">
              {language === 'arabic' ? 'تحليل ذكي' : 'AI Analysis'}
            </h4>
          </div>
          
          <div className="text-sm text-gray-700 leading-relaxed">
            {insights.split('\n').map((line, index) => (
              <p key={index} className="mb-2 last:mb-0">
                {line}
              </p>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="mt-4 pt-3 border-t border-blue-200">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <ArrowTrendingUpIcon className="w-4 h-4 mx-auto text-green-600 mb-1" />
                <span className="text-gray-600">
                  {language === 'arabic' ? 'اتجاه إيجابي' : 'Positive Trend'}
                </span>
              </div>
              <div className="text-center">
                <MapPinIcon className="w-4 h-4 mx-auto text-blue-600 mb-1" />
                <span className="text-gray-600">
                  {language === 'arabic' ? 'موقع جيد' : 'Good Location'}
                </span>
              </div>
              <div className="text-center">
                <CurrencyDollarIcon className="w-4 h-4 mx-auto text-purple-600 mb-1" />
                <span className="text-gray-600">
                  {language === 'arabic' ? 'سعر معقول' : 'Fair Price'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AIPropertyInsights;
