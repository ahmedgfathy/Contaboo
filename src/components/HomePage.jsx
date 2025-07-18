import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon,
  BuildingOffice2Icon,
  HomeModernIcon,
  MapPinIcon,
  BuildingStorefrontIcon,
  BuildingLibraryIcon,
  SparklesIcon,
  CpuChipIcon,
  ChartBarIcon,
  LanguageIcon,
  EyeIcon,
  ClockIcon,
  ArrowRightIcon,
  PhoneIcon,
  StarIcon,
  FireIcon,
  UserIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import { getAllProperties, searchProperties, getPropertyTypeStats, hideMobileNumber, isUserAuthenticated } from '../services/apiService';
import PropertyHeroSlider from './PropertyHeroSlider';
import AIFloatingButton from './AIFloatingButton';
import AIChatAssistant from './AIChatAssistant';
import SEOHead from './SEOHead';
import { isAIAvailable } from '../services/aiService';
import { generateSEOHashtags } from './SEOHead';

// Virtual property image generator
const getVirtualPropertyImage = (propertyType, messageId) => {
  const imageCategories = {
    apartment: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=250&fit=crop&auto=format'
    ],
    villa: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1571939228382-b2f2b585ce15?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=250&fit=crop&auto=format'
    ],
    land: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1566467712871-f3d5aba3f6c7?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1494280686715-9fd497f4c1a5?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=250&fit=crop&auto=format'
    ],
    office: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1575444758702-4a6b9222336e?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1541746972996-4e0b0f93e586?w=400&h=250&fit=crop&auto=format'
    ],
    warehouse: [
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1580687774429-74ee6e4a3fb4?w=400&h=250&fit=crop&auto=format'
    ]
  };

  // Default to apartment images if property type not found
  const images = imageCategories[propertyType] || imageCategories.apartment;
  
  // Use message ID to consistently select the same image for the same property
  const imageIndex = Math.abs(messageId || 0) % images.length;
  return images[imageIndex];
};

// Egyptian areas coordinates for proximity calculation (mock data)
const EGYPTIAN_AREAS_COORDINATES = {
  // Cairo areas
  'القاهرة': { lat: 30.0444, lng: 31.2357 },
  'مدينة نصر': { lat: 30.0626, lng: 31.3219 },
  'مصر الجديدة': { lat: 30.0938, lng: 31.3235 },
  'الزمالك': { lat: 30.0618, lng: 31.2194 },
  'وسط البلد': { lat: 30.0459, lng: 31.2414 },
  'المعادي': { lat: 29.9601, lng: 31.2568 },
  'حدائق الأهرام': { lat: 29.9897, lng: 31.1684 },
  'مدينة الشيخ زايد': { lat: 30.0255, lng: 30.9696 },
  'مدينة 6 أكتوبر': { lat: 29.9097, lng: 30.9746 },
  'التجمع الخامس': { lat: 30.0131, lng: 31.4286 },
  'العاشر من رمضان': { lat: 30.3119, lng: 31.7430 },
  
  // Giza areas
  'الجيزة': { lat: 30.0131, lng: 31.2089 },
  'الهرم': { lat: 29.9721, lng: 31.1859 },
  'فيصل': { lat: 29.9840, lng: 31.1656 },
  'الدقي': { lat: 30.0488, lng: 31.2122 },
  'المهندسين': { lat: 30.0620, lng: 31.2000 },
  'إمبابة': { lat: 30.0766, lng: 31.2067 },
  
  // Alexandria
  'الإسكندرية': { lat: 31.2001, lng: 29.9187 },
  'العجمي': { lat: 31.1048, lng: 29.7818 },
  'المنتزه': { lat: 31.2848, lng: 30.0171 },
  'سيدي جابر': { lat: 31.2420, lng: 29.9737 },
  
  // Other major cities
  'أسوان': { lat: 24.0889, lng: 32.8998 },
  'الأقصر': { lat: 25.6872, lng: 32.6396 },
  'أسيوط': { lat: 27.1809, lng: 31.1837 },
  'المنيا': { lat: 28.0871, lng: 30.7618 },
  'بني سويف': { lat: 29.0661, lng: 31.0994 },
  'الفيوم': { lat: 29.3084, lng: 30.8428 },
  'طنطا': { lat: 30.7865, lng: 31.0004 },
  'المنصورة': { lat: 31.0364, lng: 31.3807 },
  'الزقازيق': { lat: 30.5877, lng: 31.5022 },
  'بورسعيد': { lat: 31.2653, lng: 32.3020 },
  'السويس': { lat: 29.9668, lng: 32.5498 },
  'الإسماعيلية': { lat: 30.5965, lng: 32.2715 },
  'دمياط': { lat: 31.4165, lng: 31.8133 },
  'كفر الشيخ': { lat: 31.1107, lng: 30.9388 },
  'قنا': { lat: 26.1551, lng: 32.7160 },
  'سوهاج': { lat: 26.5569, lng: 31.6948 },
  'البحر الأحمر': { lat: 26.0975, lng: 33.8116 },
  'الغردقة': { lat: 27.2574, lng: 33.8129 },
  'شرم الشيخ': { lat: 27.9158, lng: 34.3299 },
  'دهب': { lat: 28.5069, lng: 34.5130 },
  'مرسى علم': { lat: 25.0629, lng: 34.8837 }
};

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
};

// Extract area name from property location/message text
const extractAreaFromProperty = (property) => {
  const text = property?.location || property?.message || '';
  
  // Check for exact area matches first
  for (const area of Object.keys(EGYPTIAN_AREAS_COORDINATES)) {
    if (text.includes(area)) {
      return area;
    }
  }
  
  // Check for partial matches (e.g., looking for "مدينة نصر" in "في مدينة نصر الجديدة")
  for (const area of Object.keys(EGYPTIAN_AREAS_COORDINATES)) {
    const words = area.split(' ');
    const textMatches = words.every(word => text.includes(word));
    if (textMatches) {
      return area;
    }
  }
  
  return null; // No area found
};

