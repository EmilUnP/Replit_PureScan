import React from 'react'
import { AdminTabLayout } from '@/components/admin/admin-layout'
import { RecentActivity } from '@/components/admin'
import { Activity, Clock, Filter, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AdminActivityPage() {
  return (
    <AdminTabLayout activeTab="activity">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Activity</h1>
            <p className="text-gray-600 mt-2">
              Monitor user activity, system events, and application logs
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Activity Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex space-x-3">
              <select className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500">
                <option>All Activity</option>
                <option>User Actions</option>
                <option>System Events</option>
                <option>Errors</option>
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500">
                <option>Last 24 Hours</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Custom Range</option>
              </select>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Activity Log</h3>
                <p className="text-sm text-gray-600 mt-1">Real-time system events and user actions</p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Activity className="w-4 h-4" />
                <span>Live updates</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <RecentActivity />
          </div>
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Events Today</p>
                <p className="text-2xl font-bold text-gray-900">Coming Soon</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">Real-time event tracking</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900">Coming Soon</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">System performance metrics</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Error Rate</p>
                <p className="text-2xl font-bold text-gray-900">Coming Soon</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">System health monitoring</p>
          </div>
        </div>
      </div>
    </AdminTabLayout>
  )
} 