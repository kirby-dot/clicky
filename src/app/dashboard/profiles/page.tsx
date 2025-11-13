'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, User, Check, Trash2, ExternalLink, Edit2 } from 'lucide-react'
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

      // Load profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false })

      setProfiles(profilesData || [])

      // Load subscription
      const { data: subData } = await supabase
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

      // Validate slug
      if (!/^[a-z0-9-]+$/.test(newProfileSlug)) {
        setMessage('Error: Username can only contain lowercase letters, numbers, and hyphens')
        return
      }

      // Check if slug is already taken
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('slug', newProfileSlug)
        .maybeSingle()

      if (existingProfile) {
        setMessage('Error: This username is already taken')
        return
      }

      const { error } = await supabase
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

      // Reload profiles
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
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profileId)

      if (error) throw error

      setMessage('Profile deleted successfully!')
      setTimeout(() => setMessage(''), 3000)

      // Reload profiles
      await loadData()
    } catch (error: any) {
      setMessage('Error: ' + error.message)
    }
  }

  const handleSwitchProfile = (profileId: string) => {
    // Navigate to builder for this profile
    router.push(`/dashboard/builder?profile=${profileId}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  const currentPlan = subscription?.plan || 'free'
  const maxProfiles = PLAN_LIMITS[currentPlan].profiles
  const canCreateMore = profiles.length < maxProfiles

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Profiles</h1>
          <p className="text-gray-600 mt-1 font-medium">
            Manage your link-in-bio profiles ({profiles.length}/{maxProfiles})
          </p>
        </div>
        {canCreateMore && (
          <Button onClick={() => setShowCreateForm(!showCreateForm)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Profile
          </Button>
        )}
      </div>

      {message && (
        <div className={`p-4 rounded-xl border ${
          message.includes('Error') ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'
        } shadow-soft`}>
          <p className="font-semibold">{message}</p>
        </div>
      )}

      {/* Plan Limit Warning */}
      {!canCreateMore && (
        <Card>
          <CardContent className="p-6 bg-yellow-50 border border-yellow-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-bold text-yellow-900 mb-1">Profile Limit Reached</h3>
                <p className="text-sm text-yellow-800 mb-3">
                  You&apos;ve reached the maximum of {maxProfiles} profile{maxProfiles === 1 ? '' : 's'} for your {currentPlan} plan.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/dashboard/settings?tab=billing')}
                >
                  Upgrade Plan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Profile Form */}
      {showCreateForm && canCreateMore && (
        <Card>
          <CardHeader className="bg-gradient-to-r from-pastel-peach to-pastel-butter border-b border-gray-200">
            <CardTitle>Create New Profile</CardTitle>
            <CardDescription className="text-gray-600">
              Add another link-in-bio profile
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleCreateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Profile Name
                </label>
                <Input
                  value={newProfileTitle}
                  onChange={(e) => setNewProfileTitle(e.target.value)}
                  placeholder="My Awesome Profile"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Username (URL)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">clicky.com/</span>
                  <Input
                    value={newProfileSlug}
                    onChange={(e) => setNewProfileSlug(e.target.value.toLowerCase())}
                    placeholder="username"
                    pattern="[a-z0-9-]+"
                    required
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Lowercase letters, numbers, and hyphens only
                </p>
              </div>
              <div className="flex gap-3">
                <Button type="submit">Create Profile</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Profiles List */}
      {profiles.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No profiles yet</h3>
            <p className="text-gray-600 mb-6">Create your first profile to get started</p>
            <Button onClick={() => setShowCreateForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Profile
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <Card key={profile.id} className="hover:shadow-soft-lg transition-shadow">
              <CardHeader className="bg-gradient-to-br from-pastel-sky to-pastel-lavender border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="truncate">{profile.title}</CardTitle>
                    <CardDescription className="text-gray-600 truncate">
                      clicky.com/{profile.slug}
                    </CardDescription>
                  </div>
                  {profile.published && (
                    <div className="flex-shrink-0 ml-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold">
                        <Check className="w-3 h-3 mr-1" />
                        Live
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Status</p>
                      <p className="font-semibold text-sm">
                        {profile.published ? 'Published' : 'Draft'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Created</p>
                      <p className="font-semibold text-sm">
                        {new Date(profile.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => handleSwitchProfile(profile.id)}
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Profile
                    </Button>
                    {profile.published && (
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => window.open(`/${profile.slug}`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Live
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      className="w-full gap-2"
                      onClick={() => handleDeleteProfile(profile.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
