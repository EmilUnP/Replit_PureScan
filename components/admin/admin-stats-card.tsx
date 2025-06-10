import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminStatsCardProps {
  title: string
  value: number | string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: LucideIcon
  format?: 'number' | 'decimal' | 'text'
  description?: string
}

export function AdminStatsCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon,
  format = 'number',
  description
}: AdminStatsCardProps) {
  const formatValue = (val: number | string) => {
    if (format === 'text') return val
    if (format === 'decimal') return typeof val === 'number' ? val.toFixed(1) : val
    if (format === 'number') return typeof val === 'number' ? val.toLocaleString() : val
    return val
  }

  const getChangeColor = (type: 'positive' | 'negative' | 'neutral') => {
    switch (type) {
      case 'positive':
        return 'text-green-600 bg-green-50'
      case 'negative':
        return 'text-red-600 bg-red-50'
      case 'neutral':
        return 'text-gray-600 bg-gray-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 mb-2">
          {formatValue(value)}
        </div>
        <div className="flex items-center">
          <span className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
            getChangeColor(changeType)
          )}>
            {change}
          </span>
          <span className="text-xs text-gray-500 ml-2">
            {description || 'vs last period'}
          </span>
        </div>
      </CardContent>
    </Card>
  )
} 