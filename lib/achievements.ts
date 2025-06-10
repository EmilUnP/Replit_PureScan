import { supabase } from '@/lib/supabase'

export type AchievementType = 
  | 'scan' 
  | 'cosmetic_scan' 
  | 'skin_scan' 
  | 'share' 
  | 'profile' 
  | 'streak' 
  | 'safety_alert' 
  | 'perfect_score' 
  | 'early_adopter'

/**
 * Track achievement progress for a user
 */
export async function trackAchievement(
  userId: string, 
  type: AchievementType, 
  increment: number = 1
): Promise<void> {
  try {
    // Call the database function to update achievement progress
    const { error } = await supabase.rpc('update_achievement_progress', {
      p_user_id: userId,
      p_achievement_type: type,
      p_increment: increment
    })

    if (error) {
      console.error('Error tracking achievement:', error)
    }
  } catch (error) {
    console.error('Error calling achievement tracking function:', error)
  }
}

/**
 * Check if user profile is complete and update achievement
 */
export async function checkProfileCompletion(userId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc('check_profile_completion', {
      p_user_id: userId
    })

    if (error) {
      console.error('Error checking profile completion:', error)
    }
  } catch (error) {
    console.error('Error calling profile completion check:', error)
  }
}

/**
 * Track scan completion
 */
export async function trackScanCompletion(
  userId: string, 
  scanType: 'cosmetic' | 'skin',
  safetyScore?: number
): Promise<void> {
  // Track general scan achievement
  await trackAchievement(userId, 'scan')
  
  // Track specific scan type
  if (scanType === 'cosmetic') {
    await trackAchievement(userId, 'cosmetic_scan')
  } else {
    await trackAchievement(userId, 'skin_scan')
  }

  // Check for perfect score achievement
  if (safetyScore === 100) {
    await trackAchievement(userId, 'perfect_score')
  }

  // Check for safety alert (low score)
  if (safetyScore && safetyScore < 50) {
    await trackAchievement(userId, 'safety_alert')
  }
}

/**
 * Track sharing achievement
 */
export async function trackScanShare(userId: string): Promise<void> {
  await trackAchievement(userId, 'share')
}

/**
 * Track login streak (call this on user login)
 */
export async function trackLoginStreak(userId: string): Promise<void> {
  try {
    // Get user's last login from profiles table or a separate tracking table
    const { data: profile } = await supabase
      .from('profiles')
      .select('last_login_at, preferences')
      .eq('id', userId)
      .single()

    if (profile) {
      const now = new Date()
      const lastLogin = profile.last_login_at ? new Date(profile.last_login_at) : null
      const preferences = profile.preferences as any || {}
      let currentStreak = preferences.login_streak || 0

      // Calculate if this is a consecutive day
      if (lastLogin) {
        const diffTime = now.getTime() - lastLogin.getTime()
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        
        if (diffDays === 1) {
          // Consecutive day
          currentStreak += 1
        } else if (diffDays > 1) {
          // Streak broken, reset
          currentStreak = 1
        }
        // Same day login doesn't change streak
      } else {
        // First login
        currentStreak = 1
      }

      // Update profile with new login time and streak
      await supabase
        .from('profiles')
        .update({
          last_login_at: now.toISOString(),
          preferences: {
            ...preferences,
            login_streak: currentStreak
          }
        })
        .eq('id', userId)

      // Track streak achievement based on current streak
      await trackAchievement(userId, 'streak', currentStreak)
    }
  } catch (error) {
    console.error('Error tracking login streak:', error)
  }
}

/**
 * Get user's recent achievements (for notifications)
 */
export async function getRecentAchievements(userId: string, days: number = 7) {
  try {
    const dateThreshold = new Date()
    dateThreshold.setDate(dateThreshold.getDate() - days)

    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievements (
          title,
          description,
          badge_icon,
          category
        )
      `)
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .gte('completed_at', dateThreshold.toISOString())
      .order('completed_at', { ascending: false })

    if (error) {
      console.error('Error fetching recent achievements:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error getting recent achievements:', error)
    return []
  }
}

/**
 * Initialize achievement tracking for new users
 */
export async function initializeUserAchievements(userId: string): Promise<void> {
  try {
    // Track early adopter achievement for new users
    await trackAchievement(userId, 'early_adopter')
    
    // Check if profile is complete
    await checkProfileCompletion(userId)
  } catch (error) {
    console.error('Error initializing user achievements:', error)
  }
} 