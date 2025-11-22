-- Migration: Add style column to profiles table
-- Run this in your Supabase SQL Editor if the column doesn't exist yet

-- Check if column exists, and add it if it doesn't
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'profiles'
        AND column_name = 'style'
    ) THEN
        ALTER TABLE profiles ADD COLUMN style JSONB;
        RAISE NOTICE 'Column "style" added to profiles table';
    ELSE
        RAISE NOTICE 'Column "style" already exists in profiles table';
    END IF;
END $$;
