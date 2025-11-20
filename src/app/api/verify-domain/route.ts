import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database'

const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i

const normalizeDomain = (domain: string) =>
  domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')

export async function POST(request: Request) {
  try {
    const { profileId, domain } = await request.json()

    if (!profileId || !domain) {
      return NextResponse.json(
        { error: 'Profile ID and domain are required' },
        { status: 400 }
      )
    }

    const normalizedDomain = normalizeDomain(domain)

    // Validate domain format
    if (!domainRegex.test(normalizedDomain)) {
      return NextResponse.json(
        { error: 'Invalid domain format' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Verify user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user owns this profile
    const { data: profileData } = await (supabase as any)
      .from('profiles')
      .select('user_id')
      .eq('id', profileId)
      .maybeSingle()

    const profile = profileData as { user_id: string } | null

    if (!profile || profile.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Profile not found or unauthorized' },
        { status: 403 }
      )
    }

    // Check if user has Business plan
    const { data: userData } = await (supabase as any)
      .from('users')
      .select('subscription_tier')
      .eq('id', session.user.id)
      .maybeSingle()

    const userTier = userData as { subscription_tier: string } | null

    if (!userTier || userTier.subscription_tier !== 'enterprise') {
      return NextResponse.json(
        { error: 'Custom domains are only available on Business plan' },
        { status: 403 }
      )
    }

    // Ensure the domain isn't already claimed by another profile
    const { data: existingDomain } = await (supabase as any)
      .from('profiles')
      .select('id, user_id')
      .eq('custom_domain', normalizedDomain)
      .maybeSingle()

    if (existingDomain && existingDomain.id !== profileId) {
      return NextResponse.json(
        { error: 'This domain is already connected to another profile' },
        { status: 409 }
      )
    }

    // Verify DNS configuration
    // In production, you'd use DNS lookup to verify CNAME record
    // For now, we'll do a simple HTTP check
    let verified = false
    let verificationError = ''

    try {
      // Try to fetch from the custom domain
      const response = await fetch(`https://${normalizedDomain}`, {
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
    const updateData: any = {
      custom_domain: normalizedDomain,
      domain_verified: verified,
      domain_verified_at: verified ? new Date().toISOString() : null
    }
    const { error: updateError } = await (supabase as any)
      .from('profiles')
      .update(updateData)
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
