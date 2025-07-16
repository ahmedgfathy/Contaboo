import React, { useState } from 'react';
import {
  analyzeDataQuality,
  enhancedAutoCleanData,
  detectDuplicateFieldValues,
  detectMalformedHTML,
  detectIncompleteMobileNumbers,
  detectMixedLanguageIssues,
  detectInvalidPriceFormats,
  detectInconsistentUnits,
  detectPlaceholderContent,
  detectFloatingHeaders,
  detectEnhancedMobilePatterns,
  detectDuplicateMobileBlocks,
  detectArabicFieldDuplication,
  detectSameParagraphTwice,
  validatePropertyData,
  advancedMobileMasking
} from '../utils/dataQualityUtils.js';
import { 
  fixUILayoutIssues, 
  handleMobileNumber, 
  cleanArabicContent,
  generateResponsiveCSS 
} from '../utils/uiEnhancementUtils.js';

const EnhancedDataQualityTest = () => {
  const [testData, setTestData] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [cleaningResult, setCleaningResult] = useState(null);
  const [validationResult, setValidationResult] = useState(null);

  // Sample test data with various quality issues
  const sampleTestData = {
    htmlWithIssues: `
      <div class="property-info">
        <h1>Property Details</h1>
        <p>Price: ABC123</p>
        <p>Price: ABC123</p>
        <label>Location</label><input value="">
        <label>Location</label><input value="">
        <div class="unit-detail">Villa for sale</div>
        <div class="unit-detail">Villa for sale</div>
        <p>Contact: +20 12 incomplete</p>
        <p>Area: 200 sqm and 2000 sqft</p>
        <p>Description TODO</p>
        <p>Agent: Ahmed Ahmed</p>
        <p>Status: PLACEHOLDER</p>
        <div>null</div>
        <span>empty</span>
        <section>Property info here</section>
        <section>Property info here</section>
        <input name="title" value="">
        <input name="title" value="">
      </div>
    `,
    
    propertyWithIssues: {
      title: 'Villa for Sale',
      title_duplicate: 'Villa for Sale',
      location: 'New Cairo',
      location_copy: 'New Cairo',
      price: '',
      description: null,
      agent_name: 'Ahmed المطور Ahmed',
      mobile: '+20 12 incomplete',
      area_size: '200 sqm and 2000 sqft mixed',
      status: 'TODO'
    },
    
    mixedLanguageText: `
      Welcome مرحبا to our العقارات property website
      Contact الوكيل agent for more معلومات information
      Price السعر is 500000 جنيه EGP
      Location in القاهرة الجديدة New Cairo area
    `,
    
    brokenMobileNumbers: `
      Call us at: +20 12 345
      Mobile: 01234567
      WhatsApp: +20 10 incomplete
      Contact: 012 345 6789 12
      Phone: +2012-345-67
    `,

    arabicDuplicationText: `
      مطلوب شقة في القاهرة الجديدة مطلوب شقة في القاهرة الجديدة
      للإيجار فيلا مفروشة للإيجار فيلا مفروشة
      السعر 500000 جنيه السعر 500000 جنيه
    `,

    uiLayoutIssues: `
      <div class="page-container">
        <header class="page-header" style="position: relative; top: 10px;">
          <h1>Real Estate Portal</h1>
        </header>
        <div class="toolbar" style="position: absolute;">
          <button>Search</button>
        </div>
        <main>
          <p>Property content here</p>
          <p>Property content here</p>
        </main>
      </div>
    `
  };

  const runAnalysis = (data) => {
    const analysis = analyzeDataQuality(data);
    setAnalysisResult(analysis);
    
    const cleaning = enhancedAutoCleanData(data);
    setCleaningResult(cleaning);

    // If it's a property object, also run validation
    if (typeof data === 'object' && !Array.isArray(data)) {
      const validation = validatePropertyData(data);
      setValidationResult(validation);
    } else {
      setValidationResult(null);
    }
  };

  const runSpecificDetection = (data, type) => {
    let result;
    switch (type) {
      case 'duplicateValues':
        result = detectDuplicateFieldValues(data);
        break;
      case 'malformedHTML':
        result = detectMalformedHTML(data);
        break;
      case 'incompleteMobile':
        result = detectIncompleteMobileNumbers(data);
        break;
      case 'mixedLanguage':
        result = detectMixedLanguageIssues(data);
        break;
      case 'invalidPrice':
        result = detectInvalidPriceFormats(data);
        break;
      case 'inconsistentUnits':
        result = detectInconsistentUnits(data);
        break;
      case 'placeholder':
        result = detectPlaceholderContent(data);
        break;
      default:
        result = [];
    }
    
    alert(`${type} Detection Result:\n${JSON.stringify(result, null, 2)}`);
  };

  const getQualityScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Enhanced Data Quality Testing Suite
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Sample Data Buttons */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Test with Sample Data</h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setTestData(sampleTestData.htmlWithIssues);
                  runAnalysis(sampleTestData.htmlWithIssues);
                }}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Test HTML with Issues
              </button>
              
              <button
                onClick={() => {
                  setTestData(JSON.stringify(sampleTestData.propertyWithIssues, null, 2));
                  runAnalysis(sampleTestData.propertyWithIssues);
                }}
                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Test Property Object
              </button>
              
              <button
                onClick={() => {
                  setTestData(sampleTestData.mixedLanguageText);
                  runAnalysis(sampleTestData.mixedLanguageText);
                }}
                className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              >
                Test Mixed Language Text
              </button>
              
              <button
                onClick={() => {
                  setTestData(sampleTestData.brokenMobileNumbers);
                  runAnalysis(sampleTestData.brokenMobileNumbers);
                }}
                className="w-full bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
              >
                Test Broken Mobile Numbers
              </button>
              
              <button
                onClick={() => {
                  setTestData(sampleTestData.arabicDuplicationText);
                  runAnalysis(sampleTestData.arabicDuplicationText);
                }}
                className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Test Arabic Duplication
              </button>
              
              <button
                onClick={() => {
                  setTestData(sampleTestData.uiLayoutIssues);
                  runAnalysis(sampleTestData.uiLayoutIssues);
                }}
                className="w-full bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
              >
                Test UI Layout Issues
              </button>
            </div>
          </div>

          {/* Enhanced UI Testing */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Enhanced Pattern Tests</h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  const mobileTest = handleMobileNumber('+20 12 1234567', false);
                  alert(`Mobile Test Result:\nOriginal: ${mobileTest.original}\nDisplayed: ${mobileTest.displayed}\nFormatted: ${mobileTest.formatted}\nValid: ${mobileTest.isValid}`);
                }}
                className="w-full bg-indigo-500 text-white px-3 py-2 rounded hover:bg-indigo-600 text-sm"
              >
                Test Mobile Masking
              </button>
              
              <button
                onClick={() => {
                  const uiFixes = fixUILayoutIssues(sampleTestData.uiLayoutIssues);
                  alert(`UI Fixes Applied:\n${uiFixes.appliedFixes.join('\n')}`);
                }}
                className="w-full bg-cyan-500 text-white px-3 py-2 rounded hover:bg-cyan-600 text-sm"
              >
                Test UI Fixes
              </button>
              
              <button
                onClick={() => {
                  const arabicClean = cleanArabicContent(sampleTestData.arabicDuplicationText);
                  alert(`Arabic Cleaning:\nIssues: ${arabicClean.issues.length}\nImprovements: ${arabicClean.improvements.length}`);
                }}
                className="w-full bg-emerald-500 text-white px-3 py-2 rounded hover:bg-emerald-600 text-sm"
              >
                Test Arabic Cleaning
              </button>
            </div>
          </div>
        </div>
            </div>
          </div>

          {/* Specific Detection Tests */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Specific Detection Tests</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => runSpecificDetection(testData, 'duplicateValues')}
                className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
              >
                Duplicate Values
              </button>
              
              <button
                onClick={() => runSpecificDetection(testData, 'malformedHTML')}
                className="bg-yellow-500 text-white px-2 py-1 rounded text-sm hover:bg-yellow-600"
              >
                Malformed HTML
              </button>
              
              <button
                onClick={() => runSpecificDetection(testData, 'incompleteMobile')}
                className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
              >
                Incomplete Mobile
              </button>
              
              <button
                onClick={() => runSpecificDetection(testData, 'mixedLanguage')}
                className="bg-indigo-500 text-white px-2 py-1 rounded text-sm hover:bg-indigo-600"
              >
                Mixed Language
              </button>
              
              <button
                onClick={() => runSpecificDetection(testData, 'invalidPrice')}
                className="bg-pink-500 text-white px-2 py-1 rounded text-sm hover:bg-pink-600"
              >
                Invalid Price
              </button>
              
              <button
                onClick={() => runSpecificDetection(testData, 'inconsistentUnits')}
                className="bg-teal-500 text-white px-2 py-1 rounded text-sm hover:bg-teal-600"
              >
                Inconsistent Units
              </button>
              
              <button
                onClick={() => runSpecificDetection(testData, 'placeholder')}
                className="bg-gray-500 text-white px-2 py-1 rounded text-sm hover:bg-gray-600"
              >
                Placeholder Content
              </button>
            </div>
          </div>
        </div>

        {/* Custom Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Test Data (JSON object or HTML string)
          </label>
          <textarea
            value={testData}
            onChange={(e) => setTestData(e.target.value)}
            className="w-full h-32 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your test data here..."
          />
          <button
            onClick={() => {
              try {
                const parsedData = JSON.parse(testData);
                runAnalysis(parsedData);
              } catch {
                runAnalysis(testData);
              }
            }}
            className="mt-2 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
          >
            Analyze Data Quality
          </button>
        </div>

        {/* Analysis Results */}
        {analysisResult && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Data Quality Analysis</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white rounded-lg p-4 text-center">
                <div className={`text-2xl font-bold ${getQualityScoreColor(analysisResult.qualityScore)}`}>
                  {analysisResult.qualityScore}%
                </div>
                <div className="text-gray-600">Quality Score</div>
                <div className={`text-sm font-medium ${getQualityScoreColor(analysisResult.qualityScore)}`}>
                  {analysisResult.status}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {Object.values(analysisResult).filter(Array.isArray).reduce((sum, arr) => sum + arr.length, 0)}
                </div>
                <div className="text-gray-600">Total Issues</div>
              </div>
              
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {analysisResult.suggestions.length}
                </div>
                <div className="text-gray-600">Suggestions</div>
              </div>
            </div>

            {/* Detailed Issues */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(analysisResult).map(([key, value]) => {
                if (Array.isArray(value) && value.length > 0 && key !== 'suggestions') {
                  return (
                    <div key={key} className="bg-white rounded-lg p-3">
                      <h4 className="font-semibold text-red-600 mb-2">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} ({value.length})
                      </h4>
                      <div className="text-sm text-gray-600 max-h-20 overflow-y-auto">
                        {value.slice(0, 3).map((item, index) => (
                          <div key={index} className="mb-1">
                            {typeof item === 'object' ? JSON.stringify(item, null, 1) : item}
                          </div>
                        ))}
                        {value.length > 3 && <div>... and {value.length - 3} more</div>}
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>

            {/* Suggestions */}
            {analysisResult.suggestions.length > 0 && (
              <div className="mt-4 bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Improvement Suggestions</h4>
                <ul className="list-disc list-inside text-sm text-blue-700">
                  {analysisResult.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Cleaning Results */}
        {cleaningResult && (
          <div className="bg-green-50 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4 text-green-800">Auto-Cleaning Results</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {cleaningResult.originalQuality}%
                </div>
                <div className="text-gray-600">Original Quality</div>
              </div>
              
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {cleaningResult.finalQuality}%
                </div>
                <div className="text-gray-600">Final Quality</div>
              </div>
              
              <div className="bg-white rounded-lg p-4 text-center">
                <div className={`text-2xl font-bold ${cleaningResult.improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {cleaningResult.improvement > 0 ? '+' : ''}{cleaningResult.improvement}%
                </div>
                <div className="text-gray-600">Improvement</div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold mb-2">Actions Performed</h4>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {cleaningResult.actionsPerformed.map((action, index) => (
                  <li key={index}>{action}</li>
                ))}
              </ul>
            </div>

            <div className="mt-4 bg-gray-100 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Cleaned Data (Preview)</h4>
              <pre className="text-xs text-gray-600 max-h-40 overflow-auto bg-white p-2 rounded border">
                {typeof cleaningResult.cleanedData === 'object' 
                  ? JSON.stringify(cleaningResult.cleanedData, null, 2).substring(0, 500) + '...'
                  : cleaningResult.cleanedData.substring(0, 500) + '...'
                }
              </pre>
            </div>
          </div>
        )}

        {/* Property Validation Results */}
        {validationResult && (
          <div className="bg-yellow-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-yellow-800">Property Data Validation</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white rounded-lg p-4 text-center">
                <div className={`text-2xl font-bold ${validationResult.isValid ? 'text-green-600' : 'text-red-600'}`}>
                  {validationResult.isValid ? 'VALID' : 'INVALID'}
                </div>
                <div className="text-gray-600">Validation Status</div>
              </div>
              
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {validationResult.completenessScore}%
                </div>
                <div className="text-gray-600">Completeness</div>
              </div>
              
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {validationResult.missingRequired.length}
                </div>
                <div className="text-gray-600">Missing Required</div>
              </div>
            </div>

            {validationResult.missingRequired.length > 0 && (
              <div className="bg-red-100 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-red-800 mb-2">Missing Required Fields</h4>
                <div className="flex flex-wrap gap-2">
                  {validationResult.missingRequired.map((field, index) => (
                    <span key={index} className="bg-red-200 text-red-800 px-2 py-1 rounded text-sm">
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {validationResult.missingOptional.length > 0 && (
              <div className="bg-yellow-100 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Missing Optional Fields</h4>
                <div className="flex flex-wrap gap-2">
                  {validationResult.missingOptional.map((field, index) => (
                    <span key={index} className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-sm">
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {validationResult.suggestions.length > 0 && (
              <div className="bg-blue-100 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Validation Suggestions</h4>
                <ul className="list-disc list-inside text-sm text-blue-700">
                  {validationResult.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedDataQualityTest;
