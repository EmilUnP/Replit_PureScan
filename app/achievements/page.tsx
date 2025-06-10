'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers'
import { supabase } from '@/lib/supabase'
import { Tables } from '@/lib/database.types'
import { Navbar } from '@/components/layout/navbar'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AchievementCard } from '@/components/achievements/achievement-card'
import { 
  Trophy, 
  Target, 
  Users, 
  Star, 
  Filter,
  Award,
  Zap,
  TrendingUp,
  ChevronDown
} from 'lucide-react'
import { redirect } from 'next/navigation'

type Achievement = Tables<'achievements'>
type UserAchievement = Tables<'user_achievements'>

interface AchievementWithProgress extends Achievement {
  userProgress?: UserAchievement
}

interface AchievementStats {
  totalAchievements: number
  completedAchievements: number
  inProgressAchievements: number
  totalPoints: number
  completionPercentage: number
}

export default function AchievementsPage() {
  const { user, loading: authLoading } = useAuth()
  const [achievements, setAchievements] = useState<AchievementWithProgress[]>([])
  const [stats, setStats] = useState<AchievementStats>({
    totalAchievements: 0,
    completedAchievements: 0,
    inProgressAchievements: 0,
    totalPoints: 0,
    completionPercentage: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showInProgress, setShowInProgress] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      redirect('/login')
    }
  }, [user, authLoading])

  useEffect(() => {
    if (user) {
      fetchAchievements()
    }
  }, [user])

  const fetchAchievements = async () => {
    try {
      setLoading(true)
      setError(null)

      let achievementsData = null
      let userAchievementsData = null

      // Try to fetch all achievements
      try {
        const result = await supabase
          .from('achievements')
          .select('*')
          .order('category', { ascending: true })
          .order('progress_required', { ascending: true })
        
        if (result.error && result.error.code !== '42P01') {
          throw result.error
        }
        achievementsData = result.data
      } catch (e: any) {
        if (e.code === '42P01') {
          console.log('Achievements table not available, using default achievements')
                     // Use default achievements when table doesn't exist
           achievementsData = [
             { 
               id: '1', 
               key: 'first_scan', 
               name: 'First Scan', 
               description: 'Complete your first scan', 
               category: 'getting_started', 
               criteria: { scans_count: 1 },
               points: 10,
               badge_icon: '🎯',
               icon: null,
               is_active: true,
               order_position: 1,
               created_at: new Date().toISOString(),
               updated_at: null
             },
             { 
               id: '2', 
               key: 'scanner_pro', 
               name: 'Scanner Pro', 
               description: 'Complete 5 scans', 
               category: 'progress', 
               criteria: { scans_count: 5 },
               points: 50,
               badge_icon: '⭐',
               icon: null,
               is_active: true,
               order_position: 2,
               created_at: new Date().toISOString(),
               updated_at: null
             },
             { 
               id: '3', 
               key: 'expert_scanner', 
               name: 'Expert Scanner', 
               description: 'Complete 10 scans', 
               category: 'progress', 
               criteria: { scans_count: 10 },
               points: 100,
               badge_icon: '🏆',
               icon: null,
               is_active: true,
               order_position: 3,
               created_at: new Date().toISOString(),
               updated_at: null
             }
           ]
        } else {
          throw e
        }
      }

      // Try to fetch user's achievement progress
      try {
        const result = await supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', user!.id)
        
        if (result.error && result.error.code !== '42P01') {
          throw result.error
        }
        userAchievementsData = result.data
      } catch (e: any) {
        if (e.code === '42P01') {
          console.log('User achievements table not available, using empty progress')
          userAchievementsData = []
        } else {
          throw e
        }
      }

      // Combine achievements with user progress
      const achievementsWithProgress: AchievementWithProgress[] = (achievementsData || []).map((achievement: any) => {
        const userProgress = userAchievementsData?.find((ua: any) => ua.achievement_id === achievement.id)
        return {
          ...achievement,
          userProgress
        }
      })

      setAchievements(achievementsWithProgress)
      calculateStats(achievementsWithProgress)

    } catch (err) {
      console.error('Error fetching achievements:', err)
      setError('Failed to load achievements. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (achievementsData: AchievementWithProgress[]) => {
    const stats = achievementsData.reduce(
      (acc, achievement) => {
        acc.totalAchievements++
        
        if (achievement.userProgress?.completed_at) {
          acc.completedAchievements++
          acc.totalPoints += achievement.points || 0
        } else if (achievement.userProgress && !achievement.userProgress.completed_at && (achievement.userProgress.progress_current || 0) > 0) {
          acc.inProgressAchievements++
        }
        
        return acc
      },
      {
        totalAchievements: 0,
        completedAchievements: 0,
        inProgressAchievements: 0,
        totalPoints: 0,
        completionPercentage: 0
      }
    )
    
    // Calculate completion percentage
    if (stats.totalAchievements > 0) {
      stats.completionPercentage = Math.round((stats.completedAchievements / stats.totalAchievements) * 100)
    }
    
    setStats(stats)
  }

  const getUniqueCategories = () => {
    const categories = Array.from(new Set(achievements.map(a => a.category).filter(Boolean)))
    return categories as string[]
  }

  const getFilteredAchievements = () => {
    let filtered = achievements

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category?.toLowerCase() === selectedCategory.toLowerCase()) 
    }

    // Filter by progress status
    if (showInProgress) {
      filtered = filtered.filter(a => a.userProgress && !a.userProgress.completed_at && (a.userProgress.progress_current || 0) > 0)
    }

    return filtered
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'progress':
        return <Target className="h-4 w-4" />
      case 'social':
        return <Users className="h-4 w-4" />
      case 'milestones':
        return <Star className="h-4 w-4" />
      case 'engagement':
        return <Zap className="h-4 w-4" />
      default:
        return <Award className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'progress':
        return 'from-blue-500 to-blue-600'
      case 'social':
        return 'from-purple-500 to-purple-600'
      case 'milestones':
        return 'from-yellow-500 to-yellow-600'
      case 'engagement':
        return 'from-green-500 to-green-600'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600">Loading your achievements...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Achievements</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={fetchAchievements} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const filteredAchievements = getFilteredAchievements()
  const categories = getUniqueCategories()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Achievements
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Track your progress and unlock achievements as you explore PureScan2. 
            Complete scans, share results, and engage with the platform to earn rewards!
          </p>
        </div>

        {/* Progress Overview */}
        <div className="mb-12">
          <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-r from-purple-600 to-blue-600">
            <CardContent className="p-8 text-white">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Your Progress</h2>
                  <p className="text-purple-100">Keep up the great work!</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold">{stats.completionPercentage}%</div>
                  <div className="text-purple-100">Complete</div>
                </div>
              </div>
              <div className="w-full bg-purple-800/30 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-yellow-300 h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${stats.completionPercentage}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalAchievements}</div>
              <div className="text-sm text-gray-600 font-medium">Total Available</div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Award className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.completedAchievements}</div>
              <div className="text-sm text-gray-600 font-medium">Completed</div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.inProgressAchievements}</div>
              <div className="text-sm text-gray-600 font-medium">In Progress</div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Star className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalPoints}</div>
              <div className="text-sm text-gray-600 font-medium">Points Earned</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <Button
              variant="ghost"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-between w-full p-0 h-auto hover:bg-transparent"
            >
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Filter className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl">Filters & Categories</span>
              </CardTitle>
              <ChevronDown className={`h-5 w-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </CardHeader>
          
          {showFilters && (
            <CardContent className="pt-0">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Categories</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant={selectedCategory === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory('all')}
                      className={selectedCategory === 'all' ? 'bg-gradient-to-r from-purple-600 to-blue-600 border-0' : ''}
                    >
                      All Categories
                    </Button>
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category.toLowerCase() ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(category.toLowerCase())}
                        className={`flex items-center gap-2 ${
                          selectedCategory === category.toLowerCase() 
                            ? `bg-gradient-to-r ${getCategoryColor(category)} border-0 text-white` 
                            : ''
                        }`}
                      >
                        {getCategoryIcon(category)}
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Status</h3>
                  <Button
                    variant={showInProgress ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowInProgress(!showInProgress)}
                    className={showInProgress ? 'bg-gradient-to-r from-blue-600 to-purple-600 border-0' : ''}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Show In Progress Only
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Achievements Grid */}
        {filteredAchievements.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-16 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-600 mb-4">No Achievements Found</h3>
              <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
                {selectedCategory !== 'all' || showInProgress
                  ? 'Try adjusting your filters to see more achievements.'
                  : 'Start using PureScan2 to unlock your first achievements! Complete scans, share results, and explore the platform.'}
              </p>
              {(selectedCategory !== 'all' || showInProgress) && (
                <Button 
                  onClick={() => {
                    setSelectedCategory('all')
                    setShowInProgress(false)
                  }}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAchievements.map((achievement, index) => (
              <div
                key={achievement.id}
                className="animate-fade-in"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <AchievementCard
                  achievement={achievement}
                  userProgress={achievement.userProgress}
                  className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                />
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        {stats.completedAchievements === 0 && filteredAchievements.length > 0 && (
          <Card className="border-0 shadow-lg mt-12 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Get Started?</h3>
              <p className="text-gray-600 mb-6">
                Complete your first scan or update your profile to start earning achievements!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => window.location.href = '/scan'}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Start Your First Scan
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/profile'}
                >
                  Complete Your Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out both;
        }
      `}</style>
    </div>
  )
} 