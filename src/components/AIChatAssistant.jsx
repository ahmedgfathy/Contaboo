import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SparklesIcon, 
  PaperAirplaneIcon, 
  ChartBarIcon, 
  MagnifyingGlassIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  XMarkIcon,
  MicrophoneIcon
} from '@heroicons/react/24/outline';
import { 
  analyzePropertyStats, 
  askQuestion, 
  getPropertyRecommendations, 
  analyzeMarketTrends,
  isAIAvailable,
  clearAIHistory 
} from '../services/aiService';

const AIChatAssistant = ({ language = 'arabic', isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState('general'); // general, stats, recommendations, trends
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Quick action suggestions
  const quickActions = {
    arabic: [
      { 
        id: 'stats', 
        text: 'تحليل إحصائيات العقارات', 
        icon: ChartBarIcon, 
        mode: 'stats',
        color: 'bg-blue-500'
      },
      { 
        id: 'trends', 
        text: 'اتجاهات السوق', 
        icon: ArrowTrendingUpIcon, 
        mode: 'trends',
        color: 'bg-green-500'
      },
      { 
        id: 'recommendations', 
        text: 'توصيات عقارية', 
        icon: LightBulbIcon, 
        mode: 'recommendations',
        color: 'bg-purple-500'
      },
      { 
        id: 'search', 
        text: 'البحث الذكي', 
        icon: MagnifyingGlassIcon, 
        mode: 'general',
        color: 'bg-orange-500'
      }
    ],
    english: [
      { 
        id: 'stats', 
        text: 'Analyze Statistics', 
        icon: ChartBarIcon, 
        mode: 'stats',
        color: 'bg-blue-500'
      },
      { 
        id: 'trends', 
        text: 'Market Trends', 
        icon: ArrowTrendingUpIcon, 
        mode: 'trends',
        color: 'bg-green-500'
      },
      { 
        id: 'recommendations', 
        text: 'Property Recommendations', 
        icon: LightBulbIcon, 
        mode: 'recommendations',
        color: 'bg-purple-500'
      },
      { 
        id: 'search', 
        text: 'Smart Search', 
        icon: MagnifyingGlassIcon, 
        mode: 'general',
        color: 'bg-orange-500'
      }
    ]
  };

  // Sample questions
  const sampleQuestions = {
    arabic: {
      general: [
        'ما هي أفضل المناطق للاستثمار العقاري؟',
        'كم عدد الشقق المتاحة في التجمع الخامس؟',
        'ما هو متوسط أسعار الفيلات في الشيخ زايد؟'
      ],
      stats: [
        'تحليل إحصائيات العقارات الحالية',
        'ما هو التوزيع الجغرافي للعقارات؟',
        'أي نوع عقار الأكثر طلباً؟'
      ],
      trends: [
        'كيف تغيرت أسعار العقارات هذا العام؟',
        'ما هي اتجاهات السوق العقاري؟',
        'هل هذا وقت مناسب للشراء؟'
      ],
      recommendations: [
        'أريد شقة في حدود 3 مليون جنيه',
        'أبحث عن فيلا في منطقة هادئة',
        'أريد استثمار في أرض للبناء'
      ]
    },
    english: {
      general: [
        'What are the best areas for real estate investment?',
        'How many apartments are available in Fifth Settlement?',
        'What is the average price of villas in Sheikh Zayed?'
      ],
      stats: [
        'Analyze current property statistics',
        'What is the geographical distribution of properties?',
        'Which property type is most in demand?'
      ],
      trends: [
        'How have property prices changed this year?',
        'What are the real estate market trends?',
        'Is this a good time to buy?'
      ],
      recommendations: [
        'I want an apartment within 3 million EGP budget',
        'Looking for a villa in a quiet area',
        'I want to invest in land for construction'
      ]
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Add welcome message when component mounts
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = {
        id: Date.now(),
        type: 'ai',
        content: language === 'arabic' 
          ? '👋 مرحباً! أنا مساعدك الذكي للعقارات. يمكنني تحليل البيانات، تقديم التوصيات، والإجابة على أسئلتك حول السوق العقاري المصري.'
          : '👋 Hello! I\'m your intelligent real estate assistant. I can analyze data, provide recommendations, and answer your questions about the Egyptian real estate market.',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages([welcomeMessage]);
    }
  }, [language]);

  // Check if AI is available
  const aiAvailable = isAIAvailable();

  if (!aiAvailable) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
              <SparklesIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-bold mb-2">
                {language === 'arabic' ? 'المساعد الذكي غير متاح' : 'AI Assistant Not Available'}
              </h3>
              <p className="text-gray-600 mb-6">
                {language === 'arabic' 
                  ? 'يرجى تكوين مفتاح OpenAI API لتفعيل المساعد الذكي.'
                  : 'Please configure OpenAI API key to enable the AI assistant.'
                }
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {language === 'arabic' ? 'حسناً' : 'OK'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  const handleQuickAction = async (action) => {
    setIsLoading(true);
    setChatMode(action.mode);
    
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: action.text,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      let response;
      
      switch (action.id) {
        case 'stats':
          response = await analyzePropertyStats(language);
          break;
        case 'trends':
          response = await analyzeMarketTrends('6months', language);
          break;
        case 'recommendations':
          response = await getPropertyRecommendations({ budget: '2-5M', type: 'any' }, language);
          break;
        default:
          response = await askQuestion(action.text, {}, language);
      }

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.success ? (response.analysis || response.trends || response.recommendations || response.answer) : (response.answer || response.fallback || response.error),
        timestamp: new Date().toLocaleTimeString(),
        data: response.success ? response : null,
        isFallback: response.fallback === true
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: language === 'arabic' ? 'حدث خطأ. يرجى المحاولة مرة أخرى.' : 'An error occurred. Please try again.',
        timestamp: new Date().toLocaleTimeString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    
    setIsLoading(false);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await askQuestion(currentMessage, {}, language);
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.answer || response.fallback || response.error,
        timestamp: new Date().toLocaleTimeString(),
        data: response.success ? response : null,
        isError: !response.success && !response.answer,
        isFallback: response.fallback === true
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: language === 'arabic' ? 'حدث خطأ. يرجى المحاولة مرة أخرى.' : 'An error occurred. Please try again.',
        timestamp: new Date().toLocaleTimeString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSampleQuestion = (question) => {
    setInputMessage(question);
    inputRef.current?.focus();
  };

  const clearChat = () => {
    setMessages([]);
    clearAIHistory();
    // Add welcome message back
    const welcomeMessage = {
      id: Date.now(),
      type: 'ai',
      content: language === 'arabic' 
        ? '👋 مرحباً! أنا مساعدك الذكي للعقارات. كيف يمكنني مساعدتك اليوم؟'
        : '👋 Hello! I\'m your intelligent real estate assistant. How can I help you today?',
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages([welcomeMessage]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden"
            dir={language === 'arabic' ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <SparklesIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {language === 'arabic' ? 'المساعد الذكي للعقارات' : 'AI Real Estate Assistant'}
                  </h2>
                  <p className="text-blue-100 text-sm">
                    {language === 'arabic' ? 'تحليل البيانات والتوصيات الذكية' : 'Data Analysis & Smart Recommendations'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearChat}
                  className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                  title={language === 'arabic' ? 'مسح المحادثة' : 'Clear Chat'}
                >
                  <SparklesIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {quickActions[language].map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action)}
                    disabled={isLoading}
                    className={`flex items-center gap-2 px-4 py-2 ${action.color} text-white rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap disabled:opacity-50`}
                  >
                    <action.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{action.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl p-4 ${
                    message.type === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : message.isError 
                        ? 'bg-red-50 border border-red-200' 
                        : message.isFallback
                          ? 'bg-yellow-50 border border-yellow-200'
                          : 'bg-gray-100'
                  }`}>
                    {message.isFallback && (
                      <div className="flex items-center gap-2 mb-2 text-yellow-600 text-xs">
                        <span>⚠️</span>
                        <span>{language === 'arabic' ? 'إجابة أساسية (الذكاء الاصطناعي غير متاح)' : 'Basic Answer (AI Unavailable)'}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      {message.type === 'ai' && (
                        <SparklesIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                          message.isError ? 'text-red-500' : 
                          message.isFallback ? 'text-yellow-500' : 
                          'text-blue-500'
                        }`} />
                      )}
                      <div className="flex-1">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                        <p className={`text-xs mt-2 ${
                          message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 rounded-2xl p-4">
                    <div className="flex items-center gap-2">
                      <SparklesIcon className="w-5 h-5 text-blue-500 animate-pulse" />
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Sample Questions */}
            {messages.length <= 1 && (
              <div className="px-4 py-2 border-t bg-gray-50">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {language === 'arabic' ? 'أسئلة مقترحة:' : 'Suggested Questions:'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {sampleQuestions[language][chatMode].map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSampleQuestion(question)}
                      className="text-xs px-3 py-1 bg-white border border-gray-200 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={language === 'arabic' ? 'اكتب سؤالك هنا...' : 'Type your question here...'}
                    className="w-full p-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="2"
                    disabled={isLoading}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">
                    {language === 'arabic' ? 'إرسال' : 'Send'}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIChatAssistant;
