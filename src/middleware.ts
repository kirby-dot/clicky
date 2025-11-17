import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Check for authentication token in cookies
  const token = req.cookies.get('sb-access-token')?.value
  const hasSession = !!token

  // Handle custom domain routing (only if not localhost)
  const hostname = req.headers.get('host') || ''
  const isCustomDomain = !hostname.includes('localhost') &&
                         !hostname.includes('vercel.app') &&
                         !hostname.includes('clicky.com') &&
                         hostname !== ''

  if (isCustomDomain) {
    // Lookup profile by custom domain
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('slug')
      .eq('custom_domain', hostname.split(':')[0])  // Remove port if present
      .eq('domain_verified', true)
      .maybeSingle()

    if (profile) {
      // Rewrite to the profile page
      const url = req.nextUrl.clone()
      url.pathname = `/${profile.slug}${req.nextUrl.pathname}`
      return NextResponse.rewrite(url)
    }

    // If no profile found with this domain, continue normally
    return res
  }

  // Skip auth callback and confirmation pages
  if (req.nextUrl.pathname === '/auth/callback' || req.nextUrl.pathname === '/auth/confirm') {
    return res
  }

  // Protect dashboard routes - redirect to login if no session
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!hasSession) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Redirect authenticated users away from auth pages
  if (
    (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup') &&
    hasSession
  ) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
