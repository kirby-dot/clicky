import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export async function POST(request: Request) {
  try {
    const { email, profile_id, module_id } = await request.json()

    if (!email || !profile_id || !module_id) {
      return NextResponse.json(
        { error: 'Email, profile ID, and module ID are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Check if email already captured for this profile
    const { data: existing } = await supabase
      .from('email_captures' as any)
      .select('id, subscribed')
      .eq('profile_id', profile_id)
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (existing) {
      if (existing.subscribed) {
        return NextResponse.json(
          { error: 'This email is already subscribed' },
          { status: 409 }
        )
      } else {
        // Resubscribe
        const { error: updateError } = await (supabase
          .from('email_captures' as any)
          .update({
            subscribed: true,
            unsubscribed_at: null,
          } as any)
          .eq('id', existing.id) as any)

        if (updateError) {
          console.error('Resubscribe error:', updateError)
          return NextResponse.json(
            { error: 'Failed to resubscribe' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          message: 'Successfully resubscribed!'
        })
      }
    }

    // Insert new email capture
    const { error: insertError } = await (supabase
      .from('email_captures' as any)
      .insert({
        profile_id,
        module_id,
        email: email.toLowerCase(),
        subscribed: true,
        source: 'profile',
        metadata: {
          user_agent: request.headers.get('user-agent'),
          referer: request.headers.get('referer'),
        }
      } as any) as any)

    if (insertError) {
      console.error('Email capture error:', insertError)
      return NextResponse.json(
        { error: 'Failed to capture email' },
        { status: 500 }
      )
    }

    // TODO: Send welcome email using your email service (SendGrid, Resend, etc.)
    // await sendWelcomeEmail(email, profile_id)

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed!'
    })

  } catch (error: any) {
    console.error('Email capture error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
