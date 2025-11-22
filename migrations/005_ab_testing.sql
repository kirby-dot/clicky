-- A/B Testing System for Clicky

-- Table to store A/B tests
CREATE TABLE IF NOT EXISTS ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed')),
  winner_variant_id UUID,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to store test variants
CREATE TABLE IF NOT EXISTS ab_test_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  is_control BOOLEAN DEFAULT false,
  traffic_percentage INTEGER DEFAULT 50 CHECK (traffic_percentage >= 0 AND traffic_percentage <= 100),
  content JSONB NOT NULL,
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add variant_id to events table to track which variant was shown
ALTER TABLE events ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES ab_test_variants(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ab_tests_profile_id ON ab_tests(profile_id);
CREATE INDEX IF NOT EXISTS idx_ab_tests_module_id ON ab_tests(module_id);
CREATE INDEX IF NOT EXISTS idx_ab_tests_status ON ab_tests(status);
CREATE INDEX IF NOT EXISTS idx_ab_test_variants_test_id ON ab_test_variants(test_id);
CREATE INDEX IF NOT EXISTS idx_events_variant_id ON events(variant_id);

-- Row Level Security
ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_variants ENABLE ROW LEVEL SECURITY;

-- Policies for ab_tests
CREATE POLICY "Users can view their own A/B tests"
  ON ab_tests FOR SELECT
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create their own A/B tests"
  ON ab_tests FOR INSERT
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own A/B tests"
  ON ab_tests FOR UPDATE
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own A/B tests"
  ON ab_tests FOR DELETE
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Policies for ab_test_variants
CREATE POLICY "Users can view variants of their A/B tests"
  ON ab_test_variants FOR SELECT
  USING (test_id IN (SELECT id FROM ab_tests WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

CREATE POLICY "Users can create variants for their A/B tests"
  ON ab_test_variants FOR INSERT
  WITH CHECK (test_id IN (SELECT id FROM ab_tests WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

CREATE POLICY "Users can update variants of their A/B tests"
  ON ab_test_variants FOR UPDATE
  USING (test_id IN (SELECT id FROM ab_tests WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

CREATE POLICY "Users can delete variants of their A/B tests"
  ON ab_test_variants FOR DELETE
  USING (test_id IN (SELECT id FROM ab_tests WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

-- Function to update variant stats
CREATE OR REPLACE FUNCTION update_variant_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.variant_id IS NOT NULL THEN
    IF NEW.event_type = 'view' THEN
      UPDATE ab_test_variants
      SET views = views + 1
      WHERE id = NEW.variant_id;
    ELSIF NEW.event_type = 'click' THEN
      UPDATE ab_test_variants
      SET clicks = clicks + 1
      WHERE id = NEW.variant_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update variant stats
CREATE TRIGGER trigger_update_variant_stats
AFTER INSERT ON events
FOR EACH ROW
EXECUTE FUNCTION update_variant_stats();

-- Function to calculate statistical significance
CREATE OR REPLACE FUNCTION calculate_test_significance(test_id_param UUID)
RETURNS TABLE (
  variant_id UUID,
  variant_name VARCHAR,
  views INTEGER,
  clicks INTEGER,
  ctr NUMERIC,
  is_winner BOOLEAN,
  confidence NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id,
    v.name,
    v.views,
    v.clicks,
    CASE WHEN v.views > 0 THEN (v.clicks::NUMERIC / v.views::NUMERIC) * 100 ELSE 0 END as ctr,
    v.id = (SELECT winner_variant_id FROM ab_tests WHERE id = test_id_param) as is_winner,
    -- Simple confidence calculation (placeholder for proper statistical test)
    CASE
      WHEN v.views >= 100 THEN 95.0
      WHEN v.views >= 50 THEN 80.0
      WHEN v.views >= 30 THEN 60.0
      ELSE 0.0
    END as confidence
  FROM ab_test_variants v
  WHERE v.test_id = test_id_param
  ORDER BY ctr DESC;
END;
$$ LANGUAGE plpgsql;
