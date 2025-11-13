'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Link2, CreditCard, Bell, Shield, Palette, Zap, Crown, Check, Sparkles } from 'lucide-react'
import type { Profile } from '@/types'

type TabType = 'profile' | 'account' | 'billing' | 'notifications'

interface Subscription {
  id: string
  plan: 'free' | 'pro' | 'business'
  status: string
  started_at: string
  ends_at?: string
}

const PLAN_FEATURES = {
  free: {
    name: 'Free',
    price: 0,
    description: 'Forever free',
    features: [
      '1 profile',
      'Unlimited links',
      '5 module types',
      'Basic analytics',
      'Clicky branding'
    ],
    limits: {
      profiles: 1,
      modules: 5
    }
  },
  pro: {
    name: 'Pro',
    price: 9,
    description: 'per month',
    badge: 'POPULAR',
    features: [
      'Everything in Free',
      '3 profiles',
      'All 15+ modules',
      'Remove branding',
      'Advanced analytics',
      'Priority support'
    ],
    limits: {
      profiles: 3,
      modules: 999
    }
  },
  business: {
    name: 'Business',
    price: 29,
    description: 'per month',
    features: [
      'Everything in Pro',
      'Unlimited profiles',
      'Custom domain',
      'White-label',
      'Team collaboration',
      'API access',
      'Dedicated support'
    ],
    limits: {
      profiles: 999,
      modules: 999
    }
  }
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('profile')

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

      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userData.id)
        .single()

      setProfile(profileData)

      // Load subscription
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userData.id)
        .eq('status', 'active')
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      setSubscription(subData)
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
      setMessage('Username updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error: any) {
      setMessage('Error: ' + error.message)
    }
  }

  const handleSwitchPlan = async (plan: 'free' | 'pro' | 'business') => {
    if (!user) return

    try {
      // Check if there's an active subscription
      if (subscription) {
        // Update existing subscription
        const { error } = await supabase
          .from('subscriptions')
          .update({
            plan,
            status: 'active'
          })
          .eq('id', subscription.id)

        if (error) throw error
      } else {
        // Create new subscription
        const { error } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            plan,
            status: 'active'
          })

        if (error) throw error
      }

      setMessage(`Successfully switched to ${PLAN_FEATURES[plan].name} plan!`)
      setTimeout(() => setMessage(''), 3000)

      // Reload subscription data
      await loadData()
    } catch (error: any) {
      setMessage('Error: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
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

  const currentPlan = subscription?.plan || 'free'
  const planInfo = PLAN_FEATURES[currentPlan]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1 font-medium">Manage your account and preferences</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border ${
          message.includes('Error') ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'
        } shadow-soft`}>
          <p className="font-semibold">{message}</p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <User className="w-4 h-4" />
            Profile
          </button>

          <button
            onClick={() => setActiveTab('account')}
            className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors flex items-center gap-2 ${
              activeTab === 'account'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Shield className="w-4 h-4" />
            Account
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors flex items-center gap-2 ${
              activeTab === 'billing'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Billing & Plans
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors flex items-center gap-2 ${
              activeTab === 'notifications'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Bell className="w-4 h-4" />
            Notifications
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="py-6">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Profile Settings */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-pastel-peach to-pastel-butter border-b border-gray-200">
                <CardTitle>Profile Information</CardTitle>
                <CardDescription className="text-gray-600">
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
                      className="w-5 h-5 rounded border-2 border-gray-300 text-primary-500 focus:ring-2 focus:ring-primary-500"
                      id="published"
                    />
                    <label htmlFor="published" className="font-semibold">
                      Make profile public
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <Button type="submit" disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* URL Settings */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-pastel-sky to-pastel-lavender border-b border-gray-200">
                <CardTitle>Your Clicky URL</CardTitle>
                <CardDescription className="text-gray-600">
                  Customize your profile link
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Current URL:</p>
                    <div className="bg-gray-50 border border-gray-300 rounded-xl p-4 font-mono">
                      clicky.com/{profile.slug}
                    </div>
                  </div>
                  <Button onClick={handleChangeSlug} variant="outline">
                    Change Username
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <Card>
              <CardHeader className="bg-gradient-to-r from-pastel-rose to-pastel-peach border-b border-gray-200">
                <CardTitle>Account Security</CardTitle>
                <CardDescription className="text-gray-600">
                  Manage your account security and credentials
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Email:</p>
                  <p className="font-medium">{user.email}</p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <Button variant="outline" onClick={() => alert('Password reset email sent!')}>
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card>
              <CardHeader className="bg-red-50 border-b border-red-200">
                <CardTitle className="text-red-800">Danger Zone</CardTitle>
                <CardDescription className="text-red-700">
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
        )}

        {/* Billing & Plans Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            {/* Current Plan */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-pastel-lavender to-pastel-lilac border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Current Plan</CardTitle>
                    <CardDescription className="text-gray-600">
                      You&apos;re on the {planInfo.name} plan
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border-2 border-purple-200">
                    <Crown className="w-5 h-5 text-purple-600" />
                    <span className="font-bold text-purple-600">{planInfo.name}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Price</p>
                    <p className="text-2xl font-bold">${planInfo.price}<span className="text-sm font-normal text-gray-600">/mo</span></p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-semibold">
                      Active
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Plan Selector */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Free Plan */}
                <div className={`border-2 rounded-2xl p-6 bg-white shadow-soft transition-all ${
                  currentPlan === 'free' ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-bold">Free</h3>
                    <div className="text-4xl font-bold my-4">$0</div>
                    <p className="text-sm text-gray-600">Forever free</p>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {PLAN_FEATURES.free.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    disabled={currentPlan === 'free'}
                    variant={currentPlan === 'free' ? 'default' : 'outline'}
                    onClick={() => handleSwitchPlan('free')}
                  >
                    {currentPlan === 'free' ? 'Current Plan' : 'Switch to Free'}
                  </Button>
                </div>

                {/* Pro Plan */}
                <div className={`border-2 rounded-2xl p-6 bg-gradient-to-br from-pastel-butter to-pastel-peach shadow-soft-lg relative transition-all ${
                  currentPlan === 'pro' ? 'border-purple-500 ring-2 ring-purple-200' : 'border-primary-300 hover:border-primary-400'
                }`}>
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary-500 text-white px-4 py-1 rounded-full font-bold text-xs shadow-soft">
                    POPULAR
                  </div>
                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-bold">Pro</h3>
                    <div className="text-4xl font-bold my-4">$9</div>
                    <p className="text-sm text-gray-700">per month</p>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {PLAN_FEATURES.pro.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm font-semibold">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    disabled={currentPlan === 'pro'}
                    variant={currentPlan === 'pro' ? 'default' : 'outline'}
                    onClick={() => handleSwitchPlan('pro')}
                  >
                    {currentPlan === 'pro' ? 'Current Plan' : 'Upgrade to Pro'}
                  </Button>
                </div>

                {/* Business Plan */}
                <div className={`border-2 rounded-2xl p-6 bg-white shadow-soft transition-all ${
                  currentPlan === 'business' ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-bold">Business</h3>
                    <div className="text-4xl font-bold my-4">$29</div>
                    <p className="text-sm text-gray-600">per month</p>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {PLAN_FEATURES.business.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm font-semibold">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    disabled={currentPlan === 'business'}
                    variant={currentPlan === 'business' ? 'default' : 'outline'}
                    onClick={() => handleSwitchPlan('business')}
                  >
                    {currentPlan === 'business' ? 'Current Plan' : 'Upgrade to Business'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <Card>
              <CardHeader className="bg-gradient-to-r from-pastel-mint to-pastel-sage border-b border-gray-200">
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription className="text-gray-600">
                  Manage how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="font-semibold">Marketing emails</p>
                    <p className="text-sm text-gray-600">Receive emails about new features and updates</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 rounded border-2 border-gray-300 text-primary-500" />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="font-semibold">Analytics reports</p>
                    <p className="text-sm text-gray-600">Weekly summary of your profile performance</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 rounded border-2 border-gray-300 text-primary-500" defaultChecked />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="font-semibold">Security alerts</p>
                    <p className="text-sm text-gray-600">Get notified about account security</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 rounded border-2 border-gray-300 text-primary-500" defaultChecked />
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-semibold">Billing notifications</p>
                    <p className="text-sm text-gray-600">Receipts and billing updates</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 rounded border-2 border-gray-300 text-primary-500" defaultChecked />
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <Button>Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
