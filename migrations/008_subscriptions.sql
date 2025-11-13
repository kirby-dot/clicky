-- Add subscription tracking table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'pro', 'business')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trialing')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create a function to get the current user's plan
CREATE OR REPLACE FUNCTION get_user_plan(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_plan TEXT;
BEGIN
  -- Get the most recent active subscription
  SELECT plan INTO v_plan
  FROM subscriptions
  WHERE user_id = p_user_id
    AND status = 'active'
  ORDER BY started_at DESC
  LIMIT 1;

  -- Default to free if no subscription found
  RETURN COALESCE(v_plan, 'free');
END;
$$ LANGUAGE plpgsql;

-- Create a function to check plan features
CREATE OR REPLACE FUNCTION check_plan_limit(p_user_id UUID, p_feature TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan TEXT;
  v_profile_count INTEGER;
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

    WHEN 'advanced_analytics' THEN
      RETURN v_plan IN ('pro', 'business');

    WHEN 'remove_branding' THEN
      RETURN v_plan IN ('pro', 'business');

    WHEN 'custom_domain' THEN
      RETURN v_plan = 'business';

    WHEN 'team_collaboration' THEN
      RETURN v_plan = 'business';

    ELSE
      RETURN TRUE;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies for subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own subscriptions (for testing)
CREATE POLICY "Users can insert own subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscriptions
CREATE POLICY "Users can update own subscriptions"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);
