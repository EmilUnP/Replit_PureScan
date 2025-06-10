'use client'

import { useAuth } from '@/components/providers'
import { useEffect, useState } from 'react'
import { redirect, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Tables } from '@/lib/database.types'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Navbar } from '@/components/layout/navbar'
import { Camera, TrendingUp, Award, Plus, Zap, Sparkles, ShieldCheck, Package, Eye } from 'lucide-react'
import Link from 'next/link'
import ShareButton from '@/components/share/share-button'

interface DashboardStats {
  totalScans: number
  cosmeticScans: number
  skinScans: number
  streakDays: number
  achievements: number
  followers: number
  averageScore: number
}

type RecentScan = Tables<'scans'>

export default function Dashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalScans: 0,
    cosmeticScans: 0,
    skinScans: 0,
    streakDays: 0,
    achievements: 0,
    followers: 0,
    averageScore: 0
  })
  const [recentScans, setRecentScans] = useState<RecentScan[]>([])
  const [dashboardLoading, setDashboardLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      redirect('/')
    }
  }, [user, loading])

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return

      try {
        // Get total scans and breakdown by type
        const { data: scansData, error: scansError } = await supabase
          .from('scans')
          .select('*')
          .eq('user_id', user.id)
          .order('scanned_at', { ascending: false })

        if (scansError) {
          console.error('Error fetching scans:', scansError)
          return
        }

        // Calculate stats
        const totalScans = scansData?.length || 0
        const cosmeticScans = scansData?.filter(scan => scan.scan_type === 'cosmetic').length || 0
        const skinScans = scansData?.filter(scan => scan.scan_type === 'skin').length || 0
        
        // Calculate average score (handle null values)
        const validScores = scansData?.filter(scan => scan.confidence_score !== null && scan.confidence_score !== undefined) || []
        const averageScore = validScores.length > 0 
          ? Math.round(validScores.reduce((sum, scan) => sum + ((scan.confidence_score || 0) * 100), 0) / validScores.length)
          : 0

        // Calculate streak days (consecutive days with scans)
        const streakDays = calculateStreakDays(scansData || [])

        // Get recent scans (limit to 5)
        const recentScansData = scansData?.slice(0, 5) || []

        // Get achievements count (placeholder for now)
        const { data: achievementsData } = await supabase
          .from('user_achievements')
          .select('id')
          .eq('user_id', user.id)

        const achievements = achievementsData?.length || 0

        // Set stats
        setStats({
          totalScans,
          cosmeticScans,
          skinScans,
          streakDays,
          achievements,
          followers: 0, // Placeholder for social features
          averageScore
        })

        setRecentScans(recentScansData)

      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setDashboardLoading(false)
      }
    }

    if (user) {
      loadDashboardData()
    }
  }, [user])

  // Calculate consecutive days with scans
  const calculateStreakDays = (scans: any[]) => {
    if (!scans || scans.length === 0) return 0

    const scanDates = scans.map(scan => 
      new Date(scan.scanned_at).toDateString()
    ).filter((date, index, arr) => arr.indexOf(date) === index) // Remove duplicates
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()) // Sort descending

    let streak = 0
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()

    // Check if today or yesterday has a scan
    if (scanDates.includes(today) || scanDates.includes(yesterday)) {
      streak = 1
      
      // Count consecutive days backwards
      let currentDate = scanDates.includes(today) ? new Date() : new Date(Date.now() - 86400000)
      
      for (let i = 1; i < scanDates.length; i++) {
        const previousDay = new Date(currentDate.getTime() - (i * 86400000)).toDateString()
        if (scanDates.includes(previousDay)) {
          streak++
        } else {
          break
        }
      }
    }

    return streak
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScanIcon = (scanType: string) => {
    return scanType === 'cosmetic' ? ShieldCheck : Sparkles
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    return date.toLocaleDateString()
  }

  const handleScanShare = (scanId: string, isPublic: boolean, shareUrl?: string) => {
    // Update the scan in the local state if needed
    setRecentScans(prev => 
      prev.map(scan => 
        scan.id === scanId 
          ? { ...scan, is_public: isPublic, public_id: shareUrl ? shareUrl.split('/').pop() || null : scan.public_id }
          : scan
      )
    )
  }

  const handleViewResults = (scanId: string) => {
    router.push(`/scan-results/${scanId}`)
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (dashboardLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome back, {user.email?.split('@')[0]}!</p>
              </div>
              <Link href="/scan">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                  <Zap className="w-4 h-4 mr-2" />
                  Start AI Scanning
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* AI Feature Highlight */}
          <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg p-8 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-4">
                  <Package className="w-8 h-8 mr-3" />
                  <h2 className="text-2xl font-bold">AI-Powered Cosmetic Analysis</h2>
                </div>
                <p className="text-purple-100 mb-4">
                  Analyze cosmetic ingredients for safety, scan product labels, and get personalized safety reports. 
                  Make informed beauty choices with our comprehensive ingredient database. Plus enjoy bonus skin analysis features.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <h3 className="font-semibold text-white mb-2">🧴 Cosmetic Ingredient Scanner</h3>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-300 rounded-full mr-2"></div>
                        <span>Safety Analysis</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-300 rounded-full mr-2"></div>
                        <span>Ingredient Database</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">✨ Skin Analysis</h3>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-300 rounded-full mr-2"></div>
                        <span>Health Assessment</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-300 rounded-full mr-2"></div>
                        <span>Care Recommendations</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Cosmetic Scans</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.cosmeticScans}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Skin Scans</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.skinScans}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Streak Days</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.streakDays}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Award className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}>
                    {stats.averageScore}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Scans */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Scans</h2>
                <Link href="/scan">
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    New Scan
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentScans.length > 0 ? (
                  recentScans.map((scan) => {
                    const ScanIcon = getScanIcon(scan.scan_type)
                    const isCosmetic = scan.scan_type === 'cosmetic'
                    
                    // Safely extract score from analysis results
                    let score: number | undefined
                    if (scan.analysis_results && typeof scan.analysis_results === 'object' && scan.analysis_results !== null) {
                      const results = scan.analysis_results as any
                      score = isCosmetic ? results.safetyScore : results.overallScore
                    }
                    
                    return (
                      <div key={scan.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                        <div className={`w-16 h-16 ${isCosmetic ? 'bg-purple-100' : 'bg-blue-100'} rounded-lg flex items-center justify-center`}>
                          <ScanIcon className={`w-8 h-8 ${isCosmetic ? 'text-purple-600' : 'text-blue-600'}`} />
                        </div>
                        <div className="ml-4 flex-1">
                          <h3 className="font-medium text-gray-900 capitalize">
                            {scan.scan_type} {isCosmetic ? 'Ingredient' : ''} Analysis
                          </h3>
                          <p className="text-sm text-gray-600">
                            {formatDate(scan.created_at)}
                          </p>
                          <div className="flex items-center mt-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                            <span className="text-sm text-green-600 capitalize">{scan.status}</span>
                            {score && (
                              <span className={`ml-4 text-sm font-medium ${getScoreColor(score)}`}>
                                Score: {score}/100
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ShareButton 
                            scan={scan}
                            onShare={(isPublic, shareUrl) => handleScanShare(scan.id, isPublic, shareUrl)}
                            variant="outline"
                            size="sm"
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewResults(scan.id)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Results
                          </Button>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No scans yet</h3>
                    <p className="text-gray-600 mb-4">Start your first AI analysis to see results here</p>
                    <Link href="/scan">
                      <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                        <Zap className="w-4 h-4 mr-2" />
                        Start First Scan
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Overview Stats Only */}
            <div className="space-y-6">
              {/* Overview Stats */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Progress</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Scans</span>
                    <span className="font-semibold text-gray-900">{stats.totalScans}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">This Month</span>
                    <span className="font-semibold text-gray-900">{stats.totalScans}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Current Streak</span>
                    <span className="font-semibold text-gray-900">{stats.streakDays} days</span>
                  </div>
                  {stats.averageScore > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Average Score</span>
                        <span className={`font-semibold ${getScoreColor(stats.averageScore)}`}>
                          {stats.averageScore}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${stats.averageScore}%`,
                            backgroundColor: stats.averageScore >= 80 ? '#10b981' : stats.averageScore >= 60 ? '#f59e0b' : '#ef4444'
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 