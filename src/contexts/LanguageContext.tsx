'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'ar' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  ar: {
    // Auth
    'login': 'تسجيل الدخول',
    'register': 'إنشاء حساب جديد',
    'logout': 'تسجيل الخروج',
    'email': 'البريد الإلكتروني',
    'mobile': 'رقم الموبايل',
    'password': 'كلمة المرور',
    'confirmPassword': 'تأكيد كلمة المرور',
    'fullName': 'الاسم الكامل',
    'role': 'الدور',
    'agent': 'وكيل عقاري',
    'client': 'عميل',
    'admin': 'مدير',
    'signIn': 'دخول',
    'signUp': 'تسجيل',
    'backToHome': '← العودة للرئيسية',
    'dontHaveAccount': 'مش عندك حساب؟',
    'alreadyHaveAccount': 'عندك حساب خلاص؟',
    
    // Home Page
    'findYourPerfect': 'ابحث عن وحداتك',
    'heroDescription': 'اكتشف عقارات مذهلة مع وكلائنا العقاريين المحترفين. بيت أحلامك على بُعد نقرة واحدة.',
    'browseProperties': 'تصفح العقارات',
    'registerAsAgent': 'سجل كوكيل عقاري',
    
    // Features
    'expertAgents': 'وكلاء خبراء',
    'expertAgentsDesc': 'فريق من الوكلاء العقاريين ذوي الخبرة هيساعدوك تلاقي العقار المثالي.',
    'wideSelection': 'تشكيلة واسعة',
    'wideSelectionDesc': 'آلاف العقارات في مختلف المناطق والأسعار عشان تناسب كل الاحتياجات.',
    'trustedService': 'خدمة موثوقة',
    'trustedServiceDesc': 'خدمة عملاء ممتازة ومعاملات آمنة مع ضمان كامل.',
    
    // Dashboard
    'dashboard': 'لوحة التحكم',
    'adminDashboard': 'لوحة تحكم المدير',
    'welcome': 'أهلاً وسهلاً',
    'totalUsers': 'إجمالي المستخدمين',
    'totalAgents': 'إجمالي الوكلاء',
    'totalClients': 'إجمالي العملاء',
    'totalProperties': 'إجمالي العقارات',
    'availableProperties': 'العقارات المتاحة',
    'soldProperties': 'العقارات المباعة',
    'quickActions': 'إجراءات سريعة',
    'addNewProperty': 'إضافة عقار جديد',
    'manageUsers': 'إدارة المستخدمين',
    'viewReports': 'عرض التقارير',
    'settings': 'الإعدادات',
    
    // Common
    'loading': 'جاري التحميل...',
    'error': 'خطأ',
    'success': 'تم بنجاح',
    'cancel': 'إلغاء',
    'save': 'حفظ',
    'edit': 'تعديل',
    'delete': 'حذف',
    'view': 'عرض',
    'add': 'إضافة',
    'search': 'بحث',
    'filter': 'تصفية',
    'sort': 'ترتيب',
    'next': 'التالي',
    'previous': 'السابق',
    'close': 'إغلاق',
    'open': 'فتح',
    'submit': 'إرسال',
    'reset': 'إعادة تعيين',
    
    // Footer
    'copyright': '© 2025 كونتابو. جميع الحقوق محفوظة.',
  },
  en: {
    // Auth
    'login': 'Login',
    'register': 'Register',
    'logout': 'Logout',
    'email': 'Email',
    'mobile': 'Mobile Number',
    'password': 'Password',
    'confirmPassword': 'Confirm Password',
    'fullName': 'Full Name',
    'role': 'Role',
    'agent': 'Agent',
    'client': 'Client',
    'admin': 'Admin',
    'signIn': 'Sign In',
    'signUp': 'Sign Up',
    'backToHome': '← Back to Home',
    'dontHaveAccount': "Don't have an account?",
    'alreadyHaveAccount': 'Already have an account?',
    
    // Home Page
    'findYourPerfect': 'Find Your Units',
    'heroDescription': 'Discover amazing properties with our professional real estate agents. Your dream home is just a click away.',
    'browseProperties': 'Browse Properties',
    'registerAsAgent': 'Register as Agent',
    
    // Features
    'expertAgents': 'Expert Agents',
    'expertAgentsDesc': 'Professional real estate agents with years of experience to help you find the perfect property.',
    'wideSelection': 'Wide Selection',
    'wideSelectionDesc': 'Thousands of properties across different locations and price ranges to suit all needs.',
    'trustedService': 'Trusted Service',
    'trustedServiceDesc': 'Excellent customer service and secure transactions with full guarantee.',
    
    // Dashboard
    'dashboard': 'Dashboard',
    'adminDashboard': 'Admin Dashboard',
    'welcome': 'Welcome',
    'totalUsers': 'Total Users',
    'totalAgents': 'Total Agents',
    'totalClients': 'Total Clients',
    'totalProperties': 'Total Properties',
    'availableProperties': 'Available Properties',
    'soldProperties': 'Sold Properties',
    'quickActions': 'Quick Actions',
    'addNewProperty': 'Add New Property',
    'manageUsers': 'Manage Users',
    'viewReports': 'View Reports',
    'settings': 'Settings',
    
    // Common
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
    'cancel': 'Cancel',
    'save': 'Save',
    'edit': 'Edit',
    'delete': 'Delete',
    'view': 'View',
    'add': 'Add',
    'search': 'Search',
    'filter': 'Filter',
    'sort': 'Sort',
    'next': 'Next',
    'previous': 'Previous',
    'close': 'Close',
    'open': 'Open',
    'submit': 'Submit',
    'reset': 'Reset',
    
    // Footer
    'copyright': '© 2025 Contaboo. All rights reserved.',
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ar')

  useEffect(() => {
    // Load language from localStorage, but default to Arabic
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && (savedLanguage === 'ar' || savedLanguage === 'en')) {
      setLanguage(savedLanguage)
    } else {
      // Set Arabic as default if no saved language
      setLanguage('ar')
      localStorage.setItem('language', 'ar')
    }
  }, [])

  useEffect(() => {
    // Save language to localStorage and update document
    localStorage.setItem('language', language)
    document.documentElement.lang = language === 'ar' ? 'ar' : 'en'
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    document.body.style.direction = language === 'ar' ? 'rtl' : 'ltr'
    document.body.style.textAlign = language === 'ar' ? 'right' : 'left'
    
    // Update body class for font and text improvements
    if (language === 'ar') {
      document.body.classList.add('arabic-text')
      document.body.classList.remove('english-text')
    } else {
      document.body.classList.add('english-text')
      document.body.classList.remove('arabic-text')
    }
  }, [language])

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}
