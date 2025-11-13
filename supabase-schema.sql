-- Clicky Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  username TEXT UNIQUE,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  settings JSONB DEFAULT '{}'::jsonb
);

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  bio TEXT,
  theme_id UUID,
  avatar_url TEXT,
  custom_css TEXT,
  meta_tags JSONB,
  analytics_enabled BOOLEAN DEFAULT true,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on slug for fast lookups
CREATE INDEX idx_profiles_slug ON profiles(slug);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);

-- Links table
CREATE TABLE links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'link' CHECK (type IN ('link', 'header', 'social')),
  title TEXT NOT NULL,
  url TEXT,
  thumbnail_url TEXT,
  position INTEGER NOT NULL,
  clicks INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  style JSONB,
  analytics_tag TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX idx_links_profile_id ON links(profile_id);
CREATE INDEX idx_links_position ON links(profile_id, position);

-- Themes table
CREATE TABLE themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  config JSONB NOT NULL,
  is_premium BOOLEAN DEFAULT false,
  creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  installs_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events table (for analytics)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  link_id UUID REFERENCES links(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'click')),
  visitor_id TEXT,
  ip_hash TEXT,
  country TEXT,
  device_type TEXT,
  referrer TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for analytics queries
CREATE INDEX idx_events_profile_id ON events(profile_id);
CREATE INDEX idx_events_link_id ON events(link_id);
CREATE INDEX idx_events_timestamp ON events(timestamp DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_links_updated_at BEFORE UPDATE ON links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_themes_updated_at BEFORE UPDATE ON themes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (published = true);

CREATE POLICY "Users can view own profiles"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profiles"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profiles"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profiles"
  ON profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Links policies
CREATE POLICY "Links viewable through published profiles"
  ON links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = links.profile_id
      AND (profiles.published = true OR profiles.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage links in own profiles"
  ON links FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = links.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Themes policies
CREATE POLICY "Themes are viewable by everyone"
  ON themes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create themes"
  ON themes FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

-- Events policies (service role only for writes, users can read own data)
CREATE POLICY "Users can view own profile events"
  ON events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = events.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Insert default themes
INSERT INTO themes (name, config, is_premium) VALUES
  ('Minimalist', '{
    "colors": {
      "primary": "#000000",
      "secondary": "#666666",
      "background": "#FFFFFF",
      "text": "#000000",
      "linkBackground": "#F5F5F5",
      "linkText": "#000000"
    },
    "fonts": {
      "heading": "Inter",
      "body": "Inter"
    },
    "spacing": "normal",
    "animations": {
      "entrance": true,
      "hover": "lift"
    },
    "borderRadius": "md",
    "linkStyle": "minimal"
  }', false),

  ('Ocean Blue', '{
    "colors": {
      "primary": "#0EA5E9",
      "secondary": "#0284C7",
      "background": "#F0F9FF",
      "text": "#0C4A6E",
      "linkBackground": "#FFFFFF",
      "linkText": "#0369A1"
    },
    "fonts": {
      "heading": "Inter",
      "body": "Inter"
    },
    "spacing": "normal",
    "animations": {
      "entrance": true,
      "hover": "scale"
    },
    "borderRadius": "lg",
    "linkStyle": "filled"
  }', false),

  ('Sunset Gradient', '{
    "colors": {
      "primary": "#F59E0B",
      "secondary": "#EF4444",
      "background": "#FFF7ED",
      "text": "#7C2D12",
      "linkBackground": "#FFFFFF",
      "linkText": "#C2410C"
    },
    "fonts": {
      "heading": "Inter",
      "body": "Inter"
    },
    "spacing": "loose",
    "animations": {
      "entrance": true,
      "hover": "glow"
    },
    "borderRadius": "full",
    "linkStyle": "shadow"
  }', false),

  ('Dark Mode', '{
    "colors": {
      "primary": "#8B5CF6",
      "secondary": "#A78BFA",
      "background": "#0F172A",
      "text": "#F1F5F9",
      "linkBackground": "#1E293B",
      "linkText": "#F1F5F9"
    },
    "fonts": {
      "heading": "Inter",
      "body": "Inter"
    },
    "spacing": "normal",
    "animations": {
      "entrance": true,
      "hover": "lift"
    },
    "borderRadius": "lg",
    "linkStyle": "outlined"
  }', false),

  ('Forest Green', '{
    "colors": {
      "primary": "#10B981",
      "secondary": "#059669",
      "background": "#ECFDF5",
      "text": "#064E3B",
      "linkBackground": "#FFFFFF",
      "linkText": "#047857"
    },
    "fonts": {
      "heading": "Inter",
      "body": "Inter"
    },
    "spacing": "normal",
    "animations": {
      "entrance": true,
      "hover": "scale"
    },
    "borderRadius": "md",
    "linkStyle": "filled"
  }', false),

  ('Candy Pop', '{
    "colors": {
      "primary": "#EC4899",
      "secondary": "#F472B6",
      "background": "#FDF2F8",
      "text": "#831843",
      "linkBackground": "#FFFFFF",
      "linkText": "#BE185D"
    },
    "fonts": {
      "heading": "Inter",
      "body": "Inter"
    },
    "spacing": "tight",
    "animations": {
      "entrance": true,
      "hover": "scale"
    },
    "borderRadius": "full",
    "linkStyle": "filled"
  }', false);
