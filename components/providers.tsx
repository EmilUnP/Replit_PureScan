'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { queryClient, backgroundSync } from '@/lib/react-query'
import { PerformanceMonitor } from '@/components/performance/performance-monitor'
import { Database } from '@/types/database'

type SupabaseContext = {
  supabase: typeof supabase
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Register service worker for offline support
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration)
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError)
        })
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <Context.Provider value={{ supabase }}>
        <AuthProvider>
          {children}
          <PerformanceMonitor />
        </AuthProvider>
      </Context.Provider>
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
    </QueryClientProvider>
  )
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider')
  }
  return context
}

// Auth Context
type AuthContext = {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContext | undefined>(undefined)

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) {
          console.error('Error getting user:', error)
        }
        setUser(user)
        
        // Background sync user data for performance
        if (user?.id) {
          backgroundSync.syncUserData(user.id)
          
          // Register background sync for service worker
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then((registration) => {
              // Check if sync is supported
              if ('sync' in registration) {
                (registration as any).sync.register('sync-user-data')
              }
            }).catch((err) => {
              console.log('Background sync registration failed:', err)
            })
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null)
        setLoading(false)
        
        // Sync data when user logs in
        if (session?.user?.id) {
          backgroundSync.syncUserData(session.user.id)
          
          // Register background sync
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then((registration) => {
              // Check if sync is supported
              if ('sync' in registration) {
                (registration as any).sync.register('sync-user-data')
              }
            }).catch((err) => {
              console.log('Background sync registration failed:', err)
            })
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      // Clear React Query cache on sign out
      queryClient.clear()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const value = {
    user,
    loading,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
} 