'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

interface User {
  id: string
  mobileNumber: string
  email?: string
  fullName?: string
  role: 'admin' | 'agent' | 'client'
  isActive: boolean
}

interface PropertyStats {
  totalProperties: number
  availableProperties: number
  soldProperties: number
  rentedProperties: number
  propertyTypes: {
    [key: string]: number
  }
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<PropertyStats | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { t, language, setLanguage } = useLanguage()

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

        if (!response.ok || !data.valid) {
          localStorage.removeItem('authToken')
          router.push('/auth/login')
          return
        }

        setUser(data.user)
        await fetchStats(token)
        setLoading(false)
      } catch (error) {
        console.error('Auth verification failed:', error)
        localStorage.removeItem('authToken')
        router.push('/auth/login')
      }
    }

    verifyAuth()
  }, [router])

  const fetchStats = async (token: string) => {
    try {
      const response = await fetch('/api/properties', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        
        // Calculate statistics from the response
        const totalProperties = data.pagination.total
        const propertyTypes: { [key: string]: number } = {}
        let availableProperties = 0
        let soldProperties = 0
        let rentedProperties = 0

        data.stats.forEach((stat: any) => {
          if (stat.status === 'available') availableProperties += stat._count.id
          if (stat.status === 'sold') soldProperties += stat._count.id
          if (stat.status === 'rented') rentedProperties += stat._count.id
          
          propertyTypes[stat.type] = (propertyTypes[stat.type] || 0) + stat._count.id
        })

        setStats({
          totalProperties,
          availableProperties,
          soldProperties,
          rentedProperties,
          propertyTypes
        })
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-cairo">{t('loading')}</p>
        </div>
      </div>
    )
  }

  const propertyTypeLabels: { [key: string]: string } = {
    apartment: language === 'ar' ? 'شقق' : 'Apartments',
    house: language === 'ar' ? 'بيوت' : 'Houses', 
    land: language === 'ar' ? 'أراضي' : 'Land',
    warehouse: language === 'ar' ? 'مخازن' : 'Warehouses',
    office: language === 'ar' ? 'مكاتب' : 'Offices',
    shop: language === 'ar' ? 'محلات' : 'Shops',
    other: language === 'ar' ? 'أخرى' : 'Other'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 font-cairo">
                {language === 'ar' ? 'كونتابو سي آر إم' : 'Contaboo CRM'}
              </h1>
            </div>
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <button
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
              >
                {language === 'ar' ? 'English' : 'العربية'}
              </button>
              <span className="text-sm text-gray-700 font-cairo">
                {language === 'ar' ? 'أهلاً' : 'Welcome'}, {user?.fullName || user?.mobileNumber}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {user?.role === 'admin' ? (language === 'ar' ? 'مدير' : 'Admin') : 
                 user?.role === 'agent' ? (language === 'ar' ? 'وكيل' : 'Agent') : 
                 (language === 'ar' ? 'عميل' : 'Client')}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
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
          {/* Welcome Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 font-cairo">
                {user?.role === 'admin' ? 
                  (language === 'ar' ? 'لوحة تحكم المدير' : 'Admin Dashboard') :
                  user?.role === 'agent' ? 
                  (language === 'ar' ? 'لوحة تحكم الوكيل' : 'Agent Dashboard') :
                  (language === 'ar' ? 'لوحة تحكم العميل' : 'Client Dashboard')
                }
              </h2>
              <p className="text-gray-600 font-cairo">
                {user?.role === 'admin' ? 
                  (language === 'ar' ? 'إدارة النظام والعقارات والمستخدمين' : 'Manage system, properties and users') :
                  user?.role === 'agent' ? 
                  (language === 'ar' ? 'إدارة عقاراتك وعملائك' : 'Manage your properties and clients') :
                  (language === 'ar' ? 'تصفح العقارات وإدارة استفساراتك' : 'Browse properties and manage your inquiries')
                }
              </p>
            </div>
          </div>

          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Properties Card */}
              <Link href="/crm/properties" className="group">
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 p-6 border-l-4 border-indigo-500">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4 rtl:ml-0 rtl:mr-4">
                      <p className="text-sm font-medium text-gray-600 font-cairo">
                        {language === 'ar' ? 'إجمالي العقارات' : 'Total Properties'}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalProperties.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-sm text-indigo-600 font-medium group-hover:text-indigo-800 transition-colors font-cairo">
                      {language === 'ar' ? 'عرض جميع العقارات ←' : 'View All Properties →'}
                    </span>
                  </div>
                </div>
              </Link>

              {/* Available Properties Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4 rtl:ml-0 rtl:mr-4">
                    <p className="text-sm font-medium text-gray-600 font-cairo">
                      {language === 'ar' ? 'العقارات المتاحة' : 'Available Properties'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{stats.availableProperties.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Sold Properties Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4 rtl:ml-0 rtl:mr-4">
                    <p className="text-sm font-medium text-gray-600 font-cairo">
                      {language === 'ar' ? 'العقارات المباعة' : 'Sold Properties'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{stats.soldProperties.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Rented Properties Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4 rtl:ml-0 rtl:mr-4">
                    <p className="text-sm font-medium text-gray-600 font-cairo">
                      {language === 'ar' ? 'العقارات المؤجرة' : 'Rented Properties'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{stats.rentedProperties.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Property Types Breakdown */}
          {stats && Object.keys(stats.propertyTypes).length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 font-cairo">
                {language === 'ar' ? 'أنواع العقارات' : 'Property Types'}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(stats.propertyTypes).map(([type, count]) => (
                  <div key={type} className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                    <p className="text-sm text-gray-600 font-cairo">{propertyTypeLabels[type] || type}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
