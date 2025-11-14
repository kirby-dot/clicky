'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { StatCard, EmptyState } from '@/components/ui/empty-state'
import { slugify, isValidSlug } from '@/lib/utils'
import {
  Plus, ExternalLink, Eye, MousePointerClick, TrendingUp, Layout, Palette,
  Settings, BarChart3, CheckCircle2, Circle, Sparkles, Share2, Image as ImageIcon, Activity
} from 'lucide-react'
import type { Profile } from '@/types'

interface DashboardStats {
  views: number
  clicks: number
  clickRate: number
  viewsToday: number
  clicksToday: number
  recentActivity: Array<{
    type: string
    country?: string
    device_type?: string
    timestamp: string
  }>
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

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error)
      }

      setProfile(data)
      setShowCreateProfile(!data)

      // Load stats if profile exists
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
      // Get all events
      const { data: allEvents } = await supabase
        .from('events')
        .select('*')
        .eq('profile_id', profileId)
        .order('timestamp', { ascending: false })

      // Get today's events
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const { data: todayEvents } = await supabase
        .from('events')
        .select('*')
        .eq('profile_id', profileId)
        .gte('timestamp', today.toISOString())

      const views = allEvents?.filter(e => e.event_type === 'view').length || 0
      const clicks = allEvents?.filter(e => e.event_type === 'click').length || 0
      const viewsToday = todayEvents?.filter(e => e.event_type === 'view').length || 0
      const clicksToday = todayEvents?.filter(e => e.event_type === 'click').length || 0

      setStats({
        views,
        clicks,
        clickRate: views > 0 ? Math.round((clicks / views) * 100) : 0,
        viewsToday,
        clicksToday,
        recentActivity: allEvents?.slice(0, 5) || [],
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!isValidSlug(slug)) {
      setError('Slug must be 3-30 characters and contain only lowercase letters, numbers, and hyphens')
      return
    }

    setCreating(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      // Check if slug is available
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('slug', slug)
        .single()

      if (existing) {
        setError('This slug is already taken')
        setCreating(false)
        return
      }

      // Create profile
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          slug,
          title,
          published: true,
        })
        .select()
        .single()

      if (error) throw error

      setProfile(data)
      setShowCreateProfile(false)
    } catch (error: any) {
      setError(error.message || 'An error occurred')
    } finally {
      setCreating(false)
    }
  }

  const getSetupProgress = () => {
    if (!profile) return 0
    let progress = 25 // Created profile

    // Check for modules
    // Check for theme
    // Check for profile image
    // Check if shared

    return progress
  }

  const setupTasks = [
    { id: 'profile', label: 'Create your profile', completed: !!profile, icon: CheckCircle2 },
    { id: 'link', label: 'Add your first link', completed: false, icon: Circle, action: () => router.push('/dashboard/builder') },
    { id: 'theme', label: 'Pick a theme', completed: false, icon: Circle, action: () => router.push('/dashboard/appearance') },
    { id: 'image', label: 'Add profile image', completed: false, icon: Circle, action: () => router.push('/dashboard/settings') },
    { id: 'share', label: 'Share your page', completed: false, icon: Circle, action: () => profile && navigator.clipboard.writeText(`https://clicky.link/${profile.slug}`) },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (showCreateProfile) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-scale-in">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Welcome to Clicky!
          </h1>
          <p className="text-lg text-gray-600">Let&apos;s create your personalized link page</p>
        </div>

        <Card className="border-2 border-purple-200 shadow-2xl animate-slide-up">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl">Create your Clicky profile</CardTitle>
            <CardDescription className="text-base mt-2">
              Choose a unique URL for your link page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateProfile} className="space-y-6">
              <div>
                <label htmlFor="slug" className="block text-sm font-semibold text-gray-700 mb-3">
                  Your Clicky URL
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500 font-semibold bg-gray-100 px-3 py-2.5 rounded-lg border border-gray-200">clicky.link/</span>
                  <Input
                    id="slug"
                    placeholder="yourname"
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    required
                    className="flex-1 h-11"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Use lowercase letters, numbers, and hyphens only
                </p>
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-3">
                  Profile title
                </label>
                <Input
                  id="title"
                  placeholder="Your Name"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              {error && (
                <div className="p-4 rounded-lg text-sm bg-red-50 text-red-800 border-2 border-red-200 font-medium">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={creating}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg py-7 shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                {creating ? 'Creating your page...' : 'Create my page ✨'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  const hasData = stats && (stats.views > 0 || stats.clicks > 0)

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Welcome back! Here&apos;s what&apos;s happening with your page.</p>
        </div>
        {profile && (
          <Button
            onClick={() => window.open(`/${profile.slug}`, '_blank')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Page
          </Button>
        )}
      </div>

      {/* Getting Started (for new users) */}
      {getSetupProgress() < 100 && (
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 shadow-soft-lg animate-slide-up">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  Get Started with Clicky
                </CardTitle>
                <CardDescription className="mt-1">Complete these steps to make the most of your page</CardDescription>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{getSetupProgress()}%</div>
                <div className="text-sm text-gray-600">Complete</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {setupTasks.map((task) => {
                const Icon = task.completed ? CheckCircle2 : Circle
                return (
                  <button
                    key={task.id}
                    onClick={task.action}
                    className={`p-5 rounded-xl border-2 transition-all duration-200 text-left hover:scale-105 active:scale-95 ${
                      task.completed
                        ? 'bg-white/80 border-green-300 opacity-75'
                        : 'bg-white border-purple-200 hover:border-purple-400 hover:shadow-md'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-3 ${task.completed ? 'text-green-600' : 'text-purple-400'}`} />
                    <p className="text-sm font-semibold text-gray-900">{task.label}</p>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Views"
          value={stats?.views || 0}
          icon={<Eye className="w-5 h-5" />}
          change={stats?.viewsToday ? `+${stats.viewsToday} today` : undefined}
          changeType={stats?.viewsToday ? 'positive' : 'neutral'}
        />
        <StatCard
          label="Total Clicks"
          value={stats?.clicks || 0}
          icon={<MousePointerClick className="w-5 h-5" />}
          change={stats?.clicksToday ? `+${stats.clicksToday} today` : undefined}
          changeType={stats?.clicksToday ? 'positive' : 'neutral'}
        />
        <StatCard
          label="Click Rate"
          value={`${stats?.clickRate || 0}%`}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          label="Active Links"
          value={0}
          icon={<Layout className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="border-2 shadow-soft-lg hover:shadow-soft-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="w-6 h-6 text-purple-600" />
              Quick Actions
            </CardTitle>
            <CardDescription className="mt-1">Get things done faster</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => router.push('/dashboard/builder')}
              className="h-auto py-7 flex-col gap-3 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <Plus className="w-7 h-7" />
              <span className="text-sm font-semibold">Add Link</span>
            </Button>
            <Button
              onClick={() => router.push('/dashboard/appearance')}
              variant="outline"
              className="h-auto py-7 flex-col gap-3 border-2 hover:border-purple-300 hover:bg-purple-50 transition-all hover:scale-105"
            >
              <Palette className="w-7 h-7" />
              <span className="text-sm font-semibold">Change Theme</span>
            </Button>
            <Button
              onClick={() => router.push('/dashboard/analytics')}
              variant="outline"
              className="h-auto py-7 flex-col gap-3 border-2 hover:border-purple-300 hover:bg-purple-50 transition-all hover:scale-105"
            >
              <BarChart3 className="w-7 h-7" />
              <span className="text-sm font-semibold">View Analytics</span>
            </Button>
            <Button
              onClick={() => router.push('/dashboard/settings')}
              variant="outline"
              className="h-auto py-7 flex-col gap-3 border-2 hover:border-purple-300 hover:bg-purple-50 transition-all hover:scale-105"
            >
              <Settings className="w-7 h-7" />
              <span className="text-sm font-semibold">Settings</span>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-2 shadow-soft-lg hover:shadow-soft-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Activity className="w-6 h-6 text-purple-600" />
              Recent Activity
            </CardTitle>
            <CardDescription className="mt-1">Latest visitors to your page</CardDescription>
          </CardHeader>
          <CardContent>
            {hasData && stats.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {stats.recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-center justify-between py-3 px-2 rounded-lg border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${
                        activity.type === 'view' ? 'bg-blue-500 shadow-lg shadow-blue-500/50' : 'bg-green-500 shadow-lg shadow-green-500/50'
                      }`}></div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {activity.type === 'view' ? 'Page View' : 'Link Click'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.country || 'Unknown'} · {activity.device_type || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon="📊"
                title="No activity yet"
                description="Share your page to start tracking visitors"
                action={{
                  label: 'Copy Share Link',
                  onClick: () => profile && navigator.clipboard.writeText(`https://clicky.link/${profile.slug}`)
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Profile Quick Info */}
      {profile && (
        <Card className="border-2 shadow-soft-lg hover:shadow-soft-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">Your Profile</CardTitle>
            <CardDescription className="mt-1">Quick overview of your Clicky page</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">Page URL</p>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2.5 rounded-lg flex-1 border border-purple-100">
                    clicky.link/{profile.slug}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(`https://clicky.link/${profile.slug}`)}
                    className="hover:bg-purple-50 hover:border-purple-300 transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">Title</p>
                <p className="text-base font-medium text-gray-900">{profile.title}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">Status</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${profile.published ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-gray-400'}`}></div>
                  <span className="text-sm font-semibold">
                    {profile.published ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
