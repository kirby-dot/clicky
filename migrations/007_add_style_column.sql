-- Add style column to profiles table
-- This column stores custom CSS and styling overrides for the profile page

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS style JSONB DEFAULT '{}'::jsonb;

-- Add comment
COMMENT ON COLUMN profiles.style IS 'Custom CSS and styling configuration for the profile page';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_style ON profiles USING gin (style);

-- Example style structure:
-- {
--   "customCSS": "body { background: red; }",
--   "animations": { "enabled": true, "speed": "normal" },
--   "fonts": { "heading": "Inter", "body": "Inter" }
-- }
