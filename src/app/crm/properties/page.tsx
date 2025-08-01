'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  mobileNumber: string
  email?: string
  fullName?: string
  role: 'admin' | 'agent' | 'client'
  isActive: boolean
}

interface Property {
  id: string
  title: string
  description?: string
  type: string
  transactionType: string
  status: string
  areaNumber?: number
  neighborhoodNumber?: number
  area?: number
  floorNumber?: number
  totalPrice?: number
  installmentAmount?: number
  yearsPaid?: number
  yearsRemaining?: number
  finishing?: string
  contactNumber?: string
  datePosted?: string
  owner: {
    fullName?: string
    mobileNumber: string
  }
  agent?: {
    user: {
      fullName?: string
      mobileNumber: string
    }
  }
  features: Array<{
    feature: {
      nameAr: string
      nameEn: string
      category: string
    }
  }>
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export default function PropertiesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState<'ar' | 'en'>('ar')
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [filterOptions, setFilterOptions] = useState<{
    types: string[]
    transactionTypes: string[]
    areaNumbers: number[]
  }>({
    types: [],
    transactionTypes: [],
    areaNumbers: []
  })
  const [filters, setFilters] = useState({
    type: '',
    transactionType: '',
    areaNumber: '',
    page: 1
  })
  const router = useRouter()

  const text = {
    ar: {
      allProperties: 'جميع العقارات',
      dashboard: 'لوحة التحكم',
      admin: 'مدير',
      backToDashboard: 'العودة للوحة التحكم',
      showing: 'عرض',
      of: 'من',
      properties: 'عقار',
      allTypes: 'جميع الأنواع',
      apartment: 'شقة',
      house: 'منزل',
      land: 'أرض',
      warehouse: 'مخزن',
      office: 'مكتب',
      shop: 'محل',
      allTransactions: 'جميع المعاملات',
      forSale: 'للبيع',
      forRent: 'للإيجار',
      wanted: 'مطلوب',
      sold: 'مُباع',
      rented: 'مُؤجر',
      areaNumber: 'رقم المنطقة',
      type: 'النوع',
      area: 'المنطقة',
      size: 'المساحة',
      floor: 'الطابق',
      totalPrice: 'السعر الإجمالي',
      monthlyInstallment: 'القسط الشهري',
      features: 'المميزات',
      owner: 'المالك',
      contact: 'التواصل',
      posted: 'تاريخ النشر',
      previous: 'السابق',
      next: 'التالي',
      noProperties: 'لا توجد عقارات',
      loading: 'جاري التحميل...',
      notSpecified: 'غير محدد',
      welcome: 'مرحباً،',
      logout: 'تسجيل الخروج',
      propertyDetails: 'تفاصيل العقار',
      close: 'إغلاق',
      viewDetails: 'عرض التفاصيل'
    },
    en: {
      allProperties: 'All Properties',
      dashboard: 'Dashboard',
      admin: 'Admin',
      backToDashboard: 'Back to Dashboard',
      showing: 'Showing',
      of: 'of',
      properties: 'properties',
      allTypes: 'All Types',
      apartment: 'Apartment',
      house: 'House',
      land: 'Land',
      warehouse: 'Warehouse',
      office: 'Office',
      shop: 'Shop',
      allTransactions: 'All Transactions',
      forSale: 'For Sale',
      forRent: 'For Rent',
      wanted: 'Wanted',
      sold: 'Sold',
      rented: 'Rented',
      areaNumber: 'Area Number',
      type: 'Type',
      area: 'Area',
      size: 'Size',
      floor: 'Floor',
      totalPrice: 'Total Price',
      monthlyInstallment: 'Monthly Installment',
      features: 'Features',
      owner: 'Owner',
      contact: 'Contact',
      posted: 'Posted',
      previous: 'Previous',
      next: 'Next',
      noProperties: 'No properties found',
      loading: 'Loading...',
      notSpecified: 'Not specified',
      welcome: 'Welcome,',
      logout: 'Logout',
      propertyDetails: 'Property Details',
      close: 'Close',
      viewDetails: 'View Details'
    }
  }

  const t = text[language]

  const toggleLanguage = () => {
    const newLanguage = language === 'ar' ? 'en' : 'ar'
    setLanguage(newLanguage)
    localStorage.setItem('language', newLanguage)
  }

