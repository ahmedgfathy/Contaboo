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
  const [language, setLanguage] = useState<'ar' | 'en'>('ar') // Default to Arabic
  const [filters, setFilters] = useState({
    type: '',
    transactionType: '',
    areaNumber: '',
    page: 1
  })
  const router = useRouter()

  useEffect(() => {
    // Load language preference from localStorage
    const savedLanguage = localStorage.getItem('language') as 'ar' | 'en'
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [])

  const toggleLanguage = () => {
    const newLanguage = language === 'ar' ? 'en' : 'ar'
    setLanguage(newLanguage)
    localStorage.setItem('language', newLanguage)
  }

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('authToken')
      console.log('Token from localStorage:', token ? 'Present' : 'Missing')
      
      if (!token) {
        console.log('No token found, redirecting to login')
        router.push('/auth/login')
        return
      }

      try {
        console.log('Verifying token...')
        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        console.log('Auth verification response status:', response.status)
        const data = await response.json()
        console.log('Auth verification data:', data)

        if (!response.ok || !data.valid) {
          console.log('Token invalid, removing and redirecting')
          localStorage.removeItem('authToken')
          router.push('/auth/login')
          return
        }

        console.log('User authenticated:', data.user)
        setUser(data.user)
        await fetchProperties(token)
      } catch (error) {
        console.error('Auth verification failed:', error)
        localStorage.removeItem('authToken')
        router.push('/auth/login')
      }
    }

    verifyAuth()
  }, [router, filters])

  const fetchProperties = async (token: string) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.type && filters.type !== '') params.append('type', filters.type)
      if (filters.transactionType && filters.transactionType !== '') params.append('transactionType', filters.transactionType)
      if (filters.areaNumber && filters.areaNumber !== '') params.append('areaNumber', filters.areaNumber)
      params.append('page', filters.page.toString())
      params.append('limit', '20')

      console.log('Fetching properties with params:', params.toString())
      console.log('Using token:', token ? 'Token present' : 'No token')

      const response = await fetch(`/api/properties?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (response.ok) {
        const data = await response.json()
        console.log('Properties data received:', data)
        console.log('Number of properties:', data.properties?.length || 0)
        
        if (data.success !== false) {
          setProperties(data.properties || [])
          setPagination(data.pagination || { page: 1, limit: 20, total: 0, pages: 0 })
        } else {
          console.error('API returned error:', data.message)
          setProperties([])
          setPagination(null)
        }
      } else {
        console.error('Failed to fetch properties:', response.status, response.statusText)
        const errorData = await response.json().catch(() => ({}))
        console.error('Error details:', errorData)
        setProperties([])
        setPagination(null)
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error)
      setProperties([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const formatPrice = (price?: number) => {
    if (!price) return language === 'ar' ? 'غير محدد' : 'Not specified'
    return price.toLocaleString() + (language === 'ar' ? ' جنيه' : ' EGP')
  }

  const getPropertyTypeLabel = (type: string) => {
    const types: { [key: string]: { ar: string, en: string } } = {
      apartment: { ar: 'شقة', en: 'Apartment' },
      house: { ar: 'بيت', en: 'House' },
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
      sold: { ar: 'تم البيع', en: 'Sold' },
      rented: { ar: 'تم الإيجار', en: 'Rented' }
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600" style={{ fontFamily: 'Cairo, sans-serif' }}>
            {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Link 
                href={user?.role === 'admin' ? "/admin/dashboard" : "/crm/dashboard"}
                className="text-blue-600 hover:text-blue-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                {language === 'ar' ? 'جميع العقارات' : 'All Properties'}
              </h1>
            </div>
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <button
                onClick={toggleLanguage}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 border border-gray-300 rounded-md"
                title={language === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                <span>{language === 'ar' ? 'English' : 'عربي'}</span>
              </button>
              <span className="text-sm text-gray-700">
                {language === 'ar' ? 'مرحباً،' : 'Welcome,'} {user?.fullName || user?.mobileNumber}
              </span>
              <button
                onClick={() => {
                  localStorage.removeItem('authToken')
                  router.push('/auth/login')
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg min-h-96">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {language === 'ar' ? 'إدارة العقارات' : 'Property Management'}
                </h2>
                
                {/* Filters */}
                <div className="flex flex-wrap gap-4">
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">{language === 'ar' ? 'جميع الأنواع' : 'All Types'}</option>
                    <option value="apartment">{language === 'ar' ? 'شقة' : 'Apartment'}</option>
                    <option value="house">{language === 'ar' ? 'بيت' : 'House'}</option>
                    <option value="land">{language === 'ar' ? 'أرض' : 'Land'}</option>
                    <option value="warehouse">{language === 'ar' ? 'مخزن' : 'Warehouse'}</option>
                    <option value="office">{language === 'ar' ? 'مكتب' : 'Office'}</option>
                    <option value="shop">{language === 'ar' ? 'محل' : 'Shop'}</option>
                  </select>

                  <select
                    value={filters.transactionType}
                    onChange={(e) => handleFilterChange('transactionType', e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">{language === 'ar' ? 'جميع المعاملات' : 'All Transactions'}</option>
                    <option value="for_sale">{language === 'ar' ? 'للبيع' : 'For Sale'}</option>
                    <option value="for_rent">{language === 'ar' ? 'للإيجار' : 'For Rent'}</option>
                    <option value="wanted">{language === 'ar' ? 'مطلوب' : 'Wanted'}</option>
                  </select>

                  <input
                    type="number"
                    placeholder={language === 'ar' ? 'رقم الحي' : 'Area Number'}
                    value={filters.areaNumber}
                    onChange={(e) => handleFilterChange('areaNumber', e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Statistics */}
              {pagination && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-800 font-medium">
                    {language === 'ar' ? 
                      `إجمالي العقارات: ${pagination.total} | عرض ${((pagination.page - 1) * pagination.limit) + 1}-${Math.min(pagination.page * pagination.limit, pagination.total)}` :
                      `Total Properties: ${pagination.total} | Showing ${((pagination.page - 1) * pagination.limit) + 1}-${Math.min(pagination.page * pagination.limit, pagination.total)}`
                    }
                  </p>
                </div>
              )}

              {/* Properties Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {properties.map((property) => (
                  <div key={property.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
                        {property.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                        {getTransactionTypeLabel(property.transactionType)}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{language === 'ar' ? 'النوع:' : 'Type:'}</span>
                        <span className="font-medium">{getPropertyTypeLabel(property.type)}</span>
                      </div>
                      
                      {property.areaNumber && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">{language === 'ar' ? 'الحي:' : 'Area:'}</span>
                          <span className="font-medium">{property.areaNumber}</span>
                        </div>
                      )}
                      
                      {property.area && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">{language === 'ar' ? 'المساحة:' : 'Size:'}</span>
                          <span className="font-medium">{property.area} {language === 'ar' ? 'متر²' : 'm²'}</span>
                        </div>
                      )}

                      {property.totalPrice && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">{language === 'ar' ? 'السعر:' : 'Price:'}</span>
                          <span className="font-bold text-green-600">{formatPrice(property.totalPrice)}</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{language === 'ar' ? 'المالك:' : 'Owner:'}</span>
                        <span className="font-medium">{property.owner.fullName || property.owner.mobileNumber}</span>
                      </div>
                      {property.contactNumber && (
                        <div className="flex justify-between mt-1">
                          <span className="text-gray-600">{language === 'ar' ? 'الهاتف:' : 'Phone:'}</span>
                          <a href={`tel:${property.contactNumber}`} className="font-medium text-blue-600 hover:text-blue-800">
                            {property.contactNumber}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex justify-center">
                  <div className="flex space-x-2 rtl:space-x-reverse">
                    {pagination.page > 1 && (
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        {language === 'ar' ? 'السابق' : 'Previous'}
                      </button>
                    )}
                    
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      const page = i + 1
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 border rounded-md text-sm font-medium ${
                            page === pagination.page
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    })}
                    
                    {pagination.page < pagination.pages && (
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        {language === 'ar' ? 'التالي' : 'Next'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {properties.length === 0 && !loading && (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    {language === 'ar' ? 'لا توجد عقارات' : 'No Properties Found'}
                  </h3>
                  <p className="mt-2 text-gray-500">
                    {language === 'ar' ? 'لا توجد عقارات تطابق معايير البحث المحددة' : 'No properties match the specified search criteria.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
