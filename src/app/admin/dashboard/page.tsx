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

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAgents: 0,
    totalClients: 0,
    totalProperties: 0,
    availableProperties: 0,
    soldProperties: 0
  })
  const router = useRouter()

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
        setLoading(false)

        // Fetch stats
        try {
          const statsResponse = await fetch('/api/admin/stats', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          if (statsResponse.ok) {
            const statsData = await statsResponse.json()
            setStats(statsData)
          }
        } catch (error) {
          console.error('Failed to fetch stats:', error)
        }
      } catch (error) {
        console.error('Auth verification failed:', error)
        localStorage.removeItem('authToken')
        router.push('/auth/login')
      }
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
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Contaboo CRM</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.fullName || 'Admin'}</span>
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
          <div className="border-4 border-dashed border-gray-200 rounded-lg min-h-96">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h2>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900">Total Agents</h3>
                  <p className="text-3xl font-bold text-green-600">{stats.totalAgents}</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900">Total Clients</h3>
                  <p className="text-3xl font-bold text-purple-600">{stats.totalClients}</p>
                </div>
                
                                <Link 
                  href="/crm/properties"
                  className="group bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg hover:border-indigo-300 transition-all duration-200"
                >
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">Total Properties</h3>
                  <p className="text-3xl font-bold text-orange-600 group-hover:text-indigo-600">{stats.totalProperties}</p>
                </Link>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900">Available</h3>
                  <p className="text-3xl font-bold text-cyan-600">{stats.availableProperties}</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900">Sold</h3>
                  <p className="text-3xl font-bold text-red-600">{stats.soldProperties}</p>
                </div>
              </div>

              {/* Management Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">User Management</h3>
                  <div className="space-y-2">
                    <button className="w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-50 rounded">
                      View All Users
                    </button>
                    <button className="w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-50 rounded">
                      Manage Agents
                    </button>
                    <button className="w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-50 rounded">
                      Manage Clients
                    </button>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Property Management</h3>
                  <div className="space-y-2">
                    <Link 
                      href="/crm/properties"
                      className="block w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      View All Properties
                    </Link>
                    <button className="w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-50 rounded">
                      Add New Property
                    </button>
                    <button className="w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-50 rounded">
                      Property Reports
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
