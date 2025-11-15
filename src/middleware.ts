import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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
    // For custom domains, we'll need to handle this differently
    // For now, just pass through - implement custom domain lookup in the app itself
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
