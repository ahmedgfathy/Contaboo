import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BuildingOffice2Icon, 
  HomeModernIcon, 
  MapPinIcon, 
  BuildingStorefrontIcon, 
  BuildingLibraryIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
  UserIcon,
  GlobeAltIcon,
  MapIcon,
  ClockIcon,
  CurrencyDollarIcon,
  HomeIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

// Import API functions
import { getAllProperties, getPropertyTypeStats, searchProperties } from '../services/apiService';

const HomePage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [stats, setStats] = useState([]);
  const [displayedMessages, setDisplayedMessages] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [itemsToShow, setItemsToShow] = useState(10);
  const [language, setLanguage] = useState('arabic');
  const [isInitialized, setIsInitialized] = useState(false);

  // FIXED: Property filters with correct Arabic spelling
  const propertyFilters = [
    { id: 'all', label: 'جميع العقارات', labelEn: 'All Properties', icon: BuildingOffice2Icon, color: 'from-purple-500 to-pink-500' },
    { id: 'apartment', label: 'شقق', labelEn: 'Apartments', icon: HomeModernIcon, color: 'from-blue-500 to-cyan-500' },
    { id: 'villa', label: 'فيلات', labelEn: 'Villas', icon: HomeModernIcon, color: 'from-green-500 to-emerald-500' }, // FIXED: فيلل → فيلات
    { id: 'land', label: 'أراضي', labelEn: 'Land', icon: MapPinIcon, color: 'from-orange-500 to-red-500' },
    { id: 'office', label: 'مكاتب', labelEn: 'Offices', icon: BuildingStorefrontIcon, color: 'from-indigo-500 to-purple-500' },
    { id: 'warehouse', label: 'مخازن', labelEn: 'Warehouses', icon: BuildingLibraryIcon, color: 'from-pink-500 to-rose-500' }
  ];

  useEffect(() => {
    if (!isInitialized) {
      loadInitialData();
      setIsInitialized(true);
    }
    const savedLanguage = localStorage.getItem('publicLanguage') || 'arabic';
    setLanguage(savedLanguage);
  }, [isInitialized]);

  const loadInitialData = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      console.log('🔄 Loading initial data...');
      
      // Load properties
      const allProperties = await getAllProperties(10000);
      console.log('✅ Loaded properties:', allProperties?.length || 0);
      if (allProperties && allProperties.length > 0) {
        setMessages(allProperties);
      }
      
      // Load stats
      const statsData = await getPropertyTypeStats();
      console.log('✅ Loaded stats:', statsData);
      if (statsData?.success && statsData.data) {
        setStats(statsData.data);
      }
      
    } catch (error) {
      console.error('❌ Error loading data:', error);
      setStats([]);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Search function using correct API endpoint
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadInitialData();
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Searching for:', searchTerm, 'Filter:', selectedFilter);
      
      // Use searchProperties with correct parameters
      const filterType = selectedFilter === 'all' ? null : selectedFilter;
      const searchResults = await searchProperties(searchTerm, filterType, 10000);
      
      console.log('✅ Search results:', searchResults?.length || 0);
      setMessages(searchResults || []);
      setCurrentPage(1);
    } catch (error) {
      console.error('❌ Search error:', error);
      alert(language === 'arabic' ? 'حدث خطأ في البحث. يرجى المحاولة مرة أخرى.' : 'Search error. Please try again.');
    }
    setLoading(false);
  };

  // FIXED: Filter click handler that properly filters data
  const handleStatClick = async (filterType) => {
    console.log('🎯 Filter clicked:', filterType);
    
    setSelectedFilter(filterType);
    setItemsToShow(10);
    
    // If there's an active search, re-run it with the new filter
    if (searchTerm.trim()) {
      handleSearch();
    } else {
      // Load filtered data without search term
      await loadFilteredData(filterType);
    }
  };

  // FIXED: Function to load data by filter
  const loadFilteredData = async (filterType = 'all') => {
    setLoading(true);
    try {
      console.log('🔄 Loading filtered data for:', filterType);
      
      if (filterType === 'all') {
        // Load all properties
        const allProperties = await getAllProperties(10000);
        setMessages(allProperties || []);
      } else {
        // Use searchProperties with empty search term but with filter
        const filteredProperties = await searchProperties('', filterType, 10000);
        setMessages(filteredProperties || []);
      }
      
      console.log('✅ Filtered data loaded');
    } catch (error) {
      console.error('❌ Error loading filtered data:', error);
      setMessages([]);
    }
    setLoading(false);
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    setItemsToShow(10);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setItemsToShow(10);
  };

  const handleLanguageSwitch = () => {
    const newLanguage = language === 'arabic' ? 'english' : 'arabic';
    setLanguage(newLanguage);
    localStorage.setItem('publicLanguage', newLanguage);
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
    totalProperties: 'إجمالي العقارات',
    english: 'English',
    brandName: 'كونتابو',
    brandSubtitle: 'منصة العقارات الذكية'
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
    totalProperties: 'Total Properties',
    english: 'العربية',
    brandName: 'Contaboo',
    brandSubtitle: 'Smart Real Estate Platform'
  };

  // Update displayed messages when messages or itemsToShow changes
  useEffect(() => {
    const messagesToShow = messages.slice(0, itemsToShow);
    setDisplayedMessages(messagesToShow);
    setHasMore(messages.length > itemsToShow);
  }, [messages, itemsToShow]);

  const loadMoreProperties = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setItemsToShow(prev => prev + 10);
      setLoadingMore(false);
    }, 500);
  };

  const getPropertyTypeLabel = (type) => {
    if (!type) return language === 'arabic' ? 'غير محدد' : 'Not specified';
    
    const mappings = {
      'apartment': language === 'arabic' ? 'شقة' : 'Apartment',
      'villa': language === 'arabic' ? 'فيلا' : 'Villa',
      'land': language === 'arabic' ? 'أرض' : 'Land',
      'office': language === 'arabic' ? 'مكتب' : 'Office',
      'warehouse': language === 'arabic' ? 'مخزن' : 'Warehouse'
    };
    
    return mappings[type.toLowerCase()] || type;
  };

  const getPropertyTypeColorClass = (type) => {
    const colorMappings = {
      'apartment': 'from-blue-500 to-cyan-500',
      'villa': 'from-green-500 to-emerald-500',
      'land': 'from-orange-500 to-red-500',
      'office': 'from-indigo-500 to-purple-500',
      'warehouse': 'from-pink-500 to-rose-500'
    };
    
    return colorMappings[type?.toLowerCase()] || 'from-gray-500 to-slate-500';
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 ${language === 'arabic' ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
        <div className="absolute inset-0"></div>
        
        <div className="relative z-10 px-4 py-6">
          {/* Top Navigation */}
          <nav className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BuildingOffice2Icon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{texts.brandName}</h1>
                <p className="text-sm text-gray-300">{texts.brandSubtitle}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <motion.button
                onClick={handleLanguageSwitch}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all duration-200"
              >
                <GlobeAltIcon className="w-5 h-5 mr-2" />
                {texts.english}
              </motion.button>
              
              <motion.button
                onClick={() => navigate('/login')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg text-white font-medium transition-all duration-200"
              >
                <UserIcon className="w-5 h-5 mr-2" />
                {texts.login}
              </motion.button>
            </div>
          </nav>

          {/* Hero Section */}
          <div className="text-center py-12">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6"
            >
              {texts.title}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
            >
              {texts.subtitle}
            </motion.p>

            {/* Search Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="max-w-2xl mx-auto"
            >
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder={texts.search}
                  className={`w-full px-6 py-4 text-lg bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${language === 'arabic' ? 'text-right' : 'text-left'}`}
                />
                <motion.button
                  onClick={handleSearch}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={loading}
                  className={`absolute top-2 ${language === 'arabic' ? 'left-2' : 'right-2'} px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white font-medium transition-all duration-200 disabled:opacity-50`}
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <MagnifyingGlassIcon className="w-5 h-5 mr-2 inline" />
                      {texts.searchBtn}
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Property Type Filters - FIXED: Working circles */}
      <div className="px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-white text-center mb-8"
          >
            {texts.allProperties}
          </motion.h2>
          
          <div className="flex justify-center">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 justify-items-center max-w-7xl">
              {propertyFilters.map((filter, index) => {
                const IconComponent = filter.icon;
                
                // Calculate count based on filter type
                let count = 0;
                if (filter.id === 'all') {
                  count = stats.reduce((sum, stat) => sum + parseInt(stat.count || 0), 0);
                } else {
                  // Map API property categories to filter types
                  const categoryMappings = {
                    apartment: ['Compound Apartments', 'Local Apartments', 'Local Duplex', 'Local Roof'],
                    villa: ['Independent Villas', 'Townhouse', 'Twin House', 'Land & Local Villas'],
                    land: ['Land & Local Villas', 'Various Areas'],
                    office: ['Commercial & Administrative'],
                    warehouse: ['Commercial & Administrative']
                  };
                  
                  const mappedCategories = categoryMappings[filter.id] || [];
                  count = stats.filter(stat => {
                    if (!stat.property_type) return false;
                    return mappedCategories.includes(stat.property_type) ||
                           mappedCategories.some(category => 
                             stat.property_type.toLowerCase().includes(category.toLowerCase()) ||
                             category.toLowerCase().includes(stat.property_type.toLowerCase())
                           );
                  }).reduce((sum, stat) => sum + parseInt(stat.count || 0), 0);
                }
                
                const isActive = selectedFilter === filter.id;
                
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
                    {/* Glow effects */}
                    <div className={`absolute inset-0 blur-2xl opacity-20 transition-opacity duration-300 ${
                      isActive ? 'opacity-50' : 'group-hover:opacity-40'
                    } bg-gradient-to-r ${filter.color} rounded-full`}></div>
                    
                    <div className={`absolute inset-0 blur-xl opacity-30 transition-opacity duration-300 ${
                      isActive ? 'opacity-60' : 'group-hover:opacity-50'
                    } bg-gradient-to-r ${filter.color} rounded-full`}></div>
                    
                    {/* Main Circle */}
                    <div className={`
                      relative w-32 h-32 flex flex-col items-center justify-center
                      bg-gradient-to-br transition-all duration-500 shadow-2xl 
                      border-4 border-white/10 group-hover:border-white/30 overflow-hidden
                      rounded-full
                      ${isActive 
                        ? `${filter.color} ring-4 ring-white/40 shadow-3xl border-white/40` 
                        : 'from-slate-700/90 to-slate-800/90 group-hover:from-slate-600/90 group-hover:to-slate-700/90'
                      }
                    `}>
                      
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                        <div className="absolute top-0 left-0 w-full h-full opacity-50"></div>
                      </div>
                      
                      {/* Content */}
                      <div className="relative z-10 flex flex-col items-center justify-center text-center px-3">
                        <IconComponent className={`w-8 h-8 mb-2 transition-all duration-300 ${
                          isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                        }`} />
                        
                        <span className={`text-2xl font-bold mb-1 transition-all duration-300 ${
                          isActive ? 'text-white' : 'text-gray-200 group-hover:text-white'
                        }`}>
                          {count.toLocaleString()}
                        </span>
                        
                        <span className={`text-xs font-medium leading-tight transition-all duration-300 ${
                          isActive ? 'text-white/90' : 'text-gray-300 group-hover:text-white/90'
                        }`}>
                          {language === 'arabic' ? filter.label : filter.labelEn}
                        </span>
                      </div>
                      
                      {/* Active indicator */}
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full shadow-lg"
                        />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Loading state */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white">جاري التحميل...</p>
              </div>
            </div>
          )}

          {/* Properties grid */}
          {!loading && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence>
                  {displayedMessages.map((property, index) => (
                    <motion.div
                      key={property.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden hover:bg-white/20 transition-all duration-300 border border-white/10"
                    >
                      {/* Property Image */}
                      <div className="relative h-48 bg-gradient-to-br from-gray-700 to-gray-800">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <PhotoIcon className="w-16 h-16 text-gray-400" />
                        </div>
                        <div className="absolute top-3 left-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getPropertyTypeColorClass(property.property_type)}`}>
                            {getPropertyTypeLabel(property.property_type)}
                          </span>
                        </div>
                      </div>

                      {/* Property Info */}
                      <div className="p-4">
                        <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">
                          {property.property_name || property.message || 'عقار للبيع'}
                        </h3>
                        
                        <div className="space-y-2 text-sm text-gray-300">
                          <div className="flex items-center">
                            <MapIcon className="w-4 h-4 mr-2" />
                            <span>{property.location || texts.notSpecified}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                            <span>{property.price || texts.notSpecified}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <ClockIcon className="w-4 h-4 mr-2" />
                            <span>{new Date(property.imported_at || property.timestamp).toLocaleDateString('ar-EG')}</span>
                          </div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg text-white font-medium transition-all duration-200"
                        >
                          {texts.viewDetails}
                          <ArrowRightIcon className="w-4 h-4 mr-2 inline" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center mt-8">
                  <motion.button
                    onClick={loadMoreProperties}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={loadingMore}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg text-white font-medium transition-all duration-200 disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                    ) : (
                      'عرض المزيد'
                    )}
                  </motion.button>
                </div>
              )}

              {/* Results summary */}
              <div className="text-center mt-8 text-gray-300">
                <p>
                  {`${texts.totalProperties}: ${messages.length} • ${language === 'arabic' ? 'عرض' : 'Showing'} ${displayedMessages.length}`}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
