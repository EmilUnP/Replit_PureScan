"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { performanceMonitoring, cacheMetrics } from '@/lib/api/cache'
import { Activity, Zap, Database, Clock, AlertTriangle } from 'lucide-react'

interface PerformanceMetrics {
  totalQueries: number
  avgResponseTime: number
  slowQueries: number
  cacheStats: {
    total: number
    fresh: number
    stale: number
    hitRatio: string
  }
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Initialize Web Vitals monitoring
    performanceMonitoring.measureWebVitals()

    // Show performance monitor only in development
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true)
    }

    // Update metrics every 30 seconds
    const interval = setInterval(() => {
      const detailedMetrics = cacheMetrics.getDetailedMetrics()
      if (detailedMetrics) {
        setMetrics(detailedMetrics)
      }
    }, 30000)

    // Initial metrics load
    const initialMetrics = cacheMetrics.getDetailedMetrics()
    if (initialMetrics) {
      setMetrics(initialMetrics)
    }

    return () => clearInterval(interval)
  }, [])

  const clearMetrics = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('query-metrics')
      setMetrics(null)
    }
  }

  if (!isVisible || !metrics) {
    return null
  }

  const getPerformanceColor = (value: number, thresholds: [number, number]) => {
    if (value <= thresholds[0]) return 'text-green-600'
    if (value <= thresholds[1]) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getCacheColor = (hitRatio: string) => {
    const ratio = parseFloat(hitRatio.replace('%', ''))
    if (ratio >= 80) return 'text-green-600'
    if (ratio >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="p-4 w-80 bg-white/95 backdrop-blur-sm shadow-lg border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-sm">Performance Monitor</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </div>

        <div className="space-y-3">
          {/* Query Performance */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-3 h-3 text-blue-500" />
              <span className="text-xs">Avg Response</span>
            </div>
            <Badge 
              variant="secondary" 
              className={getPerformanceColor(metrics.avgResponseTime, [500, 1000])}
            >
              {metrics.avgResponseTime}ms
            </Badge>
          </div>

          {/* Cache Performance */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-3 h-3 text-green-500" />
              <span className="text-xs">Cache Hit</span>
            </div>
            <Badge 
              variant="secondary"
              className={getCacheColor(metrics.cacheStats.hitRatio)}
            >
              {metrics.cacheStats.hitRatio}
            </Badge>
          </div>

          {/* Total Queries */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-3 h-3 text-purple-500" />
              <span className="text-xs">Queries (5min)</span>
            </div>
            <Badge variant="secondary">
              {metrics.totalQueries}
            </Badge>
          </div>

          {/* Slow Queries Warning */}
          {metrics.slowQueries > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-3 h-3 text-red-500" />
                <span className="text-xs">Slow Queries</span>
              </div>
              <Badge variant="destructive">
                {metrics.slowQueries}
              </Badge>
            </div>
          )}

          {/* Cache Details */}
          <div className="pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Fresh Cache:</span>
                <span>{metrics.cacheStats.fresh}</span>
              </div>
              <div className="flex justify-between">
                <span>Stale Cache:</span>
                <span>{metrics.cacheStats.stale}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Cached:</span>
                <span>{metrics.cacheStats.total}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={cacheMetrics.logCachePerformance}
                className="flex-1 text-xs"
              >
                Log Stats
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearMetrics}
                className="flex-1 text-xs"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

// Hook for tracking component performance
export function usePerformanceTracking(componentName: string) {
  useEffect(() => {
    const startTime = Date.now()
    
    return () => {
      const endTime = Date.now()
      const duration = endTime - startTime
      
      if (duration > 100) {
        console.warn(`Component ${componentName} took ${duration}ms to unmount`)
      }
    }
  }, [componentName])

  const trackAction = (actionName: string, fn: () => void | Promise<void>) => {
    const startTime = Date.now()
    
    const result = fn()
    
    if (result instanceof Promise) {
      return result.finally(() => {
        performanceMonitoring.trackQueryPerformance(
          [componentName, actionName], 
          startTime
        )
      })
    } else {
      performanceMonitoring.trackQueryPerformance(
        [componentName, actionName], 
        startTime
      )
    }
  }

  return { trackAction }
} 