import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { hashIp } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { profile_id, link_id, event_type } = body

    if (!profile_id || !event_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Get IP address
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown'

    // Get country from Cloudflare header (if using Cloudflare)
    const country = request.headers.get('cf-ipcountry') || null

    // Hash IP for privacy
    const ipHash = hashIp(ip)

    // Insert event
    await (supabase as any).from('events').insert({
      profile_id: profile_id as string,
      link_id: link_id || null,
      event_type: event_type as 'view' | 'click',
      ip_hash: ipHash,
      country,
      device_type: body.device_type || null,
      referrer: body.referrer || null,
    } as any)

    // Increment link clicks if it's a click event
    // Note: Click counting is handled by analytics events
    // You can add a Supabase function or use a trigger to increment clicks

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Tracking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Create the increment function in Supabase:
// CREATE OR REPLACE FUNCTION increment_link_clicks(link_id UUID)
// RETURNS void AS $$
// BEGIN
//   UPDATE links SET clicks = clicks + 1 WHERE id = link_id;
// END;
// $$ LANGUAGE plpgsql;
