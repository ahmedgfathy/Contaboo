// Real API service for backend communication
// This replaces the mock database with actual HTTP calls to the Neon database
import { maskMobile as utilsMaskMobile } from '../utils/mobileUtils.js';

// Use environment variable or fallback to localhost for development
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : (import.meta.env.VITE_API_URL || 'http://localhost:3001/api');

// Fallback URLs for development (in case primary server is down)
const FALLBACK_URLS = [
  'http://localhost:3001/api',
  'http://localhost:3002/api'
];

// Helper function to handle API calls with fallback
const apiCall = async (endpoint, options = {}) => {
  const urlsToTry = process.env.NODE_ENV === 'production' 
    ? [API_BASE_URL]
    : [API_BASE_URL, ...FALLBACK_URLS.filter(url => url !== API_BASE_URL)];

  let lastError;
  
  for (const baseUrl of urlsToTry) {
    try {
      const url = `${baseUrl}${endpoint}`;
      const requestOptions = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      };
      
      console.log(`Making API call to: ${url}`);
      
      const response = await fetch(url, requestOptions);
      
      console.log(`Response status: ${response.status}`);
      
      // Check if response is JSON by content-type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        if (!response.ok) {
          const textResponse = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, response: ${textResponse.substring(0, 200)}`);
        }
        throw new Error('Response is not JSON');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error(`API call failed for ${baseUrl}${endpoint}:`, error);
      lastError = error;
      
      // If this is the last URL to try, or we're in production, throw the error
      if (baseUrl === urlsToTry[urlsToTry.length - 1] || process.env.NODE_ENV === 'production') {
        throw error;
      }
      
      // Otherwise, continue to the next URL
      console.log(`Trying next fallback URL...`);
    }
  }
  
  // This should never be reached, but just in case
  throw lastError || new Error('All API endpoints failed');
};

// Helper functions for generating missing data (for backward compatibility)
const generatePhoneNumber = () => {
  return `0${Math.floor(Math.random() * 2) + 1}${Math.floor(Math.random() * 9000000000) + 1000000000}`;
};

const generateAgentDescription = (brokerName) => {
  const descriptions = [
    `${brokerName} - سمسار عقاري محترف متخصص في العقارات السكنية والتجارية`,
    `${brokerName} - خبرة أكثر من 10 سنوات في السوق العقاري المصري`,
    `${brokerName} - وكيل عقاري معتمد ومتخصص في الاستثمار العقاري`,
    `${brokerName} - مطور عقاري ومستشار في شراء وبيع العقارات`,
    `${brokerName} - سمسار معتمد لدى الشهر العقاري والتطوير العمراني`
  ];
  
  return descriptions[Math.floor(Math.random() * descriptions.length)];
};

const generateFullDescription = (type, area, location) => {
  const baseDesc = {
    apartment: `شقة مميزة في موقع استراتيجي بـ${location}، المساحة ${area} متر مربع، تشطيبات عالية الجودة، إطلالة رائعة، قريبة من المواصلات والخدمات، تصلح للسكن أو الاستثمار.`,
    villa: `فيلا فاخرة في ${location} بمساحة ${area} متر مربع، تصميم عصري، حديقة منسقة، جراج مغطى، أمن وحراسة 24 ساعة، موقع هادئ ومميز.`,
    land: `قطعة أرض في موقع مميز بـ${location}، المساحة ${area} متر مربع، على شارع رئيسي، مرافق متاحة، صالحة للبناء السكني أو التجاري، استثمار مضمون.`,
    office: `مكتب في برج تجاري بـ${location}، المساحة ${area} متر مربع، تشطيب راقي، أمن وحراسة، موقف سيارات، مناسب لجميع الأنشطة التجارية.`,
    warehouse: `مخزن في منطقة صناعية بـ${location}، المساحة ${area} متر مربع، ارتفاع مناسب، بوابات واسعة، ساحة مناورة، مناسب للتخزين والتوزيع.`,
    other: `عقار في ${location}، المساحة ${area} متر مربع، موقع مميز ومناسب للاستثمار.`
  };
  
  return baseDesc[type] || baseDesc.other;
};

// Authentication with enhanced security
export const authenticateUser = async (username, password) => {
  try {
    // For security, don't store credentials in the app
    // The backend should handle password hashing and validation
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    
    if (response.success) {
      // Store session token if provided by backend
      if (response.token) {
        localStorage.setItem('authToken', response.token);
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error('Authentication error:', error);
    return false;
  }
};

// Utility function to check if user is authenticated (for hiding sensitive data)
export const isUserAuthenticated = () => {
  const authStatus = localStorage.getItem('isAuthenticated');
  const sessionTime = localStorage.getItem('sessionTime');
  
  if (authStatus !== 'true' || !sessionTime) {
    return false;
  }
  
  const loginTime = parseInt(sessionTime);
  const currentTime = Date.now();
  const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  
  return (currentTime - loginTime) < SESSION_DURATION;
};

// Utility function to hide mobile numbers for non-authenticated users
export const hideMobileNumber = (phoneNumber, isAuthenticated = null) => {
  // If authentication status is not provided, check it
  if (isAuthenticated === null) {
    isAuthenticated = isUserAuthenticated();
  }
  
  if (!phoneNumber) {
    return null; // Return null if no phone number provided
  }
  
  if (!isAuthenticated) {
    return null; // Return null to hide the entire phone field for backward compatibility
  }
  
  return phoneNumber;
};

// Enhanced mobile masking function that shows masked version instead of hiding completely
export const maskMobile = (text, isLoggedIn = null) => {
  // If authentication status is not provided, check it
  if (isLoggedIn === null) {
    isLoggedIn = isUserAuthenticated();
  }
  
  return utilsMaskMobile(text, isLoggedIn);
};

// Enhanced authentication functions
export const logoutUser = async () => {
  try {
    await apiCall('/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('sessionTime');
  }
};

export const validateSession = async () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    
    const response = await apiCall('/auth/validate', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.valid;
  } catch (error) {
    console.error('Session validation error:', error);
    return false;
  }
};

// Remove duplicate messages with enhanced error handling
export const removeDuplicateMessages = async () => {
  try {
    const response = await apiCall('/admin/remove-duplicates', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    return response;
  } catch (error) {
    console.error('Error removing duplicates:', error);
    throw error;
  }
};

// Get message by ID
export const getMessageById = async (id) => {
  const response = await apiCall(`/messages/${id}`);
  return response;
};

// Insert new message
export const insertMessage = async (messageData) => {
  // Ensure all required fields are present
  const completeMessage = {
    ...messageData,
    timestamp: messageData.timestamp || new Date().toLocaleString('ar-EG'),
    agent_phone: messageData.agent_phone || generatePhoneNumber(),
    agent_description: messageData.agent_description || generateAgentDescription(messageData.sender || 'مستخدم جديد'),
    full_description: messageData.full_description || generateFullDescription(
      messageData.property_type || 'other',
      Math.floor(Math.random() * 200) + 80,
      messageData.location || 'موقع غير محدد'
    )
  };
  
  const response = await apiCall('/messages', {
    method: 'POST',
    body: JSON.stringify(completeMessage)
  });
  
  // Return the complete message object with the new ID
  return {
    id: response.id,
    ...completeMessage
  };
};

// Search messages
export const searchMessages = async (searchTerm = '', propertyType = 'all', limit = 10000) => {
  try {
    const params = new URLSearchParams();
    
    if (searchTerm.trim()) {
      params.append('search', searchTerm);
    }
    
    if (propertyType && propertyType !== 'all') {
      params.append('property_type', propertyType);
    }
    
    params.append('limit', limit.toString());
    
    console.log('🔍 Searching messages with params:', params.toString());
    const response = await apiCall(`/messages?${params.toString()}`);
    console.log('✅ Search response:', response);
    
    // The backend returns { success: true, messages: [...] }
    if (response && response.success && response.messages) {
      // Transform the data to match what HomePage expects
      const transformedProperties = response.messages.map(item => ({
        id: item.id,
        message: item.property_name || item.description || 'عقار متاح للبيع',
        property_type: item.property_type || 'apartment',
        location: item.regions || 'غير محدد',
        price: item.unit_price || item.amount || null,
        timestamp: item.imported_at ? new Date(item.imported_at).toLocaleDateString('ar-EG') : new Date().toLocaleDateString('ar-EG'),
        agent_phone: item.mobile_no || item.tel || null,
        agent_description: item.name || null,
        full_description: item.description || item.zain_house_sales_notes || null
      }));
      
      console.log('✅ Transformed', transformedProperties.length, 'search results');
      return transformedProperties;
    } else {
      console.warn('⚠️ Unexpected search API response format:', response);
      return [];
    }
  } catch (error) {
    console.error('❌ Error searching messages:', error);
    return [];
  }
};

// Get all messages
export const getAllMessages = async (propertyType = 'all', limit = 10000) => {
  return searchMessages('', propertyType, limit);
};

// Get all properties
export const getAllProperties = async (limit = 1000) => {
  try {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    
    console.log('🔍 Fetching all properties from unified search endpoint');
    const response = await apiCall(`/search-all?${params.toString()}`);
    console.log('✅ Properties API response received:', response);
    
    // The unified endpoint returns { success: true, chatMessages: [...], importedProperties: [...] }
    if (response && response.success) {
      const allProperties = [
        ...(response.chatMessages || []),
        ...(response.importedProperties || [])
      ];
      
      console.log(`✅ Found ${allProperties.length} total properties (${response.chatMessages?.length || 0} from chat, ${response.importedProperties?.length || 0} from imports)`);
      return allProperties;
    } else {
      console.warn('⚠️ Unexpected API response format:', response);
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching all properties:', error);
    // Try to provide more details about the error
    if (error.message.includes('Failed to fetch')) {
      console.error('❌ Network error - is the backend server running on localhost:3001?');
    }
    throw error;
  }
};

// Get property by ID (using messages endpoint since that's what we have)
export const getPropertyById = async (id) => {
  try {
    const response = await apiCall(`/messages/${id}`);
    console.log('Raw API response for message ID', id, ':', response);
    
    // Handle both the wrapped and direct response formats
    if (response && response.success && response.message) {
      console.log('✅ Extracted message data:', response.message);
      return response.message;
    } else if (response && response.id) {
      // Direct message object (fallback)
      console.log('✅ Using direct message data:', response);
      return response;
    }
    
    console.error('❌ Unexpected response format:', response);
    throw new Error('Property/message not found');
  } catch (error) {
    console.error('Error fetching property by ID:', error);
    throw error;
  }
};

// Get property type statistics
export const getPropertyTypeStats = async () => {
  try {
    const response = await apiCall('/stats');
    console.log('Property type breakdown from API:', response);
    
    // The backend returns { success: true, stats: [{ property_type: 'apartment', count: 123 }] }
    if (response && response.success && response.stats) {
      console.log('✅ Found stats for', response.stats.length, 'property types');
      return response.stats;
    } else {
      console.warn('⚠️ Unexpected stats API response format:', response);
      return [];
    }
    
  } catch (error) {
    console.error('❌ Error fetching property type stats:', error);
    
    // Return empty array as fallback so the app doesn't crash
    return [];
  }
};

// Import messages from WhatsApp chat file (bulk import)
export const importChatMessages = async (parsedMessages) => {
  console.log(`Starting bulk import of ${parsedMessages.length} messages to SQLite database...`);
  
  // Prepare messages with complete data
  const completeMessages = parsedMessages.map(messageData => ({
    ...messageData,
    timestamp: messageData.timestamp || new Date().toLocaleString('ar-EG'),
    agent_phone: messageData.agent_phone || generatePhoneNumber(),
    agent_description: messageData.agent_description || generateAgentDescription(messageData.sender || 'مستخدم جديد'),
    full_description: messageData.full_description || generateFullDescription(
      messageData.property_type || 'other',
      Math.floor(Math.random() * 200) + 80,
      messageData.location || 'موقع غير محدد'
    )
  }));
  
  // Debug: Log some messages to see their property types and phone numbers
  completeMessages.slice(0, 5).forEach((msg, index) => {
    console.log(`Sample message ${index + 1} for SQLite import:`, {
      sender: msg.sender,
      property_type: msg.property_type,
      agent_phone_extracted: parsedMessages[index].agent_phone,
      agent_phone_final: msg.agent_phone,
      message: msg.message.substring(0, 50) + '...'
    });
  });
  
  const response = await apiCall('/messages/bulk', {
    method: 'POST',
    body: JSON.stringify({ messages: completeMessages })
  });
  
  console.log(`SQLite bulk import complete: ${response.imported} imported, ${response.skipped} skipped`);
  
  return response;
};

// CSV Import functionality
export const importCSVData = async (tableName, headers, data) => {
  try {
    console.log(`Starting CSV import to table: ${tableName}`);
    console.log(`Headers: ${headers?.join(', ')}`);
    console.log(`Data rows: ${data?.length}`);
    
    const requestBody = {
      tableName,
      headers,
      data
    };
    
    console.log('CSV Import Request Body:', requestBody);
    console.log('Request Body JSON:', JSON.stringify(requestBody));
    
    const response = await apiCall('/import-csv', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('CSV import result:', response);
    return response;
  } catch (error) {
    console.error('CSV import error:', error);
    throw error;
  }
};

// Get available database tables for CSV import
export const getDatabaseTables = async () => {
  try {
    const response = await apiCall('/admin/tables', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    return response.tables || [];
  } catch (error) {
    console.error('Error fetching database tables:', error);
    return [];
  }
};

// Validate CSV data before import
export const validateCSVData = async (tableName, headers, sampleData) => {
  try {
    const response = await apiCall('/validate-csv', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({
        tableName,
        headers,
        sampleData: sampleData.slice(0, 5) // Send only first 5 rows for validation
      })
    });
    return response;
  } catch (error) {
    console.error('CSV validation error:', error);
    throw error;
  }
};

// Function to reset database to initial state (for testing)
export const resetDatabase = async () => {
  // This would require a backend endpoint to reset/clear the database
  // For now, just return a message that this feature is not implemented
  console.warn('Reset database feature not implemented for SQLite backend');
  return 0;
};

// Function to get current database size
export const getDatabaseSize = async () => {
  try {
    const messages = await getAllMessages('all', 999999);
    const count = messages.length;
    console.log(`SQLite database currently contains ${count} messages`);
    return count;
  } catch (error) {
    console.error('Error getting database size:', error);
    return 0;
  }
};

// Health check
export const checkBackendHealth = async () => {
  try {
    const response = await apiCall('/health');
    return response;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return { success: false, message: 'Backend not available' };
  }
};

// Update message/property
export const updateMessage = async (id, messageData) => {
  try {
    const response = await apiCall(`/messages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(messageData)
    });
    return response;
  } catch (error) {
    console.error('Error updating message:', error);
    throw new Error('Failed to update property: ' + error.message);
  }
};

