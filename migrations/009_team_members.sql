-- Add team members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'declined')),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_inviter_id ON team_members(inviter_id);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_team_members_updated_at ON team_members;
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Policies for team_members
CREATE POLICY "Users can view their team memberships"
  ON team_members FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = inviter_id);

CREATE POLICY "Users can invite team members"
  ON team_members FOR INSERT
  WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Users can update their team memberships"
  ON team_members FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = inviter_id);

-- Function to count team members for a user
CREATE OR REPLACE FUNCTION get_team_member_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Count active team members (including the owner)
  SELECT COUNT(*) INTO v_count
  FROM team_members
  WHERE inviter_id = p_user_id
    AND status = 'active';

  -- Add 1 for the owner themselves
  RETURN v_count + 1;
END;
$$ LANGUAGE plpgsql;

-- Update check_plan_limit to include team limits
CREATE OR REPLACE FUNCTION check_plan_limit(p_user_id UUID, p_feature TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan TEXT;
  v_profile_count INTEGER;
  v_team_count INTEGER;
BEGIN
  -- Get user's current plan
  v_plan := get_user_plan(p_user_id);

  -- Check limits based on feature
  CASE p_feature
    WHEN 'max_profiles' THEN
      -- Count existing profiles
      SELECT COUNT(*) INTO v_profile_count
      FROM profiles
      WHERE user_id = p_user_id;

      -- Check limits
      IF v_plan = 'free' AND v_profile_count >= 1 THEN
        RETURN FALSE;
      ELSIF v_plan = 'pro' AND v_profile_count >= 3 THEN
        RETURN FALSE;
      ELSIF v_plan = 'business' THEN
        RETURN TRUE; -- Unlimited
      END IF;

      RETURN TRUE;

    WHEN 'team_members' THEN
      -- Get team member count
      v_team_count := get_team_member_count(p_user_id);

      -- Check limits (owner is included in count)
      IF v_plan = 'free' THEN
        RETURN FALSE; -- No team members on free
      ELSIF v_plan = 'pro' AND v_team_count >= 2 THEN -- 1 included + owner
        RETURN FALSE;
      ELSIF v_plan = 'business' AND v_team_count >= 4 THEN -- 3 included + owner
        RETURN FALSE;
      END IF;

      RETURN TRUE;

    WHEN 'advanced_analytics' THEN
      RETURN v_plan IN ('pro', 'business');

    WHEN 'remove_branding' THEN
      RETURN v_plan IN ('pro', 'business');

    WHEN 'custom_domain' THEN
      RETURN v_plan = 'business';

    WHEN 'team_collaboration' THEN
      RETURN v_plan IN ('pro', 'business');

    ELSE
      RETURN TRUE;
  END CASE;
END;
$$ LANGUAGE plpgsql;
