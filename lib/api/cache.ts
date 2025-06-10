import { queryClient, queryKeys, invalidateQueries } from '@/lib/react-query'
import { supabase } from '@/lib/supabase'

// Cache configuration for different data types
export const cacheConfig = {
  user: {
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  },
  scans: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  },
  achievements: {
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  },
  profile: {
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 45, // 45 minutes
  },
}

// Memory management for large datasets
export const memoryManagement = {
  // Cleanup old queries to prevent memory leaks
  cleanupOldQueries: () => {
    const queryCache = queryClient.getQueryCache()
    const queries = queryCache.getAll()
    const oneHourAgo = Date.now() - (60 * 60 * 1000)
    
    queries.forEach(query => {
      if (query.state.dataUpdatedAt < oneHourAgo && !query.observers.length) {
        queryCache.remove(query)
      }
    })
  },

  // Limit cache size for memory efficiency
  limitCacheSize: (maxQueries = 100) => {
    const queryCache = queryClient.getQueryCache()
    const queries = queryCache.getAll()
    
    if (queries.length > maxQueries) {
      const sortedQueries = queries
        .sort((a, b) => a.state.dataUpdatedAt - b.state.dataUpdatedAt)
        .slice(0, queries.length - maxQueries)
      
      sortedQueries.forEach(query => queryCache.remove(query))
    }
  },
}

