-- Migration: Add email_captures and contact_messages tables
-- Run this in your Supabase SQL Editor

-- Email Captures table (for Email Capture Module)
CREATE TABLE email_captures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL,
  email TEXT NOT NULL,
  subscribed BOOLEAN DEFAULT true,
  source TEXT DEFAULT 'profile', -- 'profile', 'landing', etc.
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);

-- Create indexes for fast lookups
CREATE INDEX idx_email_captures_profile_id ON email_captures(profile_id);
CREATE INDEX idx_email_captures_email ON email_captures(email);
CREATE INDEX idx_email_captures_created_at ON email_captures(created_at DESC);

-- Contact Messages table (for Contact Form Module)
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL,
  name TEXT,
  email TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for fast lookups
CREATE INDEX idx_contact_messages_profile_id ON contact_messages(profile_id);
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX idx_contact_messages_read ON contact_messages(read);

-- Add custom_domain fields to profiles if they don't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS custom_domain TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS domain_verified BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS domain_verified_at TIMESTAMPTZ;

-- Add badge_id to profiles if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS badge_id UUID;

-- Create index for custom domain lookups
CREATE INDEX IF NOT EXISTS idx_profiles_custom_domain ON profiles(custom_domain) WHERE custom_domain IS NOT NULL;

-- Row Level Security (RLS) Policies

-- Email Captures: Users can view their own captures
ALTER TABLE email_captures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own email captures"
  ON email_captures FOR SELECT
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert email captures"
  ON email_captures FOR INSERT
  WITH CHECK (true);

-- Contact Messages: Users can view their own messages
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contact messages"
  ON contact_messages FOR SELECT
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can mark own messages as read"
  ON contact_messages FOR UPDATE
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert contact messages"
  ON contact_messages FOR INSERT
  WITH CHECK (true);
