import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')

    if (!userId) {
      // Return a default profile if no userId provided
      return NextResponse.json({
        user: {
          id: 'demo-user',
          name: 'Demo User',
          email: 'demo@example.com',
          role: 'user'
        }
      })
    }

    // Get user profile from database
    let user = null
    let error = null

    try {
      const result = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      user = result.data
      error = result.error
    } catch (e) {
      console.log('Profiles table not available, using fallback data')
      error = { code: '42P01' } // Table doesn't exist
    }

    if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
      console.error('Error fetching user profile:', error)
    }

    // Return user profile or demo data
    return NextResponse.json({
      user: user || {
        id: userId,
        name: 'User',
        email: 'user@example.com',
        role: 'user'
      }
    })

  } catch (error) {
    console.error('Error in profile API route:', error)
    // Return demo data instead of error to prevent dashboard crash
    return NextResponse.json({
      user: {
        id: 'demo-user',
        name: 'Demo User',
        email: 'demo@example.com',
        role: 'user'
      }
    })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const userId = body.id

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Update user profile
    const { data, error } = await supabase
      .from('profiles')
      .update({
        name: body.name,
        email: body.email,
        gender: body.gender,
        date_of_birth: body.date_of_birth,
        public_profile: body.public_profile
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user profile:', error)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ user: data })

  } catch (error) {
    console.error('Error in profile PUT route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 