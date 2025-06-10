'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  Download, 
  Plus, 
  Settings,
  BarChart3,
  Database,
  Shield,
  FileText,
  UserPlus,
  Archive
} from 'lucide-react'

export function QuickActions() {
  const router = useRouter()

  const actions = [
    {
      title: 'Add New User',
      description: 'Manually create user account',
      icon: UserPlus,
      action: () => router.push('/admin/users/new'),
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Export Users',
      description: 'Download user data as CSV',
      icon: Download,
      action: () => router.push('/admin/export?type=users'),
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'View Analytics',
      description: 'Detailed usage analytics',
      icon: BarChart3,
      action: () => router.push('/admin/analytics'),
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'System Settings',
      description: 'Configure admin settings',
      icon: Settings,
      action: () => router.push('/admin/settings'),
      color: 'from-gray-500 to-gray-600'
    },
    {
      title: 'Database Backup',
      description: 'Create system backup',
      icon: Database,
      action: () => {
        // In a real app, this would trigger a backup
        alert('Database backup initiated. You will be notified when complete.')
      },
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Generate Report',
      description: 'Create comprehensive report',
      icon: FileText,
      action: () => router.push('/admin/reports'),
      color: 'from-indigo-500 to-indigo-600'
    }
  ]

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start h-auto p-4 hover:bg-gray-50"
              onClick={action.action}
            >
              <div className="flex items-center space-x-3 w-full">
                <div className={`w-10 h-10 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium text-gray-900 text-sm">
                    {action.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {action.description}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>

        {/* System Status */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-900 mb-3">System Status</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">API Status</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Database</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600">Connected</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Storage</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-xs text-yellow-600">75% Used</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Backup</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600">24h ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Actions */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-900 mb-3">Emergency Actions</div>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs h-8 border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => {
                if (confirm('Are you sure you want to clear all cache? This may temporarily slow down the system.')) {
                  alert('Cache cleared successfully')
                }
              }}
            >
              <Database className="w-3 h-3 mr-2" />
              Clear Cache
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs h-8 border-orange-200 text-orange-600 hover:bg-orange-50"
              onClick={() => {
                if (confirm('Are you sure you want to enter maintenance mode? Users will not be able to access the app.')) {
                  alert('Maintenance mode activated')
                }
              }}
            >
              <Shield className="w-3 h-3 mr-2" />
              Maintenance Mode
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 