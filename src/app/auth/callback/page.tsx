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
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const errorParam = params.get('error')
      const errorDescription = params.get('error_description')

      console.log('Auth callback:', {
        hasCode: !!code,
        error: errorParam,
        hash: window.location.hash
      })

      if (errorParam) {
        setError(errorDescription || errorParam)
        setTimeout(() => router.push('/login'), 3000)
        return
      }

      if (code) {
        try {
          // Debug: Check what's in localStorage
          console.log('LocalStorage keys:', Object.keys(localStorage))
          const authKeys = Object.keys(localStorage).filter(key => key.includes('auth') || key.includes('supabase'))
          console.log('Auth-related keys:', authKeys)
          authKeys.forEach(key => {
            try {
              const value = localStorage.getItem(key)
              console.log(`${key}:`, value?.substring(0, 100))
            } catch (e) {
              console.log(`${key}: error reading`)
            }
          })

          console.log('Exchanging code for session...')
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

          if (exchangeError) {
            console.error('Exchange failed:', exchangeError.message)
            setError(`Authentication failed: ${exchangeError.message}`)
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
        } catch (err: any) {
          console.error('Unexpected error:', err)
          setError(err.message || 'Authentication failed')
          setTimeout(() => router.push('/login'), 3000)
          return
        }
      }

      // If we get here with no code, redirect to login
      console.log('No code found, redirecting to login')
      router.push('/login')
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
