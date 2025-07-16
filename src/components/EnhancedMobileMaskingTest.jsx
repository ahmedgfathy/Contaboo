// Enhanced test for mobile masking with real patterns from images
import React, { useState } from 'react';
import { maskMobile } from '../services/apiService';
import { extractMobile, MOBILE_PATTERNS } from '../utils/mobileUtils';

const EnhancedMobileMaskingTest = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Test cases based on the patterns seen in the images
  const testCases = [
    {
      title: "معلومات الوسيط - Pattern from image",
      text: "معلومات الوسيط 26433244 10 20+ فيستو عقاري",
      category: "Real patterns from app"
    },
    {
      title: "للتواصل/الوكيل - Contact pattern",
      text: "للتواصل/الوكيل 26433244 10 20+",
      category: "Real patterns from app"
    },
    {
      title: "Standard Egyptian mobile",
      text: "اتصل بي على 01012345678",
      category: "Standard patterns"
    },
    {
      title: "International format",
      text: "رقمي +201012345678",
      category: "Standard patterns"
    },
    {
      title: "Mobile with spaces",
      text: "هاتف 010 123 4567",
      category: "Formatted patterns"
    },
    {
      title: "Multiple mobiles in text",
      text: "مطور عقاري ومستشار في شراء وبيع العقارات 010 123 4567 أو 26433244 10 20+",
      category: "Complex patterns"
    },
    {
      title: "Property description with mobile",
      text: "شقة للبيع - مطور عقاري 26433244 10 20+ ومستشار في شراء وبيع العقارات",
      category: "Real patterns from app"
    },
    {
      title: "الوصف التفصيلي pattern",
      text: "عقار في المرحلة العاشرة مساحة 230 متر مربع موقع ممتاز ومناسب للاستثمار 01234567890",
      category: "Complex patterns"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          🧪 Enhanced Mobile Masking Test
        </h1>
        
        {/* Authentication Toggle */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={isAuthenticated}
              onChange={(e) => setIsAuthenticated(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="text-white text-lg">
              {isAuthenticated ? '🔓 Authenticated User' : '🔒 Guest User'}
            </span>
          </label>
        </div>

        {/* Mobile Patterns Info */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold text-white mb-3">📱 Mobile Patterns Supported</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {MOBILE_PATTERNS.map((pattern, index) => (
              <code key={index} className="bg-gray-700 p-2 rounded text-sm text-green-400">
                {pattern.source}
              </code>
            ))}
          </div>
        </div>

        {/* Test Cases */}
        <div className="space-y-6">
          {testCases.map((testCase, index) => {
            const originalText = testCase.text;
            const maskedText = maskMobile(originalText, isAuthenticated);
            const extractedMobile = extractMobile(originalText);
            const wasMasked = maskedText !== originalText;
            
            return (
              <div key={index} className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    {testCase.title}
                  </h3>
                  <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                    {testCase.category}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Original Text:</p>
                    <p className="bg-gray-700 p-3 rounded text-white font-mono text-sm">
                      {originalText}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-gray-400 text-sm mb-1">
                      {isAuthenticated ? 'Displayed (Authenticated):' : 'Displayed (Guest):'}
                    </p>
                    <p className="bg-gray-700 p-3 rounded text-white font-mono text-sm">
                      {maskedText}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400 mb-1">Extracted Mobile:</p>
                      <p className="bg-gray-600 p-2 rounded text-white font-mono">
                        {extractedMobile || 'None found'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1">Masking Applied:</p>
                      <p className="bg-gray-600 p-2 rounded text-center">
                        {wasMasked ? '✅ Yes' : '❌ No'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1">Privacy Status:</p>
                      <p className="bg-gray-600 p-2 rounded text-center">
                        {!isAuthenticated && wasMasked ? '🔒 Protected' : 
                         isAuthenticated ? '🔓 Full Access' : '⚠️ No Change'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-lg mt-8">
          <h2 className="text-xl font-semibold text-white mb-3">📊 Test Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-white">{testCases.length}</p>
              <p className="text-blue-200">Total Tests</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">
                {testCases.filter(tc => extractMobile(tc.text)).length}
              </p>
              <p className="text-blue-200">Mobiles Detected</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">
                {testCases.filter(tc => !isAuthenticated && maskMobile(tc.text, false) !== tc.text).length}
              </p>
              <p className="text-blue-200">Successfully Masked</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedMobileMaskingTest;