// Cached API functions
export const cachedAPI = {
  // User profile with caching
  getUserProfile: async (userId: string) => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.userProfile(userId),
      queryFn: async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()
        
        if (error) throw error
        return data
      },
      ...cacheConfig.profile,
    })
  },

  // User scans with pagination and caching
  getUserScans: async (userId: string, limit = 10, offset = 0) => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.scansList({ userId, limit, offset }),
      queryFn: async () => {
        const { data, error } = await supabase
          .from('scans')
          .select(`
            *,
            profiles:user_id (
              full_name,
              avatar_url
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)
        
        if (error) throw error
        return data
      },
      ...cacheConfig.scans,
    })
  },

  // Single scan with caching
  getScan: async (scanId: string) => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.scanDetail(scanId),
      queryFn: async () => {
        const { data, error } = await supabase
          .from('scans')
          .select(`
            *,
            profiles:user_id (
              full_name,
              avatar_url
            )
          `)
          .eq('id', scanId)
          .single()
        
        if (error) throw error
        return data
      },
      ...cacheConfig.scans,
    })
  },

  // User achievements with caching
  getUserAchievements: async (userId: string) => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.userAchievements(userId),
      queryFn: async () => {
        const { data, error } = await supabase
          .from('user_achievements')
          .select(`
            *,
            achievements (
              id,
              name,
              description,
              icon,
              category
            )
          `)
          .eq('user_id', userId)
        
        if (error) throw error
        return data
      },
      ...cacheConfig.achievements,
    })
  },

  // Get public scans (alternative to shared scans until schema is available)
  getPublicScans: async (limit = 10, offset = 0) => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.scansList({ public: true, limit, offset }),
      queryFn: async () => {
        // Assuming public scans are marked with a public field
        const { data, error } = await supabase
          .from('scans')
          .select(`
            *,
            profiles:user_id (
              full_name,
              avatar_url
            )
          `)
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)
        
        if (error) throw error
        return data
      },
      ...cacheConfig.scans,
    })
  },
}

// Cache invalidation helpers
export const cacheInvalidation = {
  // Invalidate all user-related data
  invalidateUserData: (userId: string) => {
    invalidateQueries.user()
    invalidateQueries.userScans(userId)
    invalidateQueries.userAchievements(userId)
  },

  // Invalidate scan-related data
  invalidateScanData: (scanId?: string) => {
    invalidateQueries.scans()
    if (scanId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.scanDetail(scanId) })
    }
  },

  // Invalidate specific scan
  invalidateSpecificScan: (scanId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.scanDetail(scanId) })
  },

  // Clear all cache (use sparingly)
  clearAllCache: () => {
    queryClient.clear()
  },
}

// Background refresh for critical data
export const backgroundRefresh = {
  // Refresh user data in background
  refreshUserData: async (userId: string) => {
    try {
      await Promise.all([
        queryClient.prefetchQuery({
          queryKey: queryKeys.userProfile(userId),
          queryFn: () => cachedAPI.getUserProfile(userId),
          staleTime: 0, // Force refresh
        }),
        queryClient.prefetchQuery({
          queryKey: queryKeys.userScans(userId),
          queryFn: () => cachedAPI.getUserScans(userId),
          staleTime: 0, // Force refresh
        }),
      ])
    } catch (error) {
      console.error('Background refresh failed:', error)
    }
  },

  // Refresh scan data
  refreshScanData: async (scanId: string) => {
    try {
      await queryClient.prefetchQuery({
        queryKey: queryKeys.scanDetail(scanId),
        queryFn: () => cachedAPI.getScan(scanId),
        staleTime: 0, // Force refresh
      })
    } catch (error) {
      console.error('Scan refresh failed:', error)
    }
  },
}

// Performance monitoring with Web Vitals
export const performanceMonitoring = {
  // Web Vitals measurement
  measureWebVitals: () => {
    if (typeof window !== 'undefined') {
      import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
        onCLS((metric: any) => console.log('CLS:', metric))
        onINP((metric: any) => console.log('INP:', metric))
        onFCP((metric: any) => console.log('FCP:', metric))
        onLCP((metric: any) => console.log('LCP:', metric))
        onTTFB((metric: any) => console.log('TTFB:', metric))
      }).catch(() => {
        // web-vitals not available, continue without metrics
      })
    }
  },

  // Query performance tracking
  trackQueryPerformance: (queryKey: readonly unknown[], startTime: number) => {
    const duration = Date.now() - startTime
    if (duration > 1000) {
      console.warn(`Slow query detected:`, { queryKey, duration })
    }
    
    // Store metrics for analysis
    if (typeof window !== 'undefined') {
      const metrics = JSON.parse(localStorage.getItem('query-metrics') || '[]')
      metrics.push({ queryKey, duration, timestamp: Date.now() })
      
      // Keep only last 100 metrics
      if (metrics.length > 100) {
        metrics.splice(0, metrics.length - 100)
      }
      
      localStorage.setItem('query-metrics', JSON.stringify(metrics))
    }
  },
}

// Performance monitoring
export const cacheMetrics = {
  // Get cache hit ratio
  getCacheStats: () => {
    const queryCache = queryClient.getQueryCache()
    const queries = queryCache.getAll()
    
    const total = queries.length
    const fresh = queries.filter(q => q.state.dataUpdatedAt > Date.now() - 60000).length
    const stale = total - fresh
    
    return {
      total,
      fresh,
      stale,
      hitRatio: total > 0 ? (fresh / total * 100).toFixed(2) + '%' : '0%'
    }
  },

  // Log cache performance
  logCachePerformance: () => {
    if (process.env.NODE_ENV === 'development') {
      const stats = cacheMetrics.getCacheStats()
      console.log('📊 Cache Performance:', stats)
    }
  },

  // Get detailed performance metrics
  getDetailedMetrics: () => {
    if (typeof window === 'undefined') return null
    
    const metrics = JSON.parse(localStorage.getItem('query-metrics') || '[]')
    const recentMetrics = metrics.filter((m: any) => Date.now() - m.timestamp < 300000) // Last 5 minutes
    
    const avgResponseTime = recentMetrics.length > 0 
      ? recentMetrics.reduce((acc: number, m: any) => acc + m.duration, 0) / recentMetrics.length
      : 0
    
    const slowQueries = recentMetrics.filter((m: any) => m.duration > 1000).length
    
    return {
      totalQueries: recentMetrics.length,
      avgResponseTime: Math.round(avgResponseTime),
      slowQueries,
      cacheStats: cacheMetrics.getCacheStats(),
    }
  },
}

// Auto cleanup interval
if (typeof window !== 'undefined') {
  setInterval(() => {
    memoryManagement.cleanupOldQueries()
    memoryManagement.limitCacheSize(100)
  }, 5 * 60 * 1000) // Every 5 minutes
} 