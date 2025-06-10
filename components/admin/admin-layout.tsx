'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard,
  Users,
  Activity,
  HardDrive,
  Search,
  Shield
} from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
  activeTab?: string
}

const tabs = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    href: '/admin'
  },
  {
    id: 'users',
    label: 'Users & Accounts',
    icon: Users,
    href: '/admin/users'
  },
  {
    id: 'activity',
    label: 'System Activity',
    icon: Activity,
    href: '/admin/activity'
  },
  {
    id: 'storage',
    label: 'Storage & Metrics',
    icon: HardDrive,
    href: '/admin/storage'
  },
  {
    id: 'status',
    label: 'System Status',
    icon: Shield,
    href: '/admin/status'
  }
]

export function AdminTabLayout({ children, activeTab = 'overview' }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <a
                  key={tab.id}
                  href={tab.href}
                  className={cn(
                    'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2',
                    isActive
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </a>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
} 