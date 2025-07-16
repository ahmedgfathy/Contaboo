import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  LightBulbIcon,
  SparklesIcon,
  CpuChipIcon,
  EyeIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { 
  analyzePropertyStats, 
  analyzeMarketTrends,
  isAIAvailable 
} from '../services/aiService';
import { getPropertyTypeStats } from '../services/apiService';

const AIDashboard = ({ language = 'arabic' }) => {
  const [insights, setInsights] = useState(null);
  const [trends, setTrends] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const aiAvailable = isAIAvailable();

  // Load AI insights
  const loadAIInsights = async () => {
    if (!aiAvailable) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Load data in parallel
      const [statsResponse, insightsResponse, trendsResponse] = await Promise.all([
        getPropertyTypeStats(),
        analyzePropertyStats(language),
        analyzeMarketTrends('6months', language)
      ]);

      setStats(statsResponse);
      setInsights(insightsResponse);
      setTrends(trendsResponse);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error loading AI insights:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAIInsights();
  }, [language, aiAvailable]);

  if (!aiAvailable) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <CpuChipIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-bold mb-2">
          {language === 'arabic' ? 'الذكاء الاصطناعي غير متاح' : 'AI Not Available'}
        </h3>
        <p className="text-gray-600 mb-4">
          {language === 'arabic' 
            ? 'يرجى تكوين مفتاح OpenAI API لعرض التحليلات الذكية.'
            : 'Please configure OpenAI API key to view intelligent insights.'
          }
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
          <div className="flex items-center gap-2 text-yellow-800">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <span className="font-medium">
              {language === 'arabic' ? 'كيفية التفعيل:' : 'How to Enable:'}
            </span>
          </div>
          <ul className="mt-2 space-y-1 text-yellow-700">
            <li>• {language === 'arabic' ? 'احصل على مفتاح API من OpenAI' : 'Get API key from OpenAI'}</li>
            <li>• {language === 'arabic' ? 'أضف VITE_OPENAI_API_KEY إلى ملف .env' : 'Add VITE_OPENAI_API_KEY to .env file'}</li>
            <li>• {language === 'arabic' ? 'أعد تشغيل التطبيق' : 'Restart the application'}</li>
          </ul>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <SparklesIcon className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-pulse" />
            <p className="text-lg font-medium">
              {language === 'arabic' ? 'جاري تحليل البيانات...' : 'Analyzing Data...'}
            </p>
            <p className="text-gray-600 text-sm mt-2">
              {language === 'arabic' ? 'الذكاء الاصطناعي يعمل على فهم بياناتك' : 'AI is understanding your data'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-bold text-red-700 mb-2">
            {language === 'arabic' ? 'خطأ في التحليل' : 'Analysis Error'}
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadAIInsights}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
          >
            <ArrowPathIcon className="w-4 h-4" />
            {language === 'arabic' ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={language === 'arabic' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full">
              <SparklesIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {language === 'arabic' ? 'لوحة التحليلات الذكية' : 'AI Insights Dashboard'}
              </h2>
              <p className="text-blue-100">
                {language === 'arabic' ? 'تحليل البيانات العقارية بالذكاء الاصطناعي' : 'Real Estate Data Analysis with AI'}
              </p>
            </div>
          </div>
          <button
            onClick={loadAIInsights}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            title={language === 'arabic' ? 'تحديث' : 'Refresh'}
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
        </div>
        {lastUpdated && (
          <p className="text-blue-100 text-sm mt-4">
            {language === 'arabic' ? 'آخر تحديث: ' : 'Last updated: '}
            {lastUpdated.toLocaleString(language === 'arabic' ? 'ar-EG' : 'en-US')}
          </p>
        )}
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.property_type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg border"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    {language === 'arabic' ? (
                      stat.property_type === 'apartment' ? 'شقق' :
                      stat.property_type === 'villa' ? 'فيلات' :
                      stat.property_type === 'land' ? 'أراضي' :
                      stat.property_type === 'office' ? 'مكاتب' :
                      stat.property_type === 'warehouse' ? 'مخازن' : stat.property_type
                    ) : (
                      stat.property_type.charAt(0).toUpperCase() + stat.property_type.slice(1)
                    )}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{stat.count.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <ChartBarIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Analysis */}
        {insights?.success && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <EyeIcon className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold">
                {language === 'arabic' ? 'تحليل السوق الذكي' : 'Smart Market Analysis'}
              </h3>
            </div>
            <div className="prose prose-sm max-w-none">
              <div className="bg-gray-50 rounded-lg p-4 text-sm leading-relaxed">
                {insights.analysis.split('\n').map((line, index) => (
                  <p key={index} className="mb-2 last:mb-0">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Market Trends */}
        {trends?.success && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-full">
                <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-bold">
                {language === 'arabic' ? 'اتجاهات السوق' : 'Market Trends'}
              </h3>
            </div>
            <div className="prose prose-sm max-w-none">
              <div className="bg-gray-50 rounded-lg p-4 text-sm leading-relaxed">
                {trends.trends.split('\n').map((line, index) => (
                  <p key={index} className="mb-2 last:mb-0">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* AI Capabilities Info */}
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-200 rounded-full">
            <LightBulbIcon className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-bold">
            {language === 'arabic' ? 'إمكانيات الذكاء الاصطناعي' : 'AI Capabilities'}
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold mb-2">
              {language === 'arabic' ? '📊 تحليل البيانات' : '📊 Data Analysis'}
            </h4>
            <p className="text-gray-600">
              {language === 'arabic' 
                ? 'تحليل إحصائيات العقارات وتقديم رؤى ذكية حول السوق'
                : 'Analyze property statistics and provide intelligent market insights'
              }
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold mb-2">
              {language === 'arabic' ? '🔍 البحث الذكي' : '🔍 Smart Search'}
            </h4>
            <p className="text-gray-600">
              {language === 'arabic' 
                ? 'البحث الذكي في قاعدة البيانات والإجابة على الاستفسارات'
                : 'Intelligent database search and query answering'
              }
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold mb-2">
              {language === 'arabic' ? '💡 التوصيات' : '💡 Recommendations'}
            </h4>
            <p className="text-gray-600">
              {language === 'arabic' 
                ? 'تقديم توصيات عقارية مخصصة بناءً على المعايير المحددة'
                : 'Provide personalized property recommendations based on criteria'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDashboard;