// Delete message/property
export const deleteMessage = async (id) => {
  try {
    const response = await apiCall(`/messages/${id}`, {
      method: 'DELETE'
    });
    return response;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw new Error('Failed to delete property: ' + error.message);
  }
};

// Search properties from CSV import
export const searchProperties = async (searchTerm = '', filter = '', limit = 100) => {
  const params = new URLSearchParams();
  
  if (searchTerm.trim()) {
    params.append('q', searchTerm);
  }
  
  if (filter && filter !== 'all') {
    params.append('type', filter);
  }
  
  params.append('limit', limit.toString());
  
  const response = await apiCall(`/search-all?${params.toString()}`);
  
  // Combine chat messages and imported properties into a unified array
  const allResults = [
    ...(response.chatMessages || []),
    ...(response.importedProperties || [])
  ];
  
  console.log(`🔍 Search results for "${searchTerm}" with filter "${filter}": ${allResults.length} properties`);
  return allResults;
};

// Combined search across both chat messages and properties
export const searchAll = async (searchTerm = '', filter = '', limit = 50) => {
  const params = new URLSearchParams();
  
  if (searchTerm.trim()) {
    params.append('q', searchTerm);
  }
  
  if (filter && filter !== 'all') {
    params.append('type', filter);
  }
  
  params.append('limit', limit.toString());
  
  const response = await apiCall(`/search-all?${params.toString()}`);
  return response.data;
};

// Get dropdown data for forms
export const getDropdownData = async () => {
  try {
    const data = await apiCall('/dropdowns');
    return data.data;
  } catch (error) {
    console.error('Error fetching dropdown data:', error);
    throw error;
  }
};

export default {
  authenticateUser,
  logoutUser,
  validateSession,
  isUserAuthenticated,
  hideMobileNumber,
  maskMobile,
  insertMessage,
  updateMessage,
  deleteMessage,
  searchMessages,
  getAllMessages,
  getAllProperties,
  getPropertyById,
  getPropertyTypeStats,
  importChatMessages,
  getMessageById,
  resetDatabase,
  getDatabaseSize,
  checkBackendHealth,
  removeDuplicateMessages,
  importCSVData,
  getDatabaseTables,
  validateCSVData,
  searchProperties,
  searchAll,
  getDropdownData
};
