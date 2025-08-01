'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import LanguageSwitcher from '@/components/common/LanguageSwitcher'

export default function LoginForm() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { t } = useLanguage()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: identifier,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Login failed')
      } else {
        // Store the token in localStorage for client-side auth
        localStorage.setItem('authToken', data.token)
        
        // Add a small delay to ensure localStorage is set
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Redirect based on user role
        if (data.user.role === 'admin') {
          router.push('/admin/dashboard')
        } else if (data.user.role === 'agent') {
          router.push('/crm/dashboard')
        } else {
          router.push('/dashboard')
        }
        router.refresh()
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
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
              {t('login')}
            </h2>
            <p className="mt-2 text-sm text-gray-600 arabic-text">
              دخول إلى نظام إدارة العقارات
            </p>
          </div>
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg arabic-text shadow-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="identifier" className="sr-only">
                  {t('mobile')} {t('email')}
                </label>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm shadow-sm transition-all duration-200"
                  placeholder={`${t('mobile')} أو ${t('email')}`}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  {t('password')}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm shadow-sm transition-all duration-200"
                  placeholder={t('password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                {loading ? `${t('loading')}` : t('signIn')}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 arabic-text">
                {t('dontHaveAccount')}{' '}
                <Link
                  href="/auth/register"
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  {t('register')}
                </Link>
              </p>
            </div>

            <div className="text-center mt-4">
              <p className="text-xs text-gray-500 arabic-text">
                دخول المدير: استخدم البريد الإلكتروني ({process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'ahmedgfathy@gmail.com'})
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
