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

export default function AdminPropertiesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState<'ar' | 'en'>('ar')
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
      notSpecified: 'غير محدد'
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
      notSpecified: 'Not specified'
    }
  }

  const t = text[language]

  const toggleLanguage = () => {
    const newLanguage = language === 'ar' ? 'en' : 'ar'
    setLanguage(newLanguage)
  }

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('authToken')
      if (!token) {
        router.push('/auth/login')
        return
      }

      try {
        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        const data = await response.json()

        if (!response.ok || !data.valid || data.user.role !== 'admin') {
          localStorage.removeItem('authToken')
          router.push('/auth/login')
          return
        }

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
      if (filters.type) params.append('type', filters.type)
      if (filters.transactionType) params.append('transactionType', filters.transactionType)
      if (filters.areaNumber) params.append('areaNumber', filters.areaNumber)
      params.append('page', filters.page.toString())
      params.append('limit', '20')

      console.log('Fetching properties with params:', params.toString())

      const response = await fetch(`/api/properties?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Properties data received:', data)
        setProperties(data.properties || [])
        setPagination(data.pagination)
      } else {
        console.error('Failed to fetch properties:', response.status, response.statusText)
        setProperties([])
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error)
      setProperties([])
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
    if (!price) return t.notSpecified
    return price.toLocaleString() + ' جنيه'
  }

  const getPropertyTypeLabel = (type: string) => {
    const types: { [key: string]: { ar: string; en: string } } = {
      apartment: { ar: 'شقة', en: 'Apartment' },
      house: { ar: 'منزل', en: 'House' },
      land: { ar: 'أرض', en: 'Land' },
      warehouse: { ar: 'مخزن', en: 'Warehouse' },
      office: { ar: 'مكتب', en: 'Office' },
      shop: { ar: 'محل', en: 'Shop' },
      other: { ar: 'أخرى', en: 'Other' }
    }
    return types[type]?.[language] || type
  }

  const getTransactionTypeLabel = (type: string) => {
    const types: { [key: string]: { ar: string; en: string } } = {
      for_sale: { ar: 'للبيع', en: 'For Sale' },
      for_rent: { ar: 'للإيجار', en: 'For Rent' },
      wanted: { ar: 'مطلوب', en: 'Wanted' },
      sold: { ar: 'مُباع', en: 'Sold' },
      rented: { ar: 'مُؤجر', en: 'Rented' }
    }
    return types[type]?.[language] || type
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
                href="/admin/dashboard"
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
                    {(user?.fullName || user?.mobileNumber || 'A').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{user?.fullName || user?.mobileNumber}</p>
                  <p className="text-indigo-600">{t.admin}</p>
                </div>
              </div>
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
              <option value="apartment">{t.apartment}</option>
              <option value="house">{t.house}</option>
              <option value="land">{t.land}</option>
              <option value="warehouse">{t.warehouse}</option>
              <option value="office">{t.office}</option>
              <option value="shop">{t.shop}</option>
            </select>

            <select
              value={filters.transactionType}
              onChange={(e) => handleFilterChange('transactionType', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
            >
              <option value="">{t.allTransactions}</option>
              <option value="for_sale">{t.forSale}</option>
              <option value="for_rent">{t.forRent}</option>
              <option value="wanted">{t.wanted}</option>
              <option value="sold">{t.sold}</option>
              <option value="rented">{t.rented}</option>
            </select>

            <input
              type="number"
              placeholder={t.areaNumber}
              value={filters.areaNumber}
              onChange={(e) => handleFilterChange('areaNumber', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
            />
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
            <p className="text-gray-500">لم يتم العثور على عقارات بالمعايير المحددة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <div key={property.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-2 flex-1">
                      {property.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-3 rtl:ml-0 rtl:mr-3 ${getStatusColor(property.status)}`}>
                      {getTransactionTypeLabel(property.transactionType)}
                    </span>
                  </div>

                  {/* Property Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 font-medium">{t.type}:</span>
                      <span className="text-gray-900 font-semibold">{getPropertyTypeLabel(property.type)}</span>
                    </div>
                    
                    {property.areaNumber && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 font-medium">{t.area}:</span>
                        <span className="text-gray-900 font-semibold">{property.areaNumber}</span>
                      </div>
                    )}
                    
                    {property.area && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 font-medium">{t.size}:</span>
                        <span className="text-gray-900 font-semibold">{property.area} م²</span>
                      </div>
                    )}
                    
                    {property.floorNumber !== null && property.floorNumber !== undefined && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 font-medium">{t.floor}:</span>
                        <span className="text-gray-900 font-semibold">{property.floorNumber}</span>
                      </div>
                    )}
                  </div>

                  {/* Price Information */}
                  {(property.totalPrice || property.installmentAmount) && (
                    <div className="border-t border-gray-100 pt-4 mb-6">
                      {property.totalPrice && (
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm text-gray-600 font-medium">{t.totalPrice}:</span>
                          <span className="text-lg font-bold text-green-600">{formatPrice(property.totalPrice)}</span>
                        </div>
                      )}
                      {property.installmentAmount && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 font-medium">{t.monthlyInstallment}:</span>
                          <span className="text-base font-semibold text-blue-600">{formatPrice(property.installmentAmount)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Features */}
                  {property.features.length > 0 && (
                    <div className="mb-6">
                      <p className="text-sm text-gray-600 font-medium mb-3">{t.features}:</p>
                      <div className="flex flex-wrap gap-2">
                        {property.features.slice(0, 3).map((feature, index) => (
                          <span key={index} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full font-medium">
                            {language === 'ar' ? feature.feature.nameAr : feature.feature.nameEn}
                          </span>
                        ))}
                        {property.features.length > 3 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                            +{property.features.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contact Information */}
                  <div className="border-t border-gray-100 pt-4 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 font-medium">{t.owner}:</span>
                      <span className="text-gray-900 font-semibold">{property.owner.fullName || property.owner.mobileNumber}</span>
                    </div>
                    {property.contactNumber && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 font-medium">{t.contact}:</span>
                        <a href={`tel:${property.contactNumber}`} className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors">
                          {property.contactNumber}
                        </a>
                      </div>
                    )}
                    {property.datePosted && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 font-medium">{t.posted}:</span>
                        <span className="text-gray-900 font-semibold">{new Date(property.datePosted).toLocaleDateString('ar-EG')}</span>
                      </div>
                    )}
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
              
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const page = i + 1
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
              })}
              
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
    </div>
  )
}
