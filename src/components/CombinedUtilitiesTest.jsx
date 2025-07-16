// Combined test for both Mobile Masking and SEO Metadata Extraction
import React, { useState } from 'react';
import { maskMobile } from '../services/apiService';
import { extractMobile, MOBILE_PATTERNS } from '../utils/mobileUtils';
import { 
  extractAllSEOMetadata, 
  generatePropertySEOMetadata,
  SEO_PATTERNS 
} from '../utils/seoUtils';

const CombinedUtilitiesTest = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Sample data combining mobile numbers and SEO content
  const samplePropertyMessages = [
    {
      id: 1,
      content: "معلومات الوسيط 26433244 10 20+ فيستو عقاري #NewCairo #RealEstate",
      property: {
        property_type: "Apartment",
        location: "New Cairo",
        price: "2,500,000 EGP",
        rooms: 3
      }
    },
    {
      id: 2,
      content: "للتواصل/الوكيل 01012345678 شقة للبيع في مدينة نصر #ApartmentForSale #NasrCity",
      property: {
        property_type: "Apartment",
        location: "Nasr City",
        price: "1,800,000 EGP",
        rooms: 2
      }
    },
    {
      id: 3,
      content: "فيلا فاخرة 010 123 4567 في الشيخ زايد مساحة 300 متر #Villa #ZayedCity #LuxuryHome",
      property: {
        property_type: "Villa",
        location: "Sheikh Zayed",
        price: "5,200,000 EGP",
        area_size: 300
      }
    }
  ];

  // Sample HTML for SEO testing
  const sampleHTMLContent = `
    <meta name="keywords" content="New Cairo, Apartment For Sale, Luxury Homes, Real Estate Egypt" />
    <meta name="description" content="Find real estate in New Cairo. Apartments for sale, luxury homes, and more." />
    <title>Real Estate in New Cairo | Apartments, Villas, Properties</title>
    <meta property="og:title" content="New Cairo Properties for Sale" />
    <meta property="og:description" content="Search properties, apartments, and homes in New Cairo." />
  `;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          🔧 Combined Utilities Test
        </h1>
        <p className="text-gray-300 text-center mb-8">
          Testing Mobile Masking + SEO Metadata Extraction for Real Estate Chat Application
        </p>

        {/* Authentication Toggle */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-lg mb-8">
          <label className="flex items-center justify-center space-x-3">
            <input
              type="checkbox"
              checked={isAuthenticated}
              onChange={(e) => setIsAuthenticated(e.target.checked)}
              className="form-checkbox h-6 w-6 text-blue-600 rounded"
            />
            <span className="text-white text-xl font-medium">
              {isAuthenticated ? '🔓 Authenticated User' : '🔒 Guest User'}
            </span>
          </label>
        </div>

        {/* Patterns Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold text-blue-400 mb-4">📱 Mobile Patterns</h2>
            <div className="space-y-2">
              {MOBILE_PATTERNS.slice(0, 4).map((pattern, index) => (
                <code key={index} className="block bg-gray-700 p-2 rounded text-green-400 text-xs">
                  {pattern.source}
                </code>
              ))}
              <p className="text-gray-400 text-sm">+ {MOBILE_PATTERNS.length - 4} more patterns...</p>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold text-purple-400 mb-4">🔍 SEO Patterns</h2>
            <div className="space-y-2">
              {Object.entries(SEO_PATTERNS).slice(0, 4).map(([key, pattern]) => (
                <div key={key}>
                  <p className="text-purple-300 text-sm">{key}:</p>
                  <code className="block bg-gray-700 p-2 rounded text-green-400 text-xs">
                    {pattern.source.substring(0, 50)}...
                  </code>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Property Messages Testing */}
        <div className="space-y-6 mb-8">
          <h2 className="text-2xl font-bold text-white text-center">📨 Property Messages Testing</h2>
          
          {samplePropertyMessages.map((item) => {
            const originalContent = item.content;
            const maskedContent = maskMobile(originalContent, isAuthenticated);
            const extractedMobile = extractMobile(originalContent);
            const extractedHashtags = originalContent.match(/#[\w\d\-_]+/g) || [];
            const generatedSEO = generatePropertySEOMetadata(item.property);
            
            return (
              <div key={item.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                  <h3 className="text-white font-semibold">
                    Property Message {item.id}
                  </h3>
                </div>
                
                <div className="p-6 space-y-4">
                  {/* Original vs Masked Content */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Original Content:</p>
                      <div className="bg-gray-700 p-3 rounded">
                        <p className="text-white font-mono text-sm">{originalContent}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-2">
                        {isAuthenticated ? 'Displayed (Authenticated):' : 'Displayed (Guest):'}
                      </p>
                      <div className="bg-gray-700 p-3 rounded">
                        <p className="text-white font-mono text-sm">{maskedContent}</p>
                      </div>
                    </div>
                  </div>

                  {/* Extraction Results */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-700 p-3 rounded">
                      <p className="text-blue-400 text-sm font-medium mb-1">📱 Extracted Mobile:</p>
                      <p className="text-white font-mono text-sm">
                        {extractedMobile || 'None found'}
                      </p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded">
                      <p className="text-purple-400 text-sm font-medium mb-1">🏷️ Hashtags:</p>
                      <div className="flex flex-wrap gap-1">
                        {extractedHashtags.length > 0 ? 
                          extractedHashtags.map((tag, index) => (
                            <span key={index} className="bg-purple-600 text-white px-2 py-1 rounded text-xs">
                              {tag}
                            </span>
                          )) :
                          <span className="text-gray-400 text-xs">None found</span>
                        }
                      </div>
                    </div>
                    <div className="bg-gray-700 p-3 rounded">
                      <p className="text-green-400 text-sm font-medium mb-1">🔒 Privacy Status:</p>
                      <p className="text-white text-sm">
                        {!isAuthenticated && maskedContent !== originalContent ? 
                          '🔒 Protected' : 
                          isAuthenticated ? '🔓 Full Access' : '⚠️ No Change'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Generated SEO Metadata */}
                  <div className="bg-gray-700 p-4 rounded">
                    <p className="text-yellow-400 font-medium mb-2">🎯 Generated SEO Metadata:</p>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-400">Title:</p>
                        <p className="text-white">{generatedSEO.title}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Keywords:</p>
                        <p className="text-white">{generatedSEO.keywords}</p>
                      </div>
                      <div className="lg:col-span-2">
                        <p className="text-gray-400">Description:</p>
                        <p className="text-white">{generatedSEO.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* SEO HTML Testing */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 mb-8">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 p-4">
            <h2 className="text-white font-semibold">🌐 SEO HTML Metadata Extraction</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-400 mb-2">Sample HTML Content:</p>
                <div className="bg-gray-700 p-3 rounded">
                  <pre className="text-green-400 text-xs overflow-x-auto">
                    {sampleHTMLContent.trim()}
                  </pre>
                </div>
              </div>
              <div>
                <p className="text-gray-400 mb-2">Extracted Metadata:</p>
                <div className="bg-gray-700 p-3 rounded">
                  <pre className="text-white text-xs overflow-x-auto">
                    {JSON.stringify(extractAllSEOMetadata(sampleHTMLContent), null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold text-white mb-4 text-center">📊 Test Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-white">
                {samplePropertyMessages.length}
              </p>
              <p className="text-blue-200">Test Messages</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">
                {samplePropertyMessages.filter(msg => extractMobile(msg.content)).length}
              </p>
              <p className="text-blue-200">Mobiles Detected</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">
                {samplePropertyMessages.reduce((count, msg) => 
                  count + (msg.content.match(/#[\w\d\-_]+/g) || []).length, 0
                )}
              </p>
              <p className="text-blue-200">Hashtags Found</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">
                {isAuthenticated ? 'Full' : 'Protected'}
              </p>
              <p className="text-blue-200">Privacy Mode</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombinedUtilitiesTest;
