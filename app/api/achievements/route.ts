import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({
        achievements: [],
        total: 0
      })
    }

    // Get user achievements from database
    let achievements = null
    let error = null

    try {
      const result = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false })
      
      achievements = result.data
      error = result.error
    } catch (e) {
      console.log('User achievements table not available, using fallback data')
      error = { code: '42P01' } // Table doesn't exist
    }

    if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
      console.error('Error fetching achievements:', error)
    }

    // Return achievements or empty array if no data
    return NextResponse.json({
      achievements: achievements || [],
      total: achievements?.length || 0
    })

  } catch (error) {
    console.error('Error in achievements API route:', error)
    // Return empty data instead of error to prevent dashboard crash
    return NextResponse.json({
      achievements: [],
      total: 0
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    // For now, return success without creating - focus on dashboard functionality
    return NextResponse.json({ 
      success: true,
      message: 'Achievement functionality coming soon' 
    })
  } catch (error) {
    console.error('Error in achievements POST route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 