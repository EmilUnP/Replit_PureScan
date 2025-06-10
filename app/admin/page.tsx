'use client'

import React, { useState, useEffect } from 'react'
import { AdminTabLayout } from '@/components/admin/admin-layout'
import { 
  AdminStatsCard,
  AdminChart,
  RecentActivity,
  QuickActions
} from '@/components/admin'
import { 
  getAdminStats, 
  getScanStats, 
  getDailyScans, 
  getRecentActivity,
  getActiveUsersToday,
  getSystemMetrics
} from '@/lib/supabase-admin'
import { 
  Users, 
  Activity, 
  TrendingUp, 
  Scan,
  CalendarDays
} from 'lucide-react'

type ChangeType = 'positive' | 'negative' | 'neutral'

type AdminStats = {
  totalUsers: number
  totalScans: number
  userChange: { percentage: string; type: ChangeType }
  scanChange: { percentage: string; type: ChangeType }
  currentPeriodUsers: number
  currentPeriodScans: number
}

type ScanTypeCounts = Record<string, number>

type DailyScans = Record<string, number>

type ActivityItem = {
  id: string
  type: string
  user: string
  timestamp: Date
  status: string
}

type SystemMetrics = {
  databaseSize: string
  uptime: string
  fileStorage: string
  memoryUsage: string
  totalRecords: number
  apiResponseTime: number
  errorRate: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({ 
    totalUsers: 0, 
    totalScans: 0, 
    userChange: { percentage: 'No data', type: 'neutral' }, 
    scanChange: { percentage: 'No data', type: 'neutral' }, 
    currentPeriodUsers: 0, 
    currentPeriodScans: 0 
  })
  const [scanTypeCounts, setScanTypeCounts] = useState<ScanTypeCounts>({})
  const [dailyScans, setDailyScans] = useState<DailyScans>({})
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [activeToday, setActiveToday] = useState<number>(0)
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({ 
    databaseSize: 'Loading...', 
    uptime: 'Loading...', 
    fileStorage: 'Loading...', 
    memoryUsage: 'Loading...', 
    totalRecords: 0, 
    apiResponseTime: 0, 
    errorRate: 'Loading...' 
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Fetch real data from Supabase with individual error handling
        const results = await Promise.allSettled([
          getAdminStats(),
          getScanStats(), 
          getDailyScans(7),
          getRecentActivity(),
          getActiveUsersToday(),
          getSystemMetrics()
        ])

        // Handle stats data
        if (results[0].status === 'fulfilled') {
          setStats(results[0].value)
        } else {
          console.error('Error fetching stats:', results[0].reason)
        }

        // Handle scan type data
        if (results[1].status === 'fulfilled') {
          setScanTypeCounts(results[1].value)
        } else {
          console.error('Error fetching scan types:', results[1].reason)
        }

        // Handle daily scans data
        if (results[2].status === 'fulfilled') {
          setDailyScans(results[2].value)
        } else {
          console.error('Error fetching daily scans:', results[2].reason)
        }

        // Handle recent activity data
        if (results[3].status === 'fulfilled') {
          setRecentActivity(results[3].value)
        } else {
          console.error('Error fetching recent activity:', results[3].reason)
        }

        // Handle active today data
        if (results[4].status === 'fulfilled') {
          setActiveToday(results[4].value)
        } else {
          console.error('Error fetching active today:', results[4].reason)
        }

        // Handle system metrics data
        if (results[5].status === 'fulfilled') {
          setSystemMetrics(results[5].value)
        } else {
          console.error('Error fetching system metrics:', results[5].reason)
          setSystemMetrics({
            databaseSize: 'Error',
            uptime: 'Error',
            fileStorage: 'Error',
            memoryUsage: 'Error',
            totalRecords: 0,
            apiResponseTime: 0,
            errorRate: 'Error'
          })
        }
      } catch (error) {
        console.error('Critical error fetching admin data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [])

  if (loading) {
    return (
      <AdminTabLayout activeTab="overview">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </AdminTabLayout>
    )
  }

  // Process daily scans data for chart
  const dailyData = Object.entries(dailyScans).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    scans: count,
    users: Math.floor(count * 0.8) // Approximate users from scans
  })).slice(-7) // Last 7 days

  // Process scan types for pie chart
  const totalScansForTypes = Object.values(scanTypeCounts).reduce((a: number, b: number) => a + b, 0)
  const scanTypes = Object.entries(scanTypeCounts).map(([type, count]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    count,
    percentage: totalScansForTypes > 0 ? Math.round((count / totalScansForTypes) * 100) : 0
  }))

  const scansToday = dailyData[dailyData.length - 1]?.scans || 0
  const avgScansPerUser = stats.totalUsers > 0 ? 
    Math.round((stats.totalScans / stats.totalUsers) * 10) / 10 : 0

  // Calculate change for scans today (compare with yesterday)
  const scansYesterday = dailyData[dailyData.length - 2]?.scans || 0
  const scansTodayChange = scansYesterday > 0 ? 
    Math.round(((scansToday - scansYesterday) / scansYesterday) * 100) : 0
  
  const scansTodayChangeDisplay = scansYesterday === 0 ? 'No data' : 
    scansTodayChange > 0 ? `+${scansTodayChange}%` : `${scansTodayChange}%`

  // Calculate average change for scans per user
  const prevAvgScansPerUser = stats.currentPeriodUsers > 0 ? 
    Math.round((stats.currentPeriodScans / stats.currentPeriodUsers) * 10) / 10 : 0
  
  const avgChange = prevAvgScansPerUser > 0 ? 
    Math.round(((avgScansPerUser - prevAvgScansPerUser) / prevAvgScansPerUser) * 100) : 0
  
  const avgChangeDisplay = prevAvgScansPerUser === 0 ? 'No data' : 
    avgChange > 0 ? `+${avgChange}%` : `${avgChange}%`

  return (
    <AdminTabLayout activeTab="overview">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
            <p className="text-gray-600 mt-2">
              Monitor system performance and user activity across all services
            </p>
          </div>
          <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-md">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Key Metrics - Improved spacing and layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AdminStatsCard
            title="Total Users"
            value={stats.totalUsers}
            change={stats.userChange.percentage}
            changeType={stats.userChange.type}
            icon={Users}
            description="vs last 30 days"
          />
          <AdminStatsCard
            title="Total Scans"
            value={stats.totalScans}
            change={stats.scanChange.percentage}
            changeType={stats.scanChange.type}
            icon={Scan}
            description="vs last 30 days"
          />
          <AdminStatsCard
            title="Scans Today"
            value={scansToday}
            change={scansTodayChangeDisplay}
            changeType={scansTodayChange > 0 ? 'positive' : scansTodayChange < 0 ? 'negative' : 'neutral'}
            icon={Activity}
            description="vs yesterday"
          />
          <AdminStatsCard
            title="Avg Scans/User"
            value={avgScansPerUser}
            change={avgChangeDisplay}
            changeType={avgChange > 0 ? 'positive' : avgChange < 0 ? 'negative' : 'neutral'}
            icon={TrendingUp}
            format="decimal"
            description="current period"
          />
        </div>

        {/* Secondary Metrics - Only real data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AdminStatsCard
            title="Active Today"
            value={activeToday}
            change="Live data"
            changeType="neutral"
            icon={CalendarDays}
            description="users with activity"
          />
          
          {/* Real system metrics */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">System Uptime</p>
                  <p className="text-2xl font-bold text-gray-900">{systemMetrics.uptime}</p>
                </div>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">Server availability status</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Database Size</p>
                  <p className="text-2xl font-bold text-gray-900">{systemMetrics.databaseSize}</p>
                </div>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">Total storage used</p>
          </div>
        </div>

        {/* Charts Section - Improved layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Daily Activity Chart */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Daily Activity</h3>
                <p className="text-sm text-gray-600 mt-1">User engagement over the last 7 days</p>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">Scans</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">Users</span>
                </div>
              </div>
            </div>
            <AdminChart 
              title="Daily Activity"
              description="Users and scans over the last 7 days"
              type="line" 
              data={dailyData}
            />
          </div>

          {/* Scan Types Distribution */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900">Scan Types Distribution</h3>
              <p className="text-sm text-gray-600 mt-1">Breakdown of all scan types in the system</p>
            </div>
            <AdminChart 
              title="Scan Types Distribution"
              description="Breakdown of scan types"
              type="pie" 
              data={scanTypes}
            />
          </div>
        </div>

        {/* Activity Feed and Quick Actions - Improved spacing */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
              <p className="text-sm text-gray-600 mt-1">Latest system events and user actions</p>
            </div>
            <div className="p-6">
              <RecentActivity />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Quick Actions</h3>
              <p className="text-sm text-gray-600 mt-1">Common admin tasks</p>
            </div>
            <div className="p-6">
              <QuickActions />
            </div>
          </div>
        </div>

        {/* Empty state for additional sections */}
        {stats.totalUsers === 0 && (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users yet</h3>
            <p className="text-gray-600 mb-6">
              Your admin dashboard will populate with data as users start using the system.
            </p>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              Invite Users
            </button>
          </div>
        )}
      </div>
    </AdminTabLayout>
  )
} 