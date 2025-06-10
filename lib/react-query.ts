import { QueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query'
import { supabase } from './supabase'

// Create a React Query client with optimized defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: 5 minutes
      staleTime: 1000 * 60 * 5,
      // Cache time: 10 minutes  
      gcTime: 1000 * 60 * 10,
      // Retry failed requests
      retry: (failureCount, error: any) => {
        // Don't retry for 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        return failureCount < 3
      },
      // Refetch on window focus for important data
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: 'always',
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
})

// Query keys factory for consistent caching
export const queryKeys = {
  // User queries
  user: ['user'] as const,
  userProfile: (userId: string) => ['user', 'profile', userId] as const,
  
  // Scan queries
  scans: ['scans'] as const,
  scansList: (filters?: any) => ['scans', 'list', filters] as const,
  scanDetail: (scanId: string) => ['scans', 'detail', scanId] as const,
  userScans: (userId: string) => ['scans', 'user', userId] as const,
  
  // Achievement queries
  achievements: ['achievements'] as const,
  userAchievements: (userId: string) => ['achievements', 'user', userId] as const,
  
  // Share queries
  shareableScans: ['scans', 'shareable'] as const,
  sharedScan: (shareId: string) => ['scans', 'shared', shareId] as const,
} as const

// Helper function to invalidate related queries
export const invalidateQueries = {
  user: () => queryClient.invalidateQueries({ queryKey: queryKeys.user }),
  scans: () => queryClient.invalidateQueries({ queryKey: queryKeys.scans }),
  achievements: () => queryClient.invalidateQueries({ queryKey: queryKeys.achievements }),
  userScans: (userId: string) => 
    queryClient.invalidateQueries({ queryKey: queryKeys.userScans(userId) }),
  userAchievements: (userId: string) => 
    queryClient.invalidateQueries({ queryKey: queryKeys.userAchievements(userId) }),
}

// Prefetch functions for critical data
export const prefetchFunctions = {
  userProfile: async (userId: string) => {
    await queryClient.prefetchQuery({
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
      staleTime: 1000 * 60 * 10, // 10 minutes
    })
  },
  
  userScans: async (userId: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.userScans(userId),
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
          .order('scanned_at', { ascending: false })
          .limit(10)
        
        if (error) throw error
        return data
      },
      staleTime: 1000 * 60 * 2, // 2 minutes
    })
  },
}

// Performance monitoring
export const performanceMonitor = {
  logSlowQueries: (queryKey: readonly unknown[], duration: number) => {
    if (duration > 1000) { // Log queries taking more than 1 second
      console.warn(`Slow query detected:`, { queryKey, duration })
    }
  },
  
  logCacheHits: (queryKey: readonly unknown[], fromCache: boolean) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Query ${fromCache ? 'cache hit' : 'network request'}:`, queryKey)
    }
  },
}

// Background sync for offline support
export const backgroundSync = {
  syncUserData: async (userId: string) => {
    try {
      await Promise.all([
        prefetchFunctions.userProfile(userId),
        prefetchFunctions.userScans(userId),
      ])
    } catch (error) {
      console.error('Background sync failed:', error)
    }
  },
} 