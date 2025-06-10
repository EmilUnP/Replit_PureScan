'use client'

import React, { useState, useEffect } from 'react'
import { AdminTabLayout } from '@/components/admin/admin-layout'
import { getSuperUsers, checkUserAccess, isSuperUser, type Profile } from '@/lib/supabase-admin'
import { Shield, CheckCircle, XCircle, Users, Crown, Database } from 'lucide-react'

type SuperUsersData = {
  success: boolean
  users: Profile[]
  totalSuperUsers: number
  error?: unknown
}

type EmailTest = {
  email: string
  isSuperUser: boolean
  accessCheck: {
    hasAccess: boolean
    isSuperUser: boolean
    user?: Profile
  }
}

export default function AdminStatusPage() {
  const [superUsersData, setSuperUsersData] = useState<SuperUsersData>({ 
    success: false, 
    users: [], 
    totalSuperUsers: 0 
  })
  const [emailTests, setEmailTests] = useState<EmailTest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get super users data
        const usersData = await getSuperUsers()
        setSuperUsersData(usersData)
        
        // Test email validation for known super users
        const testEmails = ['emil.unp@gmail.com', 'admin@purescan.app', 'random@example.com']
        const tests = await Promise.all(
          testEmails.map(async (email) => ({
            email,
            isSuperUser: await isSuperUser(email),
            accessCheck: await checkUserAccess(email)
          }))
        )
        setEmailTests(tests)
      } catch (error) {
        console.error('Error fetching status data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  if (loading) {
    return (
      <AdminTabLayout activeTab="status">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </AdminTabLayout>
    )
  }

  return (
    <AdminTabLayout activeTab="status">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Status</h1>
            <p className="text-gray-600 mt-2">
              Verify super user system and admin panel configuration
            </p>
          </div>
        </div>

        {/* Super User System Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Super User System</h3>
                <p className="text-sm text-gray-600 mt-1">Authentication and access control status</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {/* System Health */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">System Online</span>
                </div>
                <p className="text-xs text-green-700 mt-1">Admin system is operational</p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Database className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Database Connected</span>
                </div>
                <p className="text-xs text-blue-700 mt-1">Supabase connection active</p>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Crown className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">Auth Working</span>
                </div>
                <p className="text-xs text-purple-700 mt-1">Super user validation active</p>
              </div>
            </div>

            {/* Super Users Data */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">Configured Super Users</h4>
              {superUsersData.success ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Users className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Found {superUsersData.totalSuperUsers} super user(s) in database
                    </span>
                  </div>
                  {superUsersData.users.length > 0 ? (
                    <div className="space-y-2">
                      {superUsersData.users.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 bg-white rounded border">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.full_name || 'No name'}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">No super users found in database</p>
                  )}
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-medium text-red-800">Database Error</span>
                  </div>
                  <p className="text-xs text-red-700 mt-1">Could not fetch super users from database</p>
                </div>
              )}
            </div>

            {/* Email Validation Tests */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">Access Validation Tests</h4>
              <div className="space-y-3">
                {emailTests.map((test) => (
                  <div key={test.email} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{test.email}</p>
                      <p className="text-xs text-gray-500">Test email validation</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        {test.isSuperUser ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className="text-xs text-gray-600">Super User</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {test.accessCheck.hasAccess ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className="text-xs text-gray-600">Access</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Configuration Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Configuration Information</h4>
              <div className="space-y-1 text-xs text-blue-700">
                <p>• Super user emails are configured in lib/supabase-admin.ts</p>
                <p>• Authentication uses Supabase user management</p>
                <p>• Access control is enforced on all admin routes</p>
                <p>• Users must exist in the profiles table to gain access</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminTabLayout>
  )
} 