'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { GlassPanel, GlassCard, GlassButton, GlassBadge } from '@/components/ui/glass'
import {
  Plus, ExternalLink, Eye, MousePointerClick, TrendingUp, Layout,
  BarChart3, Sparkles, Users, Link2, Activity, Clock, Zap, Edit2
} from 'lucide-react'
import type { Profile } from '@/types'

interface DashboardStats {
  totalViews: number
  totalClicks: number
  clickRate: number
  profileCount: number
  moduleCount: number
  activeProfiles: number
}

interface ProfileWithStats extends Profile {
  views: number
  clicks: number
  moduleCount: number
}

interface RecentActivity {
  type: 'view' | 'click' | 'edit'
  profile: string
  timestamp: string
  details?: string
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [profiles, setProfiles] = useState<ProfileWithStats[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Load all profiles
      const { data: profilesData } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!profilesData || profilesData.length === 0) {
        setLoading(false)
        return
      }

      // Load modules count for each profile
      const { data: modulesData } = await (supabase as any)
        .from('modules')
        .select('profile_id')
        .in('profile_id', profilesData.map((p: Profile) => p.id))

      // Load events for stats
      const { data: eventsData } = await (supabase as any)
        .from('events')
        .select('*')
        .in('profile_id', profilesData.map((p: Profile) => p.id))
        .order('timestamp', { ascending: false })
        .limit(100)

      // Calculate stats per profile
      const profilesWithStats: ProfileWithStats[] = profilesData.map((profile: Profile) => {
        const profileModules = modulesData?.filter((m: any) => m.profile_id === profile.id) || []
        const profileEvents = eventsData?.filter((e: any) => e.profile_id === profile.id) || []
        const views = profileEvents.filter((e: any) => e.event_type === 'view').length
        const clicks = profileEvents.filter((e: any) => e.event_type === 'click').length

        return {
          ...profile,
          views,
          clicks,
          moduleCount: profileModules.length
        }
      })

      setProfiles(profilesWithStats)

      // Calculate overall stats
      const totalViews = profilesWithStats.reduce((sum, p) => sum + p.views, 0)
      const totalClicks = profilesWithStats.reduce((sum, p) => sum + p.clicks, 0)
      const totalModules = profilesWithStats.reduce((sum, p) => sum + p.moduleCount, 0)
      const activeProfiles = profilesWithStats.filter(p => p.published).length

      setStats({
        totalViews,
        totalClicks,
        clickRate: totalViews > 0 ? (totalClicks / totalViews) * 100 : 0,
        profileCount: profilesData.length,
        moduleCount: totalModules,
        activeProfiles
      })

      // Create recent activity feed
      const activities: RecentActivity[] = (eventsData || [])
        .slice(0, 10)
        .map((event: any) => {
          const profile = profilesData.find((p: Profile) => p.id === event.profile_id)
          return {
            type: event.event_type,
            profile: profile?.title || 'Unknown',
            timestamp: event.timestamp,
            details: event.event_type === 'click' ? event.module_id : undefined
          }
        })

