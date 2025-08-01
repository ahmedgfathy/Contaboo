'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import LanguageSwitcher from '@/components/common/LanguageSwitcher'

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    mobileNumber: '',
    password: '',
    fullName: '',
    role: 'agent' as 'agent' | 'client',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { t } = useLanguage()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobileNumber: formData.mobileNumber,
          password: formData.password,
          fullName: formData.fullName,
          role: formData.role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'فشل في التسجيل')
        return
      }

      // Redirect to dashboard after successful registration
      router.push('/crm/dashboard')
      router.refresh()
    } catch {
      setError('حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-500 text-sm font-medium transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t('backToHome')}
            </Link>
            <LanguageSwitcher />
          </div>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 arabic-text">
              {t('register')}
            </h2>
            <p className="mt-2 text-sm text-gray-600 arabic-text">
              انضم إلى منصة إدارة العقارات
            </p>
          </div>
          <form className="space-y-6" onSubmit={handleRegister}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg arabic-text shadow-sm">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('fullName')}
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm transition-all duration-200"
                  placeholder={t('fullName')}
                />
              </div>
              
              <div>
                <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('mobile')}
                </label>
                <input
                  id="mobileNumber"
                  name="mobileNumber"
                  type="tel"
                  required
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm transition-all duration-200"
                  placeholder="01002778090"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('role')}
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm transition-all duration-200"
                >
                  <option value="agent">{t('agent')}</option>
                  <option value="client">{t('client')}</option>
                </select>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('password')}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm transition-all duration-200"
                  placeholder={t('password')}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('confirmPassword')}
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm transition-all duration-200"
                  placeholder={t('confirmPassword')}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                {loading ? `${t('loading')}` : t('signUp')}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 arabic-text">
                {t('alreadyHaveAccount')}{' '}
                <Link
                  href="/auth/login"
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  {t('login')}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
