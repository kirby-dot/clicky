-- Add custom domain support for Business accounts
-- Profiles can have a custom domain that points to their page

-- Add custom domain columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS custom_domain VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS domain_verified BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS domain_verified_at TIMESTAMP;

-- Add index for faster custom domain lookups
CREATE INDEX IF NOT EXISTS idx_profiles_custom_domain ON profiles(custom_domain) WHERE custom_domain IS NOT NULL;

-- Add unique constraint to ensure one domain per profile
ALTER TABLE profiles ADD CONSTRAINT unique_custom_domain UNIQUE(custom_domain);

-- Add comment
COMMENT ON COLUMN profiles.custom_domain IS 'Custom domain for this profile (e.g., links.example.com) - Business plan only';
COMMENT ON COLUMN profiles.domain_verified IS 'Whether the custom domain DNS is properly configured';
COMMENT ON COLUMN profiles.domain_verified_at IS 'Timestamp when domain was last verified';
