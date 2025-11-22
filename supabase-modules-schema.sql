-- Create modules table for drag-and-drop builder
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'link', 'social-links', 'header', 'text', 'image', 'divider', 'video', 'music', etc.
  title TEXT,
  content JSONB NOT NULL DEFAULT '{}', -- Flexible storage for module-specific data
  position INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  clicks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_modules_profile_id ON modules(profile_id);
CREATE INDEX IF NOT EXISTS idx_modules_position ON modules(position);
CREATE INDEX IF NOT EXISTS idx_modules_type ON modules(type);

-- Enable RLS
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own modules"
  ON modules FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM profiles WHERE id = modules.profile_id
  ));

CREATE POLICY "Users can insert their own modules"
  ON modules FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM profiles WHERE id = modules.profile_id
  ));

CREATE POLICY "Users can update their own modules"
  ON modules FOR UPDATE
  USING (auth.uid() IN (
    SELECT user_id FROM profiles WHERE id = modules.profile_id
  ));

CREATE POLICY "Users can delete their own modules"
  ON modules FOR DELETE
  USING (auth.uid() IN (
    SELECT user_id FROM profiles WHERE id = modules.profile_id
  ));

-- Public can view active modules from published profiles
CREATE POLICY "Anyone can view active modules from published profiles"
  ON modules FOR SELECT
  USING (
    active = true AND
    profile_id IN (SELECT id FROM profiles WHERE published = true)
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER modules_updated_at
  BEFORE UPDATE ON modules
  FOR EACH ROW
  EXECUTE FUNCTION update_modules_updated_at();

-- Migrate existing links to modules (optional - keeps backward compatibility)
-- Uncomment if you want to migrate existing data:
-- INSERT INTO modules (profile_id, type, title, content, position, active, clicks, created_at)
-- SELECT
--   profile_id,
--   'link' as type,
--   title,
--   jsonb_build_object('url', url, 'icon', icon) as content,
--   position,
--   active,
--   clicks,
--   created_at
-- FROM links;
