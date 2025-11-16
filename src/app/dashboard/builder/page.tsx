'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ModuleRenderer } from '@/components/modules/module-renderer'
import { SectionEditor } from '@/components/sections/section-editor'
import { SectionCanvas } from '@/components/builder/section-canvas'
import { StyleEditor } from '@/components/style/style-editor'
import { StyleProvider } from '@/components/style/style-provider'
import {
  Trash2,
  GripVertical,
  ExternalLink,
  Eye,
  EyeOff,
  Link as LinkIcon,
  Type,
  Image as ImageIcon,
  Minus,
  Share2,
  Video,
  Music,
  ArrowUp,
  Edit2,
  RefreshCw,
  Plus,
  MousePointerClick,
  HelpCircle,
  Clock,
  Mail,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Facebook,
  Github,
  MessageCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Copy,
  Smartphone,
  Tablet,
  Monitor,
  Settings,
  Save,
  X,
  Check,
  User,
  Layout,
  Layers,
  FolderPlus,
  Palette,
  Send,
  Inbox,
} from 'lucide-react'
import type { Module, ModuleType, Profile, Section, ProfileStyle } from '@/types'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  DragStartEvent,
  DragOverlay,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface ModuleTemplate {
  type: ModuleType
  icon: React.ReactNode
  label: string
  description: string
  defaultContent: any
  color: string
  category: 'links' | 'text' | 'media' | 'social' | 'utility'
}

const MODULE_TEMPLATES: ModuleTemplate[] = [
  {
    type: 'link',
    icon: <LinkIcon className="w-4 h-4" />,
    label: 'Link Button',
    description: 'Clickable link',
    defaultContent: { url: 'https://example.com' },
    color: 'bg-pastel-sky',
    category: 'links'
  },
  {
    type: 'header',
    icon: <Type className="w-4 h-4" />,
    label: 'Header',
    description: 'Section title',
    defaultContent: { text: 'New Heading', level: 'h2', align: 'center' },
    color: 'bg-pastel-lavender',
    category: 'text'
  },
  {
    type: 'text',
    icon: <Type className="w-4 h-4" />,
    label: 'Text Block',
    description: 'Paragraph',
    defaultContent: { text: 'Add your text...', align: 'center' },
    color: 'bg-pastel-peach',
    category: 'text'
  },
  {
    type: 'image',
    icon: <ImageIcon className="w-4 h-4" />,
    label: 'Image',
    description: 'Photo/graphic',
    defaultContent: { url: '', alt: '' },
    color: 'bg-pastel-mint',
    category: 'media'
  },
  {
    type: 'divider',
    icon: <Minus className="w-4 h-4" />,
    label: 'Divider',
    description: 'Separator line',
    defaultContent: { style: 'solid' },
    color: 'bg-pastel-sage',
    category: 'utility'
  },
  {
    type: 'video',
    icon: <Video className="w-4 h-4" />,
    label: 'Video',
    description: 'YouTube/Vimeo',
    defaultContent: { url: '' },
    color: 'bg-pastel-rose',
    category: 'media'
  },
  {
    type: 'music',
    icon: <Music className="w-4 h-4" />,
    label: 'Music',
    description: 'Spotify/etc',
    defaultContent: { url: '' },
    color: 'bg-pastel-butter',
    category: 'media'
  },
  {
    type: 'social-links',
    icon: <Share2 className="w-4 h-4" />,
    label: 'Social Links',
    description: 'Social icons',
    defaultContent: { links: [], layout: 'horizontal' },
    color: 'bg-pastel-lilac',
    category: 'social'
  },
  {
    type: 'spacer',
    icon: <ArrowUp className="w-4 h-4" />,
    label: 'Spacer',
    description: 'Empty space',
    defaultContent: { height: 32 },
    color: 'bg-gray-100',
    category: 'utility'
  },
  {
    type: 'button',
    icon: <MousePointerClick className="w-4 h-4" />,
    label: 'Button/CTA',
    description: 'Call-to-action',
    defaultContent: { url: '', text: 'Click Here', style: 'primary' },
    color: 'bg-pastel-rose',
    category: 'links'
  },
  {
    type: 'accordion',
    icon: <HelpCircle className="w-4 h-4" />,
    label: 'Accordion/FAQ',
    description: 'Expandable Q&A',
    defaultContent: { question: 'Question?', answer: 'Answer here...' },
    color: 'bg-pastel-mint',
    category: 'utility'
  },
  {
    type: 'countdown',
    icon: <Clock className="w-4 h-4" />,
    label: 'Countdown',
    description: 'Timer/Launch',
    defaultContent: { targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), title: 'Coming Soon' },
    color: 'bg-pastel-lavender',
    category: 'utility'
  },
  {
    type: 'email',
    icon: <Mail className="w-4 h-4" />,
    label: 'Email Button',
    description: 'Contact button',
    defaultContent: { email: '', buttonText: 'Get in Touch' },
    color: 'bg-pastel-sage',
    category: 'links'
  },
  {
    type: 'button-grid',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>,
    label: 'Button Grid',
    description: '2-3 columns',
    defaultContent: { buttons: [{ title: 'Button 1', url: '' }, { title: 'Button 2', url: '' }], columns: 2 },
    color: 'bg-pastel-butter',
    category: 'links'
  },
  {
    type: 'two-column',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 4H5a1 1 0 00-1 1v14a1 1 0 001 1h4M9 4v16M9 4h10a1 1 0 011 1v14a1 1 0 01-1 1H9" /></svg>,
    label: 'Two Column',
    description: 'Split layout',
    defaultContent: {
      leftModuleId: null,
      rightModuleId: null,
      ratio: '50-50'
    },
    color: 'bg-pastel-sky',
    category: 'utility'
  },
  {
    type: 'email-capture',
    icon: <Inbox className="w-4 h-4" />,
    label: 'Email Capture',
    description: 'Grow your list',
    defaultContent: {
      title: 'Join my mailing list',
      description: 'Get exclusive updates delivered straight to your inbox.',
      placeholder: 'Enter your email',
      buttonText: 'Subscribe',
      successMessage: 'Thanks for subscribing! Check your inbox.'
    },
    color: 'bg-pastel-mint',
    category: 'utility'
  },
  {
    type: 'contact-form',
    icon: <Send className="w-4 h-4" />,
    label: 'Contact Form',
    description: 'Get messages',
    defaultContent: {
      title: 'Get in Touch',
      description: 'Send me a message and I\'ll get back to you soon.',
      namePlaceholder: 'Your name',
      emailPlaceholder: 'Your email',
      messagePlaceholder: 'Your message',
      buttonText: 'Send Message',
      successMessage: 'Message sent! I\'ll get back to you soon.',
      requireName: false,
      requireEmail: false
    },
    color: 'bg-pastel-rose',
    category: 'utility'
  },
]