  useEffect(() => {
    // Load language preference from localStorage
    const savedLanguage = localStorage.getItem('language') as 'ar' | 'en'
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [])

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('authToken')
      console.log('🔐 Token from localStorage:', token ? 'Present' : 'Missing')
      
      if (!token) {
        console.log('❌ No token found, redirecting to login')
        router.push('/auth/login')
        return
      }

      try {
        console.log('🔍 Verifying token...')
        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        console.log('📊 Auth verification response status:', response.status)
        const data = await response.json()
        console.log('📋 Auth verification data:', data)

        if (!response.ok || !data.valid) {
          console.log('❌ Token invalid, removing and redirecting')
          localStorage.removeItem('authToken')
          router.push('/auth/login')
          return
        }

        console.log('✅ User authenticated:', data.user)
        setUser(data.user)
        await fetchProperties(token)
        await fetchFilterOptions(token)
      } catch (error) {
        console.error('💥 Auth verification failed:', error)
        localStorage.removeItem('authToken')
        router.push('/auth/login')
      }
    }

    verifyAuth()
  }, [router, filters])

  const fetchFilterOptions = async (token: string) => {
    try {
      const response = await fetch('/api/properties/filter-options', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setFilterOptions(data)
      }
    } catch (error) {
      console.error('Failed to fetch filter options:', error)
    }
  }

  const fetchProperties = async (token: string) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.type && filters.type !== '') params.append('type', filters.type)
      if (filters.transactionType && filters.transactionType !== '') params.append('transactionType', filters.transactionType)
      if (filters.areaNumber && filters.areaNumber !== '') params.append('areaNumber', filters.areaNumber)
      params.append('page', filters.page.toString())
      params.append('limit', '20')

      const apiUrl = `/api/properties?${params.toString()}`
      console.log('🚀 Fetching properties from:', apiUrl)
      console.log('🔑 Using token:', token ? 'Present' : 'Missing')

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('📈 Response status:', response.status)
      console.log('✅ Response ok:', response.ok)

      if (response.ok) {
        const data = await response.json()
        console.log('📦 Properties data received:', data)
        console.log('🏠 Number of properties:', data.properties?.length || 0)
        console.log('📊 Pagination:', data.pagination)
        
        if (data.success !== false) {
          setProperties(data.properties || [])
          setPagination(data.pagination || { page: 1, limit: 20, total: 0, pages: 0 })
          console.log('✅ Properties and pagination set successfully')
        } else {
          console.error('❌ API returned error:', data.message)
          setProperties([])
          setPagination(null)
        }
      } else {
        console.error('💥 Failed to fetch properties:', response.status, response.statusText)
        const errorData = await response.json().catch(() => ({}))
        console.error('📋 Error details:', errorData)
        setProperties([])
        setPagination(null)
      }
    } catch (error) {
      console.error('💥 Failed to fetch properties:', error)
      setProperties([])
      setPagination(null)
    } finally {
      setLoading(false)
      console.log('🏁 Loading finished')
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const formatPrice = (price?: number) => {
    if (!price) return t.notSpecified
    return price.toLocaleString() + (language === 'ar' ? ' جنيه' : ' EGP')
  }

  const getPropertyTypeLabel = (type: string) => {
    const types: { [key: string]: { ar: string, en: string } } = {
      apartment: { ar: 'شقة', en: 'Apartment' },
      house: { ar: 'منزل', en: 'House' },
      land: { ar: 'أرض', en: 'Land' },
      warehouse: { ar: 'مخزن', en: 'Warehouse' },
      office: { ar: 'مكتب', en: 'Office' },
      shop: { ar: 'محل', en: 'Shop' },
      other: { ar: 'أخرى', en: 'Other' }
    }
    return types[type] ? types[type][language] : type
  }

  const getTransactionTypeLabel = (type: string) => {
    const types: { [key: string]: { ar: string, en: string } } = {
      for_sale: { ar: 'للبيع', en: 'For Sale' },
      for_rent: { ar: 'للإيجار', en: 'For Rent' },
      wanted: { ar: 'مطلوب', en: 'Wanted' },
      sold: { ar: 'مُباع', en: 'Sold' },
      rented: { ar: 'مُؤجر', en: 'Rented' }
    }
    return types[type] ? types[type][language] : type
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      available: 'bg-green-100 text-green-800',
      sold: 'bg-blue-100 text-blue-800',
      rented: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading && properties.length === 0) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 ${language === 'ar' ? 'font-cairo' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">{t.loading}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 ${language === 'ar' ? 'font-cairo' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Navigation Header */}
      <nav className="bg-white shadow-lg border-b-4 border-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Link 
                href={user?.role === 'admin' ? "/admin/dashboard" : "/crm/dashboard"}
                className="flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-all duration-200 font-medium"
              >
                <svg className="w-5 h-5 ml-2 rtl:ml-0 rtl:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {t.backToDashboard}
              </Link>
              <div className="h-8 w-px bg-gray-300 mx-4"></div>
              <h1 className="text-2xl font-bold text-gray-900">{t.allProperties}</h1>
            </div>
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <button
                onClick={toggleLanguage}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
              >
                {language === 'ar' ? 'English' : 'العربية'}
              </button>
              <div className="flex items-center space-x-2 rtl:space-x-reverse bg-indigo-50 px-4 py-2 rounded-lg">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {(user?.fullName || user?.mobileNumber || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{user?.fullName || user?.mobileNumber}</p>
                  <p className="text-indigo-600">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('authToken')
                  router.push('/auth/login')
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {t.logout}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Filters Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
            >
              <option value="">{t.allTypes}</option>
              {filterOptions.types.map((type) => (
                <option key={type} value={type}>
                  {getPropertyTypeLabel(type)}
                </option>
              ))}
            </select>

            <select
              value={filters.transactionType}
              onChange={(e) => handleFilterChange('transactionType', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
            >
              <option value="">{t.allTransactions}</option>
              {filterOptions.transactionTypes.map((type) => (
                <option key={type} value={type}>
                  {getTransactionTypeLabel(type)}
                </option>
              ))}
            </select>

            <select
              value={filters.areaNumber}
              onChange={(e) => handleFilterChange('areaNumber', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
            >
              <option value="">{t.areaNumber} - الكل</option>
              {filterOptions.areaNumbers.map((areaNum) => (
                <option key={areaNum} value={areaNum.toString()}>
                  الحي {areaNum}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Summary */}
        {pagination && (
          <div className="mb-8 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <p className="text-lg text-gray-700">
              {t.showing} {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} {t.of} {pagination.total} {t.properties}
            </p>
          </div>
        )}

        {/* Properties Grid */}
        {properties.length === 0 && !loading ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noProperties}</h3>
            <p className="text-gray-500">لم يتم العثور على عقارات أو هناك مشكلة في الاتصال بقاعدة البيانات</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div 
                key={property.id} 
                className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 cursor-pointer transform hover:-translate-y-1"
                onClick={() => setSelectedProperty(property)}
              >
                {/* Property Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg ${
                      property.transactionType === 'for_sale' ? 'bg-green-500' : 
                      property.transactionType === 'for_rent' ? 'bg-blue-500' : 'bg-orange-500'
                    }`}>
                      {getTransactionTypeLabel(property.transactionType)}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-sm font-medium opacity-90">{getPropertyTypeLabel(property.type)}</p>
                    {property.areaNumber && (
                      <p className="text-xs opacity-75">الحي {property.areaNumber}</p>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 leading-tight mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {property.title}
                  </h3>

                  {/* Quick Info */}
                  <div className="flex items-center justify-between mb-4">
                    {property.area && (
                      <div className="flex items-center text-gray-600">
                        <svg className="w-4 h-4 ml-1 rtl:ml-0 rtl:mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                        <span className="text-sm font-medium">{property.area} م²</span>
                      </div>
                    )}
                    {property.floorNumber !== null && property.floorNumber !== undefined && (
                      <div className="flex items-center text-gray-600">
                        <svg className="w-4 h-4 ml-1 rtl:ml-0 rtl:mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="text-sm font-medium">الطابق {property.floorNumber}</span>
                      </div>
                    )}
                  </div>

                  {/* Price Section */}
                  {(property.totalPrice || property.installmentAmount) && (
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 mb-4">
                      {property.totalPrice && (
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600 font-medium">السعر الإجمالي:</span>
                          <span className="text-lg font-bold text-green-600">{formatPrice(property.totalPrice)}</span>
                        </div>
                      )}
                      {property.installmentAmount && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 font-medium">القسط الشهري:</span>
                          <span className="text-base font-semibold text-blue-600">{formatPrice(property.installmentAmount)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Features Preview */}
                  {property.features.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {property.features.slice(0, 2).map((feature, index) => (
                          <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
                            {language === 'ar' ? feature.feature.nameAr : feature.feature.nameEn}
                          </span>
                        ))}
                        {property.features.length > 2 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                            +{property.features.length - 2} المزيد
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contact & Action */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 ml-1 rtl:ml-0 rtl:mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-sm font-medium truncate max-w-[120px]">
                        {property.owner.fullName || property.owner.mobileNumber}
                      </span>
                    </div>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg">
                      {t.viewDetails}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="mt-12 flex justify-center">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              {pagination.page > 1 && (
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
                >
                  {t.previous}
                </button>
              )}
              
              {/* First page */}
              {pagination.page > 3 && (
                <>
                  <button
                    onClick={() => handlePageChange(1)}
                    className="px-4 py-3 border rounded-lg text-sm font-medium text-gray-700 bg-white border-gray-300 hover:bg-gray-50 transition-all duration-200"
                  >
                    1
                  </button>
                  {pagination.page > 4 && <span className="px-2 text-gray-500">...</span>}
                </>
              )}
              
              {/* Current page range */}
              {Array.from({ length: 5 }, (_, i) => {
                const page = pagination.page - 2 + i
                if (page < 1 || page > pagination.pages) return null
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-3 border rounded-lg text-sm font-medium transition-all duration-200 ${
                      page === pagination.page
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg'
                        : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                )
              }).filter(Boolean)}
              
              {/* Last page */}
              {pagination.page < pagination.pages - 2 && (
                <>
                  {pagination.page < pagination.pages - 3 && <span className="px-2 text-gray-500">...</span>}
                  <button
                    onClick={() => handlePageChange(pagination.pages)}
                    className="px-4 py-3 border rounded-lg text-sm font-medium text-gray-700 bg-white border-gray-300 hover:bg-gray-50 transition-all duration-200"
                  >
                    {pagination.pages}
                  </button>
                </>
              )}
              
              {pagination.page < pagination.pages && (
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
                >
                  {t.next}
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Property Details Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedProperty(null)}>
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedProperty.title}</h2>
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Property Status */}
              <div className="mb-6">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedProperty.status)}`}>
                  {getTransactionTypeLabel(selectedProperty.transactionType)}
                </span>
              </div>

              {/* Property Description */}
              {selectedProperty.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">الوصف / Description</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedProperty.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Property Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.type} / Property Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">{t.type}:</span>
                      <span className="text-gray-900 font-semibold">{getPropertyTypeLabel(selectedProperty.type)}</span>
                    </div>
                    
                    {selectedProperty.areaNumber && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">{t.area}:</span>
                        <span className="text-gray-900 font-semibold">{selectedProperty.areaNumber}</span>
                      </div>
                    )}
                    
                    {selectedProperty.neighborhoodNumber && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">رقم المجاورة:</span>
                        <span className="text-gray-900 font-semibold">{selectedProperty.neighborhoodNumber}</span>
                      </div>
                    )}
                    
                    {selectedProperty.area && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">{t.size}:</span>
                        <span className="text-gray-900 font-semibold">{selectedProperty.area} م²</span>
                      </div>
                    )}
                    
                    {selectedProperty.floorNumber !== null && selectedProperty.floorNumber !== undefined && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">{t.floor}:</span>
                        <span className="text-gray-900 font-semibold">{selectedProperty.floorNumber}</span>
                      </div>
                    )}

                    {selectedProperty.finishing && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">التشطيب:</span>
                        <span className="text-gray-900 font-semibold">{selectedProperty.finishing}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">الأسعار / Pricing</h3>
                  <div className="space-y-3">
                    {selectedProperty.totalPrice && (
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">{t.totalPrice}:</span>
                        <span className="text-xl font-bold text-green-600">{formatPrice(selectedProperty.totalPrice)}</span>
                      </div>
                    )}
                    
                    {selectedProperty.installmentAmount && (
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">{t.monthlyInstallment}:</span>
                        <span className="text-lg font-bold text-blue-600">{formatPrice(selectedProperty.installmentAmount)}</span>
                      </div>
                    )}

                    {selectedProperty.yearsPaid && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">السنوات المدفوعة:</span>
                        <span className="text-gray-900 font-semibold">{selectedProperty.yearsPaid} سنة</span>
                      </div>
                    )}

                    {selectedProperty.yearsRemaining && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">السنوات المتبقية:</span>
                        <span className="text-gray-900 font-semibold">{selectedProperty.yearsRemaining} سنة</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Features */}
              {selectedProperty.features.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.features}</h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedProperty.features.map((feature, index) => (
                      <span key={index} className="px-4 py-2 bg-indigo-50 text-indigo-700 text-sm rounded-full font-medium">
                        {language === 'ar' ? feature.feature.nameAr : feature.feature.nameEn}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="mt-8 bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات التواصل / Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">{t.owner}:</span>
                    <span className="text-gray-900 font-semibold">{selectedProperty.owner.fullName || selectedProperty.owner.mobileNumber}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">رقم المالك:</span>
                    <a href={`tel:${selectedProperty.owner.mobileNumber}`} className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors">
                      {selectedProperty.owner.mobileNumber}
                    </a>
                  </div>

                  {selectedProperty.contactNumber && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 font-medium">{t.contact}:</span>
                      <a href={`tel:${selectedProperty.contactNumber}`} className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors">
                        {selectedProperty.contactNumber}
                      </a>
                    </div>
                  )}

                  {selectedProperty.datePosted && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 font-medium">{t.posted}:</span>
                      <span className="text-gray-900 font-semibold">{new Date(selectedProperty.datePosted).toLocaleDateString('ar-EG')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
                >
                  {t.close}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
