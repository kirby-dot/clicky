-- Profile Badges Migration (Fixed - Safe to re-run)
-- Adds support for profile verification and custom badges

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL, -- lucide-react icon name or emoji
  color TEXT NOT NULL, -- hex color for badge
  type TEXT NOT NULL CHECK (type IN ('verification', 'tier', 'industry', 'custom')),
  required_tier TEXT CHECK (required_tier IN ('free', 'pro', 'enterprise')),
  is_active BOOLEAN DEFAULT true,
  position INTEGER DEFAULT 0, -- for ordering in badge selector
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add badge column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS badge_id UUID REFERENCES badges(id) ON DELETE SET NULL;

-- Create index for badge lookups
CREATE INDEX IF NOT EXISTS idx_profiles_badge_id ON profiles(badge_id);
CREATE INDEX IF NOT EXISTS idx_badges_type ON badges(type);
CREATE INDEX IF NOT EXISTS idx_badges_active ON badges(is_active) WHERE is_active = true;

-- Enable RLS on badges table
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists, then recreate
DROP POLICY IF EXISTS "Badges are viewable by everyone" ON badges;
CREATE POLICY "Badges are viewable by everyone"
  ON badges FOR SELECT
  USING (is_active = true);

-- Apply updated_at trigger (drop first if exists)
DROP TRIGGER IF EXISTS update_badges_updated_at ON badges;
CREATE TRIGGER update_badges_updated_at BEFORE UPDATE ON badges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default badges (skip if they already exist)
INSERT INTO badges (name, display_name, description, icon, color, type, required_tier, position) VALUES
  -- Verification badges
  ('verified', 'Verified', 'Verified account', 'BadgeCheck', '#3B82F6', 'verification', NULL, 1),
  ('official', 'Official', 'Official account', 'ShieldCheck', '#8B5CF6', 'verification', NULL, 2),

  -- Tier badges
  ('pro', 'Pro', 'Pro plan subscriber', 'Star', '#F59E0B', 'tier', 'pro', 10),
  ('business', 'Business', 'Business plan subscriber', 'Crown', '#EF4444', 'tier', 'enterprise', 11),

  -- Industry badges
  ('creator', 'Creator', 'Content creator', 'Video', '#EC4899', 'industry', NULL, 20),
  ('artist', 'Artist', 'Artist or designer', 'Palette', '#A78BFA', 'industry', NULL, 21),
  ('developer', 'Developer', 'Software developer', 'Code2', '#10B981', 'industry', NULL, 22),
  ('musician', 'Musician', 'Musician or band', 'Music', '#F97316', 'industry', NULL, 23),
  ('photographer', 'Photographer', 'Photographer', 'Camera', '#06B6D4', 'industry', NULL, 24),
  ('writer', 'Writer', 'Writer or blogger', 'PenTool', '#6366F1', 'industry', NULL, 25),
  ('podcaster', 'Podcaster', 'Podcast host', 'Mic2', '#EF4444', 'industry', NULL, 26),
  ('streamer', 'Streamer', 'Live streamer', 'Radio', '#8B5CF6', 'industry', NULL, 27),
  ('entrepreneur', 'Entrepreneur', 'Business owner', 'Briefcase', '#F59E0B', 'industry', NULL, 28),
  ('educator', 'Educator', 'Teacher or educator', 'GraduationCap', '#3B82F6', 'industry', NULL, 29),
  ('coach', 'Coach', 'Coach or mentor', 'Award', '#14B8A6', 'industry', NULL, 30)
ON CONFLICT (name) DO NOTHING;
