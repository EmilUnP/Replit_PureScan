import React from 'react'
import { AdminTabLayout } from '@/components/admin/admin-layout'
import { getSystemMetrics, getStorageBreakdown } from '@/lib/supabase-admin'
import { HardDrive, Database, Server, BarChart3 } from 'lucide-react'

export default async function AdminStoragePage() {
  const [systemMetrics, storageBreakdown] = await Promise.all([
    getSystemMetrics(),
    getStorageBreakdown()
  ])
  return (
    <AdminTabLayout activeTab="storage">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Storage & Metrics</h1>
            <p className="text-gray-600 mt-2">
              Monitor system resources, storage usage, and performance metrics
            </p>
          </div>
        </div>

        {/* Storage Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Database className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Database Size</p>
                <p className="text-2xl font-bold text-gray-900">{systemMetrics.databaseSize}</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">Total database storage used</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <HardDrive className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">File Storage</p>
                <p className="text-2xl font-bold text-gray-900">{systemMetrics.fileStorage}</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">Images and file uploads</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Server className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">System Uptime</p>
                <p className="text-2xl font-bold text-gray-900">{systemMetrics.uptime}</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">Server availability</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Memory Usage</p>
                <p className="text-2xl font-bold text-gray-900">{systemMetrics.memoryUsage}</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">Current memory utilization</p>
          </div>
        </div>

        {/* Storage Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900">Storage Breakdown</h3>
              <p className="text-sm text-gray-600 mt-1">Usage by data type</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">User Data</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900">{storageBreakdown.userData.size}</span>
                  <p className="text-xs text-gray-500">{storageBreakdown.userData.records} records ({storageBreakdown.userData.percentage}%)</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Scan Images</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900">{storageBreakdown.scanImages.size}</span>
                  <p className="text-xs text-gray-500">{storageBreakdown.scanImages.records} records ({storageBreakdown.scanImages.percentage}%)</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">System Logs</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900">{storageBreakdown.systemLogs.size}</span>
                  <p className="text-xs text-gray-500">{storageBreakdown.systemLogs.records} records ({storageBreakdown.systemLogs.percentage}%)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900">Performance Metrics</h3>
              <p className="text-sm text-gray-600 mt-1">System performance overview</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">API Response Time</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{systemMetrics.apiResponseTime}ms</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Database Records</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{systemMetrics.totalRecords.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Error Rate</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{systemMetrics.errorRate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Future Implementation Notice */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-8 rounded-xl border border-purple-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Real-time Metrics Coming Soon</h3>
          </div>
          <p className="text-gray-600 mb-4">
            This section will include live monitoring of system resources, storage usage analytics, 
            and performance metrics powered by real Supabase data and system monitoring APIs.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Real-time storage monitoring</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Performance analytics</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Resource usage alerts</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>Cost optimization insights</span>
            </div>
          </div>
        </div>
      </div>
    </AdminTabLayout>
  )
} 