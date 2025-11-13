# Integration Setup & Implementation Guide

This guide explains how to set up and make integrations actually work in Clicky.

## 🚨 Important: What's Built vs. What's Needed

### ✅ Already Built:
- Database tables for storing integration configs
- Integration dashboard UI with 15 providers
- Configuration modals for storing API keys
- Logos and branding for each service
- Example webhook handler (`/api/webhooks`)

### ⚠️ What's Needed to Make Them Work:
- Trigger webhook calls from your profile page
- Connect analytics pixels to frontend
- Build email signup module
- Payment button modules
- Test each integration

---

## 📋 Step 1: Apply Database Migrations

### Run in Supabase SQL Editor:

```sql
-- 1. Add style column to profiles (fixes the styling error)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS style JSONB DEFAULT '{}'::jsonb;
CREATE INDEX IF NOT EXISTS idx_profiles_style ON profiles USING gin (style);
```

```sql
-- 2. Run migrations/005_ab_testing.sql
-- Copy and paste the entire file

-- 3. Run migrations/006_integrations.sql
-- Copy and paste the entire file

-- 4. Run migrations/007_add_style_column.sql
-- Copy and paste the entire file
```

Verify tables exist:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'ab_tests',
  'ab_test_variants',
  'integrations',
  'integration_events'
);
```

---

## 🔌 Step 2: Understanding How Integrations Work

### Current State:
When you add an integration (e.g., Mailchimp), it:
1. ✅ Stores the API key in the database
2. ✅ Shows as "Connected" in the dashboard
3. ❌ **Does NOT automatically sync data yet**

### What Needs to Happen:

#### For Webhook-Based Integrations (Zapier, Discord, Slack, Custom):
1. User connects integration (stores webhook URL)
2. **Your code needs to**: Call `/api/webhooks` when events happen
3. API sends data to the webhook
4. External service receives it

#### For Email Marketing (Mailchimp, ConvertKit, Klaviyo):
1. User connects integration (stores API key)
2. **You need to**: Build an email signup module
3. When visitor submits email, call `/api/webhooks`
4. API adds subscriber to email list

#### For Analytics (Google Analytics, Facebook Pixel, TikTok Pixel):
1. User connects integration (stores pixel ID)
2. **You need to**: Inject tracking scripts in profile page
3. Scripts automatically track page views
4. Data appears in analytics dashboards

#### For Payments (Stripe, PayPal):
1. User connects integration (stores API keys)
2. **You need to**: Build payment button modules
3. Button opens checkout
4. Payment processed

---

## 🔨 Step 3: Making Specific Integrations Work

### Example 1: Zapier/Webhook (Easiest)

**What the user does:**
1. Goes to Zapier.com
2. Creates a new Zap with a "Webhook" trigger
3. Copies the webhook URL (e.g., `https://hooks.zapier.com/hooks/catch/123456/abcdef/`)
4. Pastes it in Clicky → Integrations → Zapier → Configure

**What you need to build:**
Add this to your profile view tracking (`src/components/profile/profile-view.tsx`):

```typescript
useEffect(() => {
  // Existing tracking code...
  await supabase.from('events').insert({...})

  // NEW: Trigger webhook integrations
  fetch('/api/webhooks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_type: 'view',
      profile_id: profile.id,
      data: {
        country: 'US', // Get from IP geolocation
        device_type: isMobile ? 'mobile' : 'desktop',
        timestamp: new Date().toISOString()
      }
    })
  })
}, [])
```

**Result:** Every profile view sends data to Zapier, which can then:
- Add row to Google Sheets
- Send Slack notification
- Create Airtable record
- Trigger any of 5,000+ apps

### Example 2: Discord Notifications

**What the user does:**
1. Goes to Discord Server Settings → Integrations → Webhooks
2. Creates a webhook for a channel
3. Copies webhook URL
4. Pastes in Clicky → Integrations → Discord

**What you need to build:**
Same as Zapier - just call `/api/webhooks`. The API handles Discord formatting automatically.

**Result:** Get Discord notifications like:
```
🎉 New view
Profile viewed from United States on mobile device
```

### Example 3: Mailchimp Email Sync

**What the user does:**
1. Goes to Mailchimp → Account → Extras → API Keys
2. Creates API key
3. Gets Audience ID from Mailchimp audience settings
4. Enters both in Clicky → Integrations → Mailchimp

**What you need to build:**

