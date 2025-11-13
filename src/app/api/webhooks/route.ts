import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// This is an example webhook handler that shows how to:
// 1. Receive events from your Clicky profile
// 2. Send them to connected integrations
// 3. Log the results

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for server-side
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event_type, profile_id, data } = body

    // Get active integrations for this profile
    const { data: integrations } = await supabase
      .from('integrations')
      .select('*')
      .eq('profile_id', profile_id)
      .eq('is_active', true)

    if (!integrations || integrations.length === 0) {
      return NextResponse.json({ message: 'No active integrations' })
    }

    const results = []

    // Process each integration
    for (const integration of integrations) {
      try {
        let result

        switch (integration.provider) {
          case 'zapier':
          case 'make':
          case 'custom_webhook':
            result = await sendToWebhook(integration, event_type, data)
            break

          case 'discord':
            result = await sendToDiscord(integration, event_type, data)
            break

          case 'slack':
            result = await sendToSlack(integration, event_type, data)
            break

          case 'mailchimp':
            result = await sendToMailchimp(integration, event_type, data)
            break

          default:
            result = { status: 'skipped', message: 'Provider not implemented' }
        }

        // Log the event
        await supabase.rpc('log_integration_event', {
          integration_id_param: integration.id,
          event_type_param: event_type,
          payload_param: data,
          response_param: result,
          status_param: result.status === 'success' ? 'success' : 'failed',
          error_message_param: result.error || null,
        })

        results.push({ provider: integration.provider, ...result })
      } catch (error: any) {
        console.error(`Error processing ${integration.provider}:`, error)
        results.push({
          provider: integration.provider,
          status: 'failed',
          error: error.message,
        })
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// Helper functions for each integration type

async function sendToWebhook(
  integration: any,
  event_type: string,
  data: any
) {
  const webhookUrl = integration.config.webhook_url

  if (!webhookUrl) {
    return { status: 'failed', error: 'Webhook URL not configured' }
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(integration.config.secret && {
        'X-Webhook-Secret': integration.config.secret,
      }),
    },
    body: JSON.stringify({
      event_type,
      timestamp: new Date().toISOString(),
      data,
    }),
  })

  if (!response.ok) {
    return {
      status: 'failed',
      error: `Webhook returned ${response.status}`,
    }
  }

  return { status: 'success', response: await response.text() }
}

async function sendToDiscord(
  integration: any,
  event_type: string,
  data: any
) {
  const webhookUrl = integration.config.webhook_url

  if (!webhookUrl) {
    return { status: 'failed', error: 'Discord webhook URL not configured' }
  }

  const embed = {
    embeds: [
      {
        title: `New ${event_type}`,
        description: getEventDescription(event_type, data),
        color: event_type === 'view' ? 0x3b82f6 : 0x10b981,
        timestamp: new Date().toISOString(),
        footer: {
          text: 'Clicky',
        },
      },
    ],
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(embed),
  })

  if (!response.ok) {
    return {
      status: 'failed',
      error: `Discord returned ${response.status}`,
    }
  }

  return { status: 'success' }
}

async function sendToSlack(
  integration: any,
  event_type: string,
  data: any
) {
  const webhookUrl = integration.config.webhook_url

  if (!webhookUrl) {
    return { status: 'failed', error: 'Slack webhook URL not configured' }
  }

  const message = {
    text: `*New ${event_type}*`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: getEventDescription(event_type, data),
        },
      },
    ],
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  })

  if (!response.ok) {
    return {
      status: 'failed',
      error: `Slack returned ${response.status}`,
    }
  }

  return { status: 'success' }
}

async function sendToMailchimp(
  integration: any,
  event_type: string,
  data: any
) {
  // Only process email signups for Mailchimp
  if (event_type !== 'email_signup') {
    return { status: 'skipped', message: 'Not an email signup event' }
  }

  const apiKey = integration.config.api_key
  const listId = integration.config.list_id

  if (!apiKey || !listId) {
    return { status: 'failed', error: 'Mailchimp not fully configured' }
  }

  // Extract datacenter from API key (e.g., us1, us19)
  const datacenter = apiKey.split('-')[1]
  const url = `https://${datacenter}.api.mailchimp.com/3.0/lists/${listId}/members`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `apikey ${apiKey}`,
    },
    body: JSON.stringify({
      email_address: data.email,
      status: 'subscribed',
      merge_fields: {
        FNAME: data.first_name || '',
        LNAME: data.last_name || '',
      },
      tags: ['clicky-signup'],
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    return {
      status: 'failed',
      error: error.detail || `Mailchimp returned ${response.status}`,
    }
  }

  return { status: 'success', response: await response.json() }
}

function getEventDescription(event_type: string, data: any): string {
  switch (event_type) {
    case 'view':
      return `Profile viewed from ${data.country || 'Unknown'} on ${data.device_type || 'Unknown'} device`
    case 'click':
      return `Link clicked: ${data.link_title || 'Untitled'}`
    case 'email_signup':
      return `New subscriber: ${data.email}`
    default:
      return `Event: ${event_type}`
  }
}
