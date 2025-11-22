# Fix: Page Style Save Error

## Problem
The page styling feature is failing because the `style` column doesn't exist in your Supabase database yet.

## Solution
Run the following SQL in your Supabase SQL Editor to add the missing column:

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"

### Step 2: Run This SQL

```sql
-- Add style column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS style JSONB;
```

### Step 3: Verify
After running the SQL, you can verify it worked by running:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name = 'style';
```

You should see:
```
column_name | data_type
------------|----------
style       | jsonb
```

## What This Does
The `style` column stores your page styling preferences as JSON, including:
- Background color/gradient
- Container width (full vs contained)
- Module animations (fade-in, fade-up, scale-in, none)
- Border animations (animated beams)

## After Running the Migration
1. Refresh your browser
2. Go to the Page Builder
3. Click "Page Styling" button
4. Make your changes
5. Click "Apply Styling"

The error should be gone and your styling changes should save successfully!

---

## Alternative: Run Full Schema
If you prefer, you can also re-run the full schema from `supabase-schema.sql` which already includes the style column (line 29).
