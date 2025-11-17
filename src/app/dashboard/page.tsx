'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { GlassPanel, GlassCard, GlassButton, GlassInput, GlassBadge } from '@/components/ui/glass'
import { slugify, isValidSlug } from '@/lib/utils'
import {
  Plus, ExternalLink, Eye, MousePointerClick, TrendingUp, Layout,
  Settings, BarChart3, Sparkles, Share2, Activity, Link2, Users
} from 'lucide-react'
import type { Profile } from '@/types'

interface DashboardStats {
  views: number
  clicks: number
  clickRate: number
  viewsToday: number
  clicksToday: number
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [showCreateProfile, setShowCreateProfile] = useState(false)
  const [slug, setSlug] = useState('')
  const [title, setTitle] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error)
      }

      setProfile(data)
      setShowCreateProfile(!data)

      if (data) {
        await loadStats(data.id)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async (profileId: string) => {
    try {
      const { data: allEvents } = await (supabase as any)
        .from('events')
        .select('*')
        .eq('profile_id', profileId)
        .order('timestamp', { ascending: false })

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const { data: todayEvents } = await (supabase as any)
        .from('events')
        .select('*')
        .eq('profile_id', profileId)
        .gte('timestamp', today.toISOString())

      const views = allEvents?.filter((e: any) => e.event_type === 'view').length || 0
      const clicks = allEvents?.filter((e: any) => e.event_type === 'click').length || 0
      const viewsToday = todayEvents?.filter((e: any) => e.event_type === 'view').length || 0
      const clicksToday = todayEvents?.filter((e: any) => e.event_type === 'click').length || 0

      setStats({
        views,
        clicks,
        clickRate: views > 0 ? (clicks / views) * 100 : 0,
        viewsToday,
        clicksToday,
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleCreateProfile = async () => {
    setError('')

    if (!title.trim()) {
      setError('Please enter a title')
      return
    }

    const generatedSlug = slugify(slug || title)

    if (!isValidSlug(generatedSlug)) {
      setError('Username must be 3-30 characters (letters, numbers, hyphens)')
      return
    }

    setCreating(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: existingProfile } = await (supabase as any)
        .from('profiles')
        .select('slug')
        .eq('slug', generatedSlug)
        .single()

      if (existingProfile) {
        setError('Username is already taken')
        setCreating(false)
        return
      }

      const { data, error } = await (supabase as any)
        .from('profiles')
        .insert({
          user_id: user.id,
          title,
          slug: generatedSlug,
          published: true,
        })
        .select()
        .single()

      if (error) throw error

      setProfile(data)
      setShowCreateProfile(false)
      router.push('/dashboard/builder')
    } catch (error: any) {
      setError(error.message || 'Failed to create profile')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-400"></div>
      </div>
    )
  }

  if (showCreateProfile) {
    return (
      <div className="p-8 h-full flex items-center justify-center">
        <GlassPanel className="p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Create Your Profile</h2>
            <p className="text-slate-600">Get started with your link-in-bio page</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Profile Title
              </label>
              <GlassInput
                value={title}
                onChange={setTitle}
                placeholder="My Awesome Profile"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Username (URL)
              </label>
              <GlassInput
                value={slug}
                onChange={setSlug}
                placeholder={title ? slugify(title) : 'my-username'}
              />
              <p className="text-xs text-slate-500 mt-1">
                Your profile will be at: yoursite.com/{slug || slugify(title) || 'username'}
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-100/80 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <GlassButton
              onClick={handleCreateProfile}
              disabled={creating}
              className="w-full"
              size="lg"
            >
              {creating ? 'Creating...' : 'Create Profile'}
            </GlassButton>
          </div>
        </GlassPanel>
      </div>
    )
  }

  return (
    <div className="p-8 h-full overflow-y-auto">
      <GlassPanel className="p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
            <p className="text-slate-600 mt-1">Welcome back! Here&apos;s your overview</p>
          </div>
          <GlassButton onClick={() => router.push('/dashboard/builder')}>
            <Layout className="w-4 h-4 mr-2" />
            Edit Profile
          </GlassButton>
        </div>
      </GlassPanel>

      {profile && (
        <>
          {/* Profile Card */}
          <GlassPanel className="p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl flex items-center justify-center">
                  <Link2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{profile.title}</h2>
                  <p className="text-slate-600">yoursite.com/{profile.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <GlassBadge variant={profile.published ? 'success' : 'warning'}>
                  {profile.published ? 'Published' : 'Draft'}
                </GlassBadge>
                <GlassButton
                  variant="secondary"
                  size="sm"
                  onClick={() => window.open(`/${profile.slug}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View
                </GlassButton>
              </div>
            </div>
          </GlassPanel>

          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100/50 rounded-xl">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-sm font-semibold text-slate-600">Total Views</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{stats.views}</p>
                <p className="text-xs text-slate-500 mt-2">+{stats.viewsToday} today</p>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100/50 rounded-xl">
                    <MousePointerClick className="w-6 h-6 text-purple-600" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-sm font-semibold text-slate-600">Total Clicks</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{stats.clicks}</p>
                <p className="text-xs text-slate-500 mt-2">+{stats.clicksToday} today</p>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100/50 rounded-xl">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                  </div>
                  <Activity className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-sm font-semibold text-slate-600">Click Rate</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{stats.clickRate.toFixed(1)}%</p>
                <p className="text-xs text-slate-500 mt-2">Engagement rate</p>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-100/50 rounded-xl">
                    <Share2 className="w-6 h-6 text-accent-600" />
                  </div>
                  <Sparkles className="w-5 h-5 text-accent-500" />
                </div>
                <p className="text-sm font-semibold text-slate-600">Profile Status</p>
                <p className="text-xl font-bold text-slate-800 mt-1">Active</p>
                <p className="text-xs text-slate-500 mt-2">All systems go</p>
              </GlassCard>
            </div>
          )}

          {/* Quick Actions */}
          <GlassPanel className="p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/dashboard/builder')}
                className="flex items-center gap-4 p-4 bg-white/30 hover:bg-white/50 rounded-xl transition-all group"
              >
                <div className="p-3 bg-blue-100/50 rounded-xl group-hover:scale-110 transition-transform">
                  <Layout className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-800">Edit Page</p>
                  <p className="text-sm text-slate-600">Customize your profile</p>
                </div>
              </button>

              <button
                onClick={() => router.push('/dashboard/analytics')}
                className="flex items-center gap-4 p-4 bg-white/30 hover:bg-white/50 rounded-xl transition-all group"
              >
                <div className="p-3 bg-purple-100/50 rounded-xl group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-800">View Analytics</p>
                  <p className="text-sm text-slate-600">Check your stats</p>
                </div>
              </button>

              <button
                onClick={() => router.push('/dashboard/settings')}
                className="flex items-center gap-4 p-4 bg-white/30 hover:bg-white/50 rounded-xl transition-all group"
              >
                <div className="p-3 bg-green-100/50 rounded-xl group-hover:scale-110 transition-transform">
                  <Settings className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-800">Settings</p>
                  <p className="text-sm text-slate-600">Manage your account</p>
                </div>
              </button>
            </div>
          </GlassPanel>
        </>
      )}
    </div>
  )
}
