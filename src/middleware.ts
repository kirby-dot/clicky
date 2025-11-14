import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Create Supabase client with explicit environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  })

  // Get session from cookies
  const token = req.cookies.get('sb-access-token')?.value
  let session = null

  if (token) {
    const { data: { user } } = await supabase.auth.getUser(token)
    if (user) {
      session = { user }
    } else {
      // Clear invalid token
      res.cookies.delete('sb-access-token')
      res.cookies.delete('sb-refresh-token')
    }
  }

  // Handle custom domain routing
  const hostname = req.headers.get('host') || ''
  const isCustomDomain = !hostname.includes('localhost') &&
                         !hostname.includes('vercel.app') &&
                         !hostname.includes('clicky.com') &&
                         hostname !== ''

  if (isCustomDomain) {
    // Look up profile with this custom domain
    const { data: profile } = await supabase
      .from('profiles')
      .select('slug')
      .eq('custom_domain', hostname)
      .eq('domain_verified', true)
      .single()

    if (profile) {
      // Rewrite to the profile page
      const url = req.nextUrl.clone()
      url.pathname = `/${profile.slug}`
      return NextResponse.rewrite(url)
    }

    // If custom domain not found or not verified, show error
    return new NextResponse('Domain not configured correctly', { status: 404 })
  }

  // Protect dashboard routes
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/login'
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Redirect authenticated users away from auth pages
  if (
    (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup') &&
    session
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
