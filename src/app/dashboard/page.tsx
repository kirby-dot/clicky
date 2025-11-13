'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { slugify, isValidSlug } from '@/lib/utils'
import { Plus, ExternalLink, Eye, MousePointerClick } from 'lucide-react'
import type { Profile } from '@/types'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
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
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
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
        <Card>
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
                  <span className="text-gray-500">clicky.link/</span>
                  <Input
                    id="slug"
                    placeholder="yourname"
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    required
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

              <Button type="submit" disabled={creating} className="w-full">
                {creating ? 'Creating...' : 'Create profile'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your Clicky profile</p>
        </div>
        {profile && (
          <Button
            onClick={() => window.open(`/${profile.slug}`, '_blank')}
            variant="outline"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View profile
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
            <Eye className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500">Total views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Link Clicks</CardTitle>
            <MousePointerClick className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500">Total clicks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <MousePointerClick className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-gray-500">View to click ratio</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with your Clicky profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={() => router.push('/dashboard/links')}
            className="w-full justify-start"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add your first link
          </Button>
          <Button
            onClick={() => router.push('/dashboard/appearance')}
            className="w-full justify-start"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Customize your theme
          </Button>
        </CardContent>
      </Card>

      {/* Profile Info */}
      {profile && (
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-500">URL:</span>
                <p className="text-sm">clicky.link/{profile.slug}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Title:</span>
                <p className="text-sm">{profile.title}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Status:</span>
                <p className="text-sm">
                  {profile.published ? (
                    <span className="text-green-600">Published</span>
                  ) : (
                    <span className="text-gray-600">Draft</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
