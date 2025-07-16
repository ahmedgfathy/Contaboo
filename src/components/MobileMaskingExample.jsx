// Example usage of mobile masking utilities
import React, { useState } from 'react';
import { maskMobile } from '../services/apiService';
import { 
  extractMobile, 
  formatMobile, 
  validateMobile, 
  getPhoneCarrier,
  isEgyptianMobile 
} from '../utils/mobileUtils';

const MobileMaskingExample = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sampleText, setSampleText] = useState(
    "مرحبا، أنا أحمد وقهاهي رقمي 01234567890 أو يمكنك التواصل على +201012345678"
  );

  const exampleMobile = "01234567890";

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg space-y-4">
      <h2 className="text-2xl font-bold mb-4">Mobile Masking Utilities Demo</h2>
      
      {/* Authentication Toggle */}
      <div className="bg-gray-800 p-4 rounded">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isLoggedIn}
            onChange={(e) => setIsLoggedIn(e.target.checked)}
            className="form-checkbox"
          />
          <span>المستخدم مسجل الدخول</span>
        </label>
      </div>

      {/* Text Masking Demo */}
      <div className="bg-gray-800 p-4 rounded">
        <h3 className="text-lg font-semibold mb-2">Text Masking</h3>
        <div className="space-y-2">
          <p className="text-gray-300">النص الأصلي:</p>
          <p className="bg-gray-700 p-2 rounded">{sampleText}</p>
          <p className="text-gray-300">النص بعد التطبيق:</p>
          <p className="bg-gray-700 p-2 rounded">{maskMobile(sampleText, isLoggedIn)}</p>
        </div>
      </div>

      {/* Mobile Utilities Demo */}
      <div className="bg-gray-800 p-4 rounded">
        <h3 className="text-lg font-semibold mb-2">Mobile Utilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-300">Extract Mobile:</p>
            <p className="bg-gray-700 p-2 rounded font-mono">
              {extractMobile(sampleText) || 'No mobile found'}
            </p>
          </div>
          <div>
            <p className="text-gray-300">Format Mobile:</p>
            <p className="bg-gray-700 p-2 rounded font-mono">
              {formatMobile(exampleMobile)}
            </p>
          </div>
          <div>
            <p className="text-gray-300">Validate Mobile:</p>
            <p className="bg-gray-700 p-2 rounded">
              {validateMobile(exampleMobile) ? '✅ Valid' : '❌ Invalid'}
            </p>
          </div>
          <div>
            <p className="text-gray-300">Phone Carrier:</p>
            <p className="bg-gray-700 p-2 rounded">
              {getPhoneCarrier(exampleMobile) || 'Unknown'}
            </p>
          </div>
          <div>
            <p className="text-gray-300">Is Egyptian Mobile:</p>
            <p className="bg-gray-700 p-2 rounded">
              {isEgyptianMobile(exampleMobile) ? '🇪🇬 Yes' : '❌ No'}
            </p>
          </div>
        </div>
      </div>

      {/* Custom Text Input */}
      <div className="bg-gray-800 p-4 rounded">
        <h3 className="text-lg font-semibold mb-2">Test Your Own Text</h3>
        <textarea
          value={sampleText}
          onChange={(e) => setSampleText(e.target.value)}
          className="w-full p-2 bg-gray-700 text-white rounded"
          rows="3"
          placeholder="أدخل نص يحتوي على أرقام هواتف..."
        />
      </div>

      {/* Mobile Regex Pattern */}
      <div className="bg-gray-800 p-4 rounded">
        <h3 className="text-lg font-semibold mb-2">Mobile Regex Pattern</h3>
        <code className="bg-gray-700 p-2 rounded block">
          {`(\\+?2?01[0-2,5]{1}[0-9]{8})`}
        </code>
        <p className="text-gray-400 text-sm mt-2">
          This pattern matches Egyptian mobile numbers in formats like:
          01234567890, +201234567890, 201234567890
        </p>
      </div>
    </div>
  );
};

export default MobileMaskingExample;
