import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nqrotlzhjvwmhvawtizw.supabase.co'
// Use service role key for admin operations to bypass RLS
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xcm90bHpoanZ3bWh2YXd0aXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2OTY4MzMsImV4cCI6MjA2NDI3MjgzM30.LI0ozjUk6ySb5lSeo7o7ql9Foy0xj7trgDPEywEuZMk'

// Use service key if available for admin operations, otherwise fallback to anon key
const adminKey = supabaseServiceKey || supabaseAnonKey

// Admin client configured - using service key if available for full data access

export const supabaseAdmin = createClient(supabaseUrl, adminKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
})

// Database interfaces
export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  skin_type: 'oily' | 'dry' | 'combination' | 'sensitive' | 'normal' | null
  age: number | null
  bio: string | null
  preferences: any
  privacy_settings: any
  created_at: string
  updated_at: string
  last_login_at: string | null
  scan_count?: number
}

export interface Scan {
  id: string
  user_id: string
  image_url: string
  thumbnail_url: string | null
  status: 'processing' | 'completed' | 'failed'
  analysis_results: any
  confidence_score: number | null
  recommendations: any
  tags: string[] | null
  is_public: boolean | null
  metadata: any
  created_at: string
  updated_at: string
  scan_type: 'cosmetic' | 'skin'
  is_favorite: boolean | null
  public_id: string | null
}

export interface Achievement {
  id: string
  name: string
  description: string
  type: string
  icon: string | null
  criteria: any
  points: number | null
  rarity: string | null
  created_at: string
  title: string | null
  badge_icon: string | null
  progress_required: number | null
  category: string | null
  updated_at: string | null
}

// Admin data fetching functions with real comparison logic
export async function getAdminStats() {
  try {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    const [
      totalUsersResult,
      totalScansResult,
      currentPeriodUsers,
      previousPeriodUsers,
      currentPeriodScans,
      previousPeriodScans
    ] = await Promise.all([
      // Total counts
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('scans').select('*', { count: 'exact', head: true }),
      
      // Current period (last 30 days)
      supabaseAdmin.from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString()),
      
      // Previous period (30-60 days ago)
      supabaseAdmin.from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sixtyDaysAgo.toISOString())
        .lt('created_at', thirtyDaysAgo.toISOString()),
      
      // Current period scans
      supabaseAdmin.from('scans')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString()),
      
      // Previous period scans
      supabaseAdmin.from('scans')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sixtyDaysAgo.toISOString())
        .lt('created_at', thirtyDaysAgo.toISOString())
    ])

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number): { percentage: string; type: 'positive' | 'negative' | 'neutral' } => {
      if (previous === 0) {
        return current > 0 ? { percentage: '+100%', type: 'positive' } : { percentage: 'No data', type: 'neutral' }
      }
      const change = ((current - previous) / previous) * 100
      return {
        percentage: change > 0 ? `+${Math.round(change)}%` : `${Math.round(change)}%`,
        type: change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral'
      }
    }

    const userChange = calculateChange(currentPeriodUsers.count || 0, previousPeriodUsers.count || 0)
    const scanChange = calculateChange(currentPeriodScans.count || 0, previousPeriodScans.count || 0)

    return {
      totalUsers: totalUsersResult.count || 0,
      totalScans: totalScansResult.count || 0,
      userChange,
      scanChange,
      currentPeriodUsers: currentPeriodUsers.count || 0,
      currentPeriodScans: currentPeriodScans.count || 0
    }
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return {
      totalUsers: 0,
      totalScans: 0,
      userChange: { percentage: 'No data', type: 'neutral' as const },
      scanChange: { percentage: 'No data', type: 'neutral' as const },
      currentPeriodUsers: 0,
      currentPeriodScans: 0
    }
  }
}

export async function getActiveUsersToday() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Count users who had scan activity today
    const { count } = await supabaseAdmin
      .from('scans')
      .select('user_id', { count: 'exact', head: true })
      .gte('created_at', today.toISOString())
    
    return count || 0
  } catch (error) {
    console.error('Error fetching active users today:', error)
    return 0
  }
}

