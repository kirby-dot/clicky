'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, TrendingUp, MousePointerClick, Eye, Globe, Smartphone } from 'lucide-react'
import type { Profile, Module } from '@/types'

interface AnalyticsData {
  totalViews: number
  totalClicks: number
  clickRate: number
  topLinks: Array<{
    module: Module
    clicks: number
    views: number
  }>
  countries: Array<{
    country: string
    count: number
  }>
  devices: {
    mobile: number
    desktop: number
    tablet: number
  }
  dailyStats: Array<{
    date: string
    views: number
    clicks: number
  }>
}

export default function AnalyticsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all'>('7d')

  const supabase = createBrowserClient()

  useEffect(() => {
    loadData()
  }, [dateRange])

  const loadData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Get profile
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      const profileData = data as any

      if (profileData) {
        setProfile(profileData)

        // Get modules
        const { data: modulesData } = await (supabase as any)
          .from('modules')
          .select('*')
          .eq('profile_id', profileData.id)
          .order('position')

        setModules((modulesData as any) || [])

        // Calculate date filter
        let dateFilter = ''
        if (dateRange === '7d') {
          const sevenDaysAgo = new Date()
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
          dateFilter = sevenDaysAgo.toISOString()
        } else if (dateRange === '30d') {
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          dateFilter = thirtyDaysAgo.toISOString()
        }

        // Get analytics data
        let query = (supabase as any)
          .from('events')
          .select('*')
          .eq('profile_id', profileData.id)

        if (dateFilter) {
          query = query.gte('timestamp', dateFilter)
        }

        const { data } = await query
        const events = data as any[]

        if (events) {
          // Process analytics
          const views = events.filter(e => e.event_type === 'view').length
          const clicks = events.filter(e => e.event_type === 'click').length
          const clickRate = views > 0 ? (clicks / views) * 100 : 0

          // Top links
          const linkStats = new Map<string, { clicks: number; views: number }>()
          events.forEach(event => {
            if (event.link_id) {
              const current = linkStats.get(event.link_id) || { clicks: 0, views: 0 }
              if (event.event_type === 'click') {
                current.clicks++
              } else {
                current.views++
              }
              linkStats.set(event.link_id, current)
            }
          })

          const topLinks = Array.from(linkStats.entries())
            .map(([moduleId, stats]) => ({
              module: modulesData?.find(m => m.id === moduleId)!,
              ...stats
            }))
            .filter(item => item.module)
            .sort((a, b) => b.clicks - a.clicks)
            .slice(0, 5)

          // Countries
          const countryCounts = new Map<string, number>()
          events.forEach(event => {
            if (event.country) {
              countryCounts.set(event.country, (countryCounts.get(event.country) || 0) + 1)
            }
          })
          const countries = Array.from(countryCounts.entries())
            .map(([country, count]) => ({ country, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)

          // Devices
          const devices = {
            mobile: events.filter(e => e.device_type === 'mobile').length,
            desktop: events.filter(e => e.device_type === 'desktop').length,
            tablet: events.filter(e => e.device_type === 'tablet').length,
          }

          // Daily stats
          const dailyMap = new Map<string, { views: number; clicks: number }>()
          events.forEach(event => {
            const date = new Date(event.timestamp).toISOString().split('T')[0]
            const current = dailyMap.get(date) || { views: 0, clicks: 0 }
            if (event.event_type === 'view') {
              current.views++
            } else {
              current.clicks++
            }
            dailyMap.set(date, current)
          })
          const dailyStats = Array.from(dailyMap.entries())
            .map(([date, stats]) => ({ date, ...stats }))
            .sort((a, b) => a.date.localeCompare(b.date))

          setAnalytics({
            totalViews: views,
            totalClicks: clicks,
            clickRate,
            topLinks,
            countries,
            devices,
            dailyStats,
          })
        }
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!profile || !analytics) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-12 text-center">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2">No Analytics Data Yet</h2>
            <p className="text-gray-600">Start sharing your profile to see analytics!</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          Analytics
        </h1>
        <p className="text-gray-600">Track your profile performance and audience insights</p>
      </div>

      {/* Date Range Filter */}
      <div className="mb-6 flex gap-2">
        {[
          { value: '7d', label: 'Last 7 Days' },
          { value: '30d', label: 'Last 30 Days' },
          { value: 'all', label: 'All Time' },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setDateRange(option.value as any)}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              dateRange === option.value
                ? 'bg-primary-500 text-white shadow-soft'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-2 border-gray-200 shadow-soft hover:shadow-soft-lg transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-10 h-10 bg-gradient-to-br from-pastel-sky to-blue-400 rounded-xl flex items-center justify-center">
                <Eye className="w-5 h-5 text-gray-900" />
              </div>
              Total Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-gray-900">{analytics.totalViews.toLocaleString()}</p>
            <p className="text-sm text-gray-600 mt-1">Profile visits</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-200 shadow-soft hover:shadow-soft-lg transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-10 h-10 bg-gradient-to-br from-pastel-rose to-pink-400 rounded-xl flex items-center justify-center">
                <MousePointerClick className="w-5 h-5 text-gray-900" />
              </div>
              Total Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-gray-900">{analytics.totalClicks.toLocaleString()}</p>
            <p className="text-sm text-gray-600 mt-1">Link clicks</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-200 shadow-soft hover:shadow-soft-lg transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-10 h-10 bg-gradient-to-br from-pastel-mint to-green-400 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-gray-900" />
              </div>
              Click Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-gray-900">{analytics.clickRate.toFixed(1)}%</p>
            <p className="text-sm text-gray-600 mt-1">Engagement rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Performing Links */}
        <Card className="border-2 border-gray-200 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-500" />
              Top Performing Links
            </CardTitle>
            <CardDescription>Your most clicked modules</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.topLinks.length > 0 ? (
              <div className="space-y-4">
                {analytics.topLinks.map((link, index) => (
                  <div key={link.module.id} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{link.module.title || 'Untitled'}</p>
                      <p className="text-sm text-gray-600">
                        {link.clicks} clicks • {link.views} views
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-primary-600">
                          {link.views > 0 ? ((link.clicks / link.views) * 100).toFixed(1) : 0}%
                        </p>
                        <p className="text-xs text-gray-500">CTR</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No link clicks yet</p>
            )}
          </CardContent>
        </Card>

        {/* Geographic Breakdown */}
        <Card className="border-2 border-gray-200 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary-500" />
              Top Countries
            </CardTitle>
            <CardDescription>Where your visitors are from</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.countries.length > 0 ? (
              <div className="space-y-3">
                {analytics.countries.map((country) => {
                  const percentage = (country.count / analytics.totalViews) * 100
                  return (
                    <div key={country.country} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold text-gray-900">{country.country || 'Unknown'}</span>
                        <span className="text-gray-600">{country.count} visits</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-primary-500 to-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No geographic data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Device Breakdown */}
      <Card className="border-2 border-gray-200 shadow-soft mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary-500" />
            Device Types
          </CardTitle>
          <CardDescription>How visitors access your profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Mobile', count: analytics.devices.mobile, color: 'from-pastel-sky to-blue-400' },
              { label: 'Desktop', count: analytics.devices.desktop, color: 'from-pastel-mint to-green-400' },
              { label: 'Tablet', count: analytics.devices.tablet, color: 'from-pastel-lavender to-purple-400' },
            ].map((device) => {
              const total = analytics.devices.mobile + analytics.devices.desktop + analytics.devices.tablet
              const percentage = total > 0 ? (device.count / total) * 100 : 0
              return (
                <div key={device.label} className="text-center">
                  <div className={`w-full h-32 bg-gradient-to-br ${device.color} rounded-2xl flex items-center justify-center mb-3 shadow-soft`}>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-900">{device.count}</p>
                      <p className="text-sm text-gray-700">{percentage.toFixed(0)}%</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">{device.label}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Views Over Time */}
      <Card className="border-2 border-gray-200 shadow-soft">
        <CardHeader>
          <CardTitle>Activity Over Time</CardTitle>
          <CardDescription>Daily views and clicks</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.dailyStats.length > 0 ? (
            <div className="space-y-4">
              {analytics.dailyStats.map((day) => (
                <div key={day.date} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-gray-900">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-gray-600">
                      {day.views} views • {day.clicks} clicks
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-pastel-sky to-blue-400 h-2 rounded-full"
                        style={{ width: `${(day.views / Math.max(...analytics.dailyStats.map(d => d.views))) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-pastel-rose to-pink-400 h-2 rounded-full"
                        style={{ width: `${(day.clicks / Math.max(...analytics.dailyStats.map(d => d.clicks || 1))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No activity data yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
