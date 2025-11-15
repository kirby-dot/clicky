import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { env } from './env'

// Browser client with singleton pattern
let browserClient: ReturnType<typeof createClient<Database>> | null = null

export const createBrowserClient = () => {
  if (browserClient) return browserClient

  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error(`Missing Supabase environment variables: ${!env.supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL' : ''} ${!env.supabaseAnonKey ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY' : ''}`)
  }

  browserClient = createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  })

  return browserClient
}

export const createServiceClient = () => {
  if (!env.supabaseUrl || !env.supabaseServiceKey) {
    throw new Error('Missing Supabase service environment variables')
  }

  return createClient<Database>(env.supabaseUrl, env.supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
