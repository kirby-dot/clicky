-- Create sections table
CREATE TABLE IF NOT EXISTS public.sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  layout JSONB DEFAULT '{
    "columns": 1,
    "gap": 16,
    "mobileColumns": 1,
    "alignment": "center"
  }'::jsonb,
  style JSONB DEFAULT '{
    "backgroundColor": null,
    "backgroundImage": null,
    "backgroundGradient": null,
    "padding": {"top": 24, "bottom": 24, "left": 16, "right": 16},
    "margin": {"top": 0, "bottom": 0},
    "borderRadius": 0,
    "shadow": "none",
    "fullWidth": false
  }'::jsonb,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add section_id to modules table
ALTER TABLE public.modules
ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS column_index INTEGER DEFAULT 0;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_sections_profile_id ON public.sections(profile_id);
CREATE INDEX IF NOT EXISTS idx_sections_order ON public.sections("order");
CREATE INDEX IF NOT EXISTS idx_modules_section_id ON public.modules(section_id);

-- Enable RLS
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

-- Policies for sections
CREATE POLICY "Users can view their own sections"
  ON public.sections FOR SELECT
  USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own sections"
  ON public.sections FOR INSERT
  WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own sections"
  ON public.sections FOR UPDATE
  USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own sections"
  ON public.sections FOR DELETE
  USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sections_updated_at
  BEFORE UPDATE ON public.sections
  FOR EACH ROW
  EXECUTE FUNCTION update_sections_updated_at();
