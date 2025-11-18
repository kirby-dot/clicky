# Database Migration Instructions

## Problem
Your database is missing two columns that the application code expects:
1. `order` column in the `modules` table (code uses `order` but DB has `position`)
2. `theme_colors` column in the `profiles` table

## Solution
Apply the migration file: `supabase/migrations/20250118_add_missing_columns.sql`

## How to Apply (Supabase Dashboard)

### Method 1: Using Supabase Dashboard SQL Editor

1. **Open your Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "+ New query"

3. **Copy and paste the migration SQL**
   - Open the file: `supabase/migrations/20250118_add_missing_columns.sql`
   - Copy all the contents
   - Paste into the SQL editor

4. **Run the migration**
   - Click the "Run" button
   - Wait for confirmation that all statements executed successfully

5. **Verify the changes**
   - Go to "Table Editor" in the left sidebar
   - Check the `modules` table - it should now have an `order` column
   - Check the `profiles` table - it should now have a `theme_colors` column

### Method 2: Using Supabase CLI (if installed)

```bash
# If you have Supabase CLI installed
supabase db push

# Or apply the specific migration
supabase migration up
```

## What the Migration Does

1. **Adds `order` column to modules table**
   - Creates the new column
   - Copies data from existing `position` column
   - Creates an index for better query performance

2. **Adds `theme_colors` column to profiles table**
   - Creates the new JSONB column
   - Sets default color values

## After Migration

Once applied, you should be able to:
- ✅ Add modules without errors
- ✅ Change theme presets without errors

## Need Help?

If you encounter any issues applying the migration:
1. Check that you have the correct permissions in Supabase
2. Try running each SQL statement one at a time
3. Check the Supabase logs for detailed error messages
