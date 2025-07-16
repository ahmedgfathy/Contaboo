import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShareIcon, 
  ClipboardDocumentIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { generateSocialMediaContent, generateSEOHashtags } from './SEOHead';

const SocialShareModal = ({ isOpen, onClose, property, language = 'arabic' }) => {
  const [copied, setCopied] = useState(false);
  
  if (!isOpen || !property) return null;

  const propertyUrl = `https://contaboo.com/property/${property.id}`;
  const hashtags = generateSEOHashtags(property, language);
  const socialContent = generateSocialMediaContent(property, language);
  
  const shareData = {
    title: property.property_name || (language === 'arabic' ? 'عقار مميز للبيع' : 'Premium Property for Sale'),
    text: socialContent,
    url: propertyUrl,
    hashtags: hashtags.join(' ')
  };

  const socialPlatforms = [
    {
      name: 'Facebook',
      icon: '📘',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(propertyUrl)}&quote=${encodeURIComponent(socialContent)}`,
      color: 'from-blue-600 to-blue-700'
    },
    {
      name: 'Twitter',
      icon: '🐦',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(socialContent)}&url=${encodeURIComponent(propertyUrl)}`,
      color: 'from-sky-500 to-sky-600'
    },
    {
      name: 'LinkedIn',
      icon: '💼',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(propertyUrl)}&title=${encodeURIComponent(shareData.title)}&summary=${encodeURIComponent(socialContent)}`,
      color: 'from-blue-700 to-blue-800'
    },
    {
      name: 'WhatsApp',
      icon: '💬',
      url: `https://wa.me/?text=${encodeURIComponent(`${socialContent} ${propertyUrl}`)}`,
      color: 'from-green-600 to-green-700'
    },
    {
      name: 'Telegram',
      icon: '✈️',
      url: `https://t.me/share/url?url=${encodeURIComponent(propertyUrl)}&text=${encodeURIComponent(socialContent)}`,
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Instagram Stories',
      icon: '📸',
      action: () => copyToClipboard(`${socialContent}\n\n${propertyUrl}`),
      color: 'from-pink-500 to-purple-600'
    }
  ];

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handlePlatformClick = (platform) => {
    if (platform.action) {
      platform.action();
    } else {
      window.open(platform.url, '_blank', 'width=600,height=400');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <ShareIcon className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">
              {language === 'arabic' ? 'مشاركة العقار' : 'Share Property'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Property Preview */}
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <h4 className="font-semibold text-gray-800 mb-2">
            {property.property_name || property.message}
          </h4>
          <p className="text-sm text-gray-600 mb-2">
            📍 {property.location || property.regions || 'مصر'}
          </p>
          <p className="text-sm text-gray-600">
            💰 {property.price || 'السعر عند الاستفسار'}
          </p>
        </div>

        {/* Social Media Platforms */}
        <div className="space-y-3 mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">
            {language === 'arabic' ? 'مشاركة على:' : 'Share on:'}
          </h4>
          {socialPlatforms.map((platform, index) => (
            <motion.button
              key={platform.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handlePlatformClick(platform)}
              className={`w-full flex items-center gap-4 p-4 bg-gradient-to-r ${platform.color} text-white rounded-xl hover:scale-105 transition-all duration-300 shadow-lg`}
            >
              <span className="text-2xl">{platform.icon}</span>
              <span className="font-medium">{platform.name}</span>
            </motion.button>
          ))}
        </div>

        {/* Copy Content */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-800">
            {language === 'arabic' ? 'نسخ المحتوى:' : 'Copy Content:'}
          </h4>
          
          <div className="space-y-2">
            <button
              onClick={() => copyToClipboard(socialContent)}
              className="w-full flex items-center gap-3 p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <ClipboardDocumentIcon className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">
                {language === 'arabic' ? 'نسخ النص مع الهاشتاج' : 'Copy text with hashtags'}
              </span>
            </button>
            
            <button
              onClick={() => copyToClipboard(propertyUrl)}
              className="w-full flex items-center gap-3 p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <ClipboardDocumentIcon className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">
                {language === 'arabic' ? 'نسخ الرابط فقط' : 'Copy link only'}
              </span>
            </button>
          </div>
        </div>

        {/* Hashtags Preview */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <h5 className="font-semibold text-blue-800 mb-2">
            {language === 'arabic' ? 'الهاشتاج المقترحة:' : 'Suggested Hashtags:'}
          </h5>
          <div className="flex flex-wrap gap-2">
            {hashtags.slice(0, 10).map((hashtag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
              >
                {hashtag}
              </span>
            ))}
          </div>
        </div>

        {/* Success Message */}
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-green-100 text-green-800 rounded-xl text-center"
          >
            {language === 'arabic' ? '✅ تم النسخ بنجاح!' : '✅ Copied successfully!'}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default SocialShareModal;
