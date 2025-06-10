import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const limit = url.searchParams.get('limit') || '10'
    const userId = url.searchParams.get('userId')

    // Get scans from database
    let query = supabase
      .from('scans')
      .select('*')
      .order('scanned_at', { ascending: false })
      .limit(parseInt(limit))

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data: scans, error } = await query

    if (error && error.code !== 'PGRST116') { // PGRST116 is "relation does not exist"
      console.error('Error fetching scans:', error)
      // Fall back to mock data if database error
    }

    // Return scans or empty array if no data
    return NextResponse.json({
      scans: scans || [],
      total: scans?.length || 0
    })

  } catch (error) {
    console.error('Error in scans API route:', error)
    // Return empty data instead of error to prevent dashboard crash
    return NextResponse.json({
      scans: [],
      total: 0
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Create a new scan
    const scanData = {
      id: crypto.randomUUID(),
      user_id: body.user_id,
      type: body.type || 'cosmetic',
      scan_type: body.scan_type || 'cosmetic',
      search_query: body.search_query,
      result: body.result,
      image_url: body.image_url,
      is_public: false,
      scanned_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('scans')
      .insert([scanData])
      .select()
      .single()

    if (error) {
      console.error('Error creating scan:', error)
      return NextResponse.json(
        { error: 'Failed to create scan' },
        { status: 500 }
      )
    }

    return NextResponse.json({ scan: data })

  } catch (error) {
    console.error('Error in scans POST route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 