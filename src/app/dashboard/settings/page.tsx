'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { GlassPanel, GlassCard, GlassButton, GlassInput, GlassBadge } from '@/components/ui/glass'
import { User, CreditCard, Bell, Shield, Crown, Check, Sparkles, Mail, AlertTriangle, Trash2 } from 'lucide-react'
import type { Profile } from '@/types'

type TabType = 'account' | 'billing' | 'notifications'

interface Subscription {
  id: string
  plan: 'free' | 'pro' | 'business'
  status: string
  started_at: string
  ends_at?: string
}

interface TeamMember {
  id: string
  email: string
  role: 'owner' | 'admin' | 'member'
  status: 'pending' | 'active' | 'declined'
  invited_at: string
  joined_at?: string
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
      'Clicky branding',
      'No team members'
    ],
    limits: {
      profiles: 1,
      modules: 5,
      teamMembers: 1
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
      '1 included user + $3/mo per extra',
      'Priority support'
    ],
    limits: {
      profiles: 3,
      modules: 999,
      teamMembers: 2
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
      '3 included users + $3/mo per extra',
      'Team collaboration',
      'API access',
      'Dedicated support'
    ],
    limits: {
      profiles: 999,
      modules: 999,
      teamMembers: 4
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
  const [activeTab, setActiveTab] = useState<TabType>('account')
  const [notifications, setNotifications] = useState({
    marketing: false,
    analytics: true,
    security: true,
    billing: true,
  })
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member')

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

      // Load profile (optional - user might not have one yet)
      const { data: profileData } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('user_id', userData.id)
        .maybeSingle()

      setProfile(profileData)

      // Load subscription
      const { data: subData } = await (supabase as any)
        .from('subscriptions')
        .select('*')
        .eq('user_id', userData.id)
        .eq('status', 'active')
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      setSubscription(subData)

      // Load team members (only if profile exists)
      if (profileData) {
        const { data: teamData } = await (supabase as any)
          .from('team_members')
          .select('*')
          .eq('profile_id', profileData.id)
          .order('invited_at', { ascending: false })

        setTeamMembers(teamData || [])
      }
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
      const { error } = await (supabase as any)
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
      const { error } = await (supabase as any)
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
        const { error } = await (supabase as any)
          .from('subscriptions')
          .update({
            plan,
            status: 'active'
          })
          .eq('id', subscription.id)

        if (error) throw error
      } else {
        // Create new subscription
        const { error } = await (supabase as any)
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

  const handleInviteTeamMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !inviteEmail) return

    try {
      // Check plan limits
      const currentPlan = subscription?.plan || 'free'
      const maxTeamMembers = PLAN_FEATURES[currentPlan].limits.teamMembers
      const activeTeamCount = teamMembers.filter(m => m.status === 'active').length + 1 // +1 for owner

      if (activeTeamCount >= maxTeamMembers) {
        setMessage(`Error: Your ${currentPlan} plan only allows ${maxTeamMembers} team member${maxTeamMembers === 1 ? '' : 's'} (including yourself). Upgrade to add more.`)
        return
      }

      // Create team member invitation
      const { error } = await (supabase as any)
        .from('team_members')
        .insert({
          profile_id: profile?.id,
          email: inviteEmail,
          role: inviteRole,
          status: 'pending'
        })

      if (error) throw error

      setMessage(`Invitation sent to ${inviteEmail}!`)
      setInviteEmail('')
      setTimeout(() => setMessage(''), 3000)

      // Reload team data
      await loadData()
    } catch (error: any) {
      setMessage('Error: ' + error.message)
    }
  }

  const handleRemoveTeamMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return

    try {
      const { error } = await (supabase as any)
        .from('team_members')
        .delete()
        .eq('id', memberId)

      if (error) throw error

      setMessage('Team member removed successfully!')
      setTimeout(() => setMessage(''), 3000)

      // Reload team data
      await loadData()
    } catch (error: any) {
      setMessage('Error: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-400"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-8">
        <GlassPanel className="p-12 text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Not authenticated</h2>
          <p className="text-slate-600 mb-6">Please log in to access settings</p>
        </GlassPanel>
      </div>
    )
  }

  const currentPlan = subscription?.plan || 'free'
  const planInfo = PLAN_FEATURES[currentPlan]

  return (
    <div className="p-8 h-full overflow-y-auto">
      {/* Header */}
      <GlassPanel className="p-6 mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-600 mt-1">Manage your account and preferences</p>
      </GlassPanel>

      {/* Message Banner */}
      {message && (
        <GlassPanel className={`p-4 mb-6 border-2 ${
          message.includes('Error')
            ? 'border-red-300 bg-red-50/50'
            : 'border-green-300 bg-green-50/50'
        }`}>
          <p className={`font-semibold ${
            message.includes('Error') ? 'text-red-800' : 'text-green-800'
          }`}>
            {message}
          </p>
        </GlassPanel>
      )}

      {/* Tab Navigation */}
      <GlassPanel className="p-2 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('account')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === 'account'
                ? 'bg-accent-400 text-white shadow-sm'
                : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <Shield className="w-4 h-4" />
            Account
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === 'billing'
                ? 'bg-accent-400 text-white shadow-sm'
                : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Billing & Plans
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === 'notifications'
                ? 'bg-accent-400 text-white shadow-sm'
                : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <Bell className="w-4 h-4" />
            Notifications
          </button>
        </div>
      </GlassPanel>

      {/* Tab Content */}
      <div>
        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <GlassPanel className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100/50 rounded-xl">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Account Security</h2>
                  <p className="text-sm text-slate-600">Manage your account security and credentials</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-2">Email</p>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <p className="font-medium text-slate-800">{user.email}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/30">
                  <GlassButton variant="secondary" onClick={() => alert('Password reset email sent!')}>
                    Change Password
                  </GlassButton>
                </div>
              </div>
            </GlassPanel>

            {/* Danger Zone */}
            <GlassPanel className="p-6 border-2 border-red-300 bg-red-50/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100/50 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-red-800">Danger Zone</h2>
                  <p className="text-sm text-red-700">Irreversible actions</p>
                </div>
              </div>

              <GlassButton
                variant="secondary"
                onClick={() => {
                  if (confirm('Are you sure? This will delete your account and all data permanently.')) {
                    alert('Account deletion would be processed here')
                  }
                }}
                className="border-red-400 text-red-700 hover:bg-red-100/50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </GlassButton>
            </GlassPanel>
          </div>
        )}

        {/* Billing & Plans Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            {/* Current Plan */}
            <GlassPanel className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100/50 rounded-xl">
                    <Crown className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Current Plan</h2>
                    <p className="text-sm text-slate-600">You&apos;re on the {planInfo.name} plan</p>
                  </div>
                </div>
                <GlassBadge variant="success">Active</GlassBadge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <GlassCard className="p-4">
                  <p className="text-sm text-slate-600 mb-1">Price</p>
                  <p className="text-3xl font-bold text-slate-800">
                    ${planInfo.price}
                    <span className="text-sm font-normal text-slate-600">/mo</span>
                  </p>
                </GlassCard>
                <GlassCard className="p-4">
                  <p className="text-sm text-slate-600 mb-1">Plan</p>
                  <p className="text-3xl font-bold text-slate-800">{planInfo.name}</p>
                </GlassCard>
              </div>
            </GlassPanel>

            {/* Plan Selector */}
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-4 px-1">Choose Your Plan</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Free Plan */}
                <GlassCard className={`p-6 transition-all ${
                  currentPlan === 'free'
                    ? 'ring-2 ring-accent-400 border-2 border-accent-400'
                    : 'hover:bg-white/60'
                }`}>
                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-bold text-slate-800">Free</h3>
                    <div className="text-4xl font-bold text-slate-800 my-4">$0</div>
                    <p className="text-sm text-slate-600">Forever free</p>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {PLAN_FEATURES.free.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <GlassButton
                    className="w-full"
                    disabled={currentPlan === 'free'}
                    variant={currentPlan === 'free' ? 'primary' : 'secondary'}
                    onClick={() => handleSwitchPlan('free')}
                  >
                    {currentPlan === 'free' ? 'Current Plan' : 'Switch to Free'}
                  </GlassButton>
                </GlassCard>

                {/* Pro Plan */}
                <GlassCard className={`p-6 relative transition-all ${
                  currentPlan === 'pro'
                    ? 'ring-2 ring-accent-400 border-2 border-accent-400'
                    : 'hover:bg-white/60'
                }`}>
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-accent-400 text-white px-4 py-1 rounded-full font-bold text-xs shadow-sm">
                    POPULAR
                  </div>
                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-bold text-slate-800">Pro</h3>
                    <div className="text-4xl font-bold text-slate-800 my-4">$9</div>
                    <p className="text-sm text-slate-600">per month</p>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {PLAN_FEATURES.pro.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-700 font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <GlassButton
                    className="w-full"
                    disabled={currentPlan === 'pro'}
                    variant={currentPlan === 'pro' ? 'primary' : 'secondary'}
                    onClick={() => handleSwitchPlan('pro')}
                  >
                    {currentPlan === 'pro' ? 'Current Plan' : 'Upgrade to Pro'}
                  </GlassButton>
                </GlassCard>

                {/* Business Plan */}
                <GlassCard className={`p-6 transition-all ${
                  currentPlan === 'business'
                    ? 'ring-2 ring-accent-400 border-2 border-accent-400'
                    : 'hover:bg-white/60'
                }`}>
                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-bold text-slate-800">Business</h3>
                    <div className="text-4xl font-bold text-slate-800 my-4">$29</div>
                    <p className="text-sm text-slate-600">per month</p>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {PLAN_FEATURES.business.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-700 font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <GlassButton
                    className="w-full"
                    disabled={currentPlan === 'business'}
                    variant={currentPlan === 'business' ? 'primary' : 'secondary'}
                    onClick={() => handleSwitchPlan('business')}
                  >
                    {currentPlan === 'business' ? 'Current Plan' : 'Upgrade to Business'}
                  </GlassButton>
                </GlassCard>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <GlassPanel className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-green-100/50 rounded-xl">
                  <Bell className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Email Notifications</h2>
                  <p className="text-sm text-slate-600">Manage how you receive notifications</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-start gap-3 p-4 bg-white/20 rounded-xl hover:bg-white/40 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.marketing}
                    onChange={(e) => setNotifications({ ...notifications, marketing: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-accent-400 focus:ring-accent-400"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">Marketing emails</p>
                    <p className="text-sm text-slate-600">Receive emails about new features and updates</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 bg-white/20 rounded-xl hover:bg-white/40 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.analytics}
                    onChange={(e) => setNotifications({ ...notifications, analytics: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-accent-400 focus:ring-accent-400"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">Analytics reports</p>
                    <p className="text-sm text-slate-600">Weekly summary of your profile performance</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 bg-white/20 rounded-xl hover:bg-white/40 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.security}
                    onChange={(e) => setNotifications({ ...notifications, security: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-accent-400 focus:ring-accent-400"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">Security alerts</p>
                    <p className="text-sm text-slate-600">Get notified about account security</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 bg-white/20 rounded-xl hover:bg-white/40 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.billing}
                    onChange={(e) => setNotifications({ ...notifications, billing: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-accent-400 focus:ring-accent-400"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">Billing notifications</p>
                    <p className="text-sm text-slate-600">Receipts and billing updates</p>
                  </div>
                </label>
              </div>

              <div className="pt-6 border-t border-white/30 mt-6">
                <GlassButton onClick={() => setMessage('Notification preferences saved!')}>
                  Save Preferences
                </GlassButton>
              </div>
            </GlassPanel>
          </div>
        )}
      </div>
    </div>
  )
}
