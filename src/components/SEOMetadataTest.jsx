// Test component for SEO and metadata extraction functionality
import React, { useState } from 'react';
import { 
  extractMetaKeywords, 
  extractMetaDescription, 
  extractOpenGraphTags,
  extractPageTitle,
  extractHashtags,
  extractAllSEOMetadata,
  generatePropertySEOMetadata,
  SEO_PATTERNS 
} from '../utils/seoUtils';

const SEOMetadataTest = () => {
  // Sample HTML content with the meta tags you provided
  const [sampleHTML] = useState(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="keywords" content="New Cairo, Apartment For Sale, Luxury Homes, Real Estate Egypt" />
      <meta name="description" content="Find real estate in New Cairo. Apartments for sale, luxury homes, and more." />
      <title>Real Estate in New Cairo | Apartments, Villas, Properties</title>
      <meta property="og:title" content="New Cairo Properties for Sale" />
      <meta property="og:description" content="Search properties, apartments, and homes in New Cairo." />
      <meta name="twitter:card" content="summary_large_image" />
      <h1>Welcome to New Cairo Real Estate</h1>
      <h2>Find Your Dream Property</h2>
      <h3>Premium Locations Available</h3>
    </head>
    <body>
      <p>Check out these amazing properties! #NewCairo #RealEstate #LuxuryHomes #ApartmentForSale</p>
    </body>
    </html>
  `);

  // Sample property data
  const sampleProperty = {
    id: 1,
    property_type: "Apartment",
    location: "New Cairo",
    area_name: "Fifth Settlement",
    price: "2,500,000 EGP",
    rooms: 3,
    area_size: 150,
    description: "Luxurious 3-bedroom apartment with modern amenities",
    message: "شقة فاخرة للبيع في القاهرة الجديدة"
  };

  // Extract all metadata
  const extractedMetadata = extractAllSEOMetadata(sampleHTML);
  const generatedMetadata = generatePropertySEOMetadata(sampleProperty);

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          🔍 SEO Metadata Extraction Test
        </h1>

        {/* SEO Patterns Display */}
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">📱 SEO Regex Patterns</h2>
          <div className="grid grid-cols-1 gap-3">
            {Object.entries(SEO_PATTERNS).map(([key, pattern]) => (
              <div key={key} className="bg-gray-700 p-3 rounded">
                <p className="text-blue-400 font-medium">{key}:</p>
                <code className="text-green-400 text-sm break-all">{pattern.source}</code>
              </div>
            ))}
          </div>
        </div>

        {/* Sample HTML Display */}
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">📄 Sample HTML Content</h2>
          <div className="bg-gray-700 p-4 rounded">
            <pre className="text-green-400 text-sm overflow-x-auto whitespace-pre-wrap">
              {sampleHTML}
            </pre>
          </div>
        </div>

        {/* Extracted Metadata Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">🎯 Extracted Metadata</h2>
            <div className="space-y-4">
              <div>
                <p className="text-blue-400 font-medium">Title:</p>
                <p className="text-white bg-gray-700 p-2 rounded">{extractedMetadata.title || 'Not found'}</p>
              </div>
              <div>
                <p className="text-blue-400 font-medium">Description:</p>
                <p className="text-white bg-gray-700 p-2 rounded">{extractedMetadata.description || 'Not found'}</p>
              </div>
              <div>
                <p className="text-blue-400 font-medium">Keywords:</p>
                <p className="text-white bg-gray-700 p-2 rounded">{extractedMetadata.keywords || 'Not found'}</p>
              </div>
              <div>
                <p className="text-blue-400 font-medium">Hashtags:</p>
                <div className="flex flex-wrap gap-2">
                  {extractedMetadata.hashtags && extractedMetadata.hashtags.length > 0 ? 
                    extractedMetadata.hashtags.map((tag, index) => (
                      <span key={index} className="bg-blue-600 text-white px-2 py-1 rounded text-sm">
                        #{tag}
                      </span>
                    )) : 
                    <span className="text-gray-400">No hashtags found</span>
                  }
                </div>
              </div>
              <div>
                <p className="text-blue-400 font-medium">Open Graph:</p>
                <div className="bg-gray-700 p-2 rounded">
                  {extractedMetadata.openGraph && Object.keys(extractedMetadata.openGraph).length > 0 ? 
                    Object.entries(extractedMetadata.openGraph).map(([key, value]) => (
                      <p key={key} className="text-white text-sm">
                        <span className="text-yellow-400">{key}:</span> {value}
                      </p>
                    )) :
                    <span className="text-gray-400">No OG tags found</span>
                  }
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">🏠 Generated Property SEO</h2>
            <div className="space-y-4">
              <div>
                <p className="text-blue-400 font-medium">Generated Title:</p>
                <p className="text-white bg-gray-700 p-2 rounded">{generatedMetadata.title}</p>
              </div>
              <div>
                <p className="text-blue-400 font-medium">Generated Description:</p>
                <p className="text-white bg-gray-700 p-2 rounded">{generatedMetadata.description}</p>
              </div>
              <div>
                <p className="text-blue-400 font-medium">Generated Keywords:</p>
                <p className="text-white bg-gray-700 p-2 rounded">{generatedMetadata.keywords}</p>
              </div>
              <div>
                <p className="text-blue-400 font-medium">Generated OG Data:</p>
                <div className="bg-gray-700 p-2 rounded">
                  {Object.entries(generatedMetadata.openGraph).map(([key, value]) => (
                    <p key={key} className="text-white text-sm">
                      <span className="text-yellow-400">{key}:</span> {value}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Individual Function Tests */}
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">🧪 Individual Function Tests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-700 p-4 rounded">
              <h3 className="text-lg font-medium text-blue-400 mb-2">extractMetaKeywords()</h3>
              <p className="text-white">{extractMetaKeywords(sampleHTML) || 'Not found'}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <h3 className="text-lg font-medium text-blue-400 mb-2">extractMetaDescription()</h3>
              <p className="text-white">{extractMetaDescription(sampleHTML) || 'Not found'}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <h3 className="text-lg font-medium text-blue-400 mb-2">extractPageTitle()</h3>
              <p className="text-white">{extractPageTitle(sampleHTML) || 'Not found'}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <h3 className="text-lg font-medium text-blue-400 mb-2">extractHashtags()</h3>
              <p className="text-white">
                {extractHashtags(sampleHTML).join(', ') || 'Not found'}
              </p>
            </div>
          </div>
        </div>

        {/* Sample Property Data */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">🏡 Sample Property Data</h2>
          <div className="bg-gray-700 p-4 rounded">
            <pre className="text-green-400 text-sm overflow-x-auto">
              {JSON.stringify(sampleProperty, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SEOMetadataTest;