export async function getSystemMetrics() {
  try {
    // Get database size approximation by counting records across tables
    const [profilesCount, scansCount, achievementsCount] = await Promise.all([
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('scans').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('achievements').select('*', { count: 'exact', head: true })
    ])

    // Estimate storage based on record counts (rough approximation)
    const totalRecords = (profilesCount.count || 0) + (scansCount.count || 0) + (achievementsCount.count || 0)
    const estimatedDbSize = totalRecords * 2 // Rough KB estimate per record
    
    // Calculate uptime (since this is a demo, we'll use a fixed good uptime)
    const uptimePercentage = 99.9

    return {
      databaseSize: estimatedDbSize > 1024 ? 
        `${(estimatedDbSize / 1024).toFixed(1)} MB` : 
        `${estimatedDbSize} KB`,
      fileStorage: 'Coming Soon', // Would need actual file storage API
      uptime: `${uptimePercentage}%`,
      memoryUsage: 'Coming Soon', // Would need system monitoring
      totalRecords,
      apiResponseTime: Math.floor(Math.random() * 100) + 50, // Simulated for demo
      errorRate: '0.1%' // Simulated for demo
    }
  } catch (error) {
    console.error('Error fetching system metrics:', error)
    return {
      databaseSize: 'Error',
      fileStorage: 'Error',
      uptime: 'Error',
      memoryUsage: 'Error',
      totalRecords: 0,
      apiResponseTime: 0,
      errorRate: 'Error'
    }
  }
}

export async function getStorageBreakdown() {
  try {
    // Get counts for different data types
    const [profilesCount, scansCount, achievementsCount] = await Promise.all([
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('scans').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('achievements').select('*', { count: 'exact', head: true })
    ])

    const totalRecords = (profilesCount.count || 0) + (scansCount.count || 0) + (achievementsCount.count || 0)

    return {
      userData: {
        records: profilesCount.count || 0,
        percentage: totalRecords > 0 ? Math.round(((profilesCount.count || 0) / totalRecords) * 100) : 0,
        size: `${Math.round((profilesCount.count || 0) * 1.5)} KB` // Estimate
      },
      scanImages: {
        records: scansCount.count || 0,
        percentage: totalRecords > 0 ? Math.round(((scansCount.count || 0) / totalRecords) * 100) : 0,
        size: `${Math.round((scansCount.count || 0) * 5)} KB` // Estimate (scans are larger)
      },
      systemLogs: {
        records: achievementsCount.count || 0,
        percentage: totalRecords > 0 ? Math.round(((achievementsCount.count || 0) / totalRecords) * 100) : 0,
        size: `${Math.round((achievementsCount.count || 0) * 0.5)} KB` // Estimate
      }
    }
  } catch (error) {
    console.error('Error fetching storage breakdown:', error)
    return {
      userData: { records: 0, percentage: 0, size: '0 KB' },
      scanImages: { records: 0, percentage: 0, size: '0 KB' },
      systemLogs: { records: 0, percentage: 0, size: '0 KB' }
    }
  }
}

export async function getScanStats() {
  try {
    const { data: scanTypes } = await supabaseAdmin
      .from('scans')
      .select('scan_type')

    const typeCounts = scanTypes?.reduce((acc: Record<string, number>, scan) => {
      acc[scan.scan_type] = (acc[scan.scan_type] || 0) + 1
      return acc
    }, {}) || {}

    return typeCounts
  } catch (error) {
    console.error('Error fetching scan stats:', error)
    return {}
  }
}

export async function getDailyScans(days: number = 30) {
  try {
    const { data: scans } = await supabaseAdmin
      .from('scans')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true })

    const dailyCounts = scans?.reduce((acc: Record<string, number>, scan) => {
      const date = new Date(scan.created_at).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {}) || {}

    return dailyCounts
  } catch (error) {
    console.error('Error fetching daily scans:', error)
    return {}
  }
}

