'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Achievement {
  id: string
  title: string | null
  description: string
  badge_icon: string | null
  progress_required: number | null
  type: string
  category: string | null
}

interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  progress_current: number | null
  completed_at: string | null
}

interface AchievementCardProps {
  achievement: Achievement
  userProgress?: UserAchievement
  className?: string
}

export function AchievementCard({ achievement, userProgress, className }: AchievementCardProps) {
  const isCompleted = !!userProgress?.completed_at
  const currentProgress = userProgress?.progress_current || 0
  const requiredProgress = achievement.progress_required || 1
  const progressPercentage = Math.min((currentProgress / requiredProgress) * 100, 100)
  
  const title = achievement.title || 'Untitled Achievement'
  const badgeIcon = achievement.badge_icon || '🏆'
  const category = achievement.category || 'General'

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-200 hover:shadow-lg",
      isCompleted 
        ? "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50" 
        : currentProgress > 0
        ? "border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50"
        : "border-gray-200 bg-gray-50 opacity-60",
      className
    )}>
      <CardContent className="p-6">
        {/* Achievement Icon & Completion Status */}
        <div className="flex items-start justify-between mb-4">
          <div className="text-3xl mb-2">
            {badgeIcon}
          </div>
          {isCompleted ? (
            <div className="flex items-center gap-1">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">Completed</span>
            </div>
          ) : currentProgress === 0 ? (
            <div className="flex items-center gap-1">
              <Lock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Locked</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-blue-600">In Progress</span>
            </div>
          )}
        </div>

        {/* Achievement Title & Category */}
        <div className="mb-3">
          <h3 className={cn(
            "text-lg font-semibold mb-1",
            isCompleted ? "text-green-800" : currentProgress > 0 ? "text-gray-900" : "text-gray-500"
          )}>
            {title}
          </h3>
          <Badge 
            variant="secondary" 
            className={cn(
              "text-xs",
              isCompleted ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
            )}
          >
            {category}
          </Badge>
        </div>

        {/* Achievement Description */}
        <p className={cn(
          "text-sm mb-4",
          isCompleted ? "text-green-700" : currentProgress > 0 ? "text-gray-700" : "text-gray-500"
        )}>
          {achievement.description}
        </p>

        {/* Progress Section */}
        {!isCompleted && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium text-gray-900">
                {currentProgress} / {requiredProgress}
              </span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2"
            />
            {currentProgress > 0 && (
              <p className="text-xs text-blue-600 font-medium">
                {Math.round(progressPercentage)}% complete
              </p>
            )}
          </div>
        )}

        {/* Completion Date */}
        {isCompleted && userProgress.completed_at && (
          <div className="mt-4 pt-3 border-t border-green-200">
            <p className="text-xs text-green-600">
              Completed on {new Date(userProgress.completed_at).toLocaleDateString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AchievementCard 