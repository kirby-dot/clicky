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
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Welcome to Clicky!
          </h1>
          <p className="text-gray-600">Let&apos;s create your personalized link page</p>
        </div>

        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle>Create your Clicky profile</CardTitle>
            <CardDescription>
              Choose a unique URL for your link page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateProfile} className="space-y-4">
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Clicky URL
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500 font-medium">clicky.link/</span>
                  <Input
                    id="slug"
                    placeholder="yourname"
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    required
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Use lowercase letters, numbers, and hyphens only
                </p>
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Profile title
                </label>
                <Input
                  id="title"
                  placeholder="Your Name"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="p-3 rounded-md text-sm bg-red-50 text-red-800 border border-red-200">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={creating}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg py-6"
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Welcome back! Here&apos;s what&apos;s happening with your page.</p>
        </div>
        {profile && (
          <Button
            onClick={() => window.open(`/${profile.slug}`, '_blank')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Page
          </Button>
        )}
      </div>

      {/* Getting Started (for new users) */}
      {getSetupProgress() < 100 && (
        <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Get Started with Clicky
                </CardTitle>
                <CardDescription>Complete these steps to make the most of your page</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">{getSetupProgress()}%</div>
                <div className="text-xs text-gray-600">Complete</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {setupTasks.map((task) => {
                const Icon = task.completed ? CheckCircle2 : Circle
                return (
                  <button
                    key={task.id}
                    onClick={task.action}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      task.completed
                        ? 'bg-white border-green-300 opacity-75'
                        : 'bg-white border-purple-200 hover:border-purple-400 hover:shadow-md'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-2 ${task.completed ? 'text-green-600' : 'text-gray-400'}`} />
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
        <Card className="border-2 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>Get things done faster</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => router.push('/dashboard/builder')}
              className="h-auto py-6 flex-col gap-2 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Plus className="w-6 h-6" />
              <span className="text-sm font-semibold">Add Link</span>
            </Button>
            <Button
              onClick={() => router.push('/dashboard/appearance')}
              variant="outline"
              className="h-auto py-6 flex-col gap-2 border-2"
            >
              <Palette className="w-6 h-6" />
              <span className="text-sm font-semibold">Change Theme</span>
            </Button>
            <Button
              onClick={() => router.push('/dashboard/analytics')}
              variant="outline"
              className="h-auto py-6 flex-col gap-2 border-2"
            >
              <BarChart3 className="w-6 h-6" />
              <span className="text-sm font-semibold">View Analytics</span>
            </Button>
            <Button
              onClick={() => router.push('/dashboard/settings')}
              variant="outline"
              className="h-auto py-6 flex-col gap-2 border-2"
            >
              <Settings className="w-6 h-6" />
              <span className="text-sm font-semibold">Settings</span>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-2 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest visitors to your page</CardDescription>
          </CardHeader>
          <CardContent>
            {hasData && stats.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {stats.recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'view' ? 'bg-blue-500' : 'bg-green-500'
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
        <Card className="border-2 shadow-soft">
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>Quick overview of your Clicky page</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Page URL</p>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-gray-100 px-3 py-2 rounded-lg flex-1">
                    clicky.link/{profile.slug}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(`https://clicky.link/${profile.slug}`)}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Title</p>
                <p className="text-sm font-medium text-gray-900">{profile.title}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Status</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${profile.published ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-sm font-medium">
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
