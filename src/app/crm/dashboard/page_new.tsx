'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { localAuth, User } from '@/lib/auth'

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('authToken')
      if (!token) {
        router.push('/auth/login')
        return
      }

      const userData = await localAuth.verifyToken(token)
      if (!userData) {
        router.push('/auth/login')
        return
      }

      setUser(userData)
      setLoading(false)
    }

    verifyAuth()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Contaboo CRM</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user?.fullName || user?.mobileNumber}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {user?.role === 'agent' ? 'Agent Dashboard' : 'Client Dashboard'}
              </h2>
              <p className="text-gray-600">
                {user?.role === 'agent' 
                  ? 'Manage your properties and clients here.'
                  : 'Browse properties and manage your inquiries here.'
                }
              </p>
              <div className="mt-6">
                <span className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  Role: {user?.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
