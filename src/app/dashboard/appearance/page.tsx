'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Palette, Save, Upload, Eye, Plus, Check, X, Download, FileUp, Award } from 'lucide-react'
import type { Profile, Theme, ThemeConfig, Badge } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import * as LucideIcons from 'lucide-react'

// Popular Google Fonts
const GOOGLE_FONTS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Raleway',
  'Nunito',
  'Playfair Display',
  'Merriweather',
  'PT Sans',
  'Ubuntu',
  'Work Sans',
  'Quicksand',
  'DM Sans',
]

export default function AppearancePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [themes, setThemes] = useState<Theme[]>([])
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null)
  const [previewTheme, setPreviewTheme] = useState<Theme | null>(null)
  const [showCustomCreator, setShowCustomCreator] = useState(false)
  const [customTheme, setCustomTheme] = useState<ThemeConfig>({
    colors: {
      primary: '#8B5CF6',
      secondary: '#A78BFA',
      background: '#FFFFFF',
      text: '#1F2937',
      linkBackground: '#F3F4F6',
      linkText: '#1F2937',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
    spacing: 'normal',
    animations: {
      entrance: true,
      hover: 'lift',
    },
    borderRadius: 'md',
    linkStyle: 'filled',
    gradient: {
      enabled: false,
      type: 'linear',
      direction: '135deg',
      colors: ['#8B5CF6', '#A78BFA'],
    },
  })

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
        setSelectedBadge(profileData.badge_id)
      }

      const { data: themesData } = await supabase
        .from('themes')
        .select('*')
        .order('name')

      setThemes(themesData || [])

      const { data: badgesData } = await supabase
        .from('badges')
        .select('*')
        .eq('is_active', true)
        .order('position')

      setBadges(badgesData || [])
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
          badge_id: selectedBadge,
        })
        .eq('id', profile.id)

      if (error) throw error

      alert('Changes saved successfully!')
      await loadData()
    } catch (error: any) {
      alert(error.message || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleExportTheme = () => {
    if (!selectedTheme) {
      alert('Please select a theme first')
      return
    }

    const theme = themes.find(t => t.id === selectedTheme)
    if (!theme) return

    const themeExport = {
      name: theme.name,
      config: theme.config,
    }

    const blob = new Blob([JSON.stringify(themeExport, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${theme.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportTheme = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const imported = JSON.parse(text)

        if (!imported.name || !imported.config) {
          throw new Error('Invalid theme file format')
        }

        setCustomTheme(imported.config as ThemeConfig)
        setShowCustomCreator(true)
      } catch (error: any) {
        alert(error.message || 'Failed to import theme')
      }
    }
    input.click()
  }

  const handleSaveCustomTheme = async (name: string) => {
    if (!profile) return

    try {
      const { data: newTheme, error } = await supabase
        .from('themes')
        .insert({
          name,
          config: customTheme,
          is_premium: false,
          creator_id: profile.user_id,
        })
        .select()
        .single()

      if (error) throw error

      alert('Custom theme created successfully!')
      setSelectedTheme(newTheme.id)
      setShowCustomCreator(false)
      await loadData()
    } catch (error: any) {
      alert(error.message || 'Failed to create custom theme')
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

      {/* Badge Selector */}
      <Card className="border-2 border-amber-200 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Profile Badge
          </CardTitle>
          <CardDescription>Add a badge to showcase your identity or achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* No Badge Option */}
            <button
              onClick={() => setSelectedBadge(null)}
              className={`p-4 rounded-xl border-2 transition-all text-center ${
                selectedBadge === null
                  ? 'border-gray-400 bg-gray-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gray-200 flex items-center justify-center">
                <X className="w-5 h-5 text-gray-500" />
              </div>
              <p className="text-xs font-medium text-gray-700">No Badge</p>
            </button>

            {badges.map((badge) => {
              const IconComponent = (LucideIcons as any)[badge.icon] || Award
              const isSelected = selectedBadge === badge.id

              return (
                <button
                  key={badge.id}
                  onClick={() => setSelectedBadge(badge.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    isSelected
                      ? 'border-primary-500 shadow-md ring-2 ring-primary-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{
                    backgroundColor: isSelected ? `${badge.color}10` : 'white',
                  }}
                >
                  <div
                    className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${badge.color}20` }}
                  >
                    <IconComponent className="w-5 h-5" style={{ color: badge.color }} />
                  </div>
                  <p className="text-xs font-medium text-gray-900 truncate">{badge.display_name}</p>
                  {badge.description && (
                    <p className="text-xs text-gray-500 truncate mt-1">{badge.description}</p>
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-gray-200 shadow-soft">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary-500" />
                Themes
              </CardTitle>
              <CardDescription>Choose or create a theme for your profile</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleImportTheme}
                size="sm"
              >
                <FileUp className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button
                variant="outline"
                onClick={handleExportTheme}
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                onClick={() => setShowCustomCreator(true)}
                className="bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Custom
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {themes.map((theme) => {
              const config = theme.config as unknown as ThemeConfig
              const isSelected = selectedTheme === theme.id

              return (
                <motion.div
                  key={theme.id}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="relative"
                >
                  <button
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`w-full p-5 rounded-2xl border-2 transition-all text-left relative overflow-hidden group ${
                      isSelected
                        ? 'border-primary-500 shadow-soft-lg ring-4 ring-primary-200'
                        : 'border-gray-200 hover:border-gray-300 shadow-soft hover:shadow-soft-lg'
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${config.colors?.background || '#fff'} 0%, ${config.colors?.linkBackground || '#f3f4f6'} 100%)`
                    }}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}

                    <div className="mb-4">
                      <h3 className="font-bold text-lg mb-1" style={{ color: config.colors?.text }}>
                        {theme.name}
                      </h3>
                      {theme.is_premium && (
                        <span className="inline-block text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-0.5 rounded font-semibold">
                          Premium
                        </span>
                      )}
                    </div>

                    {/* Color palette */}
                    <div className="flex gap-2 mb-4">
                      <div
                        className="w-10 h-10 rounded-lg shadow-soft border-2 border-white"
                        style={{ backgroundColor: config.colors?.primary }}
                        title="Primary"
                      />
                      <div
                        className="w-10 h-10 rounded-lg shadow-soft border-2 border-white"
                        style={{ backgroundColor: config.colors?.linkBackground }}
                        title="Link BG"
                      />
                      <div
                        className="w-10 h-10 rounded-lg shadow-soft border-2 border-white"
                        style={{ backgroundColor: config.colors?.secondary }}
                        title="Secondary"
                      />
                    </div>

                    {/* Mini preview */}
                    <div className="space-y-2">
                      <div
                        className="h-8 rounded-lg flex items-center justify-center text-xs font-semibold shadow-soft"
                        style={{
                          backgroundColor: config.colors?.linkBackground,
                          color: config.colors?.linkText,
                          borderRadius: config.borderRadius === 'full' ? '9999px' :
                                       config.borderRadius === 'lg' ? '12px' :
                                       config.borderRadius === 'md' ? '8px' : '4px'
                        }}
                      >
                        Link Preview
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        setPreviewTheme(theme)
                      }}
                    >
                      <Eye className="w-3 h-3 mr-2" />
                      Preview
                    </Button>
                  </button>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewTheme && (
          <ThemePreviewModal
            theme={previewTheme}
            onClose={() => setPreviewTheme(null)}
            onApply={() => {
              setSelectedTheme(previewTheme.id)
              setPreviewTheme(null)
            }}
          />
        )}
      </AnimatePresence>

      {/* Custom Theme Creator */}
      <AnimatePresence>
        {showCustomCreator && (
          <CustomThemeCreator
            theme={customTheme}
            onChange={setCustomTheme}
            onSave={handleSaveCustomTheme}
            onClose={() => setShowCustomCreator(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Theme Preview Modal Component
function ThemePreviewModal({
  theme,
  onClose,
  onApply,
}: {
  theme: Theme
  onClose: () => void
  onApply: () => void
}) {
  const config = theme.config as unknown as ThemeConfig

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{theme.name}</h2>
            <p className="text-gray-600 text-sm">Preview how your profile will look</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto max-h-[60vh]" style={{ backgroundColor: config.colors?.background }}>
          <div className="max-w-md mx-auto space-y-4">
            {/* Mock profile header */}
            <div className="text-center">
              <div
                className="w-24 h-24 rounded-full mx-auto mb-4 shadow-soft"
                style={{
                  background: `linear-gradient(135deg, ${config.colors?.primary}, ${config.colors?.secondary})`
                }}
              />
              <h3 className="text-2xl font-bold mb-2" style={{ color: config.colors?.text }}>
                @yourname
              </h3>
              <p className="text-gray-600">This is how your profile will look</p>
            </div>

            {/* Mock links */}
            <div className="space-y-3">
              {['My Website', 'Social Media', 'Contact Me'].map((link, i) => (
                <div
                  key={i}
                  className="p-4 text-center font-semibold shadow-soft transition-transform hover:scale-105"
                  style={{
                    backgroundColor: config.colors?.linkBackground,
                    color: config.colors?.linkText,
                    borderRadius: config.borderRadius === 'full' ? '9999px' :
                                 config.borderRadius === 'lg' ? '16px' :
                                 config.borderRadius === 'md' ? '12px' : '8px'
                  }}
                >
                  {link}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={onApply}
            className="flex-1 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600"
          >
            Apply Theme
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Custom Theme Creator Component
function CustomThemeCreator({
  theme,
  onChange,
  onSave,
  onClose,
}: {
  theme: ThemeConfig
  onChange: (theme: ThemeConfig) => void
  onSave: (name: string) => void
  onClose: () => void
}) {
  const [themeName, setThemeName] = useState('')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-primary-50 to-purple-50">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              Create Custom Theme
            </h2>
            <p className="text-gray-600 text-sm">Design your perfect theme</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-white/50 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Editor */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Theme Name</label>
                <Input
                  value={themeName}
                  onChange={(e) => setThemeName(e.target.value)}
                  placeholder="My Awesome Theme"
                  className="h-12"
                />
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4">Colors</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'primary', label: 'Primary' },
                    { key: 'secondary', label: 'Secondary' },
                    { key: 'background', label: 'Background' },
                    { key: 'text', label: 'Text' },
                    { key: 'linkBackground', label: 'Link BG' },
                    { key: 'linkText', label: 'Link Text' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={theme.colors[key as keyof typeof theme.colors]}
                          onChange={(e) =>
                            onChange({
                              ...theme,
                              colors: { ...theme.colors, [key]: e.target.value },
                            })
                          }
                          className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200"
                        />
                        <Input
                          value={theme.colors[key as keyof typeof theme.colors]}
                          onChange={(e) =>
                            onChange({
                              ...theme,
                              colors: { ...theme.colors, [key]: e.target.value },
                            })
                          }
                          className="flex-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4">Fonts</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Heading Font</label>
                    <select
                      value={theme.fonts.heading}
                      onChange={(e) =>
                        onChange({
                          ...theme,
                          fonts: { ...theme.fonts, heading: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {GOOGLE_FONTS.map((font) => (
                        <option key={font} value={font} style={{ fontFamily: font }}>
                          {font}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Body Font</label>
                    <select
                      value={theme.fonts.body}
                      onChange={(e) =>
                        onChange({
                          ...theme,
                          fonts: { ...theme.fonts, body: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {GOOGLE_FONTS.map((font) => (
                        <option key={font} value={font} style={{ fontFamily: font }}>
                          {font}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4">Background Gradient</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={theme.gradient?.enabled || false}
                      onChange={(e) =>
                        onChange({
                          ...theme,
                          gradient: {
                            ...(theme.gradient || {
                              type: 'linear',
                              direction: '135deg',
                              colors: ['#8B5CF6', '#A78BFA'],
                            }),
                            enabled: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Enable Gradient Background</span>
                  </label>

                  {theme.gradient?.enabled && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Color 1</label>
                          <input
                            type="color"
                            value={theme.gradient?.colors[0] || '#8B5CF6'}
                            onChange={(e) => {
                              const newColors = [...(theme.gradient?.colors || ['#8B5CF6', '#A78BFA'])]
                              newColors[0] = e.target.value
                              onChange({
                                ...theme,
                                gradient: { ...theme.gradient!, colors: newColors },
                              })
                            }}
                            className="w-full h-10 rounded-lg cursor-pointer border-2 border-gray-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Color 2</label>
                          <input
                            type="color"
                            value={theme.gradient?.colors[1] || '#A78BFA'}
                            onChange={(e) => {
                              const newColors = [...(theme.gradient?.colors || ['#8B5CF6', '#A78BFA'])]
                              newColors[1] = e.target.value
                              onChange({
                                ...theme,
                                gradient: { ...theme.gradient!, colors: newColors },
                              })
                            }}
                            className="w-full h-10 rounded-lg cursor-pointer border-2 border-gray-200"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4">Style</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Border Radius</label>
                    <div className="grid grid-cols-5 gap-2">
                      {(['none', 'sm', 'md', 'lg', 'full'] as const).map((radius) => (
                        <button
                          key={radius}
                          onClick={() => onChange({ ...theme, borderRadius: radius })}
                          className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                            theme.borderRadius === radius
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          {radius}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Spacing</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['tight', 'normal', 'loose'] as const).map((spacing) => (
                        <button
                          key={spacing}
                          onClick={() => onChange({ ...theme, spacing })}
                          className={`px-3 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                            theme.spacing === spacing
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          {spacing}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Preview */}
            <div>
              <h3 className="text-lg font-bold mb-4">Live Preview</h3>
              <div
                className="rounded-2xl p-8 shadow-soft-lg"
                style={{
                  background: theme.gradient?.enabled
                    ? `linear-gradient(${theme.gradient.direction || '135deg'}, ${theme.gradient.colors.join(', ')})`
                    : theme.colors.background,
                }}
              >
                <div className="max-w-sm mx-auto space-y-4">
                  <div className="text-center">
                    <div
                      className="w-20 h-20 rounded-full mx-auto mb-4 shadow-soft"
                      style={{
                        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
                      }}
                    />
                    <h3
                      className="text-xl font-bold mb-2"
                      style={{
                        color: theme.colors.text,
                        fontFamily: theme.fonts.heading,
                      }}
                    >
                      @yourname
                    </h3>
                    <p
                      style={{
                        color: theme.colors.text,
                        opacity: 0.7,
                        fontFamily: theme.fonts.body,
                      }}
                    >
                      Your bio goes here
                    </p>
                  </div>

                  <div className="space-y-2">
                    {['Link One', 'Link Two', 'Link Three'].map((link, i) => (
                      <div
                        key={i}
                        className="p-3 text-center font-semibold shadow-soft"
                        style={{
                          backgroundColor: theme.colors.linkBackground,
                          color: theme.colors.linkText,
                          borderRadius: theme.borderRadius === 'full' ? '9999px' :
                                       theme.borderRadius === 'lg' ? '16px' :
                                       theme.borderRadius === 'md' ? '12px' : '8px',
                          fontFamily: theme.fonts.body,
                        }}
                      >
                        {link}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3 bg-gray-50">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!themeName.trim()) {
                alert('Please enter a theme name')
                return
              }
              onSave(themeName)
            }}
            className="flex-1 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Theme
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