export async function getRecentActivity() {
  try {
    const { data: recentScans } = await supabaseAdmin
      .from('scans')
      .select(`
        id,
        created_at,
        scan_type,
        status,
        profiles!inner(full_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    return recentScans?.map(scan => ({
      id: scan.id,
      type: `${scan.scan_type} scan`,
      user: (scan.profiles as any)?.full_name || (scan.profiles as any)?.email,
      timestamp: new Date(scan.created_at),
      status: scan.status
    })) || []
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return []
  }
}

export async function getUsers(
  page: number = 1, 
  limit: number = 10, 
  search?: string,
  sortBy: string = 'created_at',
  sortOrder: 'asc' | 'desc' = 'desc'
) {
  try {
    let query = supabaseAdmin
      .from('profiles')
      .select(`
        *,
        scans(count)
      `, { count: 'exact' })

    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
    }

    const { data: users, count, error } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range((page - 1) * limit, page * limit - 1)

    if (error) {
      throw error
    }

    const formattedUsers = users?.map(user => ({
      ...user,
      scan_count: Array.isArray(user.scans) ? user.scans.length : 0
    })) || []

    return {
      users: formattedUsers,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    return { users: [], total: 0, totalPages: 0 }
  }
}

export async function deleteUser(userId: string) {
  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error deleting user:', error)
    return { success: false, error }
  }
}

export async function updateUser(userId: string, updates: Partial<Profile>) {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error updating user:', error)
    return { success: false, error }
  }
}

// Super User Management Functions
const SUPER_USER_EMAILS = [
  'admin@purescan.app',
  'emil.talibov87@gmail.com',
  'emil.unp@gmail.com'  // The current user in the database
]

export async function isSuperUser(email: string): Promise<boolean> {
  try {
    // Check if email is in the super user list
    const normalizedEmail = email?.toLowerCase().trim()
    return SUPER_USER_EMAILS.some(adminEmail => 
      adminEmail.toLowerCase() === normalizedEmail
    )
  } catch (error) {
    console.error('Error checking super user status:', error)
    return false
  }
}

export async function getSuperUsers() {
  try {
    // Get all profiles that match super user emails
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .in('email', SUPER_USER_EMAILS)
    
    if (error) throw error
    
    return {
      success: true,
      users: data || [],
      totalSuperUsers: data?.length || 0
    }
  } catch (error) {
    console.error('Error fetching super users:', error)
    return {
      success: false,
      users: [],
      totalSuperUsers: 0,
      error
    }
  }
}

export async function addSuperUser(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const normalizedEmail = email.toLowerCase().trim()
    
    // Check if already a super user
    if (SUPER_USER_EMAILS.includes(normalizedEmail)) {
      return { success: false, message: 'User is already a super user' }
    }
    
    // Check if user exists in profiles
    const { data: user, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', normalizedEmail)
      .single()
    
    if (userError || !user) {
      return { success: false, message: 'User not found in the system' }
    }
    
    // In a real implementation, you would update a database table
    // For now, we'll just log this action (you'd need to manually add to the array above)
    console.log(`Super user access requested for: ${normalizedEmail}`)
    
    return { 
      success: true, 
      message: 'Super user access has been noted. Contact system administrator to complete the process.' 
    }
  } catch (error) {
    console.error('Error adding super user:', error)
    return { success: false, message: 'Error processing request' }
  }
}

export async function removeSuperUser(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const normalizedEmail = email.toLowerCase().trim()
    
    // Check if user is a super user
    if (!SUPER_USER_EMAILS.includes(normalizedEmail)) {
      return { success: false, message: 'User is not a super user' }
    }
    
    // Prevent removing the last super user
    if (SUPER_USER_EMAILS.length <= 1) {
      return { success: false, message: 'Cannot remove the last super user' }
    }
    
    // In a real implementation, you would update a database table
    console.log(`Super user removal requested for: ${normalizedEmail}`)
    
    return { 
      success: true, 
      message: 'Super user removal has been noted. Contact system administrator to complete the process.' 
    }
  } catch (error) {
    console.error('Error removing super user:', error)
    return { success: false, message: 'Error processing request' }
  }
}

export async function checkUserAccess(email: string): Promise<{
  hasAccess: boolean;
  isSuperUser: boolean;
  user?: Profile;
}> {
  try {
    const normalizedEmail = email?.toLowerCase().trim()
    
    if (!normalizedEmail) {
      return { hasAccess: false, isSuperUser: false }
    }
    
    // Check if super user
    const isSuperUserResult = await isSuperUser(normalizedEmail)
    
    if (!isSuperUserResult) {
      return { hasAccess: false, isSuperUser: false }
    }
    
    // Get user profile
    const { data: user, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', normalizedEmail)
      .single()
    
    if (error) {
      console.error('Error fetching user profile:', error)
      return { hasAccess: false, isSuperUser: false }
    }
    
    return {
      hasAccess: true,
      isSuperUser: true,
      user: user
    }
  } catch (error) {
    console.error('Error checking user access:', error)
    return { hasAccess: false, isSuperUser: false }
  }
} 