'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'

export default function AuthConfirmPage() {
  const router = useRouter()
  const [status, setStatus] = useState('Completing sign in...')

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Get session data from URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')

        console.log('Auth confirm - tokens found:', !!accessToken, !!refreshToken)

        if (accessToken && refreshToken) {
          const supabase = createBrowserClient()

          // Set the session in Supabase
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (error) {
            console.error('Error setting session:', error)
            setStatus('Error setting session...')
            setTimeout(() => router.push('/login?error=session_error'), 2000)
            return
          }

          console.log('Session set successfully:', !!data.session)
          setStatus('Session confirmed...')

          // Set cookies for middleware (non-httpOnly so JS can set them)
          document.cookie = `sb-access-token=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
          document.cookie = `sb-refresh-token=${refreshToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`

          console.log('Cookies set')
          setStatus('Redirecting to dashboard...')

          // Wait a bit for cookies to be set, then redirect
          await new Promise(resolve => setTimeout(resolve, 500))

          console.log('Redirecting to dashboard')
          window.location.href = '/dashboard'
        } else {
          // No session data, redirect to login
          console.log('No tokens found, redirecting to login')
          router.push('/login')
        }
      } catch (error) {
        console.error('Auth confirm error:', error)
        setStatus('Authentication error...')
        setTimeout(() => router.push('/login'), 2000)
      }
    }

    handleAuth()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">{status}</p>
      </div>
    </div>
  )
}
