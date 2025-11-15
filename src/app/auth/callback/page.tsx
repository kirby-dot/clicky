'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const supabase = createBrowserClient()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the code from the URL
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')
        const errorParam = params.get('error')
        const errorDescription = params.get('error_description')

        console.log('Callback page loaded:', { code: code ? 'present' : 'missing', error: errorParam })

        if (errorParam) {
          setError(errorDescription || errorParam)
          setTimeout(() => router.push('/login'), 3000)
          return
        }

        if (code) {
          // Exchange the code for a session - this will work with PKCE
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

          if (exchangeError) {
            console.error('Exchange error:', exchangeError)
            setError(exchangeError.message)
            setTimeout(() => router.push('/login'), 3000)
            return
          }

          if (data.session) {
            console.log('Session established, redirecting to dashboard')

            // Set cookies for middleware
            document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
            document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`

            router.push('/dashboard')
          } else {
            setError('No session created')
            setTimeout(() => router.push('/login'), 3000)
          }
        } else {
          // No code, redirect to login
          router.push('/login')
        }
      } catch (err: any) {
        console.error('Callback error:', err)
        setError(err.message)
        setTimeout(() => router.push('/login'), 3000)
      }
    }

    handleCallback()
  }, [router, supabase])

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