1. Create an email signup module type in `src/types/index.ts`:
```typescript
export interface EmailSignupContent {
  title: string
  description: string
  placeholder: string
  buttonText: string
  successMessage: string
}
```

2. Create `src/components/modules/email-signup-module.tsx`:
```typescript
export function EmailSignupModule({ module }: { module: Module }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Save to database
      await supabase.from('email_signups').insert({
        profile_id: module.profile_id,
        email,
      })

      // Trigger integrations
      await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'email_signup',
          profile_id: module.profile_id,
          data: { email }
        })
      })

      setSuccess(true)
    } catch (error) {
      alert('Failed to subscribe')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="...">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
      />
      <button type="submit">{loading ? 'Subscribing...' : 'Subscribe'}</button>
    </form>
  )
}
```

3. Add to module renderer and builder

**Result:**
- Visitor enters email
- Email saved to your database
- Automatically added to Mailchimp audience
- Receives welcome email campaign

### Example 4: Google Analytics

**What the user does:**
1. Goes to Google Analytics → Admin → Data Streams
2. Creates web stream
3. Copies Measurement ID (G-XXXXXXXXXX)
4. Enters in Clicky → Integrations → Google Analytics

**What you need to build:**

1. Create `src/lib/analytics.ts`:
```typescript
export function injectGoogleAnalytics(measurementId: string) {
  // Inject GA script
  const script = document.createElement('script')
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  script.async = true
  document.head.appendChild(script)

  // Initialize GA
  window.dataLayer = window.dataLayer || []
  function gtag(...args: any[]) {
    window.dataLayer.push(arguments)
  }
  gtag('js', new Date())
  gtag('config', measurementId)
}

export function trackEvent(eventName: string, params?: any) {
  if (window.gtag) {
    window.gtag('event', eventName, params)
  }
}
```

2. In profile view (`src/app/[username]/page.tsx`):
```typescript
useEffect(() => {
  // Load user's active integrations
  const { data: integrations } = await supabase
    .from('integrations')
    .select('*')
    .eq('profile_id', profileData.id)
    .eq('is_active', true)

  // Inject analytics pixels
  integrations.forEach(integration => {
    if (integration.provider === 'google_analytics') {
      injectGoogleAnalytics(integration.config.measurement_id)
    } else if (integration.provider === 'facebook_pixel') {
      injectFacebookPixel(integration.config.pixel_id)
    } else if (integration.provider === 'tiktok_pixel') {
      injectTikTokPixel(integration.config.pixel_id)
    }
  })
}, [])

// Track link clicks
const handleLinkClick = (link: Module) => {
  trackEvent('link_click', {
    link_id: link.id,
    link_title: link.content.title
  })
}
```

**Result:**
- GA script automatically loads on profile page
- All views tracked in Google Analytics
- Click events sent to GA
- See data in GA dashboard

### Example 5: Stripe Payments

**What the user does:**
1. Goes to Stripe Dashboard → Developers → API Keys
2. Copies Publishable Key and Secret Key
3. Enters both in Clicky → Integrations → Stripe

**What you need to build:**

1. Create payment link module type
2. When clicked, open Stripe Checkout:
```typescript
import { loadStripe } from '@stripe/stripe-js'

const handlePayment = async () => {
  // Get user's Stripe publishable key from their integration
  const { data: integration } = await supabase
    .from('integrations')
    .select('config')
    .eq('profile_id', profileId)
    .eq('provider', 'stripe')
    .single()

  const stripe = await loadStripe(integration.config.publishable_key)

  // Create checkout session (need backend API)
  const response = await fetch('/api/create-checkout', {
    method: 'POST',
    body: JSON.stringify({
      profile_id: profileId,
      amount: 1000, // $10.00
      product_name: 'Digital Product'
    })
  })

  const session = await response.json()
  await stripe.redirectToCheckout({ sessionId: session.id })
}
```

---

## 🧪 Step 4: Testing Integrations

### Test Zapier:
1. Create test Zap: Webhook → Send Email
2. Copy webhook URL to Clicky
3. Visit your profile page
4. Check email - should receive notification

### Test Discord:
1. Create test webhook in Discord server
2. Copy URL to Clicky
3. Visit your profile
4. Check Discord channel - should see message

### Test Mailchimp:
1. Get API key and audience ID
2. Add to Clicky
3. Build email signup module (see above)
4. Submit email on profile
5. Check Mailchimp audience - should see new subscriber

