'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers'
import { redirect } from 'next/navigation'
import { checkUserAccess } from '@/lib/supabase-admin'
import { AccessDenied } from '@/components/admin/access-denied'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminLoading, setAdminLoading] = useState(true)

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (loading) return

      if (!user) {
        redirect('/login')
        return
      }

      if (user && user.email) {
        try {
          // Check if user has super user access
          const accessCheck = await checkUserAccess(user.email)
          
          if (!accessCheck.hasAccess || !accessCheck.isSuperUser) {
            redirect('/')
            return
          }

          setIsAdmin(true)
        } catch (error) {
          console.error('Error checking admin access:', error)
          redirect('/')
          return
        }
      } else {
        redirect('/login')
        return
      }
      
      setAdminLoading(false)
    }

    checkAdminAccess()
  }, [user, loading])

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return <AccessDenied />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">{user?.email || 'Admin'}</span>
              <a
                href="/"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Back to App
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  )
} 