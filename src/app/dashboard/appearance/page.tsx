'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Palette, Save, Upload } from 'lucide-react'
import type { Profile, Theme } from '@/types'

export default function AppearancePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [themes, setThemes] = useState<Theme[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)

  const supabase = createBrowserClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        setTitle(profileData.title)
        setBio(profileData.bio || '')
        setAvatarUrl(profileData.avatar_url || '')
        setSelectedTheme(profileData.theme_id)
      }

      const { data: themesData } = await supabase
        .from('themes')
        .select('*')
        .order('name')

      setThemes(themesData || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!profile) return

    setSaving(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          title,
          bio,
          avatar_url: avatarUrl,
          theme_id: selectedTheme,
        })
        .eq('id', profile.id)

      if (error) throw error

      alert('Changes saved successfully!')
    } catch (error: any) {
      alert(error.message || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No profile found</CardTitle>
          <CardDescription>Create a profile first</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appearance</h1>
          <p className="text-gray-600 mt-1">Customize your profile look</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save changes'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Your Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people about yourself..."
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Avatar URL
            </label>
            <div className="flex space-x-3">
              <Input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
              <Button variant="outline" size="icon">
                <Upload className="w-4 h-4" />
              </Button>
            </div>
            {avatarUrl && (
              <div className="mt-3">
                <img
                  src={avatarUrl}
                  alt="Avatar preview"
                  className="w-20 h-20 rounded-full object-cover"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Choose a theme for your profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {themes.map((theme) => {
              const config = theme.config as any
              return (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedTheme === theme.id
                      ? 'border-primary-600 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-3">
                    <Palette className="w-5 h-5" />
                    <span className="font-medium">{theme.name}</span>
                  </div>
                  <div className="flex space-x-1">
                    {config.colors && (
                      <>
                        <div
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: config.colors.primary }}
                        />
                        <div
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: config.colors.background }}
                        />
                        <div
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: config.colors.linkBackground }}
                        />
                      </>
                    )}
                  </div>
                  {theme.is_premium && (
                    <span className="inline-block mt-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Premium
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
