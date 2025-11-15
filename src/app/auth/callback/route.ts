import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  console.log('Auth callback received:', {
    code: code ? 'present' : 'missing',
    error,
    errorDescription,
    fullUrl: requestUrl.href
  })

  // If there's an error from the OAuth provider
  if (error) {
    console.error('OAuth provider error:', error, errorDescription)
    return NextResponse.redirect(new URL(`/login?error=${error}`, requestUrl.origin))
  }

  if (code) {
    const supabase = createClient(
      'https://ddekvujqgnhkndhvdfma.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkZWt2dWpxZ25oa25kaHZkZm1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMTcwMTYsImV4cCI6MjA3ODU5MzAxNn0.9pwv0Ma6HMnjxM8XsysmsovJKFnd6eqsfxNJuSeNBY8'
    )

    // Exchange code for session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Auth callback error:', exchangeError)
      return NextResponse.redirect(new URL(`/login?error=exchange_failed&message=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin))
    }

    if (data.session) {
      console.log('Session created successfully, setting cookies and redirecting to dashboard')

      // Create response and set cookies directly
      const redirectUrl = new URL('/dashboard', requestUrl.origin)
      const response = NextResponse.redirect(redirectUrl)

      // Set cookies on the response (non-httpOnly so middleware can read them)
      response.cookies.set('sb-access-token', data.session.access_token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      })

      response.cookies.set('sb-refresh-token', data.session.refresh_token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      })

      console.log('Cookies set, redirecting to:', redirectUrl.href)
      return response
    }

    console.log('No session in data, redirecting to login')
    return NextResponse.redirect(new URL('/login?error=no_session', requestUrl.origin))
  }

  // No code provided, redirect to login
  return NextResponse.redirect(new URL('/login', requestUrl.origin))
}