function BuilderPageContent() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [editingSection, setEditingSection] = useState<Section | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [previewKey, setPreviewKey] = useState(0)
  const [saving, setSaving] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [showStyleEditor, setShowStyleEditor] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(true)
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'tablet' | 'desktop'>('mobile')
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [profileStyle, setProfileStyle] = useState<Partial<ProfileStyle>>({})

  const supabase = createBrowserClient()
  const searchParams = useSearchParams()
  const router = useRouter()
  const profileIdFromUrl = searchParams.get('profile')

  // Separate sensors for mouse/touch and keyboard
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  })
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  })
  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  })

  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor)

  useEffect(() => {
    loadData()
  }, [profileIdFromUrl])

  const loadData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Load all user profiles for the profile switcher
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      setProfiles(allProfiles || [])

      let profileData

      // If a specific profile ID is provided in the URL, load that profile
      if (profileIdFromUrl) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profileIdFromUrl)
          .eq('user_id', user.id) // Security: ensure the profile belongs to the user
          .maybeSingle()

        profileData = data
      } else {
        // Otherwise, load the user's first profile
        profileData = allProfiles && allProfiles.length > 0 ? allProfiles[0] : null
      }

      if (!profileData) {
        // No profile found - redirect to profiles page to create one
        // Keep loading true while redirecting to avoid showing error message
        router.push('/dashboard/profiles')
        return
      }

      setProfile(profileData)

      // Load style from profile
      if (profileData.style) {
        setProfileStyle(profileData.style as Partial<ProfileStyle>)
      }

      // Load sections
      const { data: sectionsData } = await supabase
        .from('sections')
        .select('*')
        .eq('profile_id', profileData.id)
        .order('order')

      setSections((sectionsData as Section[]) || [])

      const { data: modulesData } = await supabase
        .from('modules')
        .select('*')
        .eq('profile_id', profileData.id)
        .order('position')

      setModules((modulesData as Module[]) || [])
      setLoading(false)
    } catch (error) {
      console.error('Error loading data:', error)
      setLoading(false)
    }
  }

  const refreshPreview = useCallback(() => {
    setPreviewKey(prev => prev + 1)
  }, [])

  const handleAddModule = async (template: ModuleTemplate, sectionId?: string | null, columnIndex?: number) => {
    if (!profile) return

    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('modules')
        .insert({
          profile_id: profile.id,
          type: template.type,
          title: template.label,
          content: template.defaultContent,
          position: modules.length,
          section_id: sectionId || null,
          column_index: columnIndex !== undefined ? columnIndex : 0,
        })
        .select()
        .single()

      if (error) throw error

      setModules([...modules, data as Module])
      setTimeout(refreshPreview, 100)
    } catch (error: any) {
      console.error('Error adding module:', error)
      alert('Error adding module: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleMoveModuleToSection = async (moduleId: string, sectionId: string | null, columnIndex: number) => {
    try {
      const { error } = await supabase
        .from('modules')
        .update({
          section_id: sectionId,
          column_index: columnIndex,
        })
        .eq('id', moduleId)

      if (error) throw error

      setModules(modules.map((m) =>
        m.id === moduleId
          ? { ...m, section_id: sectionId, column_index: columnIndex }
          : m
      ))
      setTimeout(refreshPreview, 100)
    } catch (error: any) {
      console.error('Error moving module:', error)
      alert('Error moving module: ' + error.message)
    }
  }

  const handleDeleteModule = async (id: string) => {
    if (!confirm('Delete this module?')) return

    try {
      const { error } = await supabase.from('modules').delete().eq('id', id)

      if (error) throw error

      setModules(modules.filter((m) => m.id !== id))
      setTimeout(refreshPreview, 100)
    } catch (error) {
      console.error('Error deleting module:', error)
    }
  }

  const handleToggleActive = async (module: Module) => {
    try {
      const { error } = await supabase
        .from('modules')
        .update({ active: !module.active })
        .eq('id', module.id)

      if (error) throw error

      setModules(
        modules.map((m) => (m.id === module.id ? { ...m, active: !m.active } : m))
      )
      setTimeout(refreshPreview, 100)
    } catch (error) {
      console.error('Error updating module:', error)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeData = active.data.current
    const overData = over.data.current

    // Handle dropping a module into a column
    if (activeData?.type === 'module' && overData?.type === 'column') {
      const moduleId = active.id as string
      const sectionId = overData.sectionId
      const columnIndex = overData.columnIndex

      await handleMoveModuleToSection(moduleId, sectionId, columnIndex)
      return
    }

    // Handle reordering sections
    if (activeData?.type === 'section' && overData?.type === 'section') {
      if (active.id === over.id) return

      const oldIndex = sections.findIndex((s) => s.id === active.id)
      const newIndex = sections.findIndex((s) => s.id === over.id)

      if (oldIndex === -1 || newIndex === -1) return

      const newSections = arrayMove(sections, oldIndex, newIndex)
      setSections(newSections)

      // Update order in database
      try {
        const updates = newSections.map((section, index) =>
          supabase.from('sections').update({ order: index }).eq('id', section.id)
        )
        await Promise.all(updates)
        setTimeout(refreshPreview, 100)
      } catch (error) {
        console.error('Error updating section order:', error)
      }
      return
    }

    // Handle reordering modules
    if (active.id === over.id) return

    const oldIndex = modules.findIndex((m) => m.id === active.id)
    const newIndex = modules.findIndex((m) => m.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    const newModules = arrayMove(modules, oldIndex, newIndex)
    setModules(newModules)

    // Update positions in database
    try {
      const updates = newModules.map((module, index) =>
        supabase.from('modules').update({ position: index }).eq('id', module.id)
      )
      await Promise.all(updates)
      setTimeout(refreshPreview, 100)
    } catch (error) {
      console.error('Error updating positions:', error)
    }
  }

  const handleUpdateModule = async (module: Module) => {
    try {
      const { error } = await supabase
        .from('modules')
        .update({
          title: module.title,
          content: module.content,
        })
        .eq('id', module.id)

      if (error) throw error

      setModules(modules.map((m) => (m.id === module.id ? module : m)))
      setEditingModule(null)
      setTimeout(refreshPreview, 100)
    } catch (error: any) {
      console.error('Error updating module:', error)
      alert('Error updating module: ' + error.message)
    }
  }

  // Section Management Functions
  const handleAddSection = async () => {
    if (!profile) return

    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('sections')
        .insert({
          profile_id: profile.id,
          title: 'New Section',
          order: sections.length,
          layout: {
            columns: 1,
            gap: 16,
            mobileColumns: 1,
            alignment: 'center',
          },
          style: {
            backgroundColor: null,
            backgroundImage: null,
            backgroundGradient: null,
            padding: { top: 24, bottom: 24, left: 16, right: 16 },
            margin: { top: 0, bottom: 0 },
            borderRadius: 0,
            shadow: 'none',
            fullWidth: false,
          },
        })
        .select()
        .single()

      if (error) throw error

      setSections([...sections, data as Section])
      setEditingSection(data as Section)
    } catch (error: any) {
      console.error('Error adding section:', error)
      alert('Error adding section: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateSection = async (section: Section) => {
    try {
      const { error } = await supabase
        .from('sections')
        .update({
          title: section.title,
          layout: section.layout,
          style: section.style,
        })
        .eq('id', section.id)

      if (error) throw error

      setSections(sections.map((s) => (s.id === section.id ? section : s)))
      setEditingSection(null)
      setTimeout(refreshPreview, 100)
    } catch (error: any) {
      console.error('Error updating section:', error)
      alert('Error updating section: ' + error.message)
    }
  }

  const handleDeleteSection = async (id: string) => {
    if (!confirm('Delete this section? All modules in this section will also be deleted.')) return

    try {
      const { error } = await supabase.from('sections').delete().eq('id', id)

      if (error) throw error

      setSections(sections.filter((s) => s.id !== id))
      setModules(modules.filter((m) => m.section_id !== id))
      setTimeout(refreshPreview, 100)
    } catch (error) {
      console.error('Error deleting section:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-500"></div>
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

  const activeModule = activeId ? modules.find(m => m.id === activeId) : null

  // Filter modules by search and category
  const filteredTemplates = MODULE_TEMPLATES.filter(template => {
    const matchesSearch = template.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === 'all' || template.category === activeCategory
    return matchesSearch && matchesCategory
  })

  // Get device width for preview
  const deviceWidths = {
    mobile: '375px',
    tablet: '768px',
    desktop: '100%'
  }

  // Category config
  const categories = [
    { id: 'all', label: 'All Modules', icon: <Type className="w-4 h-4" /> },
    { id: 'links', label: 'Links & Buttons', icon: <LinkIcon className="w-4 h-4" /> },
    { id: 'text', label: 'Text', icon: <Type className="w-4 h-4" /> },
    { id: 'media', label: 'Media', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'social', label: 'Social', icon: <Share2 className="w-4 h-4" /> },
    { id: 'utility', label: 'Utility', icon: <Settings className="w-4 h-4" /> },
  ]

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">Page Builder</h1>

          {/* Profile Indicator & Switcher */}
          {profile && (
            <div className="relative">
              <button
                onClick={() => setShowProfileSwitcher(!showProfileSwitcher)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-pastel-sky to-pastel-lavender rounded-lg hover:shadow-soft transition-all"
              >
                <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-purple-500 rounded-md flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">{profile.title}</p>
                  <p className="text-xs text-gray-600">clicky.com/{profile.slug}</p>
                </div>
                <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showProfileSwitcher ? 'rotate-90' : ''}`} />
              </button>

              {/* Profile Switcher Dropdown */}
              {showProfileSwitcher && profiles.length > 1 && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl border border-gray-200 shadow-lg z-50">
                  <div className="p-2 max-h-80 overflow-y-auto">
                    {profiles.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          router.push(`/dashboard/builder?profile=${p.id}`)
                          setShowProfileSwitcher(false)
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                          p.id === profile.id ? 'bg-purple-50' : ''
                        }`}
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-sm font-semibold text-gray-900 truncate">{p.title}</p>
                          <p className="text-xs text-gray-600 truncate">{p.slug}</p>
                        </div>
                        {p.id === profile.id && (
                          <Check className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="p-2 border-t border-gray-200">
                    <button
                      onClick={() => {
                        router.push('/dashboard/profiles')
                        setShowProfileSwitcher(false)
                      }}
                      className="w-full flex items-center justify-center gap-2 p-2 text-sm font-semibold text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Manage Profiles
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Copy URL & View Live */}
          {profile?.slug && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/${profile.slug}`)
                  setCopiedUrl(true)
                  setTimeout(() => setCopiedUrl(false), 2000)
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Copy profile URL"
              >
                {copiedUrl ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-green-600 font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy URL
                  </>
                )}
              </button>
              <a
                href={`/${profile.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View Live
              </a>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Device Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`p-2 rounded ${deviceMode === 'mobile' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
              title="Mobile view"
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeviceMode('tablet')}
              className={`p-2 rounded ${deviceMode === 'tablet' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
              title="Tablet view"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`p-2 rounded ${deviceMode === 'desktop' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
              title="Desktop view"
            >
              <Monitor className="w-4 h-4" />
            </button>
          </div>

          <Button
            onClick={() => setShowStyleEditor(true)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Palette className="w-4 h-4" />
            Style
          </Button>

          <Button
            onClick={refreshPreview}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Three-Panel Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Module Library */}
        {!leftSidebarCollapsed && (
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            {/* Search & Categories */}
            <div className="p-4 border-b border-gray-200 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search modules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      activeCategory === cat.id
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sections */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Sections
                </h3>
                <Button
                  onClick={handleAddSection}
                  size="sm"
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                  disabled={saving}
                >
                  <FolderPlus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              </div>

              {sections.length === 0 ? (
                <div className="text-center py-4 text-xs text-gray-500 bg-gray-50 rounded-lg">
                  No sections yet. Add a section to organize your modules.
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {sections
                    .sort((a, b) => a.order - b.order)
                    .map((section) => (
                      <div
                        key={section.id}
                        className="flex items-center justify-between p-2 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Layout className="w-3 h-3 text-purple-600 flex-shrink-0" />
                          <span className="text-xs font-medium text-purple-900 truncate">
                            {section.title || 'Untitled Section'}
                          </span>
                          <span className="text-xs text-purple-600">
                            ({section.layout.columns} col)
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingSection(section)}
                            className="p-1 hover:bg-purple-200 rounded"
                            title="Edit section"
                          >
                            <Edit2 className="w-3 h-3 text-purple-700" />
                          </button>
                          <button
                            onClick={() => handleDeleteSection(section.id)}
                            className="p-1 hover:bg-red-100 rounded"
                            title="Delete section"
                          >
                            <Trash2 className="w-3 h-3 text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Module Templates */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No modules found
                </div>
              ) : (
                filteredTemplates.map((template) => (
                  <button
                    key={template.type}
                    onClick={() => handleAddModule(template)}
                    disabled={saving}
                    className={`w-full p-3 ${template.color} rounded-xl text-left hover:shadow-md transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        {template.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-gray-900">{template.label}</div>
                        <div className="text-xs text-gray-600 truncate">{template.description}</div>
                      </div>
                      <Plus className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Collapse Button */}
            <button
              onClick={() => setLeftSidebarCollapsed(true)}
              className="p-2 border-t border-gray-200 hover:bg-gray-50 flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        )}

        {/* Collapsed Left Sidebar */}
        {leftSidebarCollapsed && (
          <button
            onClick={() => setLeftSidebarCollapsed(false)}
            className="w-12 bg-white border-r border-gray-200 hover:bg-gray-50 flex items-center justify-center"
          >
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        )}

        {/* Center - Canvas/Preview */}
        <div className="flex-1 flex flex-col bg-gray-100 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8 flex justify-center">
            {profile && (
              <div
                className="transition-all duration-300 bg-white shadow-2xl rounded-2xl overflow-hidden"
                style={{
                  width: deviceWidths[deviceMode],
                  maxWidth: '100%',
                  height: 'fit-content',
                  minHeight: deviceMode === 'mobile' ? '667px' : '600px'
                }}
              >
                <StyleProvider style={profileStyle}>
                  <div
                    className="relative w-full"
                    style={{
                      background: profileStyle.backgroundColor || '#ffffff',
                      backgroundImage: profileStyle.backgroundGradient || (profileStyle.backgroundImage ? `url(${profileStyle.backgroundImage})` : undefined),
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      minHeight: 'inherit'
                    }}
                  >
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={modules.map((m) => m.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <SectionCanvas
                          sections={sections}
                          modules={modules}
                          profileId={profile.id}
                          onEditSection={(section) => setEditingSection(section)}
                          onDeleteSection={handleDeleteSection}
                          onSelectModule={(module) => {
                            setSelectedModule(module)
                            setRightPanelCollapsed(false)
                          }}
                          onDeleteModule={handleDeleteModule}
                          onToggleActive={handleToggleActive}
                          selectedModuleId={selectedModule?.id}
                        />
                      </SortableContext>
                    </DndContext>
                  </div>
                </StyleProvider>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Properties */}
        {!rightPanelCollapsed && selectedModule && (
          <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Module Settings</h3>
              <button
                onClick={() => {
                  setRightPanelCollapsed(true)
                  setSelectedModule(null)
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <PropertiesPanel
                module={selectedModule}
                modules={modules}
                onUpdate={async (updatedModule) => {
                  await handleUpdateModule(updatedModule)
                  setSelectedModule(updatedModule)
                }}
              />
            </div>
          </div>
        )}

        {/* Collapsed Right Panel Indicator */}
        {rightPanelCollapsed && selectedModule && (
          <button
            onClick={() => setRightPanelCollapsed(false)}
            className="w-12 bg-white border-l border-gray-200 hover:bg-gray-50 flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Edit Module Modal */}
      {editingModule && (
        <ModuleEditor
          module={editingModule}
          modules={modules}
          onSave={handleUpdateModule}
          onCancel={() => setEditingModule(null)}
        />
      )}

      {/* Edit Section Modal */}
      {editingSection && (
        <SectionEditor
          section={editingSection}
          onSave={handleUpdateSection}
          onCancel={() => setEditingSection(null)}
        />
      )}

      {/* Style Editor Modal */}
      {showStyleEditor && (
        <StyleEditor
          style={profileStyle}
          onSave={async (newStyle) => {
            if (!profile) return
            try {
              const { error } = await supabase
                .from('profiles')
                .update({ style: newStyle })
                .eq('id', profile.id)

              if (error) {
                console.error('Supabase error:', error)
                throw new Error(`Database error: ${error.message}\nDetails: ${JSON.stringify(error)}`)
              }

              setProfileStyle(newStyle)
              setShowStyleEditor(false)
              setTimeout(refreshPreview, 100)
            } catch (error: any) {
              console.error('Error saving style:', error)
              alert(`Error saving style:\n\n${error.message || error}`)
            }
          }}
          onCancel={() => setShowStyleEditor(false)}
        />
      )}
    </div>
  )
}

// In-Canvas Module with hover actions
function InCanvasModule({
  module,
  profileId,
  index,
  isSelected,
  onSelect,
  onDelete,
  onToggleActive,
  onDuplicate,
}: {
  module: Module
  profileId: string
  index: number
  isSelected: boolean
  onSelect: () => void
  onDelete: (id: string) => void
  onToggleActive: (module: Module) => void
  onDuplicate: (module: Module) => void
}) {
  const [isHovered, setIsHovered] = useState(false)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const template = MODULE_TEMPLATES.find((t) => t.type === module.type)

  return (
    <div
      ref={setNodeRef}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
      className={`relative group cursor-pointer transition-all ${
        isSelected
          ? 'ring-2 ring-purple-500 ring-offset-2'
          : 'hover:ring-2 hover:ring-gray-300'
      } ${!module.active ? 'opacity-60' : ''} rounded-lg`}
    >
      {/* Module Preview */}
      <div className="pointer-events-none">
        <ModuleRenderer module={module} profileId={profileId} index={index} />
      </div>

      {/* Hover Overlay with Actions */}
      {(isHovered || isSelected) && (
        <div className="absolute inset-0 bg-black/5 rounded-lg flex items-center justify-center gap-2 pointer-events-auto">
          <button
            {...attributes}
            {...listeners}
            className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-4 h-4 text-gray-600" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleActive(module)
            }}
            className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50"
            title={module.active ? 'Hide module' : 'Show module'}
          >
            {module.active ? (
              <Eye className="w-4 h-4 text-gray-600" />
            ) : (
              <EyeOff className="w-4 h-4 text-gray-600" />
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onDuplicate(module)
            }}
            className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50"
            title="Duplicate"
          >
            <Copy className="w-4 h-4 text-gray-600" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              if (confirm('Delete this module?')) {
                onDelete(module.id)
              }
            }}
            className="p-2 bg-white rounded-lg shadow-md hover:bg-red-50"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}

      {/* Module Type Badge */}
      {(isHovered || isSelected) && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-white rounded-md shadow-sm flex items-center gap-1.5">
          {template?.icon}
          <span className="text-xs font-medium text-gray-700">{template?.label}</span>
        </div>
      )}
    </div>
  )
}

// Drag overlay card
function InCanvasModuleCard({ module, profileId, index, isDragging = false }: { module: Module; profileId: string; index: number; isDragging?: boolean }) {
  return (
    <div className={`p-4 bg-white rounded-lg border-2 border-gray-300 ${isDragging ? 'shadow-2xl' : ''}`}>
      <ModuleRenderer module={module} profileId={profileId} index={index} />
    </div>
  )
}

// Properties Panel for editing selected module
function PropertiesPanel({
  module,
  modules,
  onUpdate,
}: {
  module: Module
  modules: Module[]
  onUpdate: (module: Module) => void
}) {
  const [editedModule, setEditedModule] = useState<Module>(module)
  const [uploading, setUploading] = useState(false)
  const supabase = createBrowserClient()

  // Update local state when module prop changes
  useEffect(() => {
    setEditedModule(module)
  }, [module])

  const updateContent = (key: string, value: any) => {
    setEditedModule({
      ...editedModule,
      content: {
        ...editedModule.content,
        [key]: value,
      },
    })
  }

  const handleSave = () => {
    onUpdate(editedModule)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('images').getPublicUrl(fileName)
      updateContent(key, data.publicUrl)
    } catch (error: any) {
      alert('Error uploading image: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  // Render different editors based on module type
  const renderEditor = () => {
    switch (editedModule.type) {
      case 'link':
        const linkStyle = (editedModule.content as any).style || {}
        const updateStyle = (key: string, value: any) => {
          updateContent('style', { ...linkStyle, [key]: value })
        }
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <Input
                value={editedModule.title || ''}
                onChange={(e) => setEditedModule({ ...editedModule, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
              <Input
                type="url"
                value={(editedModule.content as any).url || ''}
                onChange={(e) => updateContent('url', e.target.value)}
              />
            </div>

            {/* Styling Options */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-bold text-gray-900 mb-3">Styling</h4>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Background</label>
                  <Input
                    type="color"
                    value={linkStyle.backgroundColor || '#6366f1'}
                    onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                  <Input
                    type="color"
                    value={linkStyle.textColor || '#ffffff'}
                    onChange={(e) => updateStyle('textColor', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Border Radius (px)</label>
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    value={linkStyle.borderRadius || 12}
                    onChange={(e) => updateStyle('borderRadius', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Font Size (px)</label>
                  <Input
                    type="number"
                    min="12"
                    max="24"
                    value={linkStyle.fontSize || 16}
                    onChange={(e) => updateStyle('fontSize', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shadow</label>
                  <select
                    value={linkStyle.shadow || 'sm'}
                    onChange={(e) => updateStyle('shadow', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="none">None</option>
                    <option value="sm">Small</option>
                    <option value="md">Medium</option>
                    <option value="lg">Large</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Font Weight</label>
                  <select
                    value={linkStyle.fontWeight || 'semibold'}
                    onChange={(e) => updateStyle('fontWeight', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="normal">Normal</option>
                    <option value="medium">Medium</option>
                    <option value="semibold">Semibold</option>
                    <option value="bold">Bold</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={linkStyle.fullWidth !== false}
                    onChange={(e) => updateStyle('fullWidth', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Full Width</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Border (Optional)</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="color"
                    value={linkStyle.borderColor || '#000000'}
                    onChange={(e) => updateStyle('borderColor', e.target.value)}
                    placeholder="Border Color"
                  />
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    value={linkStyle.borderWidth || 0}
                    onChange={(e) => updateStyle('borderWidth', parseInt(e.target.value))}
                    placeholder="Width (px)"
                  />
                </div>
              </div>
            </div>
          </>
        )

      case 'header':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Text</label>
              <Input
                value={(editedModule.content as any).text || ''}
                onChange={(e) => updateContent('text', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
              <select
                value={(editedModule.content as any).level || 'h2'}
                onChange={(e) => updateContent('level', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="h1">H1 - Largest</option>
                <option value="h2">H2 - Large</option>
                <option value="h3">H3 - Medium</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alignment</label>
              <select
                value={(editedModule.content as any).align || 'center'}
                onChange={(e) => updateContent('align', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>

            {/* Styling Options */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-bold text-gray-900 mb-3">Styling</h4>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                <Input
                  type="color"
                  value={(editedModule.content as any).color || '#111827'}
                  onChange={(e) => updateContent('color', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Font Size (px)</label>
                  <Input
                    type="number"
                    min="16"
                    max="72"
                    value={(editedModule.content as any).fontSize || ''}
                    onChange={(e) => updateContent('fontSize', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Auto"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Font Weight</label>
                  <select
                    value={(editedModule.content as any).fontWeight || 'bold'}
                    onChange={(e) => updateContent('fontWeight', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="normal">Normal</option>
                    <option value="medium">Medium</option>
                    <option value="semibold">Semibold</option>
                    <option value="bold">Bold</option>
                  </select>
                </div>
              </div>
            </div>
          </>
        )

      case 'text':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Text</label>
              <Textarea
                value={(editedModule.content as any).text || ''}
                onChange={(e) => updateContent('text', e.target.value)}
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alignment</label>
              <select
                value={(editedModule.content as any).align || 'center'}
                onChange={(e) => updateContent('align', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>

            {/* Styling Options */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-bold text-gray-900 mb-3">Styling</h4>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                <Input
                  type="color"
                  value={(editedModule.content as any).color || '#374151'}
                  onChange={(e) => updateContent('color', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Font Size (px)</label>
                  <Input
                    type="number"
                    min="12"
                    max="32"
                    value={(editedModule.content as any).fontSize || ''}
                    onChange={(e) => updateContent('fontSize', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Auto"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Font Weight</label>
                  <select
                    value={(editedModule.content as any).fontWeight || 'normal'}
                    onChange={(e) => updateContent('fontWeight', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="normal">Normal</option>
                    <option value="medium">Medium</option>
                    <option value="semibold">Semibold</option>
                    <option value="bold">Bold</option>
                  </select>
                </div>
              </div>
            </div>
          </>
        )

      case 'image':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'url')}
                disabled={uploading}
              />
              {(editedModule.content as any).url && (
                <img src={(editedModule.content as any).url} alt="" className="mt-2 rounded-lg max-h-40" />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alt Text</label>
              <Input
                value={(editedModule.content as any).alt || ''}
                onChange={(e) => updateContent('alt', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Caption</label>
              <Input
                value={(editedModule.content as any).caption || ''}
                onChange={(e) => updateContent('caption', e.target.value)}
                placeholder="Optional caption"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Width (%)
                </label>
                <Input
                  type="number"
                  min="10"
                  max="100"
                  value={(editedModule.content as any).width || 100}
                  onChange={(e) => updateContent('width', parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Roundness (px)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="50"
                  value={(editedModule.content as any).borderRadius || 8}
                  onChange={(e) => updateContent('borderRadius', parseInt(e.target.value))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alignment</label>
                <select
                  value={(editedModule.content as any).align || 'center'}
                  onChange={(e) => updateContent('align', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shadow</label>
                <select
                  value={(editedModule.content as any).shadow || 'none'}
                  onChange={(e) => updateContent('shadow', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="none">None</option>
                  <option value="sm">Small</option>
                  <option value="md">Medium</option>
                  <option value="lg">Large</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Link URL (Optional)</label>
              <Input
                type="url"
                value={(editedModule.content as any).link || ''}
                onChange={(e) => updateContent('link', e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </>
        )

      case 'button':
        const buttonStyle = (editedModule.content as any).style || {}
        const updateButtonStyle = (key: string, value: any) => {
          updateContent('style', { ...buttonStyle, [key]: value })
        }
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
              <Input
                value={(editedModule.content as any).text || ''}
                onChange={(e) => updateContent('text', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
              <Input
                type="url"
                value={(editedModule.content as any).url || ''}
                onChange={(e) => updateContent('url', e.target.value)}
              />
            </div>

            {/* Styling Options */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-bold text-gray-900 mb-3">Styling</h4>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Background</label>
                  <Input
                    type="color"
                    value={buttonStyle.backgroundColor || '#6366f1'}
                    onChange={(e) => updateButtonStyle('backgroundColor', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                  <Input
                    type="color"
                    value={buttonStyle.textColor || '#ffffff'}
                    onChange={(e) => updateButtonStyle('textColor', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Border Radius (px)</label>
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    value={buttonStyle.borderRadius || 12}
                    onChange={(e) => updateButtonStyle('borderRadius', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Font Size (px)</label>
                  <Input
                    type="number"
                    min="12"
                    max="24"
                    value={buttonStyle.fontSize || 16}
                    onChange={(e) => updateButtonStyle('fontSize', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shadow</label>
                  <select
                    value={buttonStyle.shadow || 'sm'}
                    onChange={(e) => updateButtonStyle('shadow', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="none">None</option>
                    <option value="sm">Small</option>
                    <option value="md">Medium</option>
                    <option value="lg">Large</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Font Weight</label>
                  <select
                    value={buttonStyle.fontWeight || 'semibold'}
                    onChange={(e) => updateButtonStyle('fontWeight', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="normal">Normal</option>
                    <option value="medium">Medium</option>
                    <option value="semibold">Semibold</option>
                    <option value="bold">Bold</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={buttonStyle.fullWidth !== false}
                    onChange={(e) => updateButtonStyle('fullWidth', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Full Width</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Border (Optional)</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="color"
                    value={buttonStyle.borderColor || '#000000'}
                    onChange={(e) => updateButtonStyle('borderColor', e.target.value)}
                    placeholder="Border Color"
                  />
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    value={buttonStyle.borderWidth || 0}
                    onChange={(e) => updateButtonStyle('borderWidth', parseInt(e.target.value))}
                    placeholder="Width (px)"
                  />
                </div>
              </div>
            </div>
          </>
        )

      case 'social-links':
        const socialContent = editedModule.content as any
        const socialLinks = socialContent.links || []

        const addSocialLink = () => {
          updateContent('links', [...socialLinks, { platform: 'instagram', url: '' }])
        }

        const updateSocialLink = (index: number, field: string, value: any) => {
          const newLinks = [...socialLinks]
          newLinks[index] = { ...newLinks[index], [field]: value }
          updateContent('links', newLinks)
        }

        const removeSocialLink = (index: number) => {
          updateContent('links', socialLinks.filter((_: any, i: number) => i !== index))
        }

        return (
          <>
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">Social Links</label>
                <Button
                  type="button"
                  size="sm"
                  onClick={addSocialLink}
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Link
                </Button>
              </div>

              {socialLinks.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <Share2 className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">No social links added yet</p>
                  <p className="text-xs text-gray-400 mt-1">Click &quot;Add Link&quot; to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {socialLinks.map((link: any, index: number) => (
                    <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 space-y-2">
                        <select
                          value={link.platform}
                          onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        >
                          <option value="instagram">Instagram</option>
                          <option value="twitter">Twitter/X</option>
                          <option value="tiktok">TikTok</option>
                          <option value="youtube">YouTube</option>
                          <option value="linkedin">LinkedIn</option>
                          <option value="facebook">Facebook</option>
                          <option value="github">GitHub</option>
                          <option value="discord">Discord</option>
                          <option value="twitch">Twitch</option>
                          <option value="spotify">Spotify</option>
                        </select>
                        <Input
                          type="url"
                          value={link.url}
                          onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                          placeholder="https://..."
                          className="text-sm"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeSocialLink(index)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Layout & Styling Options */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-bold text-gray-900 mb-3">Layout & Styling</h4>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Layout</label>
                  <select
                    value={socialContent.layout || 'horizontal'}
                    onChange={(e) => updateContent('layout', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="horizontal">Horizontal</option>
                    <option value="grid">Grid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Icon Size (px)</label>
                  <Input
                    type="number"
                    min="24"
                    max="64"
                    value={socialContent.iconSize || 32}
                    onChange={(e) => updateContent('iconSize', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Icon Color</label>
                  <Input
                    type="color"
                    value={socialContent.iconColor || '#374151'}
                    onChange={(e) => updateContent('iconColor', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Background</label>
                  <Input
                    type="color"
                    value={socialContent.backgroundColor || '#f3f4f6'}
                    onChange={(e) => updateContent('backgroundColor', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Border Radius (px)</label>
                <Input
                  type="number"
                  min="0"
                  max="50"
                  value={socialContent.borderRadius !== undefined ? socialContent.borderRadius : 16}
                  onChange={(e) => updateContent('borderRadius', parseInt(e.target.value))}
                />
              </div>
            </div>
          </>
        )

      default:
        return (
          <div className="text-sm text-gray-500">
            <p>Module type: {editedModule.type}</p>
            <p className="mt-2">Advanced editing for this module type is coming soon.</p>
          </div>
        )
    }
  }

  return (
    <div className="space-y-4">
      {renderEditor()}

      <div className="pt-4 border-t border-gray-200">
        <Button
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Check className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  )
}

function ModuleCard({ module, isDragging = false }: { module: Module, isDragging?: boolean }) {
  const template = MODULE_TEMPLATES.find((t) => t.type === module.type)

  return (
    <Card className={`p-4 ${isDragging ? 'shadow-soft-xl' : ''} ${module.active ? '' : 'opacity-60'}`}>
      <div className="flex items-center gap-4">
        <div className={`p-2 ${template?.color || 'bg-gray-100'} rounded-lg`}>
          {template?.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{module.title}</h3>
          <p className="text-sm text-gray-500">{template?.description}</p>
        </div>
      </div>
    </Card>
  )
}

function SortableModule({
  module,
  onDelete,
  onToggleActive,
  onEdit,
}: {
  module: Module
  onDelete: (id: string) => void
  onToggleActive: (module: Module) => void
  onEdit: (module: Module) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: module.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const template = MODULE_TEMPLATES.find((t) => t.type === module.type)

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`group hover:shadow-soft-lg transition-all ${
        module.active ? '' : 'opacity-60'
      } ${isDragging ? 'opacity-50 shadow-soft-xl' : ''}`}
    >
      <div className="flex items-center gap-4 p-4">
        {/* Drag Handle - Only this part is draggable */}
        <button
          className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 rounded-lg transition-colors touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-5 h-5 text-gray-400" />
        </button>

        {/* Module Icon */}
        <div className={`p-3 ${template?.color || 'bg-gray-100'} rounded-xl`}>
          {template?.icon}
        </div>

        {/* Module Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{module.title}</h3>
          <p className="text-sm text-gray-500">{template?.description}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onEdit(module)}
            title="Edit"
            className="h-9 w-9"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onToggleActive(module)}
            title={module.active ? 'Hide' : 'Show'}
            className="h-9 w-9"
          >
            {module.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
          <Button
            size="icon"
            variant="destructive"
            onClick={() => onDelete(module.id)}
            title="Delete"
            className="h-9 w-9"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

// Live Preview Component
function LivePreview({ profile, modules, containerWidth }: { profile: Profile; modules: Module[]; containerWidth?: 'full' | 'contained' }) {
  return (
    <div className="min-h-full py-12 px-4">
      <div className={containerWidth === 'full' ? 'w-full' : 'max-w-2xl mx-auto'}>
        {/* Profile Header */}
        <div className="text-center mb-12">
          {profile.avatar_url && (
            <div className="mb-6">
              <img
                src={profile.avatar_url}
                alt={profile.title}
                className="w-32 h-32 mx-auto object-cover rounded-full border-2 border-gray-200 shadow-soft-lg"
              />
            </div>
          )}

          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            {profile.title}
          </h1>

          {profile.bio && (
            <p className="text-lg text-gray-600 max-w-lg mx-auto">{profile.bio}</p>
          )}
        </div>

        {/* Modules */}
        <div className="max-w-lg mx-auto space-y-4">
          {modules.map((module, index) => (
            <ModuleRenderer
              key={module.id}
              module={module}
              profileId={profile.id}
              index={index}
              allModules={modules}
            />
          ))}
        </div>

        {modules.length === 0 && (
          <div className="text-center text-gray-600 py-12">
            <p>Add modules from the left sidebar to see them here!</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ModuleEditor({
  module,
  modules,
  onSave,
  onCancel,
}: {
  module: Module
  modules: Module[]
  onSave: (module: Module) => void
  onCancel: () => void
}) {
  const [editedModule, setEditedModule] = useState<Module>(module)
  const [uploading, setUploading] = useState(false)
  const supabase = createBrowserClient()

  const updateContent = (key: string, value: any) => {
    setEditedModule({
      ...editedModule,
      content: {
        ...editedModule.content,
        [key]: value,
      },
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { data, error } = await supabase.storage
        .from('clicky-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('clicky-images')
        .getPublicUrl(filePath)

      updateContent('url', publicUrl)
      alert('Image uploaded successfully!')
    } catch (error: any) {
      console.error('Upload error:', error)
      alert('Error uploading image: ' + (error.message || 'Please create a "clicky-images" storage bucket in Supabase'))
    } finally {
      setUploading(false)
    }
  }

  const template = MODULE_TEMPLATES.find((t) => t.type === module.type)

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-lg animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        className="max-w-5xl w-full max-h-[92vh] overflow-hidden bg-white rounded-3xl shadow-2xl border-2 border-gray-100 animate-in slide-in-from-bottom-6 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r from-pastel-lavender via-pastel-sky to-pastel-mint p-8`}>
          <div className="flex items-center gap-5">
            <div className={`p-4 ${template?.color || 'bg-white'} rounded-2xl shadow-soft-lg border-2 border-white`}>
              <div className="w-8 h-8 flex items-center justify-center">
                {template?.icon}
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900">Edit {template?.label}</h2>
              <p className="text-sm text-gray-700 mt-1.5 font-medium">{template?.description}</p>
            </div>
            <button
              onClick={onCancel}
              className="p-3 hover:bg-white/60 rounded-2xl transition-all active:scale-95 group"
              aria-label="Close"
            >
              <svg className="w-6 h-6 text-gray-700 group-hover:text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(92vh - 240px)' }}>
          <div className="p-8 space-y-8">
          {/* Title Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
              <Type className="w-4 h-4 text-primary-500" />
              Module Title
            </label>
            <Input
              value={editedModule.title || ''}
              onChange={(e) =>
                setEditedModule({ ...editedModule, title: e.target.value })
              }
              className="h-12 text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl transition-all"
              placeholder="Enter a title..."
            />
            <p className="text-xs text-gray-500 pl-1">This is the internal name for your module</p>
          </div>

          {/* Module-specific fields */}
          {module.type === 'link' && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                <LinkIcon className="w-4 h-4 text-primary-500" />
                Destination URL
              </label>
              <div className="relative">
                <Input
                  value={(editedModule.content as any).url || ''}
                  onChange={(e) => updateContent('url', e.target.value)}
                  placeholder="https://example.com"
                  className="h-12 text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl transition-all pl-4"
                />
              </div>
              <p className="text-xs text-gray-500 pl-1">Where should this link go?</p>
            </div>
          )}

          {module.type === 'header' && (
            <>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                  <Type className="w-4 h-4 text-primary-500" />
                  Header Text
                </label>
                <Input
                  value={(editedModule.content as any).text || ''}
                  onChange={(e) => updateContent('text', e.target.value)}
                  className="h-12 text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl transition-all"
                  placeholder="Your heading text..."
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Heading Size
                </label>
                <select
                  value={(editedModule.content as any).level || 'h2'}
                  onChange={(e) => updateContent('level', e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-primary-500 bg-white text-base transition-all"
                >
                  <option value="h1">Large (H1)</option>
                  <option value="h2">Medium (H2)</option>
                  <option value="h3">Small (H3)</option>
                </select>
              </div>
            </>
          )}

          {module.type === 'text' && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                <Type className="w-4 h-4 text-primary-500" />
                Text Content
              </label>
              <Textarea
                value={(editedModule.content as any).text || ''}
                onChange={(e) => updateContent('text', e.target.value)}
                rows={6}
                className="text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl transition-all resize-none"
                placeholder="Write your text here..."
              />
              <p className="text-xs text-gray-500 pl-1">Supports line breaks and paragraphs</p>
            </div>
          )}

          {module.type === 'image' && (
            <>
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                  <ImageIcon className="w-4 h-4 text-primary-500" />
                  Image Source
                </label>

                {/* Upload Button */}
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                    id="image-upload"
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    disabled={uploading}
                    className="w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl hover:border-primary-500 hover:bg-primary-50/50 transition-all flex flex-col items-center justify-center gap-3 group disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm font-semibold text-gray-600">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <ImageIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-gray-900">Click to upload</p>
                          <p className="text-xs text-gray-500">Max 5MB • PNG, JPG, GIF</p>
                        </div>
                      </>
                    )}
                  </button>
                </div>

                <div className="relative flex items-center gap-4 py-2">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="text-xs font-semibold text-gray-400 uppercase">or paste url</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>

                <Input
                  value={(editedModule.content as any).url || ''}
                  onChange={(e) => updateContent('url', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="h-12 text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl transition-all"
                />

                {/* Image Preview */}
                {(editedModule.content as any).url && (
                  <div className="mt-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">Preview</p>
                    <img
                      src={(editedModule.content as any).url}
                      alt="Preview"
                      className="max-h-64 mx-auto rounded-xl shadow-soft-lg border-2 border-white"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="sans-serif"%3EInvalid Image%3C/text%3E%3C/svg%3E'
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                    Alt Text
                  </label>
                  <Input
                    value={(editedModule.content as any).alt || ''}
                    onChange={(e) => updateContent('alt', e.target.value)}
                    placeholder="Description for accessibility"
                    className="h-12 text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl transition-all"
                  />
                  <p className="text-xs text-gray-500 pl-1">Required for screen readers</p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                    Caption <span className="text-xs text-gray-400 normal-case">(optional)</span>
                  </label>
                  <Input
                    value={(editedModule.content as any).caption || ''}
                    onChange={(e) => updateContent('caption', e.target.value)}
                    placeholder="Photo caption"
                    className="h-12 text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                  <LinkIcon className="w-4 h-4 text-primary-500" />
                  Link URL <span className="text-xs text-gray-400 normal-case">(optional)</span>
                </label>
                <Input
                  value={(editedModule.content as any).link || ''}
                  onChange={(e) => updateContent('link', e.target.value)}
                  placeholder="https://... (makes image clickable)"
                  className="h-12 text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl transition-all"
                />
              </div>
            </>
          )}

          {module.type === 'video' && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                <Video className="w-4 h-4 text-primary-500" />
                Video URL
              </label>
              <Input
                value={(editedModule.content as any).url || ''}
                onChange={(e) => updateContent('url', e.target.value)}
                placeholder="Paste your video URL here..."
                className="h-12 text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl transition-all"
              />
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-xs px-2 py-1 bg-pastel-sky rounded-lg font-semibold text-gray-700">YouTube</span>
                <span className="text-xs px-2 py-1 bg-pastel-lavender rounded-lg font-semibold text-gray-700">Vimeo</span>
                <span className="text-xs px-2 py-1 bg-pastel-mint rounded-lg font-semibold text-gray-700">TikTok</span>
                <span className="text-xs px-2 py-1 bg-pastel-rose rounded-lg font-semibold text-gray-700">Loom</span>
              </div>
            </div>
          )}

          {module.type === 'music' && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                <Music className="w-4 h-4 text-primary-500" />
                Music Embed URL
              </label>
              <Input
                value={(editedModule.content as any).url || ''}
                onChange={(e) => updateContent('url', e.target.value)}
                placeholder="Spotify or SoundCloud URL..."
                className="h-12 text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl transition-all"
              />
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-xs px-2 py-1 bg-pastel-mint rounded-lg font-semibold text-gray-700">Spotify</span>
                <span className="text-xs px-2 py-1 bg-pastel-peach rounded-lg font-semibold text-gray-700">SoundCloud</span>
              </div>
            </div>
          )}

          {module.type === 'spacer' && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                <ArrowUp className="w-4 h-4 text-primary-500" />
                Spacing Height
              </label>
              <div className="flex items-center gap-4">
                <Input
                  type="range"
                  value={(editedModule.content as any).height || 32}
                  onChange={(e) => updateContent('height', parseInt(e.target.value))}
                  min="8"
                  max="200"
                  className="flex-1"
                />
                <div className="w-20 h-12 flex items-center justify-center bg-gray-100 rounded-xl border-2 border-gray-200 font-bold text-gray-900">
                  {(editedModule.content as any).height || 32}px
                </div>
              </div>
              <p className="text-xs text-gray-500 pl-1">Add vertical space between modules</p>
            </div>
          )}

          {module.type === 'button' && (
            <>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                  <MousePointerClick className="w-4 h-4 text-primary-500" />
                  Button Text
                </label>
                <Input
                  value={(editedModule.content as any).text || ''}
                  onChange={(e) => updateContent('text', e.target.value)}
                  placeholder="Click Here"
                  className="h-12 text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                  <LinkIcon className="w-4 h-4 text-primary-500" />
                  Destination URL
                </label>
                <Input
                  value={(editedModule.content as any).url || ''}
                  onChange={(e) => updateContent('url', e.target.value)}
                  placeholder="https://example.com"
                  className="h-12 text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl transition-all"
                />
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Button Style
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'primary', label: 'Primary', class: 'bg-gradient-to-r from-primary-500 to-purple-500 text-white' },
                    { value: 'secondary', label: 'Secondary', class: 'bg-gradient-to-r from-pastel-rose to-pastel-peach text-gray-900' },
                    { value: 'outline', label: 'Outline', class: 'border-2 border-gray-900 bg-white text-gray-900' }
                  ].map((style) => (
                    <button
                      key={style.value}
                      type="button"
                      onClick={() => updateContent('style', style.value)}
                      className={`h-16 rounded-xl font-semibold transition-all ${
                        (editedModule.content as any).style === style.value || (!((editedModule.content as any).style) && style.value === 'primary')
                          ? 'ring-4 ring-primary-500 ring-offset-2 scale-105'
                          : 'opacity-60 hover:opacity-100'
                      } ${style.class}`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {module.type === 'accordion' && (
            <>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                  <HelpCircle className="w-4 h-4 text-primary-500" />
                  Question
                </label>
                <Input
                  value={(editedModule.content as any).question || ''}
                  onChange={(e) => updateContent('question', e.target.value)}
                  placeholder="What is your question?"
                  className="h-12 text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Answer
                </label>
                <Textarea
                  value={(editedModule.content as any).answer || ''}
                  onChange={(e) => updateContent('answer', e.target.value)}
                  placeholder="The answer goes here..."
                  rows={5}
                  className="text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl transition-all resize-none"
                />
              </div>
            </>
          )}

          {module.type === 'countdown' && (
            <>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                  <Type className="w-4 h-4 text-primary-500" />
                  Title <span className="text-xs text-gray-400 normal-case">(optional)</span>
                </label>
                <Input
                  value={(editedModule.content as any).title || ''}
                  onChange={(e) => updateContent('title', e.target.value)}
                  placeholder="Coming Soon"
                  className="h-12 text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                  <Clock className="w-4 h-4 text-primary-500" />
                  Target Date & Time
                </label>
                <Input
                  type="datetime-local"
                  value={(editedModule.content as any).targetDate?.slice(0, 16) || ''}
                  onChange={(e) => updateContent('targetDate', new Date(e.target.value).toISOString())}
                  className="h-12 text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl transition-all"
                />
                <p className="text-xs text-gray-500 pl-1">Countdown will display days, hours, minutes, seconds</p>
              </div>
            </>
          )}

          {module.type === 'email' && (
            <>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                  <Mail className="w-4 h-4 text-primary-500" />
                  Email Address
                </label>
                <Input
                  type="email"
                  value={(editedModule.content as any).email || ''}
                  onChange={(e) => updateContent('email', e.target.value)}
                  placeholder="your@email.com"
                  className="h-12 text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Button Text
                </label>
                <Input
                  value={(editedModule.content as any).buttonText || ''}
                  onChange={(e) => updateContent('buttonText', e.target.value)}
                  placeholder="Get in Touch"
                  className="h-12 text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Email Subject <span className="text-xs text-gray-400 normal-case">(optional)</span>
                </label>
                <Input
                  value={(editedModule.content as any).subject || ''}
                  onChange={(e) => updateContent('subject', e.target.value)}
                  placeholder="Subject line"
                  className="h-12 text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl transition-all"
                />
              </div>
            </>
          )}

          {module.type === 'divider' && (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                <Minus className="w-4 h-4 text-primary-500" />
                Divider Style
              </label>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { value: 'solid', label: 'Solid' },
                  { value: 'dashed', label: 'Dashed' },
                  { value: 'dotted', label: 'Dotted' },
                  { value: 'double', label: 'Double' }
                ].map((style) => (
                  <button
                    key={style.value}
                    type="button"
                    onClick={() => updateContent('style', style.value)}
                    className={`h-20 rounded-xl font-semibold transition-all flex flex-col items-center justify-center gap-2 ${
                      (editedModule.content as any).style === style.value || (!((editedModule.content as any).style) && style.value === 'solid')
                        ? 'bg-primary-500 text-white ring-4 ring-primary-300 scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className={`w-8 border-t-2 ${
                      style.value === 'solid' ? 'border-solid' :
                      style.value === 'dashed' ? 'border-dashed' :
                      style.value === 'dotted' ? 'border-dotted' : 'border-double border-t-4'
                    } ${(editedModule.content as any).style === style.value || (!((editedModule.content as any).style) && style.value === 'solid') ? 'border-white' : 'border-gray-900'}`}></div>
                    <span className="text-xs">{style.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {module.type === 'button-grid' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Columns
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[2, 3, 4].map((cols) => (
                    <button
                      key={cols}
                      type="button"
                      onClick={() => updateContent('columns', cols)}
                      className={`h-16 rounded-xl font-semibold transition-all ${
                        ((editedModule.content as any).columns || 2) === cols
                          ? 'bg-primary-500 text-white ring-4 ring-primary-300 scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cols} Columns
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Buttons
                </label>
                {((editedModule.content as any).buttons || []).map((button: any, index: number) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-xl space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-700">Button {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const buttons = [...((editedModule.content as any).buttons || [])]
                          buttons.splice(index, 1)
                          updateContent('buttons', buttons)
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <Input
                      value={button.title || ''}
                      onChange={(e) => {
                        const buttons = [...((editedModule.content as any).buttons || [])]
                        buttons[index] = { ...buttons[index], title: e.target.value }
                        updateContent('buttons', buttons)
                      }}
                      placeholder="Button title"
                      className="h-12 text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl transition-all"
                    />
                    <Input
                      value={button.url || ''}
                      onChange={(e) => {
                        const buttons = [...((editedModule.content as any).buttons || [])]
                        buttons[index] = { ...buttons[index], url: e.target.value }
                        updateContent('buttons', buttons)
                      }}
                      placeholder="https://example.com"
                      className="h-12 text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl transition-all"
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const buttons = [...((editedModule.content as any).buttons || []), { title: '', url: '' }]
                    updateContent('buttons', buttons)
                  }}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Button
                </Button>
              </div>
            </div>
          )}

          {module.type === 'two-column' && (
            <TwoColumnEditor
              content={(editedModule.content as any)}
              modules={modules.filter(m => m.id !== module.id)}
              updateContent={updateContent}
            />
          )}

          {module.type === 'social-links' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                  <Share2 className="w-4 h-4 text-primary-500" />
                  Select Platforms
                </label>
                <p className="text-xs text-gray-500 pl-1">Choose which social platforms to display</p>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { platform: 'instagram', label: 'Instagram', color: 'bg-gradient-to-br from-purple-500 to-pink-500', icon: Instagram },
                    { platform: 'twitter', label: 'Twitter', color: 'bg-sky-500', icon: Twitter },
                    { platform: 'youtube', label: 'YouTube', color: 'bg-red-500', icon: Youtube },
                    { platform: 'tiktok', label: 'TikTok', color: 'bg-gray-900', icon: Music },
                    { platform: 'linkedin', label: 'LinkedIn', color: 'bg-blue-600', icon: Linkedin },
                    { platform: 'facebook', label: 'Facebook', color: 'bg-blue-500', icon: Facebook },
                    { platform: 'github', label: 'GitHub', color: 'bg-gray-800', icon: Github },
                    { platform: 'spotify', label: 'Spotify', color: 'bg-green-500', icon: Music },
                    { platform: 'twitch', label: 'Twitch', color: 'bg-purple-600', icon: Music },
                    { platform: 'discord', label: 'Discord', color: 'bg-indigo-600', icon: MessageCircle },
                    { platform: 'website', label: 'Website', color: 'bg-blue-500', icon: ExternalLink },
                    { platform: 'email', label: 'Email', color: 'bg-orange-500', icon: Mail },
                  ].map((social) => {
                    const links = ((editedModule.content as any).links || []) as Array<{ platform: string; url: string }>
                    const isSelected = links.some(l => l.platform === social.platform)
                    const Icon = social.icon

                    return (
                      <button
                        key={social.platform}
                        type="button"
                        onClick={() => {
                          const currentLinks = ((editedModule.content as any).links || []) as Array<{ platform: string; url: string }>
                          if (isSelected) {
                            updateContent('links', currentLinks.filter(l => l.platform !== social.platform))
                          } else {
                            updateContent('links', [...currentLinks, { platform: social.platform, url: '' }])
                          }
                        }}
                        className={`h-24 rounded-xl font-semibold transition-all flex flex-col items-center justify-center gap-2 text-white ${social.color} ${
                          isSelected ? 'ring-4 ring-primary-500 ring-offset-2 scale-105 opacity-100' : 'opacity-60 hover:opacity-100'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-xs">{social.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* URL inputs for selected platforms */}
              {((editedModule.content as any).links || []).length > 0 && (
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                    <LinkIcon className="w-4 h-4 text-primary-500" />
                    Social Links
                  </label>
                  {((editedModule.content as any).links || []).map((link: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 capitalize">{link.platform}</label>
                      <Input
                        value={link.url || ''}
                        onChange={(e) => {
                          const newLinks = [...((editedModule.content as any).links || [])]
                          newLinks[index] = { ...newLinks[index], url: e.target.value }
                          updateContent('links', newLinks)
                        }}
                        placeholder={`https://${link.platform}.com/yourprofile`}
                        className="h-12 text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl transition-all"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Icon Style
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'rounded', label: 'Rounded', preview: 'rounded-2xl' },
                    { value: 'sharp', label: 'Sharp', preview: 'rounded-md' },
                    { value: 'minimal', label: 'Minimal', preview: 'rounded-full border-2' }
                  ].map((style) => (
                    <button
                      key={style.value}
                      type="button"
                      onClick={() => updateContent('iconStyle', style.value)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        ((editedModule.content as any).iconStyle || 'rounded') === style.value
                          ? 'border-primary-500 bg-primary-50 ring-4 ring-primary-300'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-center mb-2">
                        <div className={`w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center ${style.preview}`}>
                          <Instagram className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <p className="font-bold text-sm">{style.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Layout Style
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'horizontal', label: 'Horizontal Row' },
                    { value: 'grid', label: 'Grid (4 columns)' }
                  ].map((layout) => (
                    <button
                      key={layout.value}
                      type="button"
                      onClick={() => updateContent('layout', layout.value)}
                      className={`h-16 rounded-xl font-semibold transition-all ${
                        ((editedModule.content as any).layout || 'horizontal') === layout.value
                          ? 'bg-primary-500 text-white ring-4 ring-primary-300 scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {layout.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-primary-300 transition-all">
                  <input
                    type="checkbox"
                    checked={((editedModule.content as any).useGlobalColors || false)}
                    onChange={(e) => updateContent('useGlobalColors', e.target.checked)}
                    className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Use Global Colors</div>
                    <div className="text-xs text-gray-600">Match your profile&apos;s theme colors</div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {module.type === 'email-capture' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                  <Type className="w-4 h-4 text-primary-500" />
                  Title
                </label>
                <Input
                  value={(editedModule.content as any).title || ''}
                  onChange={(e) => updateContent('title', e.target.value)}
                  placeholder="Join my mailing list"
                  className="h-12 text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                  <Type className="w-4 h-4 text-primary-500" />
                  Description
                </label>
                <Textarea
                  value={(editedModule.content as any).description || ''}
                  onChange={(e) => updateContent('description', e.target.value)}
                  placeholder="Get exclusive updates delivered straight to your inbox."
                  rows={3}
                  className="text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl transition-all resize-none"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                  <Mail className="w-4 h-4 text-primary-500" />
                  Email Placeholder
                </label>
                <Input
                  value={(editedModule.content as any).placeholder || ''}
                  onChange={(e) => updateContent('placeholder', e.target.value)}
                  placeholder="Enter your email"
                  className="h-12 text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                  <MousePointerClick className="w-4 h-4 text-primary-500" />
                  Button Text
                </label>
                <Input
                  value={(editedModule.content as any).buttonText || ''}
                  onChange={(e) => updateContent('buttonText', e.target.value)}
                  placeholder="Subscribe"
                  className="h-12 text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                  <Check className="w-4 h-4 text-primary-500" />
                  Success Message
                </label>
                <Input
                  value={(editedModule.content as any).successMessage || ''}
                  onChange={(e) => updateContent('successMessage', e.target.value)}
                  placeholder="Thanks for subscribing! Check your inbox."
                  className="h-12 text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl transition-all"
                />
              </div>
            </div>
          )}

          {module.type === 'contact-form' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                  <Type className="w-4 h-4 text-primary-500" />
                  Title
                </label>
                <Input
                  value={(editedModule.content as any).title || ''}
                  onChange={(e) => updateContent('title', e.target.value)}
                  placeholder="Get in Touch"
                  className="h-12 text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                  <Type className="w-4 h-4 text-primary-500" />
                  Description
                </label>
                <Textarea
                  value={(editedModule.content as any).description || ''}
                  onChange={(e) => updateContent('description', e.target.value)}
                  placeholder="Send me a message and I'll get back to you soon."
                  rows={3}
                  className="text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl transition-all resize-none"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                  <User className="w-4 h-4 text-primary-500" />
                  Name Placeholder
                </label>
                <Input
                  value={(editedModule.content as any).namePlaceholder || ''}
                  onChange={(e) => updateContent('namePlaceholder', e.target.value)}
                  placeholder="Your name"
                  className="h-12 text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                  <Mail className="w-4 h-4 text-primary-500" />
                  Email Placeholder
                </label>
                <Input
                  value={(editedModule.content as any).emailPlaceholder || ''}
                  onChange={(e) => updateContent('emailPlaceholder', e.target.value)}
                  placeholder="Your email"
                  className="h-12 text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                  <MessageCircle className="w-4 h-4 text-primary-500" />
                  Message Placeholder
                </label>
                <Input
                  value={(editedModule.content as any).messagePlaceholder || ''}
                  onChange={(e) => updateContent('messagePlaceholder', e.target.value)}
                  placeholder="Your message"
                  className="h-12 text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Field Requirements
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-primary-300 transition-all">
                    <input
                      type="checkbox"
                      checked={((editedModule.content as any).requireName !== false)}
                      onChange={(e) => updateContent('requireName', e.target.checked)}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Require Name</div>
                      <div className="text-xs text-gray-600">Make name field mandatory</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-primary-300 transition-all">
                    <input
                      type="checkbox"
                      checked={((editedModule.content as any).requireEmail !== false)}
                      onChange={(e) => updateContent('requireEmail', e.target.checked)}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Require Email</div>
                      <div className="text-xs text-gray-600">Make email field mandatory</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                  <MousePointerClick className="w-4 h-4 text-primary-500" />
                  Button Text
                </label>
                <Input
                  value={(editedModule.content as any).buttonText || ''}
                  onChange={(e) => updateContent('buttonText', e.target.value)}
                  placeholder="Send Message"
                  className="h-12 text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                  <Check className="w-4 h-4 text-primary-500" />
                  Success Message
                </label>
                <Input
                  value={(editedModule.content as any).successMessage || ''}
                  onChange={(e) => updateContent('successMessage', e.target.value)}
                  placeholder="Message sent! I'll get back to you soon."
                  className="h-12 text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl transition-all"
                />
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t-2 border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100/50 p-6">
          <div className="flex gap-4">
            <Button
              onClick={() => onSave(editedModule)}
              className="flex-1 h-14 text-base font-bold shadow-lg hover:shadow-xl bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 transition-all hover:scale-105 active:scale-95"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              className="px-8 h-14 text-base font-bold border-2 hover:bg-gray-100 transition-all hover:scale-105 active:scale-95"
              disabled={uploading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Two Column Editor Component
function TwoColumnEditor({
  content,
  modules,
  updateContent,
}: {
  content: { leftModuleId?: string | null; rightModuleId?: string | null; ratio?: string }
  modules: Module[]
  updateContent: (key: string, value: any) => void
}) {
  // Filter out two-column modules to prevent nesting
  const availableModules = modules.filter(m => m.type !== 'two-column')
  const leftModule = availableModules.find(m => m.id === content.leftModuleId)
  const rightModule = availableModules.find(m => m.id === content.rightModuleId)

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <h4 className="font-semibold text-blue-900 mb-2">How it works</h4>
        <p className="text-sm text-blue-700">
          Select existing modules from your page to display in a two-column layout. Create other modules first, then assign them to the left and right columns here.
        </p>
      </div>

      {/* Column Ratio */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
          Column Layout
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: '50-50', label: '50/50', desc: 'Equal width' },
            { value: '60-40', label: '60/40', desc: 'Left wider' },
            { value: '40-60', label: '40/60', desc: 'Right wider' }
          ].map((ratio) => (
            <button
              key={ratio.value}
              type="button"
              onClick={() => updateContent('ratio', ratio.value)}
              className={`h-20 rounded-xl font-semibold transition-all flex flex-col items-center justify-center gap-2 ${
                (content.ratio || '50-50') === ratio.value
                  ? 'bg-primary-500 text-white ring-4 ring-primary-300 scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="text-sm">{ratio.label}</span>
              <span className="text-xs opacity-70">{ratio.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Left Column Selection */}
      <div className="p-6 bg-gradient-to-br from-pastel-sky to-pastel-lavender rounded-2xl space-y-4">
        <h3 className="font-bold text-lg text-gray-900">Left Column</h3>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-900">Select Module</label>
          <select
            value={content.leftModuleId || ''}
            onChange={(e) => updateContent('leftModuleId', e.target.value || null)}
            className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-primary-500 bg-white text-base"
          >
            <option value="">-- None (empty column) --</option>
            {availableModules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title || `${m.type} module`}
              </option>
            ))}
          </select>
        </div>

        {leftModule && (
          <div className="p-4 bg-white rounded-xl border-2 border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-1">Preview:</p>
            <p className="text-xs text-gray-600">
              <span className="font-semibold">{MODULE_TEMPLATES.find(t => t.type === leftModule.type)?.label}</span>
              {' - '}{leftModule.title}
            </p>
          </div>
        )}

        {!leftModule && (
          <div className="p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 text-center text-gray-500 text-sm">
            No module selected
          </div>
        )}
      </div>

      {/* Right Column Selection */}
      <div className="p-6 bg-gradient-to-br from-pastel-mint to-pastel-peach rounded-2xl space-y-4">
        <h3 className="font-bold text-lg text-gray-900">Right Column</h3>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-900">Select Module</label>
          <select
            value={content.rightModuleId || ''}
            onChange={(e) => updateContent('rightModuleId', e.target.value || null)}
            className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-primary-500 bg-white text-base"
          >
            <option value="">-- None (empty column) --</option>
            {availableModules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title || `${m.type} module`}
              </option>
            ))}
          </select>
        </div>

        {rightModule && (
          <div className="p-4 bg-white rounded-xl border-2 border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-1">Preview:</p>
            <p className="text-xs text-gray-600">
              <span className="font-semibold">{MODULE_TEMPLATES.find(t => t.type === rightModule.type)?.label}</span>
              {' - '}{rightModule.title}
            </p>
          </div>
        )}

        {!rightModule && (
          <div className="p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 text-center text-gray-500 text-sm">
            No module selected
          </div>
        )}
      </div>

      {availableModules.length === 0 && (
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-sm font-semibold text-yellow-900 mb-1">No modules available</p>
          <p className="text-sm text-yellow-700">
            Create other modules first (video, social links, text, etc.) then come back here to assign them to columns.
          </p>
        </div>
      )}
    </div>
  )
}


export default function BuilderPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    }>
      <BuilderPageContent />
    </Suspense>
  )
}
