'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import LanguageSwitcher from '@/components/common/LanguageSwitcher'

export default function Home() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 font-cairo">كونتابو</h1>
            </div>
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <LanguageSwitcher />
              <Link
                href="/auth/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-100"
              >
                {t('login')}
              </Link>
              <Link
                href="/auth/register"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                {t('registerAsAgent')}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        <div className="text-center py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl font-cairo arabic-text mb-4">
              <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {t('findYourPerfect')}
              </span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 sm:text-xl arabic-text leading-relaxed">
              {t('heroDescription')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center max-w-lg mx-auto mb-8">
            <Link
              href="/properties"
              className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            >
              {t('browseProperties')}
            </Link>
            <Link
              href="/auth/register"
              className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border-2 border-indigo-600 text-base font-medium rounded-xl text-indigo-600 bg-white hover:bg-indigo-50 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              {t('registerAsAgent')}
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-4 mb-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            <div className="text-center bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white mx-auto mb-4 shadow-lg">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{t('wideSelection')}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t('wideSelectionDesc')}
              </p>
            </div>
            
            <div className="text-center bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white mx-auto mb-4 shadow-lg">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{t('expertAgents')}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t('expertAgentsDesc')}
              </p>
            </div>
            
            <div className="text-center bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white mx-auto mb-4 shadow-lg">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{t('trustedService')}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t('trustedServiceDesc')}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-cairo">
              {t('copyright')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
