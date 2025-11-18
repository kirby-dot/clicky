'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, TrendingUp, MousePointerClick, Eye, Globe, Smartphone } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
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
              module: modulesData?.find((m: any) => m.id === moduleId)!,
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

      {/* Geographic Breakdown */}
      <Card className="border-2 border-gray-200 shadow-soft mb-8">
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
                      <span className="text-gray-600">{country.count} visits ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-accent-400 to-purple-500 h-3 rounded-full transition-all"
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

      {/* Views Over Time - Line Chart */}
      <Card className="border-2 border-gray-200 shadow-soft mb-8">
        <CardHeader>
          <CardTitle>Activity Over Time</CardTitle>
          <CardDescription>Daily views and clicks trends</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.dailyStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  stroke="#64748b"
                />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                />
                <Legend />
                <Line type="monotone" dataKey="views" stroke="#0EA5E9" strokeWidth={3} dot={{ fill: '#0EA5E9', r: 4 }} name="Views" />
                <Line type="monotone" dataKey="clicks" stroke="#F43F5E" strokeWidth={3} dot={{ fill: '#F43F5E', r: 4 }} name="Clicks" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-8">No activity data yet</p>
          )}
        </CardContent>
      </Card>

      {/* Top Links - Bar Chart */}
      <Card className="border-2 border-gray-200 shadow-soft mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-500" />
            Link Performance
          </CardTitle>
          <CardDescription>Clicks by link</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.topLinks.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.topLinks}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="module.title"
                  stroke="#64748b"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Legend />
                <Bar dataKey="clicks" fill="#FF8F6B" name="Clicks" radius={[8, 8, 0, 0]} />
                <Bar dataKey="views" fill="#0EA5E9" name="Views" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-8">No link data yet</p>
          )}
        </CardContent>
      </Card>

      {/* Device Types - Pie Chart */}
      <Card className="border-2 border-gray-200 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary-500" />
            Device Distribution
          </CardTitle>
          <CardDescription>How visitors access your profile</CardDescription>
        </CardHeader>
        <CardContent>
          {(analytics.devices.mobile + analytics.devices.desktop + analytics.devices.tablet) > 0 ? (
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Mobile', value: analytics.devices.mobile },
                      { name: 'Desktop', value: analytics.devices.desktop },
                      { name: 'Tablet', value: analytics.devices.tablet },
                    ].filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#0EA5E9" />
                    <Cell fill="#10B981" />
                    <Cell fill="#A78BFA" />
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No device data yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
