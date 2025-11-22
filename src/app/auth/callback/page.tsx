'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const supabase = createBrowserClient()

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Check for error in URL
        const params = new URLSearchParams(window.location.search)
        const errorParam = params.get('error')
        const errorDescription = params.get('error_description')

        if (errorParam) {
          setError(errorDescription || errorParam)
          setTimeout(() => router.push('/login'), 3000)
          return
        }

        // Parse hash for implicit flow tokens
        const hash = window.location.hash.substring(1) // Remove the #
        const hashParams = new URLSearchParams(hash)
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')

        console.log('Auth callback - checking for tokens in hash:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken
        })

        if (accessToken && refreshToken) {
          console.log('Tokens found in hash, setting session...')

          // Set the session using the tokens from the hash
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (sessionError) {
            console.error('Failed to set session:', sessionError.message)
            setError(`Authentication failed: ${sessionError.message}`)
            setTimeout(() => router.push('/login'), 3000)
            return
          }

          if (data.session) {
            console.log('Session created successfully!')

            // Set cookies for middleware
            document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
            document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`

            // Small delay to ensure cookies are set
            await new Promise(resolve => setTimeout(resolve, 100))
            router.push('/dashboard')
            return
          }
        }

        // No tokens found, redirect to login
        console.log('No tokens found, redirecting to login')
        router.push('/login')
      } catch (err: any) {
        console.error('Unexpected error:', err)
        setError(err.message || 'Authentication failed')
        setTimeout(() => router.push('/login'), 3000)
      }
    }

    handleAuth()
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
