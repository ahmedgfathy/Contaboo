import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check if user is admin
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'admin') {
    redirect('/crm/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Contaboo Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome Admin</span>
              <form action="/auth/logout" method="post">
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-blue-600">0</p>
              <p className="text-sm text-gray-500">All registered users</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Agents</h3>
              <p className="text-3xl font-bold text-green-600">0</p>
              <p className="text-sm text-gray-500">Active agents</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Properties</h3>
              <p className="text-3xl font-bold text-purple-600">0</p>
              <p className="text-sm text-gray-500">Listed properties</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Transactions</h3>
              <p className="text-3xl font-bold text-orange-600">0</p>
              <p className="text-sm text-gray-500">Completed deals</p>
            </div>
          </div>

          {/* Management Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Management */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Management</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                  <span className="font-medium">Manage Agents</span>
                  <p className="text-sm text-gray-600">View and manage real estate agents</p>
                </button>
                <button className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                  <span className="font-medium">Manage Clients</span>
                  <p className="text-sm text-gray-600">View and manage clients</p>
                </button>
                <button className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                  <span className="font-medium">User Permissions</span>
                  <p className="text-sm text-gray-600">Set user roles and permissions</p>
                </button>
              </div>
            </div>

            {/* Property Management */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Management</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                  <span className="font-medium">All Properties</span>
                  <p className="text-sm text-gray-600">View and manage all properties</p>
                </button>
                <button className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                  <span className="font-medium">Property Categories</span>
                  <p className="text-sm text-gray-600">Manage property types and categories</p>
                </button>
                <button className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                  <span className="font-medium">Featured Properties</span>
                  <p className="text-sm text-gray-600">Set featured properties on homepage</p>
                </button>
              </div>
            </div>

            {/* Reports & Analytics */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports & Analytics</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                  <span className="font-medium">Sales Reports</span>
                  <p className="text-sm text-gray-600">View sales performance and metrics</p>
                </button>
                <button className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                  <span className="font-medium">Agent Performance</span>
                  <p className="text-sm text-gray-600">Track agent performance metrics</p>
                </button>
                <button className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                  <span className="font-medium">Market Analysis</span>
                  <p className="text-sm text-gray-600">Property market trends and analysis</p>
                </button>
              </div>
            </div>

            {/* System Settings */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                  <span className="font-medium">General Settings</span>
                  <p className="text-sm text-gray-600">Configure system-wide settings</p>
                </button>
                <button className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                  <span className="font-medium">Email Templates</span>
                  <p className="text-sm text-gray-600">Manage notification templates</p>
                </button>
                <button className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                  <span className="font-medium">Backup & Export</span>
                  <p className="text-sm text-gray-600">Data backup and export options</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
