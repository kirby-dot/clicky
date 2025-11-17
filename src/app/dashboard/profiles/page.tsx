'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { GlassPanel, GlassCard, GlassButton, GlassInput, GlassBadge } from '@/components/ui/glass'
import { Plus, User, Trash2, ExternalLink, Edit2, Calendar, Eye } from 'lucide-react'
import type { Profile } from '@/types'

interface Subscription {
  plan: 'free' | 'pro' | 'business'
}

const PLAN_LIMITS = {
  free: { profiles: 1 },
  pro: { profiles: 3 },
  business: { profiles: 999 }
}

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newProfileTitle, setNewProfileTitle] = useState('')
  const [newProfileSlug, setNewProfileSlug] = useState('')
  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data: { user: userData } } = await supabase.auth.getUser()
      if (!userData) {
        router.push('/login')
        return
      }
      setUser(userData)

      const { data: profilesData } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false })

      setProfiles(profilesData || [])

      const { data: subData } = await (supabase as any)
        .from('subscriptions')
        .select('plan')
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

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newProfileTitle || !newProfileSlug) return

    try {
      const currentPlan = subscription?.plan || 'free'
      const maxProfiles = PLAN_LIMITS[currentPlan].profiles

      if (profiles.length >= maxProfiles) {
        setMessage(`Error: Your ${currentPlan} plan only allows ${maxProfiles} profile${maxProfiles === 1 ? '' : 's'}. Upgrade to create more.`)
        return
      }

      if (!/^[a-z0-9-]+$/.test(newProfileSlug)) {
        setMessage('Error: Username can only contain lowercase letters, numbers, and hyphens')
        return
      }

      const { data: existingProfile } = await (supabase as any)
        .from('profiles')
        .select('id')
        .eq('slug', newProfileSlug)
        .maybeSingle()

      if (existingProfile) {
        setMessage('Error: This username is already taken')
        return
      }

      const { error } = await (supabase as any)
        .from('profiles')
        .insert({
          user_id: user.id,
          title: newProfileTitle,
          slug: newProfileSlug,
          published: false
        })

      if (error) throw error

      setMessage('Profile created successfully!')
      setNewProfileTitle('')
      setNewProfileSlug('')
      setShowCreateForm(false)
      setTimeout(() => setMessage(''), 3000)

      await loadData()
    } catch (error: any) {
      setMessage('Error: ' + error.message)
    }
  }

  const handleDeleteProfile = async (profileId: string) => {
    if (!confirm('Are you sure you want to delete this profile? All links and modules will be permanently deleted.')) {
      return
    }

    try {
      const { error } = await (supabase as any)
        .from('profiles')
        .delete()
        .eq('id', profileId)

      if (error) throw error

      setMessage('Profile deleted successfully!')
      setTimeout(() => setMessage(''), 3000)

      await loadData()
    } catch (error: any) {
      setMessage('Error: ' + error.message)
    }
  }

  const handleSwitchProfile = (profileId: string) => {
    router.push(`/dashboard/builder?profile=${profileId}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-400"></div>
      </div>
    )
  }

  const currentPlan = subscription?.plan || 'free'
  const maxProfiles = PLAN_LIMITS[currentPlan].profiles
  const canCreateMore = profiles.length < maxProfiles

  return (
    <div className="p-8 h-full overflow-y-auto">
      {/* Header */}
      <GlassPanel className="p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Profiles</h1>
            <p className="text-slate-600 mt-1">
              Manage your link-in-bio profiles ({profiles.length}/{maxProfiles})
            </p>
          </div>
          {canCreateMore && (
            <GlassButton onClick={() => setShowCreateForm(!showCreateForm)}>
              <Plus className="w-4 h-4 mr-2" />
              New Profile
            </GlassButton>
          )}
        </div>
      </GlassPanel>

      {message && (
        <div className={`p-4 rounded-xl mb-6 ${
          message.includes('Error') ? 'bg-red-100/80 border border-red-200 text-red-800' : 'bg-green-100/80 border border-green-200 text-green-800'
        }`}>
          <p className="font-semibold">{message}</p>
        </div>
      )}

      {/* Plan Limit Warning */}
      {!canCreateMore && (
        <GlassPanel className="p-6 mb-6 bg-yellow-50/50">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-yellow-100/50 rounded-xl">
              <User className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-yellow-900 mb-1">Profile Limit Reached</h3>
              <p className="text-sm text-yellow-800 mb-3">
                You&apos;ve reached the maximum of {maxProfiles} profile{maxProfiles === 1 ? '' : 's'} for your {currentPlan} plan.
              </p>
              <GlassButton
                variant="secondary"
                size="sm"
                onClick={() => router.push('/dashboard/settings?tab=billing')}
              >
                Upgrade Plan
              </GlassButton>
            </div>
          </div>
        </GlassPanel>
      )}

      {/* Create Profile Form */}
      {showCreateForm && canCreateMore && (
        <GlassPanel className="p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Create New Profile</h2>
          <form onSubmit={handleCreateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Profile Name
              </label>
              <GlassInput
                value={newProfileTitle}
                onChange={setNewProfileTitle}
                placeholder="My Awesome Profile"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Username (URL)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-medium">clicky.com/</span>
                <GlassInput
                  value={newProfileSlug}
                  onChange={(value) => setNewProfileSlug(value.toLowerCase())}
                  placeholder="username"
                />
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Lowercase letters, numbers, and hyphens only
              </p>
            </div>
            <div className="flex gap-3">
              <GlassButton type="submit">Create Profile</GlassButton>
              <GlassButton type="button" variant="secondary" onClick={() => setShowCreateForm(false)}>
                Cancel
              </GlassButton>
            </div>
          </form>
        </GlassPanel>
      )}

      {/* Profiles List */}
      {profiles.length === 0 ? (
        <GlassPanel className="p-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-100/50 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <User className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No profiles yet</h3>
            <p className="text-slate-600 mb-6">Create your first profile to get started</p>
            <GlassButton onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Profile
            </GlassButton>
          </div>
        </GlassPanel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <GlassCard key={profile.id} className="p-6" hover>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent-400 to-accent-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 truncate">{profile.title}</h3>
                    <p className="text-sm text-slate-600 truncate">/{profile.slug}</p>
                  </div>
                </div>
                {profile.published && (
                  <GlassBadge variant="success">Live</GlassBadge>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-white/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="w-4 h-4 text-slate-500" />
                    <p className="text-xs text-slate-600 font-semibold">Status</p>
                  </div>
                  <p className="text-sm font-bold text-slate-800">
                    {profile.published ? 'Published' : 'Draft'}
                  </p>
                </div>
                <div className="p-3 bg-white/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <p className="text-xs text-slate-600 font-semibold">Created</p>
                  </div>
                  <p className="text-sm font-bold text-slate-800">
                    {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <GlassButton
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => handleSwitchProfile(profile.id)}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </GlassButton>
                {profile.published && (
                  <GlassButton
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => window.open(`/${profile.slug}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Live
                  </GlassButton>
                )}
                <button
                  onClick={() => handleDeleteProfile(profile.id)}
                  className="w-full px-4 py-2 text-sm font-semibold rounded-xl bg-red-100/50 hover:bg-red-100 text-red-700 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  )
}
