-- Add order column to modules table
ALTER TABLE public.modules
ADD COLUMN IF NOT EXISTS "order" INTEGER;

-- Copy position data to order column for existing rows
UPDATE public.modules
SET "order" = position
WHERE "order" IS NULL;

-- Set default value for order column
ALTER TABLE public.modules
ALTER COLUMN "order" SET DEFAULT 0;

-- Set NOT NULL constraint after populating the column
ALTER TABLE public.modules
ALTER COLUMN "order" SET NOT NULL;

-- Create index for faster ordering queries
CREATE INDEX IF NOT EXISTS idx_modules_order ON public.modules("order");

-- Add theme_colors column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS theme_colors JSONB DEFAULT '{
  "primary": "#6366f1",
  "secondary": "#8b5cf6",
  "accent": "#ec4899",
  "background": "#ffffff",
  "text": "#111827"
}'::jsonb;
