import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export async function POST(request: Request) {
  try {
    const { profileId, domain } = await request.json()

    if (!profileId || !domain) {
      return NextResponse.json(
        { error: 'Profile ID and domain are required' },
        { status: 400 }
      )
    }

    // Validate domain format
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i
    if (!domainRegex.test(domain)) {
      return NextResponse.json(
        { error: 'Invalid domain format' },
        { status: 400 }
      )
    }

    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user owns this profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('id', profileId)
      .single()

    if (!profile || profile.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Profile not found or unauthorized' },
        { status: 403 }
      )
    }

    // Check if user has Business plan
    const { data: userData } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    if (!userData || userData.subscription_tier !== 'enterprise') {
      return NextResponse.json(
        { error: 'Custom domains are only available on Business plan' },
        { status: 403 }
      )
    }

    // Verify DNS configuration
    // In production, you'd use DNS lookup to verify CNAME record
    // For now, we'll do a simple HTTP check
    let verified = false
    let verificationError = ''

    try {
      // Try to fetch from the custom domain
      const response = await fetch(`https://${domain}`, {
        method: 'HEAD',
        redirect: 'manual',
        signal: AbortSignal.timeout(5000)
      })

      // Check if it resolves (any response is good enough for basic verification)
      verified = response.status < 500
    } catch (error: any) {
      verificationError = error.message || 'Domain verification failed'
      verified = false
    }

    // Update profile with verification status
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        custom_domain: domain,
        domain_verified: verified,
        domain_verified_at: verified ? new Date().toISOString() : null
      })
      .eq('id', profileId)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update domain' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      verified,
      message: verified
        ? 'Domain verified successfully!'
        : `Domain saved but not yet verified. ${verificationError}`
    })

  } catch (error: any) {
    console.error('Domain verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
