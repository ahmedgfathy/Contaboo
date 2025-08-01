'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar')
  }

  return (
    <button
      onClick={toggleLanguage}
      className="inline-flex items-center p-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
      title={language === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
      aria-label={language === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
    >
      <div className="w-6 h-6 flex items-center justify-center">
        {language === 'ar' ? (
          // US Flag for English
          <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-sm">
            <defs>
              <clipPath id="us-flag">
                <rect width="512" height="512"/>
              </clipPath>
            </defs>
            <g clipPath="url(#us-flag)">
              <rect width="512" height="512" fill="#B22234"/>
              <rect y="39.4" width="512" height="39.4" fill="#FFFFFF"/>
              <rect y="118.2" width="512" height="39.4" fill="#FFFFFF"/>
              <rect y="197" width="512" height="39.4" fill="#FFFFFF"/>
              <rect y="275.8" width="512" height="39.4" fill="#FFFFFF"/>
              <rect y="354.6" width="512" height="39.4" fill="#FFFFFF"/>
              <rect y="433.4" width="512" height="39.4" fill="#FFFFFF"/>
              <rect width="256" height="276" fill="#3C3B6E"/>
            </g>
          </svg>
        ) : (
          // Egypt Flag for Arabic
          <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-sm">
            <rect width="512" height="171" fill="#CE1126"/>
            <rect y="171" width="512" height="171" fill="#FFFFFF"/>
            <rect y="342" width="512" height="170" fill="#000000"/>
            <g transform="translate(256,256)">
              <circle r="85" fill="#FFCD00" stroke="#B8860B" strokeWidth="4"/>
              <text y="5" textAnchor="middle" fontSize="40" fill="#8B4513">☪</text>
            </g>
          </svg>
        )}
      </div>
    </button>
  )
}
