import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

// Get environment variables with fallbacks for browser
const getEnvVar = (key: string): string => {
  if (typeof window !== 'undefined') {
    // Browser environment - access from window
    return (window as any).ENV?.[key] || process.env[key] || ''
  }
  // Server environment
  return process.env[key] || ''
}

// Browser client with singleton pattern
let browserClient: ReturnType<typeof createClient<Database>> | null = null

export const createBrowserClient = () => {
  if (browserClient) return browserClient

  // Direct access to ensure Next.js inlines these
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ddekvujqgnhkndhvdfma.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkZWt2dWpxZ25oa25kaHZkZm1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMTcwMTYsImV4cCI6MjA3ODU5MzAxNn0.9pwv0Ma6HMnjxM8XsysmsovJKFnd6eqsfxNJuSeNBY8'

  browserClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  })

  return browserClient
}

export const createServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase service environment variables')
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
