-- Add global theme support to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS theme JSONB DEFAULT '{
  "typography": {
    "fontFamily": "Inter, system-ui, sans-serif",
    "headingSize": "large",
    "bodySize": "medium"
  },
  "colors": {
    "primary": "#6366f1",
    "secondary": "#8b5cf6",
    "accent": "#ec4899",
    "background": "#ffffff",
    "text": "#111827"
  },
  "layout": {
    "buttonRoundness": "rounded",
    "sectionSpacing": "normal",
    "moduleSpacing": "normal"
  }
}'::jsonb;
