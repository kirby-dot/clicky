// Environment variables helper
// Next.js replaces these at build time
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
} as const

// Validate required environment variables
if (typeof window !== 'undefined') {
  // Client-side validation
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    console.error('Missing required environment variables:', {
      supabaseUrl: env.supabaseUrl,
      supabaseAnonKey: env.supabaseAnonKey ? '***' : 'missing'
    })
  }
}
