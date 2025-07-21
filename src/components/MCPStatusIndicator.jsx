import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';
import { testAI, isAIAvailable } from '../services/mcpAiService';

const MCPStatusIndicator = ({ language = 'arabic' }) => {
  const [status, setStatus] = useState('checking');
  const [details, setDetails] = useState(null);
  const [lastCheck, setLastCheck] = useState(null);

  const checkMCPStatus = async () => {
    setStatus('checking');
    try {
      const result = await testAI(language);
      setStatus(result.success ? 'connected' : 'error');
      setDetails(result);
      setLastCheck(new Date());
    } catch (error) {
      setStatus('error');
      setDetails({ error: error.message });
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    checkMCPStatus();
    // Check status every 30 seconds
    const interval = setInterval(checkMCPStatus, 30000);
    return () => clearInterval(interval);
  }, [language]);

  const getStatusInfo = () => {
    switch (status) {
      case 'connected':
        return {
          icon: CheckCircleIcon,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          title: language === 'arabic' ? 'MCP متصل' : 'MCP Connected',
          description: language === 'arabic' ? 
            'الذكاء الاصطناعي متاح مع قاعدة البيانات' : 
            'AI available with database access'
        };
      case 'error':
        return {
          icon: ExclamationTriangleIcon,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: language === 'arabic' ? 'خطأ في الاتصال' : 'Connection Error',
          description: language === 'arabic' ? 
            'استخدام النظام العادي بدون ذكاء اصطناعي' : 
            'Using normal system without AI'
        };
      default:
        return {
          icon: ArrowPathIcon,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          title: language === 'arabic' ? 'جاري التحقق...' : 'Checking...',
          description: language === 'arabic' ? 
            'جاري فحص حالة الاتصال' : 
            'Checking connection status'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const Icon = statusInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        inline-flex items-center gap-2 px-3 py-2 rounded-lg border
        ${statusInfo.bgColor} ${statusInfo.borderColor}
        transition-all duration-300
      `}
    >
      <Icon 
        className={`w-4 h-4 ${statusInfo.color} ${status === 'checking' ? 'animate-spin' : ''}`} 
      />
      <div className="flex flex-col">
        <span className={`text-xs font-medium ${statusInfo.color}`}>
          {statusInfo.title}
        </span>
        <span className="text-xs text-gray-500">
          {statusInfo.description}
        </span>
      </div>
      
      {lastCheck && (
        <button
          onClick={checkMCPStatus}
          className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
          title={language === 'arabic' ? 'إعادة فحص' : 'Recheck'}
        >
          <ArrowPathIcon className="w-3 h-3 text-gray-400" />
        </button>
      )}
    </motion.div>
  );
};

export default MCPStatusIndicator;
