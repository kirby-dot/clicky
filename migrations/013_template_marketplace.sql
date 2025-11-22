-- Template Marketplace Migration
-- Adds support for browsing, installing, and creating profile templates

-- Create template_categories table
CREATE TABLE IF NOT EXISTS template_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- lucide-react icon name
  color TEXT DEFAULT '#3B82F6',
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category_id UUID REFERENCES template_categories(id) ON DELETE SET NULL,

  -- Preview assets
  preview_image_url TEXT, -- Screenshot of the template
  preview_images JSONB DEFAULT '[]'::jsonb, -- Array of additional preview images

  -- Pricing and access
  is_premium BOOLEAN DEFAULT false,
  price DECIMAL(10,2) DEFAULT 0.00,
  required_tier TEXT CHECK (required_tier IN ('free', 'pro', 'business')),

  -- Creator info
  creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  is_official BOOLEAN DEFAULT false, -- Created by Clicky team
  is_user_submitted BOOLEAN DEFAULT false,

  -- Template data (complete profile configuration)
  config JSONB NOT NULL DEFAULT '{}'::jsonb, -- Full template configuration

  -- Template metadata
  tags TEXT[] DEFAULT '{}', -- Searchable tags like 'minimal', 'dark', 'creative'

  -- Stats
  installs_count INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,
  rating_average DECIMAL(3,2) DEFAULT 0.00, -- 0.00 to 5.00
  rating_count INTEGER DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  featured_position INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Create template_installs table to track who installed what
CREATE TABLE IF NOT EXISTS template_installs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  installed_at TIMESTAMPTZ DEFAULT NOW(),

  -- Track modifications
  modified BOOLEAN DEFAULT false,

  UNIQUE(template_id, user_id, profile_id)
);

-- Create template_favorites table
CREATE TABLE IF NOT EXISTS template_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(template_id, user_id)
);

-- Create template_ratings table
CREATE TABLE IF NOT EXISTS template_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(template_id, user_id)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_templates_slug ON templates(slug);
CREATE INDEX IF NOT EXISTS idx_templates_category_id ON templates(category_id);
CREATE INDEX IF NOT EXISTS idx_templates_creator_id ON templates(creator_id);
CREATE INDEX IF NOT EXISTS idx_templates_is_active ON templates(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_templates_featured ON templates(featured, featured_position) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_templates_tags ON templates USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_template_installs_user_id ON template_installs(user_id);
CREATE INDEX IF NOT EXISTS idx_template_installs_template_id ON template_installs(template_id);
CREATE INDEX IF NOT EXISTS idx_template_favorites_user_id ON template_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_template_ratings_template_id ON template_ratings(template_id);

-- Enable RLS
ALTER TABLE template_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_installs ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for template_categories
CREATE POLICY "Categories are viewable by everyone"
  ON template_categories FOR SELECT
  USING (is_active = true);

-- RLS Policies for templates
CREATE POLICY "Active templates are viewable by everyone"
  ON templates FOR SELECT
  USING (is_active = true AND published_at IS NOT NULL);

CREATE POLICY "Users can create templates"
  ON templates FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own templates"
  ON templates FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their own templates"
  ON templates FOR DELETE
  USING (auth.uid() = creator_id);

-- RLS Policies for template_installs
CREATE POLICY "Users can view their own installs"
  ON template_installs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create installs"
  ON template_installs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Template creators can view installs of their templates"
  ON template_installs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM templates
      WHERE templates.id = template_installs.template_id
      AND templates.creator_id = auth.uid()
    )
  );

-- RLS Policies for template_favorites
CREATE POLICY "Users can view their own favorites"
  ON template_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create favorites"
  ON template_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON template_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for template_ratings
CREATE POLICY "Ratings are viewable by everyone"
  ON template_ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can create ratings"
  ON template_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
  ON template_ratings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
  ON template_ratings FOR DELETE
  USING (auth.uid() = user_id);

-- Apply updated_at triggers
CREATE TRIGGER update_template_categories_updated_at BEFORE UPDATE ON template_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_template_ratings_updated_at BEFORE UPDATE ON template_ratings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update template stats on install
CREATE OR REPLACE FUNCTION update_template_install_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE templates
  SET installs_count = installs_count + 1
  WHERE id = NEW.template_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_template_installs
  AFTER INSERT ON template_installs
  FOR EACH ROW
  EXECUTE FUNCTION update_template_install_count();

-- Function to update template stats on favorite
CREATE OR REPLACE FUNCTION update_template_favorite_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE templates
    SET favorites_count = favorites_count + 1
    WHERE id = NEW.template_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE templates
    SET favorites_count = favorites_count - 1
    WHERE id = OLD.template_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_template_favorites
  AFTER INSERT OR DELETE ON template_favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_template_favorite_count();

-- Function to update template rating stats
CREATE OR REPLACE FUNCTION update_template_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE templates
  SET
    rating_average = (SELECT AVG(rating)::DECIMAL(3,2) FROM template_ratings WHERE template_id = NEW.template_id),
    rating_count = (SELECT COUNT(*) FROM template_ratings WHERE template_id = NEW.template_id)
  WHERE id = NEW.template_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_template_ratings_stats
  AFTER INSERT OR UPDATE OR DELETE ON template_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_template_rating_stats();

-- Insert default categories
INSERT INTO template_categories (name, display_name, description, icon, color, position) VALUES
  ('creator', 'Creator', 'Content creators, influencers, and social media personalities', 'Video', '#EC4899', 1),
  ('musician', 'Musician', 'Musicians, bands, DJs, and music producers', 'Music', '#F97316', 2),
  ('business', 'Business', 'Businesses, startups, and professional services', 'Briefcase', '#3B82F6', 3),
  ('portfolio', 'Portfolio', 'Artists, designers, photographers, and creative professionals', 'Palette', '#A78BFA', 4),
  ('restaurant', 'Restaurant & Food', 'Restaurants, cafes, food trucks, and catering', 'UtensilsCrossed', '#10B981', 5),
  ('education', 'Education', 'Teachers, coaches, tutors, and educational content', 'GraduationCap', '#6366F1', 6),
  ('health', 'Health & Wellness', 'Fitness trainers, yoga instructors, wellness coaches', 'Heart', '#EF4444', 7),
  ('minimal', 'Minimal', 'Clean, simple, and minimal designs', 'Minus', '#64748B', 8),
  ('ecommerce', 'E-Commerce', 'Online shops, product sellers, and merchants', 'ShoppingBag', '#F59E0B', 9),
  ('nonprofit', 'Non-Profit', 'Charities, causes, and community organizations', 'Heart', '#14B8A6', 10)
ON CONFLICT (name) DO NOTHING;