const HomePage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [stats, setStats] = useState([]);
  const [displayedMessages, setDisplayedMessages] = useState([]);
  const [language, setLanguage] = useState('arabic');
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProperties, setTotalProperties] = useState(0);
  const propertiesPerPage = 52; // 52 properties = 13 rows × 4 cards per row
  
  // Geolocation states
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState('prompt'); // 'granted', 'denied', 'prompt'
  const [sortByProximity, setSortByProximity] = useState(false);
  const [geoError, setGeoError] = useState(null);
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // AI Chat state
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  useEffect(() => {
    // Check authentication status on component mount
    setIsAuthenticated(isUserAuthenticated());
  }, []);

  const propertyFilters = [
    { id: 'all', label: 'جميع العقارات', labelEn: 'All Properties', icon: BuildingOffice2Icon, color: 'from-purple-500 to-pink-500' },
    { id: 'apartment', label: 'شقق', labelEn: 'Apartments', icon: HomeModernIcon, color: 'from-blue-500 to-cyan-500' },
    { id: 'villa', label: 'فيلات', labelEn: 'Villas', icon: HomeModernIcon, color: 'from-green-500 to-emerald-500' },
    { id: 'land', label: 'أراضي', labelEn: 'Land', icon: MapPinIcon, color: 'from-orange-500 to-red-500' },
    { id: 'office', label: 'مكاتب', labelEn: 'Offices', icon: BuildingStorefrontIcon, color: 'from-indigo-500 to-purple-500' },
    { id: 'warehouse', label: 'مخازن', labelEn: 'Warehouses', icon: BuildingLibraryIcon, color: 'from-pink-500 to-rose-500' }
  ];

  useEffect(() => {
    if (!isInitialized) {
      loadInitialData();
      setIsInitialized(true);
    }
    // Check saved language preference
    const savedLanguage = localStorage.getItem('publicLanguage') || 'arabic';
    setLanguage(savedLanguage);
  }, [isInitialized]);

  // Geolocation functions
  const requestGeolocation = async () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by this browser');
      return;
    }

    try {
      setGeoError(null);
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes cache
          }
        );
      });

      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      setUserLocation(coords);
      setLocationPermission('granted');
      setSortByProximity(true);
      
      console.log('📍 User location obtained:', coords);
      
      // Show success message
      if (language === 'arabic') {
        alert('تم الحصول على موقعك بنجاح! سيتم ترتيب العقارات حسب القرب منك.');
      } else {
        alert('Location obtained successfully! Properties will be sorted by proximity to you.');
      }

    } catch (error) {
      console.error('Geolocation error:', error);
      setLocationPermission('denied');
      
      let errorMessage = '';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = language === 'arabic' 
            ? 'تم رفض الإذن للوصول للموقع. يرجى تفعيل خدمات الموقع في المتصفح.'
            : 'Location permission denied. Please enable location services in your browser.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = language === 'arabic'
            ? 'الموقع غير متاح. يرجى التأكد من تفعيل GPS.'
            : 'Location unavailable. Please make sure GPS is enabled.';
          break;
        case error.TIMEOUT:
          errorMessage = language === 'arabic'
            ? 'انتهت مهلة الحصول على الموقع. يرجى المحاولة مرة أخرى.'
            : 'Location request timed out. Please try again.';
          break;
        default:
          errorMessage = language === 'arabic'
            ? 'حدث خطأ في الحصول على الموقع.'
            : 'An error occurred while getting location.';
          break;
      }
      
      setGeoError(errorMessage);
      alert(errorMessage);
    }
  };

  // Sort properties by proximity to user
  const sortPropertiesByProximity = (properties) => {
    if (!userLocation || !sortByProximity) {
      return properties;
    }

    return [...properties].sort((a, b) => {
      const areaA = extractAreaFromProperty(a);
      const areaB = extractAreaFromProperty(b);
      
      const coordsA = areaA ? EGYPTIAN_AREAS_COORDINATES[areaA] : null;
      const coordsB = areaB ? EGYPTIAN_AREAS_COORDINATES[areaB] : null;
      
      // If we can't find coordinates for both properties, maintain original order
      if (!coordsA && !coordsB) return 0;
      if (!coordsA) return 1; // Put properties without coordinates at the end
      if (!coordsB) return -1;
      
      const distanceA = calculateDistance(
        userLocation.lat, userLocation.lng,
        coordsA.lat, coordsA.lng
      );
      
      const distanceB = calculateDistance(
        userLocation.lat, userLocation.lng,
        coordsB.lat, coordsB.lng
      );
      
      return distanceA - distanceB;
    });
  };

  // Calculate distance for display
  const getDistanceToProperty = (property) => {
    if (!userLocation) return null;
    
    const area = extractAreaFromProperty(property);
    const coords = area ? EGYPTIAN_AREAS_COORDINATES[area] : null;
    
    if (!coords) return null;
    
    const distance = calculateDistance(
      userLocation.lat, userLocation.lng,
      coords.lat, coords.lng
    );
    
    return distance < 1 ? `${Math.round(distance * 1000)}م` : `${distance.toFixed(1)}كم`;
  };

  const loadInitialData = async (page = 1) => {
    if (loading) return;
    
    setLoading(true);
    try {
      console.log('🔄 Loading data for page:', page);
      
      // Load property stats first
      const propertyStats = await getPropertyTypeStats();
      console.log('✅ Property stats received:', propertyStats);
      if (propertyStats && propertyStats.length > 0) {
        setStats(propertyStats);
      } else {
        setStats([]);
      }
      
      // Load properties with pagination
      const allProperties = await getAllProperties(10000); // Get all, then paginate on frontend
      console.log('✅ Total properties loaded:', allProperties?.length || 0);
      
      if (allProperties && allProperties.length > 0) {
        setMessages(allProperties);
        setTotalProperties(allProperties.length);
        setTotalPages(Math.ceil(allProperties.length / propertiesPerPage));
        
        // Set current page data
        const startIndex = (page - 1) * propertiesPerPage;
        const endIndex = startIndex + propertiesPerPage;
        const pageData = allProperties.slice(startIndex, endIndex);
        setDisplayedMessages(pageData);
        setCurrentPage(page);
        
        console.log(`✅ Page ${page} loaded: ${pageData.length} properties (${startIndex + 1}-${Math.min(endIndex, allProperties.length)} of ${allProperties.length})`);
      } else {
        setMessages([]);
        setDisplayedMessages([]);
        setTotalProperties(0);
        setTotalPages(1);
      }
      
    } catch (error) {
      console.error('❌ Error loading data:', error);
      setStats([]);
      setMessages([]);
      setDisplayedMessages([]);
      setTotalProperties(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadInitialData(1);
      return;
    }

    setLoading(true);
    try {
      const filterType = selectedFilter === 'all' ? null : selectedFilter;
      const searchResults = await searchProperties(searchTerm, filterType, 10000);
      
      if (searchResults && searchResults.length > 0) {
        setMessages(searchResults);
        setTotalProperties(searchResults.length);
        setTotalPages(Math.ceil(searchResults.length / propertiesPerPage));
        
        // Show first page of search results
        const pageData = searchResults.slice(0, propertiesPerPage);
        setDisplayedMessages(pageData);
        setCurrentPage(1);
        
        console.log(`🔍 Search results: ${searchResults.length} properties found`);
      } else {
        setMessages([]);
        setDisplayedMessages([]);
        setTotalProperties(0);
        setTotalPages(1);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error searching:', error);
      alert(language === 'arabic' ? 'حدث خطأ في البحث. يرجى المحاولة مرة أخرى.' : 'Search error. Please try again.');
    }
    setLoading(false);
  };

  const handleStatClick = async (filterType) => {
    console.log('🎯 Filter clicked:', filterType);
    
    setSelectedFilter(filterType);
    setCurrentPage(1);
    
    if (searchTerm.trim()) {
      handleSearch();
    } else {
      await loadFilteredData(filterType);
    }
  };

  const loadFilteredData = async (filterType = 'all') => {
    setLoading(true);
    try {
      console.log('🔄 Loading filtered data for:', filterType);
      
      let filteredProperties = [];
      
      if (filterType === 'all') {
        filteredProperties = await getAllProperties(10000);
      } else {
        // Use searchProperties with empty search term but with filter type
        filteredProperties = await searchProperties('', filterType, 10000);
      }
      
      console.log(`✅ Filtered data loaded: ${filteredProperties?.length || 0} properties for ${filterType}`);
      
      if (filteredProperties && filteredProperties.length > 0) {
        setMessages(filteredProperties);
        setTotalProperties(filteredProperties.length);
        setTotalPages(Math.ceil(filteredProperties.length / propertiesPerPage));
        
        // Show first page
        const pageData = filteredProperties.slice(0, propertiesPerPage);
        setDisplayedMessages(pageData);
        setCurrentPage(1);
      } else {
        setMessages([]);
        setDisplayedMessages([]);
        setTotalProperties(0);
        setTotalPages(1);
        setCurrentPage(1);
      }
      
    } catch (error) {
      console.error('❌ Error loading filtered data:', error);
      setMessages([]);
      setDisplayedMessages([]);
      setTotalProperties(0);
      setTotalPages(1);
    }
    setLoading(false);
  };

  // Pagination functions
  const goToPage = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    
    const startIndex = (page - 1) * propertiesPerPage;
    const endIndex = startIndex + propertiesPerPage;
    const pageData = messages.slice(startIndex, endIndex);
    
    setDisplayedMessages(pageData);
    setCurrentPage(page);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    console.log(`📄 Page ${page} loaded: ${pageData.length} properties (${startIndex + 1}-${Math.min(endIndex, messages.length)} of ${messages.length})`);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };



  const handleLanguageSwitch = () => {
    const newLanguage = language === 'arabic' ? 'english' : 'arabic';
    setLanguage(newLanguage);
    localStorage.setItem('publicLanguage', newLanguage);
  };

  const getPropertyTypeLabel = (type) => {
    const labels = language === 'arabic' ? {
      apartment: 'شقة',
      villa: 'فيلا',
      land: 'أرض',
      office: 'مكتب',
      warehouse: 'مخزن'
    } : {
      apartment: 'Apartment',
      villa: 'Villa',
      land: 'Land',
      office: 'Office',
      warehouse: 'Warehouse'
    };
    return labels[type] || type;
  };

  const getPropertyTypeColorClass = (type) => {
    const colors = {
      apartment: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      villa: 'bg-green-500/20 text-green-300 border-green-500/30',
      land: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      office: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      warehouse: 'bg-red-500/20 text-red-300 border-red-500/30'
    };
    return colors[type] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  // Update search handlers
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
  };

  const texts = language === 'arabic' ? {
    title: 'كونتابو',
    subtitle: 'اكتشف أفضل العقارات في مصر',
    search: 'ابحث عن العقار المناسب...',
    searchBtn: 'بحث',
    login: 'دخول النظام',
    allProperties: 'جميع العقارات',
    latestProperties: 'أحدث العقارات',
    viewDetails: 'عرض التفاصيل',
    price: 'السعر',
    location: 'الموقع',
    notSpecified: 'غير محدد',
    page: 'صفحة',
    of: 'من',
    showingProperties: 'عرض العقارات',
    to: 'إلى',
    totalProperties: 'إجمالي العقارات',
    english: 'English',
    brandName: 'كونتابو',
    brandSubtitle: 'منصة العقارات الذكية',
    propertyListing: 'إعلان عقاري'
  } : {
    title: 'Contaboo',
    subtitle: 'Discover the best properties in Egypt',
    search: 'Search for the perfect property...',
    searchBtn: 'Search',
    login: 'System Login',
    allProperties: 'All Properties',
    latestProperties: 'Latest Properties',
    viewDetails: 'View Details',
    price: 'Price',
    location: 'Location',
    notSpecified: 'Not specified',
    page: 'Page',
    of: 'of',
    showingProperties: 'Showing properties',
    to: 'to',
    totalProperties: 'Total Properties',
    english: 'العربية',
    brandName: 'Contaboo',
    brandSubtitle: 'Smart Real Estate Platform',
    propertyListing: 'Property Listing'
  };

  // Generate SEO hashtags for homepage
  const homePageHashtags = [
    '#عقارات_مصر', '#كونتابو', '#Contaboo', '#عقارات_للبيع',
    '#RealEstateEgypt', '#PropertiesForSale', '#EgyptRealEstate',
    '#شقق_للبيع', '#فيلات_للبيع', '#أراضي_للبيع',
    '#القاهرة', '#الجيزة', '#الإسكندرية', '#التجمع_الخامس',
    '#ذكاء_اصطناعي', '#AIRealEstate', '#SmartSearch'
  ];

  return (
    <>
      {/* SEO Head Component */}
      <SEOHead
        title={language === 'arabic' 
          ? 'كونتابو - منصة العقارات الذكية في مصر | شقق، فيلات، أراضي للبيع'
          : 'Contaboo - Smart Real Estate Platform in Egypt | Apartments, Villas, Land for Sale'
        }
        description={language === 'arabic'
          ? 'اكتشف أفضل العقارات في مصر مع كونتابو. آلاف الشقق والفيلات والأراضي للبيع. بحث ذكي بالذكاء الاصطناعي، أسعار تنافسية، ونظام CRM متطور للسماسرة'
          : 'Discover the best properties in Egypt with Contaboo. Thousands of apartments, villas, and land for sale. AI-powered smart search, competitive prices, and advanced CRM system for brokers'
        }
        keywords={language === 'arabic'
          ? 'عقارات مصر, شقق للبيع, فيلات للبيع, أراضي للبيع, عقارات القاهرة, عقارات الجيزة, عقارات الإسكندرية, التجمع الخامس, مدينة نصر, كونتابو, بحث ذكي, ذكاء اصطناعي'
          : 'real estate egypt, apartments for sale, villas for sale, land for sale, cairo real estate, giza real estate, alexandria real estate, new cairo, nasr city, contaboo, smart search, artificial intelligence'
        }
        image="https://contaboo.com/og-image.jpg"
        hashtags={homePageHashtags}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Contaboo Real Estate",
          "url": "https://contaboo.com",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://contaboo.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }}
      />
      
      <div 
        className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 ${language === 'arabic' ? 'font-cairo lang-arabic' : 'font-roboto lang-english'}`} 
      dir={language === 'arabic' ? 'rtl' : 'ltr'}
      lang={language === 'arabic' ? 'ar' : 'en'}
    >

      {/* Floating Property Icons - Like Login Page */}
      {[
        { Icon: HomeModernIcon, delay: 0, position: "top-24 left-16", rotation: "0deg" },
        { Icon: BuildingOffice2Icon, delay: 0.3, position: "top-40 right-24", rotation: "15deg" },
        { Icon: MapPinIcon, delay: 0.6, position: "bottom-40 left-24", rotation: "-10deg" },
        { Icon: BuildingStorefrontIcon, delay: 0.9, position: "bottom-32 right-16", rotation: "20deg" },
        { Icon: BuildingLibraryIcon, delay: 1.2, position: "top-1/2 left-8", rotation: "-15deg" },
        { Icon: SparklesIcon, delay: 1.5, position: "top-1/3 right-12", rotation: "10deg" }
      ].map(({ Icon, delay, position, rotation }, index) => (
        <motion.div
          key={index}
          className={`absolute ${position} text-white/5 pointer-events-none z-5 hidden lg:block`}
          initial={{ opacity: 0, y: 100, rotate: 0 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            rotate: [0, 15, -15, 0],
          }}
          transition={{ 
            delay,
            duration: 2,
            rotate: {
              repeat: Infinity,
              duration: 6,
              ease: "easeInOut"
            }
          }}
          style={{ transform: `rotate(${rotation})` }}
        >
          <Icon className="h-20 w-20" />
        </motion.div>
      ))}

      {/* Animated Phone CRM Feature */}
      <motion.div
        className="fixed bottom-8 right-20 z-50 pointer-events-auto"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          delay: 2,
          duration: 0.8,
          type: "spring",
          stiffness: 200
        }}
      >
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative group"
        >
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Phone Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
            className="relative p-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full shadow-2xl hover:shadow-green-500/25 transition-all duration-300"
          >
            <PhoneIcon className="h-6 w-6" />
          </motion.button>

          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileHover={{ opacity: 1, x: 0 }}
            className="absolute right-full top-1/2 transform -translate-y-1/2 mr-4 px-3 py-2 bg-black/80 backdrop-blur-sm text-white text-sm rounded-lg border border-white/20 whitespace-nowrap pointer-events-none"
          >
            {language === 'arabic' ? 'اتصل بنا - نظام CRM متقدم' : 'Contact Us - Advanced CRM System'}
            <div className="absolute top-1/2 left-full transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-black/80"></div>
          </motion.div>

          {/* Pulse Effect */}
          <div className="absolute inset-0 rounded-full bg-green-500/30 animate-ping"></div>
        </motion.div>
      </motion.div>

      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40"
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 lg:h-24">
            <motion.div 
              className="flex items-center gap-3 lg:gap-6" 
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl lg:rounded-3xl blur opacity-75"></div>
                <div className="relative p-2 lg:p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl lg:rounded-3xl shadow-2xl">
                  <BuildingOffice2Icon className="h-6 w-6 lg:h-10 lg:w-10 text-white" />
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl lg:text-3xl font-bold gradient-text bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {texts.title}
                </h1>
                <div className="flex items-center space-x-2 mt-2 lg:mt-3">
                  <SparklesIcon className="h-3 w-3 lg:h-4 lg:w-4 text-purple-400" />
                  <CpuChipIcon className="h-3 w-3 lg:h-4 lg:w-4 text-purple-400 animate-pulse" />
                  <p className="text-xs lg:text-sm text-gray-300">{texts.subtitle}</p>
                </div>
              </div>
            </motion.div>
            
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Language Switcher */}
              <motion.button
                onClick={handleLanguageSwitch}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative overflow-hidden flex items-center px-3 lg:px-6 py-2 lg:py-3 text-xs lg:text-sm font-semibold text-gray-300 hover:text-white bg-white/10 backdrop-blur-sm rounded-xl lg:rounded-2xl border border-white/20 transition-all duration-300 shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <LanguageIcon className="h-4 w-4 lg:h-5 lg:w-5 mr-1 lg:mr-2 group-hover:rotate-12 transition-transform duration-300" />
                <span className="relative">{texts.english}</span>
              </motion.button>

              {/* Login Button */}
              <motion.button
                onClick={() => navigate('/login')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative overflow-hidden flex items-center px-4 lg:px-8 py-2 lg:py-4 text-xs lg:text-sm font-semibold text-gray-300 hover:text-white bg-white/10 backdrop-blur-sm rounded-xl lg:rounded-2xl border border-white/20 transition-all duration-300 shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <UserIcon className="h-4 w-4 lg:h-5 lg:w-5 mr-1 lg:mr-3 group-hover:rotate-12 transition-transform duration-300" />
                <span className="relative">{texts.login}</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section - New Design */}
      <div className="relative z-10 min-h-[80vh] sm:min-h-[70vh] flex items-center">
        <div className="absolute inset-0">
          <PropertyHeroSlider language={language} isBackground={true} />
        </div>
        
        <div className="relative z-20 w-full">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-center min-h-[60vh] sm:min-h-[50vh]">
              
              {/* Left Side - Hero Content */}
              <motion.div 
                className="text-center lg:text-right space-y-6 sm:space-y-8 order-2 lg:order-1"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {/* Main Title */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="-mt-4 sm:-mt-8"
                >
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4">
                    <span className="block gradient-text bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4 sm:mb-6 lg:mb-8 xl:mb-10 relative -top-1 pb-2">{texts.brandName}</span>
                    <span className="gradient-text bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
                      {texts.brandSubtitle}
                    </span>
                  </h1>
                </motion.div>

                {/* Subtitle */}
                <motion.p 
                  className="text-lg sm:text-xl md:text-2xl text-white max-w-2xl mx-auto lg:mx-0 leading-relaxed px-4 sm:px-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  {language === 'arabic' 
                    ? 'اكتشف أفضل العقارات في مصر مع تقنيات الذكاء الاصطناعي المتطورة'
                    : 'Discover the best properties in Egypt with advanced AI technology'
                  }
                </motion.p>

                {/* Features */}
                <motion.div 
                  className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-4 px-4 sm:px-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  {[
                    { 
                      icon: CpuChipIcon, 
                      text: language === 'arabic' ? 'بحث ذكي' : 'Smart Search',
                      action: () => setIsAIChatOpen(true),
                      isAI: true
                    },
                    { 
                      icon: ChartBarIcon, 
                      text: language === 'arabic' ? 'إحصائيات متقدمة' : 'Advanced Analytics',
                      action: () => document.getElementById('properties-section').scrollIntoView({ behavior: 'smooth' }),
                      isAI: false
                    },
                    { 
                      icon: StarIcon, 
                      text: language === 'arabic' ? 'عقارات مميزة' : 'Premium Properties',
                      action: () => document.getElementById('properties-section').scrollIntoView({ behavior: 'smooth' }),
                      isAI: false
                    }
                  ].map((feature, index) => (
                    <motion.button
                      key={index}
                      onClick={feature.action}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center gap-2 px-3 sm:px-4 py-2 backdrop-blur-sm rounded-full border shadow-lg text-sm sm:text-base transition-all duration-300 cursor-pointer ${
                        feature.isAI && isAIAvailable()
                          ? 'bg-gradient-to-r from-blue-500/90 to-purple-600/90 border-blue-300/50 text-white hover:from-blue-600/90 hover:to-purple-700/90'
                          : feature.isAI && !isAIAvailable()
                          ? 'bg-gray-500/80 border-gray-400/50 text-gray-300 cursor-not-allowed'
                          : 'bg-white/80 border-gray-200 text-gray-700 hover:bg-white/90'
                      }`}
                      disabled={feature.isAI && !isAIAvailable()}
                      title={feature.isAI && !isAIAvailable() ? (language === 'arabic' ? 'يتطلب تكوين مفتاح OpenAI API' : 'Requires OpenAI API key configuration') : ''}
                    >
                      <feature.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${
                        feature.isAI && isAIAvailable() 
                          ? 'text-blue-200' 
                          : feature.isAI && !isAIAvailable()
                          ? 'text-gray-400'
                          : 'text-purple-600'
                      }`} />
                      <span className="font-medium">{feature.text}</span>
                      {feature.isAI && isAIAvailable() && (
                        <SparklesIcon className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-300 animate-pulse" />
                      )}
                    </motion.button>
                  ))}
                </motion.div>

                {/* CTA Buttons */}
                <motion.div 
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start px-4 sm:px-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  {/* Smart Search AI Button - Primary CTA */}
                  {isAIAvailable() && (
                    <motion.button
                      onClick={() => setIsAIChatOpen(true)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 justify-center text-sm sm:text-base group relative overflow-hidden"
                    >
                      {/* Animated background shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                      <CpuChipIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-200" />
                      <span>{language === 'arabic' ? 'بحث ذكي بالذكاء الاصطناعي' : 'AI Smart Search'}</span>
                      <SparklesIcon className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-300 animate-pulse" />
                    </motion.button>
                  )}
                  
                  <motion.button
                    onClick={() => navigate('/login')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 justify-center text-sm sm:text-base"
                  >
                    <UserIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    {texts.login}
                  </motion.button>
                  
                  <motion.button
                    onClick={() => document.getElementById('properties-section').scrollIntoView({ behavior: 'smooth' })}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-white/90 backdrop-blur-sm text-gray-800 font-bold rounded-2xl border-2 border-gray-300 hover:border-purple-400 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 justify-center text-sm sm:text-base"
                  >
                    <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    {language === 'arabic' ? 'استكشف العقارات' : 'Explore Properties'}
                  </motion.button>
                </motion.div>
              </motion.div>

              {/* Right Side - Search Section */}
              <motion.div 
                className="lg:order-last relative order-1 lg:order-2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                {/* Floating Offer Banner - NEW OFFER Style */}
                <motion.div
                  initial={{ opacity: 0, scale: 0, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="absolute -top-12 sm:-top-16 -right-8 sm:-right-12 z-20 cursor-pointer"
                  onClick={() => navigate('/register')}
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      opacity: [0.95, 1, 0.95]
                    }}
                    transition={{ 
                      duration: 1.2, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="relative"
                  >
                    {/* Main Offer Banner - Made Even Smaller */}
                    <div className="relative w-36 h-20 bg-red-600 rounded-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                      {/* Animated background pulse */}
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.1, 0.3]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="absolute inset-0 bg-white rounded-lg"
                      />
                      
                      {/* Content - More Compact Layout */}
                      <div className="relative z-10 p-2 text-white h-full flex items-center justify-between">
                        {/* Left side - Smaller Megaphone */}
                        <div className="flex-shrink-0">
                          <motion.div
                            animate={{ 
                              rotate: [0, 10, -10, 0],
                              scale: [1, 1.1, 1]
                            }}
                            transition={{ 
                              duration: 2, 
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            className="w-8 h-8 bg-white rounded-full flex items-center justify-center"
                          >
                            <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.894A1 1 0 0018 16V3z" clipRule="evenodd" />
                            </svg>
                          </motion.div>
                        </div>
                        
                        {/* Right side - More Compact Text */}
                        <div className="flex-1 text-right pr-1">
                          <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-sm font-bold leading-tight"
                          >
                            {language === 'arabic' ? 'عرض جديد' : 'NEW OFFER'}
                          </motion.div>
                          <div className="text-xs font-semibold text-yellow-200">
                            {language === 'arabic' ? 'للسماسرة' : 'FOR BROKERS'}
                          </div>
                          <div className="text-xs font-bold text-yellow-300">
                            {language === 'arabic' ? '199 جنيه/شهر' : '199 L.E/Mo'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Decorative triangular elements - Even Smaller */}
                      <motion.div
                        animate={{ 
                          rotate: [0, 360],
                          scale: [1, 1.2, 1]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 transform rotate-45"
                      />
                      <motion.div
                        animate={{ 
                          rotate: [360, 0],
                          scale: [1.2, 1, 1.2]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute -bottom-0.5 -left-0.5 w-1.5 h-1.5 bg-red-500 transform rotate-45"
                      />
                      
                      {/* Sparkle effects - Much Smaller */}
                      <motion.div
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0.5, 1, 0.5]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          repeatDelay: 0.5
                        }}
                        className="absolute top-2 right-2 w-1.5 h-1.5 bg-yellow-300 rounded-full"
                      />
                      <motion.div
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0.5, 1, 0.5]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          repeatDelay: 1
                        }}
                        className="absolute bottom-2 left-4 w-1 h-1 bg-yellow-300 rounded-full"
                      />
                    </div>
                    
                    {/* Outer glow rings - Adjusted for smaller card */}
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.4, 0.1, 0.4]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0 border-2 border-red-400 rounded-xl -m-2 transform rotate-3"
                    />
                    <motion.div
                      animate={{
                        scale: [1, 1.4, 1],
                        opacity: [0.3, 0.05, 0.3]
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5
                      }}
                      className="absolute inset-0 border border-red-400 rounded-xl -m-3 transform rotate-3"
                    />
                  </motion.div>
                </motion.div>

                <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/50">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
                      {language === 'arabic' ? 'ابحث عن عقارك المثالي' : 'Find Your Perfect Property'}
                    </h3>
                    
                    {/* Search Input */}
                    <div className="relative mb-4 sm:mb-6">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder={texts.search}
                        className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 text-gray-800 rounded-xl sm:rounded-2xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-400/20 placeholder-gray-500 text-base sm:text-lg pr-12 sm:pr-14"
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      />
                      {searchTerm && (
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            loadInitialData();
                          }}
                          className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Search Buttons */}
                    <div className="flex gap-2 sm:gap-3">
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSearch}
                        disabled={loading || !searchTerm.trim()}
                        className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl sm:rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-lg text-sm sm:text-base"
                      >
                        {loading ? (
                          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        )}
                        {texts.searchBtn}
                      </motion.button>
                      
                      {searchTerm && (
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setSearchTerm('');
                            setSelectedFilter('all');
                            loadInitialData();
                          }}
                          className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl sm:rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-lg text-sm sm:text-base"
                        >
                          {language === 'arabic' ? 'مسح' : 'Clear'}
                        </motion.button>
                      )}
                    </div>

                    {/* Quick Stats */}
                    <motion.div 
                      className="mt-4 sm:mt-6 grid grid-cols-3 gap-2 sm:gap-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.7 }}
                    >
                      {stats.slice(0, 3).map((stat, index) => (
                        <div key={index} className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg sm:rounded-xl">
                          <div className="text-base sm:text-lg font-bold text-purple-600">{stat.count?.toLocaleString() || '0'}</div>
                          <div className="text-xs text-gray-600">{stat.property_type === 'apartment' ? (language === 'arabic' ? 'شقق' : 'Apartments') : stat.property_type === 'villa' ? (language === 'arabic' ? 'فيلات' : 'Villas') : (language === 'arabic' ? 'أراضي' : 'Land')}</div>
                        </div>
                      ))}
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Section */}
      <div id="properties-section" className="relative z-20 bg-gradient-to-b from-transparent to-slate-900/50">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Property Type Filter Cards - Enhanced Design */}
        <motion.div 
          className="mb-8"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {/* Centered Grid Container */}
          <div className="flex justify-center">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 justify-items-center max-w-7xl">
            {propertyFilters.map((filter, index) => {
              // Use BuildingOffice2Icon for all property types
              const IconComponent = BuildingOffice2Icon;
              
              // Calculate count based on filter type by mapping API categories to filter types
              let count = 0;
              if (filter.id === 'all') {
                count = stats.reduce((sum, stat) => sum + parseInt(stat.count || 0), 0);
              } else {
                // Map API property category names to filter types
                const categoryMappings = {
                  apartment: ['Compound Apartments', 'Local Apartments', 'Local Duplex', 'Local Roof'],
                  villa: ['Independent Villas', 'Townhouse', 'Twin House', 'Land & Local Villas'],
                  land: ['Land & Local Villas', 'Various Areas'],
                  office: ['Commercial & Administrative'],
                  warehouse: ['Commercial & Administrative']
                };
                
                // Get mapped categories for this filter
                const mappedCategories = categoryMappings[filter.id] || [];
                count = stats.filter(stat => {
                  if (!stat.property_type) return false;
                  
                  // Direct match
                  if (mappedCategories.includes(stat.property_type)) return true;
                  
                  // Partial match for flexibility
                  return mappedCategories.some(category => 
                    stat.property_type.toLowerCase().includes(category.toLowerCase()) ||
                    category.toLowerCase().includes(stat.property_type.toLowerCase())
                  );
                }).reduce((sum, stat) => sum + parseInt(stat.count || 0), 0);
              }
              
              const isActive = selectedFilter === filter.id;
              
              // All cards use the same circular shape now
              const shapeClass = 'rounded-full';
              
              return (
                <motion.button
                  key={filter.id}
                  initial={{ scale: 0.8, opacity: 0, y: 30 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.1 * index,
                    type: "spring",
                    stiffness: 100
                  }}
                  onClick={() => handleStatClick(filter.id)}
                  whileHover={{ 
                    scale: 1.08, 
                    y: -8,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative group transition-all duration-500 ${
                    isActive ? 'transform scale-110' : ''
                  }`}
                >
                  {/* Multi-layer glow effect */}
                  <div className={`absolute inset-0 blur-2xl opacity-20 transition-opacity duration-300 ${
                    isActive ? 'opacity-50' : 'group-hover:opacity-40'
                  } bg-gradient-to-r ${filter.color} ${shapeClass}`}></div>
                  
                  <div className={`absolute inset-0 blur-xl opacity-30 transition-opacity duration-300 ${
                    isActive ? 'opacity-60' : 'group-hover:opacity-50'
                  } bg-gradient-to-r ${filter.color} ${shapeClass}`}></div>
                  
                  {/* Main Card - All circular now */}
                  <div className={`
                    relative w-32 h-32 flex flex-col items-center justify-center
                    bg-gradient-to-br transition-all duration-500 shadow-2xl 
                    border-4 border-white/10 group-hover:border-white/30 overflow-hidden
                    ${shapeClass}
                    ${isActive 
                      ? `${filter.color} ring-4 ring-white/40 shadow-3xl border-white/40` 
                      : 'from-slate-700/90 to-slate-800/90 group-hover:from-slate-600/90 group-hover:to-slate-700/90'
                    }
                  `}>
                    
                    {/* Background pattern overlay */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20"></div>
                      {/* Geometric pattern */}
                      <div className="absolute top-2 right-2 w-8 h-8 border border-white/20 rounded-full"></div>
                      <div className="absolute bottom-2 left-2 w-6 h-6 bg-white/10 rounded-full"></div>
                    </div>
                    
                    {/* Content Container - Perfectly Centered */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      {/* Icon Container - centered and consistent */}
                      <div className={`
                        relative rounded-2xl backdrop-blur-sm transition-all duration-300 group-hover:scale-110
                        flex items-center justify-center
                        ${filter.id === 'all' ? 'p-3 mb-2' : 'p-2 mb-1'}
                        ${isActive 
                          ? 'bg-white/40 shadow-lg' 
                          : 'bg-white/20 group-hover:bg-white/30'
                        }
                      `}>
                        <IconComponent className={`text-white drop-shadow-lg ${
                          filter.id === 'all' ? 'h-7 w-7' : 'h-5 w-5'
                        }`} />
                        
                        {/* Pulse animation for active */}
                        {isActive && (
                          <div className="absolute inset-0 bg-white/20 rounded-2xl animate-ping"></div>
                        )}
                      </div>
                      
                      {/* Count Display - perfectly centered */}
                      <div className="text-center">
                        <motion.div 
                          className="text-2xl font-black text-white drop-shadow-lg leading-none"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 + index * 0.1 }}
                        >
                          {count?.toLocaleString() || '0'}
                        </motion.div>
                        <div className="text-xs text-white/90 font-semibold tracking-wide leading-tight">
                          {language === 'arabic' ? 'عقار' : 'Units'}
                        </div>
                      </div>
                    </div>

                    {/* Animated Border Effects */}
                    {isActive && (
                      <>
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className={`absolute inset-0 border-2 border-white/50 ${shapeClass}`}
                        >
                          <div className={`absolute inset-0 border-2 border-white/30 animate-pulse ${shapeClass}`}></div>
                        </motion.div>
                        
                        {/* Rotating ring effect for all circles */}
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-2 border-2 border-dashed border-white/40 rounded-full"
                        />
                      </>
                    )}
                  </div>
                  
                  {/* Enhanced Label */}
                  <div className="mt-2 text-center">
                    <h3 className="text-sm font-bold text-white mb-1 group-hover:text-blue-300 transition-colors duration-300">
                      {language === 'arabic' ? filter.label : filter.labelEn}
                    </h3>
                    <div className="flex items-center justify-center text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <FireIcon className="h-3 w-3 mr-1" />
                      </motion.div>
                      <span>{language === 'arabic' ? 'انقر للعرض' : 'Click to View'}</span>
                    </div>
                  </div>
                  
                  {/* Active indicator with enhanced design */}
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-white/30"
                    >
                      <StarIcon className="w-5 h-5 text-white animate-pulse" />
                    </motion.div>
                  )}

                  {/* Enhanced floating particles */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1.5 h-1.5 bg-white/60 rounded-full"
                        style={{
                          left: `${15 + i * 20}%`,
                          top: `${25 + i * 12}%`,
                        }}
                        animate={{
                          y: [-15, -30, -15],
                          x: [0, 5, 0],
                          opacity: [0, 1, 0],
                          scale: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: i * 0.4,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </div>
                </motion.button>
              );
            })}
            </div>
          </div>
        </motion.div>

        {/* Properties Grid - Centered and Aligned */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-7xl mx-auto bg-gradient-to-br from-gray-800 via-gray-900 to-slate-900 rounded-2xl p-8 shadow-2xl border border-gray-700"
        >
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 pb-6 border-b border-gray-700">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 flex items-center gap-3">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  {selectedFilter === 'all' ? texts.allProperties : `${language === 'arabic' ? propertyFilters.find(f => f.id === selectedFilter)?.label : propertyFilters.find(f => f.id === selectedFilter)?.labelEn}`}
                </h3>
                <p className="text-gray-400 flex items-center gap-2 text-sm md:text-base">
                  <BuildingOffice2Icon className="h-5 w-5" />
                  {/* Show total from stats if available, otherwise from messages */}
                  {stats.length > 0 ? stats.reduce((sum, stat) => sum + parseInt(stat.count || 0), 0) : messages.length} {texts.totalProperties} • {language === 'arabic' ? 'عرض' : 'Showing'} {displayedMessages.length}
                </p>
              </div>
              
              {/* Filter Reset Button */}
              {selectedFilter !== 'all' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {setSelectedFilter('all'); setCurrentPage(1);}}
                  className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg font-medium text-sm md:text-base"
                >
                  <BuildingOffice2Icon className="h-4 w-4 mr-2 inline" />
                  {language === 'arabic' ? 'عرض الكل' : 'Show All'}
                </motion.button>
              )}
            </div>

          {loading ? (
            <div className="text-center py-16">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"
              ></motion.div>
              <p className="text-gray-400 text-lg">جاري تحميل البيانات...</p>
            </div>
          ) : (
            <>
              {/* Properties Grid - 5 per row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {displayedMessages.map((message, index) => (
                  <motion.div 
                    key={message.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                    onClick={() => navigate(`/property/${message.id}`)}
                    className="group bg-white/5 backdrop-blur-lg rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-500 shadow-2xl border border-white/10 cursor-pointer hover:border-white/20"
                  >
                    {/* Property Image */}
                    <div className="relative h-64 overflow-hidden">
                      <img 
                        src={getVirtualPropertyImage(message.property_type, message.id)}
                        alt={getPropertyTypeLabel(message.property_type)}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=250&fit=crop&auto=format';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      
                      {/* Property Type Badge */}
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className={`absolute top-4 left-4 px-4 py-2 rounded-xl text-sm font-semibold backdrop-blur-md border border-white/20 ${getPropertyTypeColorClass(message.property_type)}`}
                      >
                        {getPropertyTypeLabel(message.property_type)}
                      </motion.div>

                      {/* Source Type Badge */}
                      <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 backdrop-blur-md border border-white/20 rounded-lg">
                        <span className="text-xs text-white/90 font-medium">
                          {message.source_type === 'chat' ? 'واتساب' : 'مستورد'}
                        </span>
                      </div>

                      {/* Price Overlay */}
                      {message.price && message.price !== 'السعر غير محدد' && message.price !== 'غير محدد' && (
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="bg-gradient-to-r from-green-500/90 to-emerald-600/90 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                            <span className="text-white font-bold text-lg">
                              {message.price} {message.price.includes('مليون') || message.price.includes('ألف') ? '' : 'جنيه'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Property Content */}
                    <div className="p-6 space-y-4">
                      {/* Property Title */}
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors duration-300">
                          {message.property_name || message.message}
                        </h3>
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {message.full_description || message.message}
                        </p>
                      </div>

                      {/* Property Details Grid */}
                      <div className="grid grid-cols-2 gap-3 py-4 border-t border-white/10">
                        {/* Location */}
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <MapPinIcon className="h-4 w-4 text-blue-400 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-400">المنطقة</p>
                            <p className="text-sm font-medium text-white truncate">
                              {message.regions || message.location || 'غير محدد'}
                            </p>
                          </div>
                        </div>

                        {/* Bedrooms */}
                        {(message.bedroom || message.bedrooms) && (
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <HomeIcon className="h-4 w-4 text-purple-400 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-400">غرف النوم</p>
                              <p className="text-sm font-medium text-white">
                                {message.bedroom || message.bedrooms}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Bathrooms */}
                        {(message.bathroom || message.bathrooms) && (
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <BuildingOffice2Icon className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-400">الحمامات</p>
                              <p className="text-sm font-medium text-white">
                                {message.bathroom || message.bathrooms}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Area Size */}
                        {message.area_size && (
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <ChartBarIcon className="h-4 w-4 text-orange-400 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-400">المساحة</p>
                              <p className="text-sm font-medium text-white">
                                {message.area_size}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Floor Number */}
                        {(message.floor_no || message.floor_number) && (
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <BuildingStorefrontIcon className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-400">الدور</p>
                              <p className="text-sm font-medium text-white">
                                {message.floor_no || message.floor_number}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Agent Contact */}
                        {hideMobileNumber(message.agent_phone, isAuthenticated) && message.agent_phone !== 'غير متوفر' && (
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <UserIcon className="h-4 w-4 text-green-400 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-400">الوكيل</p>
                              <p className="text-sm font-medium text-white truncate">
                                {message.sender}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Distance Display */}
                      {userLocation && (
                        <div className="flex items-center justify-center py-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                          <MapPinIcon className="h-4 w-4 text-blue-400 ml-2" />
                          <span className="text-sm text-blue-300">
                            {getDistanceToProperty(message)} كم من موقعك
                          </span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4 border-t border-white/10">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/property/${message.id}`);
                          }}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                        >
                          <EyeIcon className="h-5 w-5" />
                          عرض التفاصيل
                        </motion.button>

                        {hideMobileNumber(message.agent_phone, isAuthenticated) && message.agent_phone !== 'غير متوفر' && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`tel:${message.agent_phone}`, '_self');
                            }}
                            className="px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                          >
                            <PhoneIcon className="h-5 w-5" />
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-6 py-8"
                >
                  {/* Pagination Info */}
                  <div className="text-center">
                    <p className="text-gray-300 text-lg mb-2">
                      {language === 'arabic' 
                        ? `عرض ${(currentPage - 1) * propertiesPerPage + 1} - ${Math.min(currentPage * propertiesPerPage, totalProperties)} من ${totalProperties} عقار`
                        : `Showing ${(currentPage - 1) * propertiesPerPage + 1} - ${Math.min(currentPage * propertiesPerPage, totalProperties)} of ${totalProperties} properties`
                      }
                    </p>
                    <p className="text-gray-400">
                      {language === 'arabic' 
                        ? `صفحة ${currentPage} من ${totalPages}`
                        : `Page ${currentPage} of ${totalPages}`
                      }
                    </p>
                  </div>

                  {/* Pagination Buttons */}
                  <div className="flex items-center gap-2">
                    {/* Previous Button */}
                    <motion.button
                      whileHover={currentPage > 1 ? { scale: 1.05 } : {}}
                      whileTap={currentPage > 1 ? { scale: 0.95 } : {}}
                      onClick={prevPage}
                      disabled={currentPage <= 1}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                        currentPage > 1
                          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                          : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {language === 'arabic' ? 'السابق' : 'Previous'}
                    </motion.button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-2 mx-4">
                      {/* First page */}
                      {currentPage > 3 && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => goToPage(1)}
                            className="w-10 h-10 rounded-lg bg-gray-700 text-gray-300 hover:bg-blue-600 hover:text-white transition-all duration-300"
                          >
                            1
                          </motion.button>
                          {currentPage > 4 && <span className="text-gray-500">...</span>}
                        </>
                      )}

                      {/* Visible page numbers */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                        if (pageNumber > totalPages) return null;
                        
                        return (
                          <motion.button
                            key={pageNumber}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => goToPage(pageNumber)}
                            className={`w-10 h-10 rounded-lg font-medium transition-all duration-300 ${
                              pageNumber === currentPage
                                ? 'bg-blue-600 text-white shadow-lg scale-110'
                                : 'bg-gray-700 text-gray-300 hover:bg-blue-600 hover:text-white'
                            }`}
                          >
                            {pageNumber}
                          </motion.button>
                        );
                      })}

                      {/* Last page */}
                      {currentPage < totalPages - 2 && (
                        <>
                          {currentPage < totalPages - 3 && <span className="text-gray-500">...</span>}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => goToPage(totalPages)}
                            className="w-10 h-10 rounded-lg bg-gray-700 text-gray-300 hover:bg-blue-600 hover:text-white transition-all duration-300"
                          >
                            {totalPages}
                          </motion.button>
                        </>
                      )}
                    </div>

                    {/* Next Button */}
                    <motion.button
                      whileHover={currentPage < totalPages ? { scale: 1.05 } : {}}
                      whileTap={currentPage < totalPages ? { scale: 0.95 } : {}}
                      onClick={nextPage}
                      disabled={currentPage >= totalPages}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                        currentPage < totalPages
                          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                          : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {language === 'arabic' ? 'التالي' : 'Next'}
                    </motion.button>
                  </div>

                  {/* Quick Jump */}
                  {totalPages > 10 && (
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 text-sm">
                        {language === 'arabic' ? 'انتقال سريع:' : 'Quick jump:'}
                      </span>
                      <input
                        type="number"
                        min="1"
                        max={totalPages}
                        value={currentPage}
                        onChange={(e) => {
                          const page = parseInt(e.target.value);
                          if (page >= 1 && page <= totalPages) {
                            goToPage(page);
                          }
                        }}
                        className="w-16 px-2 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-center"
                      />
                      <span className="text-gray-400 text-sm">/ {totalPages}</span>
                    </div>
                  )}
                </motion.div>
              )}
            </>
          )}
        </motion.div>

        {/* Footer */}
        <motion.footer 
          className="mt-16 text-center py-8 border-t border-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div className="text-gray-400">
            <p className="mb-2">© 2025 {texts.title}</p>
            <p className="text-sm">{language === 'arabic' ? 'منصة ذكية لعرض العقارات' : 'Smart Platform for Real Estate Listings'}</p>
          </div>
        </motion.footer>
        </div>
      </div>

      {/* AI Chat Assistant Modal */}
      <AIChatAssistant
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        language={language}
      />

      {/* AI Floating Assistant Button */}
      <AIFloatingButton language={language} />
      </div>
    </>
  );
};

export default HomePage;
