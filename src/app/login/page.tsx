'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link2, Mail } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const router = useRouter()
  const supabase = createBrowserClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      setMessage({
        type: 'success',
        text: 'Check your email for the magic link!',
      })
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'An error occurred',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-4">
            <Link2 className="w-10 h-10 text-primary-600" />
            <span className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              Clicky
            </span>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {message && (
                <div
                  className={`p-3 rounded-md text-sm ${
                    message.type === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  'Sending magic link...'
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send magic link
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
