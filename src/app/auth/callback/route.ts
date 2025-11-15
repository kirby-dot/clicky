import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient(
      'https://ddekvujqgnhkndhvdfma.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkZWt2dWpxZ25oa25kaHZkZm1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMTcwMTYsImV4cCI6MjA3ODU5MzAxNn0.9pwv0Ma6HMnjxM8XsysmsovJKFnd6eqsfxNJuSeNBY8'
    )

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(new URL('/login?error=auth_error', requestUrl.origin))
    }

    if (data.session) {
      // Create redirect response with session data encoded in fragment
      const redirectUrl = new URL('/auth/confirm', requestUrl.origin)
      redirectUrl.hash = `access_token=${data.session.access_token}&refresh_token=${data.session.refresh_token}&expires_in=${data.session.expires_in}&token_type=${data.session.token_type}`

      return NextResponse.redirect(redirectUrl)
    }
  }

  // No code provided, redirect to login
  return NextResponse.redirect(new URL('/login', requestUrl.origin))
}
