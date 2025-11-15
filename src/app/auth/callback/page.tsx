'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const supabase = createBrowserClient()

  useEffect(() => {
    // Check for errors in URL
    const params = new URLSearchParams(window.location.search)
    const errorParam = params.get('error')
    const errorDescription = params.get('error_description')

    if (errorParam) {
      setError(errorDescription || errorParam)
      setTimeout(() => router.push('/login'), 3000)
      return
    }

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session ? 'session exists' : 'no session')

      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in, setting cookies')

        // Set cookies for middleware
        document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
        document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`

        router.push('/dashboard')
      } else if (event === 'TOKEN_REFRESHED' && session) {
        console.log('Token refreshed, setting cookies')

        document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
        document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`

        router.push('/dashboard')
      }
    })

    // Set a timeout in case the auth doesn't complete
    const timeout = setTimeout(() => {
      subscription.unsubscribe()
      setError('Authentication timed out')
      setTimeout(() => router.push('/login'), 2000)
    }, 10000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [router, supabase.auth])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="text-center">
        {error ? (
          <>
            <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Completing authentication...</h1>
            <p className="text-gray-600">Please wait while we log you in</p>
          </>
        )}
      </div>
    </div>
  )
}
