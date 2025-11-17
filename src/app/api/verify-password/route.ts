import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { profileId, password } = await request.json()

    if (!profileId || !password) {
      return NextResponse.json(
        { error: 'Profile ID and password are required' },
        { status: 400 }
      )
    }

    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Fetch profile with password
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('meta_tags')
      .eq('id', profileId)
      .maybeSingle()

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Check if profile has password protection
    const metaTags = (profile as any).meta_tags
    const profilePassword = metaTags?.password

    if (!profilePassword) {
      return NextResponse.json(
        { error: 'Profile is not password protected' },
        { status: 400 }
      )
    }

    // Verify password (in production, use bcrypt)
    const isValid = password === profilePassword

    if (isValid) {
      // Create a response with a cookie to remember password access
      const response = NextResponse.json({ success: true })

      // Set cookie that expires in 24 hours
      response.cookies.set(`profile_access_${profileId}`, 'granted', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
      })

      return response
    }

    return NextResponse.json(
      { error: 'Incorrect password' },
      { status: 401 }
    )

  } catch (error: any) {
    console.error('Password verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
