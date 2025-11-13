'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Link2, CreditCard, Bell, Shield, Palette, Zap, Crown, Check } from 'lucide-react'
import type { Profile } from '@/types'

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const supabase = createBrowserClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const {
        data: { user: userData },
      } = await supabase.auth.getUser()

      if (!userData) return
      setUser(userData)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userData.id)
        .single()

      setProfile(profileData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile || !user) return

    setSaving(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          title: profile.title,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          published: profile.published,
        })
        .eq('id', profile.id)

      if (error) throw error

      setMessage('Profile updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error: any) {
      setMessage('Error: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleChangeSlug = async () => {
    if (!profile) return

    const newSlug = prompt('Enter new username (letters, numbers, hyphens only):', profile.slug)
    if (!newSlug) return

    // Validate slug
    if (!/^[a-z0-9-]+$/.test(newSlug)) {
      alert('Username can only contain lowercase letters, numbers, and hyphens')
      return
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ slug: newSlug })
        .eq('id', profile.id)

      if (error) throw error

      setProfile({ ...profile, slug: newSlug })
      alert('Username updated! Your new URL is: clicky.com/' + newSlug)
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black"></div>
      </div>
    )
  }

  if (!profile || !user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No profile found</CardTitle>
          <CardDescription>Please create a profile first</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1 font-medium">Manage your account and preferences</p>
      </div>

      {message && (
        <div className={`p-4 border-4 border-black shadow-brutal ${
          message.includes('Error') ? 'bg-red-100' : 'bg-neo-green'
        }`}>
          <p className="font-bold">{message}</p>
        </div>
      )}

      {/* Profile Settings */}
      <Card>
        <CardHeader className="bg-neo-yellow border-b-4 border-black">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            <CardTitle>Profile Settings</CardTitle>
          </div>
          <CardDescription className="text-gray-700 font-medium">
            Update your public profile information
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Display Name
              </label>
              <Input
                value={profile.title || ''}
                onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                placeholder="Your Name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Bio
              </label>
              <Textarea
                value={profile.bio || ''}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Tell people about yourself..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Avatar URL
              </label>
              <Input
                value={profile.avatar_url || ''}
                onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
                type="url"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={profile.published}
                onChange={(e) => setProfile({ ...profile, published: e.target.checked })}
                className="w-5 h-5 border-3 border-black"
                id="published"
              />
              <label htmlFor="published" className="font-bold">
                Make profile public
              </label>
            </div>

            <div className="flex gap-3 pt-4 border-t-4 border-black">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* URL Settings */}
      <Card>
        <CardHeader className="bg-neo-blue border-b-4 border-black">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            <CardTitle>Your Clicky URL</CardTitle>
          </div>
          <CardDescription className="text-gray-700 font-medium">
            Customize your profile link
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-700 mb-2">Current URL:</p>
              <div className="bg-gray-50 border-3 border-black p-4 font-mono">
                clicky.com/{profile.slug}
              </div>
            </div>
            <Button onClick={handleChangeSlug} variant="outline">
              Change Username
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader className="bg-neo-pink border-b-4 border-black">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <CardTitle>Account Settings</CardTitle>
          </div>
          <CardDescription className="text-gray-700 font-medium">
            Manage your account security
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Email:</p>
            <p className="font-medium">{user.email}</p>
          </div>

          <div className="pt-4 border-t-4 border-black">
            <Button variant="outline" onClick={() => alert('Password reset email sent!')}>
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <Card>
        <CardHeader className="bg-neo-purple border-b-4 border-black">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            <CardTitle>Your Plan</CardTitle>
          </div>
          <CardDescription className="text-gray-700 font-medium">
            Upgrade to unlock more features
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Free Plan */}
            <div className="border-4 border-black p-6 bg-white shadow-brutal">
              <div className="text-center mb-4">
                <h3 className="text-2xl font-black">Free</h3>
                <div className="text-4xl font-black my-4">$0</div>
                <p className="text-sm text-gray-600 font-medium">Forever free</p>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-sm">1 profile</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Unlimited links</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-sm">5 module types</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Basic analytics</span>
                </li>
              </ul>
              <Button className="w-full" disabled>
                Current Plan
              </Button>
            </div>

            {/* Pro Plan */}
            <div className="border-4 border-black p-6 bg-neo-yellow shadow-brutal-lg relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-1 font-black text-xs">
                POPULAR
              </div>
              <div className="text-center mb-4">
                <h3 className="text-2xl font-black">Pro</h3>
                <div className="text-4xl font-black my-4">$9</div>
                <p className="text-sm text-gray-700 font-medium">per month</p>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-bold">Everything in Free</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-sm">3 profiles</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-sm">All 17+ modules</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Remove branding</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Advanced analytics</span>
                </li>
              </ul>
              <Button className="w-full">
                Upgrade to Pro
              </Button>
            </div>

            {/* Business Plan */}
            <div className="border-4 border-black p-6 bg-white shadow-brutal">
              <div className="text-center mb-4">
                <h3 className="text-2xl font-black">Business</h3>
                <div className="text-4xl font-black my-4">$29</div>
                <p className="text-sm text-gray-600 font-medium">per month</p>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-bold">Everything in Pro</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Unlimited profiles</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Custom domain</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-sm">White-label</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Team collaboration</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline">
                Upgrade to Business
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card>
        <CardHeader className="bg-red-100 border-b-4 border-black">
          <CardTitle className="text-red-800">Danger Zone</CardTitle>
          <CardDescription className="text-red-700 font-medium">
            Irreversible actions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm('Are you sure? This will delete your account and all data permanently.')) {
                alert('Account deletion would be processed here')
              }
            }}
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
