-- Integrations System for Clicky
-- Supports third-party services like Mailchimp, Zapier, Analytics, etc.

-- Table to store integration configurations
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider VARCHAR(100) NOT NULL CHECK (provider IN (
    'mailchimp',
    'convertkit',
    'klaviyo',
    'zapier',
    'make',
    'google_analytics',
    'facebook_pixel',
    'tiktok_pixel',
    'stripe',
    'paypal',
    'calendly',
    'cal_com',
    'discord',
    'slack',
    'twitter_api',
    'instagram_api',
    'custom_webhook'
  )),
  name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  config JSONB NOT NULL DEFAULT '{}',
  credentials JSONB DEFAULT '{}', -- Encrypted sensitive data
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status VARCHAR(50) DEFAULT 'idle' CHECK (sync_status IN ('idle', 'syncing', 'success', 'error')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id, provider)
);

-- Table to store integration events/logs
CREATE TABLE IF NOT EXISTS integration_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB,
  response JSONB,
  status VARCHAR(50) CHECK (status IN ('pending', 'success', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_integrations_profile_id ON integrations(profile_id);
CREATE INDEX IF NOT EXISTS idx_integrations_provider ON integrations(provider);
CREATE INDEX IF NOT EXISTS idx_integrations_is_active ON integrations(is_active);
CREATE INDEX IF NOT EXISTS idx_integration_events_integration_id ON integration_events(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_events_created_at ON integration_events(created_at);

-- Row Level Security
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_events ENABLE ROW LEVEL SECURITY;

-- Policies for integrations
CREATE POLICY "Users can view their own integrations"
  ON integrations FOR SELECT
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create their own integrations"
  ON integrations FOR INSERT
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own integrations"
  ON integrations FOR UPDATE
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own integrations"
  ON integrations FOR DELETE
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Policies for integration_events
CREATE POLICY "Users can view events for their integrations"
  ON integration_events FOR SELECT
  USING (integration_id IN (SELECT id FROM integrations WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

CREATE POLICY "System can insert integration events"
  ON integration_events FOR INSERT
  WITH CHECK (true); -- Events are created by system/webhooks

-- Function to log integration events
CREATE OR REPLACE FUNCTION log_integration_event(
  integration_id_param UUID,
  event_type_param VARCHAR,
  payload_param JSONB,
  response_param JSONB,
  status_param VARCHAR,
  error_message_param TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO integration_events (
    integration_id,
    event_type,
    payload,
    response,
    status,
    error_message
  ) VALUES (
    integration_id_param,
    event_type_param,
    payload_param,
    response_param,
    status_param,
    error_message_param
  ) RETURNING id INTO event_id;

  -- Update integration status
  UPDATE integrations
  SET
    last_sync_at = NOW(),
    sync_status = CASE
      WHEN status_param = 'success' THEN 'success'
      WHEN status_param = 'failed' THEN 'error'
      ELSE sync_status
    END,
    error_message = error_message_param,
    updated_at = NOW()
  WHERE id = integration_id_param;

  RETURN event_id;
END;
$$ LANGUAGE plpgsql;

-- Add integration metadata column to profiles for quick access
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS integrations_enabled BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS webhook_url VARCHAR(500);

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_integration_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_integration_timestamp
BEFORE UPDATE ON integrations
FOR EACH ROW
EXECUTE FUNCTION update_integration_timestamp();