      setRecentActivity(activities)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-400"></div>
      </div>
    )
  }

  // No profiles - show onboarding
  if (profiles.length === 0) {
    return (
      <div className="p-8 h-full flex items-center justify-center">
        <GlassPanel className="p-12 max-w-2xl text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-accent-400 to-accent-600 rounded-3xl mx-auto mb-6 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-3">Welcome to Clicky!</h2>
          <p className="text-lg text-slate-600 mb-8">
            Let&apos;s create your first link-in-bio profile to get started.
            You&apos;ll be able to add links, images, videos, and more!
          </p>
          <GlassButton onClick={() => router.push('/dashboard/profiles')} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Profile
          </GlassButton>
        </GlassPanel>
      </div>
    )
  }

  return (
    <div className="p-8 h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">Dashboard</h1>
        <p className="text-lg text-slate-600">Welcome back! Here&apos;s your overview</p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100/50 rounded-xl">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm font-semibold text-slate-600 mb-1">Total Views</p>
            <p className="text-3xl font-bold text-slate-800">{stats.totalViews.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-2">Across all profiles</p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100/50 rounded-xl">
                <MousePointerClick className="w-6 h-6 text-purple-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm font-semibold text-slate-600 mb-1">Total Clicks</p>
            <p className="text-3xl font-bold text-slate-800">{stats.totalClicks.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-2">{stats.clickRate.toFixed(1)}% click rate</p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100/50 rounded-xl">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <GlassBadge variant="success">{stats.activeProfiles} active</GlassBadge>
            </div>
            <p className="text-sm font-semibold text-slate-600 mb-1">Your Profiles</p>
            <p className="text-3xl font-bold text-slate-800">{stats.profileCount}</p>
            <p className="text-xs text-slate-500 mt-2">{stats.moduleCount} total modules</p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100/50 rounded-xl">
                <Zap className="w-6 h-6 text-accent-600" />
              </div>
              <Activity className="w-5 h-5 text-accent-500" />
            </div>
            <p className="text-sm font-semibold text-slate-600 mb-1">Engagement</p>
            <p className="text-3xl font-bold text-slate-800">{stats.clickRate.toFixed(1)}%</p>
            <p className="text-xs text-slate-500 mt-2">Average across profiles</p>
          </GlassCard>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profiles Overview - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <GlassPanel className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Your Profiles</h2>
              <GlassButton
                variant="secondary"
                size="sm"
                onClick={() => router.push('/dashboard/profiles')}
              >
                View All
              </GlassButton>
            </div>

            <div className="space-y-4">
              {profiles.slice(0, 3).map((profile) => (
                <GlassCard key={profile.id} className="p-4" hover>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-accent-400 to-accent-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Link2 className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-800 truncate">{profile.title}</h3>
                        {profile.published ? (
                          <GlassBadge variant="success">Live</GlassBadge>
                        ) : (
                          <GlassBadge variant="default">Draft</GlassBadge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 truncate">/{profile.slug}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-slate-500">
                          <Eye className="w-3 h-3 inline mr-1" />
                          {profile.views} views
                        </span>
                        <span className="text-xs text-slate-500">
                          <MousePointerClick className="w-3 h-3 inline mr-1" />
                          {profile.clicks} clicks
                        </span>
                        <span className="text-xs text-slate-500">
                          <Layout className="w-3 h-3 inline mr-1" />
                          {profile.moduleCount} modules
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <GlassButton
                        variant="secondary"
                        size="sm"
                        onClick={() => router.push(`/dashboard/builder?profile=${profile.id}`)}
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Edit
                      </GlassButton>
                      {profile.published && (
                        <GlassButton
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/${profile.slug}`, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View
                        </GlassButton>
                      )}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>

            {profiles.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-600 mb-4">No profiles yet</p>
                <GlassButton onClick={() => router.push('/dashboard/profiles')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Profile
                </GlassButton>
              </div>
            )}
          </GlassPanel>
        </div>

        {/* Sidebar - Recent Activity */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <GlassPanel className="p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => router.push('/dashboard/profiles')}
                className="w-full flex items-center gap-3 p-3 bg-white/30 hover:bg-white/50 rounded-xl transition-all group text-left"
              >
                <div className="p-2 bg-blue-100/50 rounded-lg group-hover:scale-110 transition-transform">
                  <Plus className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">New Profile</p>
                  <p className="text-xs text-slate-600">Create a new page</p>
                </div>
              </button>

              <button
                onClick={() => router.push('/dashboard/analytics')}
                className="w-full flex items-center gap-3 p-3 bg-white/30 hover:bg-white/50 rounded-xl transition-all group text-left"
              >
                <div className="p-2 bg-purple-100/50 rounded-lg group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Analytics</p>
                  <p className="text-xs text-slate-600">View detailed stats</p>
                </div>
              </button>

              <button
                onClick={() => router.push('/dashboard/appearance')}
                className="w-full flex items-center gap-3 p-3 bg-white/30 hover:bg-white/50 rounded-xl transition-all group text-left"
              >
                <div className="p-2 bg-green-100/50 rounded-lg group-hover:scale-110 transition-transform">
                  <Sparkles className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Customize</p>
                  <p className="text-xs text-slate-600">Edit appearance</p>
                </div>
              </button>
            </div>
          </GlassPanel>

          {/* Recent Activity */}
          <GlassPanel className="p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.slice(0, 5).map((activity, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${
                      activity.type === 'view' ? 'bg-blue-100/50' :
                      activity.type === 'click' ? 'bg-purple-100/50' :
                      'bg-green-100/50'
                    }`}>
                      {activity.type === 'view' ? <Eye className="w-3 h-3" /> :
                       activity.type === 'click' ? <MousePointerClick className="w-3 h-3" /> :
                       <Edit2 className="w-3 h-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {activity.type === 'view' ? 'Profile viewed' :
                         activity.type === 'click' ? 'Link clicked' :
                         'Profile edited'}
                      </p>
                      <p className="text-xs text-slate-600 truncate">{activity.profile}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600">No recent activity</p>
                </div>
              )}
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  )
}
