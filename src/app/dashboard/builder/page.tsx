'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { GlassPanel, GlassButton, GlassInput, GlassBadge } from '@/components/ui/glass'
import {
  Search, Plus, GripVertical, MoreHorizontal, ChevronDown, ChevronRight,
  Link as LinkIcon, Type, Image as ImageIcon, Video, Mail, Users, Eye, EyeOff
} from 'lucide-react'
import type { Module, Section, Profile } from '@/types'

// Module type icons mapping
const MODULE_ICONS: Record<string, React.ReactNode> = {
  link: <LinkIcon className="w-4 h-4" />,
  header: <Type className="w-4 h-4" />,
  text: <Type className="w-4 h-4" />,
  image: <ImageIcon className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
  'email-capture': <Mail className="w-4 h-4" />,
  'contact-form': <Mail className="w-4 h-4" />,
  'social-links': <Users className="w-4 h-4" />,
}

interface SectionWithModules extends Section {
  modules: Module[]
}

function BuilderContent() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sections, setSections] = useState<SectionWithModules[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createBrowserClient()

  const loadData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Get profile ID from URL parameter
      const profileId = searchParams.get('profile')

      let profileData

      if (profileId) {
        // Load specific profile by ID
        const { data } = await (supabase as any)
          .from('profiles')
          .select('*')
          .eq('id', profileId)
          .eq('user_id', user.id) // Ensure user owns this profile
          .single()

        profileData = data
      } else {
        // No profile specified, load user's first profile
        const { data } = await (supabase as any)
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        profileData = data

        // Update URL with the loaded profile ID
        if (profileData) {
          router.replace(`/dashboard/builder?profile=${profileData.id}`)
        }
      }

      if (!profileData) {
        // No profiles found, redirect to dashboard to create one
        router.push('/dashboard')
        return
      }

      setProfile(profileData)

      // Load sections with modules
      const { data: sectionsData } = await (supabase as any)
        .from('sections')
        .select('*')
        .eq('profile_id', profileData.id)
        .order('order', { ascending: true })

      const { data: modulesData } = await (supabase as any)
        .from('modules')
        .select('*')
        .eq('profile_id', profileData.id)
        .order('order', { ascending: true })

      // Group modules by section
      const sectionsWithModules: SectionWithModules[] = (sectionsData || []).map((section: Section) => ({
        ...section,
        modules: (modulesData || []).filter((m: Module) => m.section_id === section.id)
      }))

      setSections(sectionsWithModules)

      // Expand all sections by default
      setExpandedSections(new Set(sectionsData?.map((s: Section) => s.id) || []))
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }, [searchParams, supabase, router])

  useEffect(() => {
    loadData()
  }, [loadData])

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const handleAddModule = () => {
    // TODO: Implement add module modal
    alert('Add Module functionality coming soon!')
  }

  const handleAddSection = () => {
    // TODO: Implement add section
    alert('Add Section functionality coming soon!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-400"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-8">
        <GlassPanel className="p-12 text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-2">No Profile Found</h2>
          <p className="text-slate-600 mb-6">Create a profile to start building</p>
          <GlassButton onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </GlassButton>
        </GlassPanel>
      </div>
    )
  }

  const filteredSections = sections.map(section => ({
    ...section,
    modules: section.modules.filter(m =>
      m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.type.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.modules.length > 0 || searchQuery === '')

  return (
    <div className="p-8 h-full overflow-y-auto">
      {/* Header */}
      <GlassPanel className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Manage Profile</h1>
            <p className="text-slate-600 text-sm mt-1">{profile.title}</p>
          </div>
          <div className="flex items-center gap-3">
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={() => window.open(`/${profile.slug}`, '_blank')}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </GlassButton>
            <GlassButton onClick={handleAddModule}>
              <Plus className="w-4 h-4 mr-2" />
              Add Module
            </GlassButton>
          </div>
        </div>

        {/* Search Bar */}
        <GlassInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search modules..."
          icon={<Search className="w-4 h-4" />}
        />
      </GlassPanel>

      {/* Sections & Modules List */}
      <GlassPanel className="p-6">
        <div className="space-y-2">
          {filteredSections.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600 mb-4">No modules found</p>
              <GlassButton onClick={handleAddSection}>
                <Plus className="w-4 h-4 mr-2" />
                Create Section
              </GlassButton>
            </div>
          ) : (
            filteredSections.map((section) => (
              <div key={section.id} className="space-y-1">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center gap-2 p-3 hover:bg-white/30 rounded-lg transition-all group"
                >
                  {expandedSections.has(section.id) ? (
                    <ChevronDown className="w-4 h-4 text-slate-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  )}
                  <span className="font-semibold text-slate-800">
                    {section.title || 'Untitled Section'}
                  </span>
                  <span className="text-sm text-slate-500">
                    ({section.modules.length})
                  </span>
                  <div className="flex-1" />
                  {section.active ? (
                    <GlassBadge variant="success">Active</GlassBadge>
                  ) : (
                    <GlassBadge variant="default">Hidden</GlassBadge>
                  )}
                </button>

                {/* Modules List */}
                {expandedSections.has(section.id) && (
                  <div className="ml-6 space-y-1">
                    {section.modules.map((module) => (
                      <div
                        key={module.id}
                        className="flex items-center gap-3 p-3 bg-white/20 hover:bg-white/40 rounded-lg transition-all group cursor-pointer"
                      >
                        {/* Drag Handle */}
                        <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />

                        {/* Module Icon */}
                        <div className="p-2 bg-blue-100/50 rounded-lg">
                          {MODULE_ICONS[module.type] || <LinkIcon className="w-4 h-4 text-blue-600" />}
                        </div>

                        {/* Module Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 truncate text-sm">
                            {module.title || `${module.type} module`}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {module.type}
                          </p>
                        </div>

                        {/* Tags */}
                        <div className="flex items-center gap-2">
                          {module.active ? (
                            <GlassBadge variant="success">Active</GlassBadge>
                          ) : (
                            <GlassBadge variant="default">Draft</GlassBadge>
                          )}
                          {module.clicks > 0 && (
                            <span className="text-xs text-slate-500">
                              {module.clicks} clicks
                            </span>
                          )}
                        </div>

                        {/* More Options */}
                        <button className="p-2 hover:bg-white/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4 text-slate-600" />
                        </button>
                      </div>
                    ))}

                    {/* Add Module to Section Button */}
                    <button
                      onClick={handleAddModule}
                      className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 hover:border-accent-400 hover:bg-accent-50/50 rounded-lg transition-all text-slate-600 hover:text-accent-600"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-sm font-semibold">Add Module</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add Section Button */}
        {sections.length > 0 && (
          <div className="mt-6 pt-6 border-t border-white/30">
            <GlassButton
              variant="secondary"
              onClick={handleAddSection}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Section
            </GlassButton>
          </div>
        )}
      </GlassPanel>
    </div>
  )
}

export default function BuilderPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-400"></div>
      </div>
    }>
      <BuilderContent />
    </Suspense>
  )
}