### Test Google Analytics:
1. Create GA4 property
2. Add measurement ID to Clicky
3. Inject script on profile page (see above)
4. Visit profile
5. Check GA real-time reports - should see active user

---

## 🔐 Security Considerations

### API Keys:
- Currently stored in JSONB column (plain text)
- **Recommended**: Use Supabase Vault for encryption
- Never expose credentials in API responses
- Use environment variables for service role keys

### Webhooks:
- Validate webhook signatures when possible
- Rate limit webhook endpoints
- Log all webhook calls
- Handle errors gracefully

### Service Role Key:
Add to `.env.local`:
```
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```
Never commit this to git!

---

## 📊 Monitoring Integration Health

### Check Integration Status:
```sql
SELECT
  p.username,
  i.provider,
  i.is_active,
  i.sync_status,
  i.last_sync_at,
  i.error_message
FROM integrations i
JOIN profiles p ON p.id = i.profile_id
WHERE i.is_active = true
ORDER BY i.last_sync_at DESC;
```

### View Recent Events:
```sql
SELECT
  ie.created_at,
  i.provider,
  ie.event_type,
  ie.status,
  ie.error_message
FROM integration_events ie
JOIN integrations i ON i.id = ie.integration_id
ORDER BY ie.created_at DESC
LIMIT 50;
```

### Success Rate by Provider:
```sql
SELECT
  i.provider,
  COUNT(*) as total_events,
  SUM(CASE WHEN ie.status = 'success' THEN 1 ELSE 0 END) as successful,
  ROUND(100.0 * SUM(CASE WHEN ie.status = 'success' THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate
FROM integration_events ie
JOIN integrations i ON i.id = ie.integration_id
WHERE ie.created_at > NOW() - INTERVAL '7 days'
GROUP BY i.provider
ORDER BY total_events DESC;
```

---

## 🚀 Quick Start Checklist

- [ ] Apply all database migrations in Supabase
- [ ] Add SUPABASE_SERVICE_ROLE_KEY to .env.local
- [ ] Test webhook endpoint with curl/Postman
- [ ] Connect one integration (Zapier is easiest)
- [ ] Add webhook trigger to profile view
- [ ] Visit profile and verify webhook fires
- [ ] Check integration_events table for logs
- [ ] Build email signup module (if needed)
- [ ] Inject analytics scripts (if needed)
- [ ] Test thoroughly before production

---

## 📝 Next Steps

### Immediate:
1. Fix styling error by running migration 007
2. Test one webhook integration (Zapier/Discord)
3. Add webhook calls to profile view tracking

### Short Term:
1. Build email signup module
2. Add analytics pixel injection
3. Create payment button module
4. Add more integration providers

### Long Term:
1. OAuth flows for supported providers
2. Integration marketplace
3. Custom integration builder
4. Webhook retry logic
5. Rate limiting and queue system

---

## ❓ FAQ

**Q: Do integrations work right now if I add a Mailchimp API key?**
A: No, the configuration is stored but no data syncs yet. You need to:
1. Build an email signup module
2. Call `/api/webhooks` when someone signs up
3. The API will then add them to Mailchimp

**Q: What's the easiest integration to test first?**
A: Zapier or Discord webhooks. Just need to call the webhook URL when events happen.

**Q: Why do I need SUPABASE_SERVICE_ROLE_KEY?**
A: The webhook API needs to query all integrations across users, which requires service-level access (bypasses RLS).

**Q: How do I get the service role key?**
A: Supabase Dashboard → Settings → API → service_role key (keep this secret!)

**Q: Can I test without deploying?**
A: Yes, but you'll need to expose your local server (use ngrok or similar) for external webhooks to reach you.

**Q: Are the integration logos final?**
A: They're using brand colors with initials/icons. You can replace with actual logo SVGs if you have permission.

---

## 💡 Pro Tips

1. **Start with webhooks**: Zapier is the easiest way to test - it can connect to anything
2. **Use ngrok for testing**: Expose localhost for webhook testing during development
3. **Log everything**: The integration_events table is your friend for debugging
4. **Test incrementally**: Get one integration fully working before moving to the next
5. **Handle errors gracefully**: External APIs fail - have fallbacks and retries
6. **Monitor status**: Check sync_status and error_message regularly
7. **Rate limit**: Don't hammer external APIs - add delays between calls
8. **Use queues**: For production, use a job queue (BullMQ, Inngest, etc.)

---

This guide should help you understand what's built and what work remains to make integrations fully functional. Start with webhooks for quick wins!
