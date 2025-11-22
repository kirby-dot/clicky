import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export async function POST(request: Request) {
  try {
    const { name, email, message, profile_id, module_id } = await request.json()

    if (!message || !profile_id || !module_id) {
      return NextResponse.json(
        { error: 'Message, profile ID, and module ID are required' },
        { status: 400 }
      )
    }

    // Validate email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        )
      }
    }

    // Validate message length
    if (message.length < 10) {
      return NextResponse.json(
        { error: 'Message must be at least 10 characters' },
        { status: 400 }
      )
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: 'Message must be less than 5000 characters' },
        { status: 400 }
      )
    }

    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Insert contact message
    const { data: contactMessage, error: insertError } = await (supabase as any)
      .from('contact_messages')
      .insert({
        profile_id,
        module_id,
        name: name?.trim() || null,
        email: email?.toLowerCase().trim() || null,
        message: message.trim(),
        read: false,
        metadata: {
          user_agent: request.headers.get('user-agent'),
          referer: request.headers.get('referer'),
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        }
      })
      .select()
      .single()

    if (insertError) {
      console.error('Contact message error:', insertError)
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      )
    }

    // Fetch profile owner's email for notification
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('user_id, title')
      .eq('id', profile_id)
      .maybeSingle()

    if (profile) {
      const { data: userData } = await (supabase as any)
        .from('users')
        .select('email')
        .eq('id', profile.user_id)
        .maybeSingle()

      if (userData) {
        // TODO: Send email notification to profile owner
        // await sendContactNotification({
        //   ownerEmail: userData.email,
        //   profileTitle: profile.title,
        //   senderName: name,
        //   senderEmail: email,
        //   message: message,
        // })
        console.log(`New contact message for profile ${profile.title} - would notify ${userData.email}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully!'
    })

  } catch (error: any) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
