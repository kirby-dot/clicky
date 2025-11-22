#!/usr/bin/env node
/**
 * Check and add style column to profiles table
 * This script checks if the 'style' column exists in the profiles table,
 * and adds it if it doesn't exist.
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkAndAddStyleColumn() {
  console.log('🔍 Checking if style column exists in profiles table...\n')

  try {
    // Try to query the style column - if it doesn't exist, this will fail
    const { data, error } = await supabase
      .from('profiles')
      .select('id, style')
      .limit(1)

    if (error) {
      // Check if error is about column not existing
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        console.log('⚠️  Column "style" does not exist. Adding it now...\n')

        // Add the column using SQL
        const { error: sqlError } = await supabase.rpc('exec_sql', {
          sql: 'ALTER TABLE profiles ADD COLUMN style JSONB;'
        })

        if (sqlError) {
          console.error('❌ Error adding column:', sqlError)
          console.log('\n📝 Please run this SQL manually in your Supabase SQL Editor:')
          console.log('\nALTER TABLE profiles ADD COLUMN style JSONB;\n')
          return false
        }

        console.log('✅ Successfully added "style" column to profiles table!\n')
        return true
      } else {
        console.error('❌ Database error:', error)
        return false
      }
    }

    console.log('✅ Column "style" already exists in profiles table!')
    console.log(`   Found ${data?.length || 0} profile(s) in the table.\n`)
    return true

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    console.log('\n📝 If the column is missing, please run this SQL manually in your Supabase SQL Editor:')
    console.log('\nALTER TABLE profiles ADD COLUMN style JSONB;\n')
    return false
  }
}

async function main() {
  console.log('🚀 Clicky Database Migration: Add style column\n')
  console.log('=' .repeat(60))
  console.log()

  const success = await checkAndAddStyleColumn()

  console.log('=' .repeat(60))

  if (success) {
    console.log('✨ Migration complete! The page styling feature should now work.\n')
  } else {
    console.log('⚠️  Migration needs manual intervention. See instructions above.\n')
    process.exit(1)
  }
}

main()
