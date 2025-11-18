'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { GlassPanel, GlassCard, GlassButton, GlassInput, GlassBadge } from '@/components/ui/glass'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ModuleRenderer } from '@/components/modules/module-renderer'
import { QRCodeModal } from '@/components/qr-code-modal'
import { ColorThemeModal, COLOR_THEMES, type ColorTheme } from '@/components/color-theme-modal'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Plus, GripVertical, MoreHorizontal, ChevronDown, ChevronRight,
  Link as LinkIcon, Type, Image as ImageIcon, Video, Mail, Users, Eye, EyeOff,
  Edit2, Trash2, ExternalLink, X, Check, Save, Smartphone, Copy, Settings as SettingsIcon,
  Instagram, Twitter, Youtube, Linkedin, Facebook, Github, MessageCircle, Send, Music,
  Sparkles, Layers, QrCode, Palette
} from 'lucide-react'
import type { Module, ModuleType, Section, Profile } from '@/types'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface ModuleTemplate {
  type: ModuleType
  icon: React.ReactNode
  label: string
  description: string
  color: string
}

const MODULE_TEMPLATES: ModuleTemplate[] = [
  {
    type: 'link',
    icon: <LinkIcon className="w-4 h-4" />,
    label: 'Link',
    description: 'Add a button link',
    color: 'blue'
  },
  {
    type: 'header',
    icon: <Type className="w-4 h-4" />,
    label: 'Header',
    description: 'Large heading text',
    color: 'purple'
  },
  {
    type: 'text',
    icon: <Type className="w-4 h-4" />,
    label: 'Text',
    description: 'Paragraph text',
    color: 'slate'
  },
  {
    type: 'image',
    icon: <ImageIcon className="w-4 h-4" />,
    label: 'Image',
    description: 'Display an image',
    color: 'green'
  },
  {
    type: 'video',
    icon: <Video className="w-4 h-4" />,
    label: 'Video',
    description: 'Embed a video',
    color: 'red'
  },
  {
    type: 'email-capture',
    icon: <Mail className="w-4 h-4" />,
    label: 'Email Capture',
    description: 'Collect emails',
    color: 'yellow'
  },
  {
    type: 'contact-form',
    icon: <Send className="w-4 h-4" />,
    label: 'Contact Form',
    description: 'Message form',
    color: 'pink'
  },
  {
    type: 'social-links',
    icon: <Users className="w-4 h-4" />,
    label: 'Social Links',
    description: 'Social media icons',
    color: 'indigo'
  },
]

interface SectionWithModules extends Section {
  modules: Module[]
}

interface SortableModuleProps {
  module: Module
  isEditing: boolean
  onEdit: () => void
  onDelete: () => void
  onToggleActive: () => void
  onDuplicate: () => void
}

function SortableModule({ module, isEditing, onEdit, onDelete, onToggleActive, onDuplicate }: SortableModuleProps) {
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
    zIndex: isDragging ? 1000 : 1,
  }

  const template = MODULE_TEMPLATES.find(t => t.type === module.type)

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0, scale: isDragging ? 1.02 : 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={`flex items-center gap-3 p-3 bg-white/20 hover:bg-white/40 rounded-lg transition-all group ${
        isEditing ? 'ring-2 ring-accent-400' : ''
      }`}
    >
      <motion.div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <GripVertical className="w-4 h-4 text-slate-400" />
      </motion.div>

      <div className={`p-2 bg-${template?.color || 'blue'}-100/50 rounded-lg`}>
        {template?.icon || <LinkIcon className="w-4 h-4" />}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800 truncate text-sm">
          {module.title || `${module.type} module`}
        </p>
        <p className="text-xs text-slate-500 truncate">
          {module.type}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <motion.button
          onClick={onToggleActive}
          className="p-2 hover:bg-white/50 rounded-lg transition-opacity opacity-0 group-hover:opacity-100"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {module.active ? (
            <Eye className="w-4 h-4 text-green-600" />
          ) : (
            <EyeOff className="w-4 h-4 text-slate-400" />
          )}
        </motion.button>
        <motion.button
          onClick={onEdit}
          className="p-2 hover:bg-white/50 rounded-lg transition-opacity opacity-0 group-hover:opacity-100"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Edit2 className="w-4 h-4 text-blue-600" />
        </motion.button>
        <motion.button
          onClick={onDuplicate}
          className="p-2 hover:bg-white/50 rounded-lg transition-opacity opacity-0 group-hover:opacity-100"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Duplicate module"
        >
          <Copy className="w-4 h-4 text-purple-600" />
        </motion.button>
        <motion.button
          onClick={onDelete}
          className="p-2 hover:bg-white/50 rounded-lg transition-opacity opacity-0 group-hover:opacity-100"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </motion.button>
      </div>
    </motion.div>
  )
}

function ModuleEditor({ module, onSave, onCancel }: { module: Module, onSave: (data: Partial<Module>) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState<any>(module.content || {})
  const [title, setTitle] = useState(module.title || '')

  const handleSave = () => {
    onSave({
      title,
      content: formData
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <GlassPanel className="p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">Edit {module.type} Module</h3>
          <div className="flex gap-2">
            <GlassButton variant="secondary" size="sm" onClick={onCancel}>
              <X className="w-4 h-4 mr-1" />
              Cancel
            </GlassButton>
            <GlassButton size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-1" />
              Save
            </GlassButton>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Module Title</label>
            <GlassInput
              value={title}
              onChange={setTitle}
              placeholder="Enter module title"
            />
          </div>

          {module.type === 'link' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Link URL</label>
                <GlassInput
                  value={formData.url || ''}
                  onChange={(value) => setFormData({ ...formData, url: value })}
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Button Text</label>
                <GlassInput
                  value={formData.text || ''}
                  onChange={(value) => setFormData({ ...formData, text: value })}
                  placeholder="Click here"
                />
              </div>
            </>
          )}

          {module.type === 'header' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Header Text</label>
              <GlassInput
                value={formData.text || ''}
                onChange={(value) => setFormData({ ...formData, text: value })}
                placeholder="Enter header text"
              />
            </div>
          )}

          {module.type === 'text' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Text Content</label>
              <Textarea
                value={formData.text || ''}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                placeholder="Enter your text"
                className="w-full bg-white/50 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-2.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-400/50 min-h-[100px]"
              />
            </div>
          )}

          {module.type === 'image' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Image URL</label>
                <GlassInput
                  value={formData.url || ''}
                  onChange={(value) => setFormData({ ...formData, url: value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Alt Text</label>
                <GlassInput
                  value={formData.alt || ''}
                  onChange={(value) => setFormData({ ...formData, alt: value })}
                  placeholder="Image description"
                />
              </div>
            </>
          )}

          {module.type === 'video' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Video URL (YouTube, Vimeo, etc.)</label>
              <GlassInput
                value={formData.url || ''}
                onChange={(value) => setFormData({ ...formData, url: value })}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          )}

          {module.type === 'email-capture' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Heading</label>
                <GlassInput
                  value={formData.heading || ''}
                  onChange={(value) => setFormData({ ...formData, heading: value })}
                  placeholder="Subscribe to our newsletter"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Button Text</label>
                <GlassInput
                  value={formData.button_text || ''}
                  onChange={(value) => setFormData({ ...formData, button_text: value })}
                  placeholder="Subscribe"
                />
              </div>
            </>
          )}

          {module.type === 'contact-form' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Form Heading</label>
                <GlassInput
                  value={formData.heading || ''}
                  onChange={(value) => setFormData({ ...formData, heading: value })}
                  placeholder="Get in touch"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Submit Button Text</label>
                <GlassInput
                  value={formData.button_text || ''}
                  onChange={(value) => setFormData({ ...formData, button_text: value })}
                  placeholder="Send Message"
                />
              </div>
            </>
          )}

          {module.type === 'social-links' && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">Social Links</p>
              {['instagram', 'twitter', 'youtube', 'linkedin', 'facebook', 'github'].map((platform) => (
                <div key={platform}>
                  <label className="block text-xs font-medium text-slate-600 mb-1 capitalize">{platform}</label>
                  <GlassInput
                    value={formData[platform] || ''}
                    onChange={(value) => setFormData({ ...formData, [platform]: value })}
                    placeholder={`https://${platform}.com/...`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </GlassPanel>
    </motion.div>
  )
}

function SectionModal({ isOpen, onClose, onSave }: { isOpen: boolean, onClose: () => void, onSave: (title: string) => void }) {
  const [title, setTitle] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      onSave(title.trim())
      setTitle('')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[9998]"
            onClick={onClose}
          />

          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white/50 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 w-full max-w-md pointer-events-auto overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <motion.div
                    initial={{ rotate: -180, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="p-3 bg-accent-100/50 rounded-xl"
                  >
                    <Layers className="w-6 h-6 text-accent-600" />
                  </motion.div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Create New Section</h2>
                    <p className="text-sm text-slate-600">Organize your modules into sections</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Section Name</label>
                    <GlassInput
                      value={title}
                      onChange={setTitle}
                      placeholder="e.g., Featured Links, Social Media, About"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <GlassButton
                      type="button"
                      variant="secondary"
                      className="flex-1"
                      onClick={onClose}
                    >
                      Cancel
                    </GlassButton>
                    <GlassButton
                      type="submit"
                      className="flex-1"
                      disabled={!title.trim()}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Create Section
                    </GlassButton>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

function BuilderContent() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sections, setSections] = useState<SectionWithModules[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [showModuleTemplates, setShowModuleTemplates] = useState(false)
  const [showSectionModal, setShowSectionModal] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [showQRModal, setShowQRModal] = useState(false)
  const [showThemeModal, setShowThemeModal] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<ColorTheme | undefined>()

  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createBrowserClient()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const loadData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const profileId = searchParams.get('profile')
      let profileData

      if (profileId) {
        const { data } = await (supabase as any)
          .from('profiles')
          .select('*')
          .eq('id', profileId)
          .eq('user_id', user.id)
          .single()
        profileData = data
      } else {
        const { data } = await (supabase as any)
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        profileData = data
        if (profileData) {
          router.replace(`/dashboard/builder?profile=${profileData.id}`)
        }
      }

      if (!profileData) {
        router.push('/dashboard')
        return
      }

      setProfile(profileData)

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

      const sectionsWithModules: SectionWithModules[] = (sectionsData || []).map((section: Section) => ({
        ...section,
        modules: (modulesData || []).filter((m: Module) => m.section_id === section.id)
      }))

      setSections(sectionsWithModules)
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

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
    setActiveSection(event.active.data.current?.sectionId || activeSection)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id === over.id) return

    const sectionId = activeSection
    if (!sectionId) return

    const section = sections.find(s => s.id === sectionId)
    if (!section) return

    const oldIndex = section.modules.findIndex((m) => m.id === active.id)
    const newIndex = section.modules.findIndex((m) => m.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    const newModules = arrayMove(section.modules, oldIndex, newIndex)

    setSections(sections.map(s =>
      s.id === sectionId ? { ...s, modules: newModules } : s
    ))

    // Update order in database
    try {
      for (let i = 0; i < newModules.length; i++) {
        await (supabase as any)
          .from('modules')
          .update({ order: i })
          .eq('id', newModules[i].id)
      }
    } catch (error) {
      console.error('Error updating module order:', error)
    }
  }

  const handleAddModule = async (template: ModuleTemplate) => {
    if (!profile) {
      console.error('No profile loaded')
      alert('Error: No profile loaded. Please refresh the page.')
      return
    }

    if (!activeSection) {
      console.error('No active section')
      alert('Error: No section selected. Please try clicking "Add Module" again.')
      return
    }

    try {
      const section = sections.find(s => s.id === activeSection)
      const nextOrder = section ? section.modules.length : 0

      console.log('Adding module:', {
        profile_id: profile.id,
        section_id: activeSection,
        type: template.type,
        title: template.label,
        order: nextOrder
      })

      const { data, error } = await (supabase as any)
        .from('modules')
        .insert({
          profile_id: profile.id,
          section_id: activeSection,
          type: template.type,
          title: template.label,
          content: {},
          order: nextOrder,
          active: true
        })
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Module created successfully:', data)
      await loadData()
      setShowModuleTemplates(false)
      setEditingModule(data)
    } catch (error: any) {
      console.error('Error adding module:', error)
      alert(`Failed to add module: ${error.message || 'Unknown error'}. Check console for details.`)
    }
  }

  const handleUpdateModule = async (moduleId: string, updates: Partial<Module>) => {
    try {
      await (supabase as any)
        .from('modules')
        .update(updates)
        .eq('id', moduleId)

      await loadData()
      setEditingModule(null)
    } catch (error) {
      console.error('Error updating module:', error)
    }
  }

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module?')) return

    try {
      await (supabase as any)
        .from('modules')
        .delete()
        .eq('id', moduleId)

      await loadData()
    } catch (error) {
      console.error('Error deleting module:', error)
    }
  }

  const handleToggleModuleActive = async (module: Module) => {
    await handleUpdateModule(module.id, { active: !module.active })
  }

  const handleDuplicateModule = async (module: Module) => {
    if (!profile) return

    try {
      const section = sections.find(s => s.id === module.section_id)
      if (!section) return

      const { data, error } = await (supabase as any)
        .from('modules')
        .insert({
          profile_id: profile.id,
          section_id: module.section_id,
          type: module.type,
          title: `${module.title} (copy)`,
          content: module.content,
          order: section.modules.length,
          active: module.active
        })
        .select()
        .single()

      if (error) throw error

      await loadData()
      // Show success feedback
      console.log('Module duplicated successfully:', data)
    } catch (error: any) {
      console.error('Error duplicating module:', error)
      alert(`Failed to duplicate module: ${error.message || 'Unknown error'}`)
    }
  }

  const handleCreateSection = async (title: string) => {
    if (!profile) return

    try {
      await (supabase as any)
        .from('sections')
        .insert({
          profile_id: profile.id,
          title,
          order: sections.length,
          active: true
        })

      await loadData()
      setShowSectionModal(false)
    } catch (error) {
      console.error('Error adding section:', error)
    }
  }

  const handleSelectTheme = async (theme: ColorTheme) => {
    if (!profile) return

    try {
      // Save theme colors to profile metadata
      const { error } = await (supabase as any)
        .from('profiles')
        .update({
          theme_colors: theme.colors
        })
        .eq('id', profile.id)

      if (error) throw error

      setCurrentTheme(theme)
      console.log('Theme updated successfully:', theme.name)
    } catch (error: any) {
      console.error('Error updating theme:', error)
      alert(`Failed to update theme: ${error.message || 'Unknown error'}`)
    }
  }

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-12 w-12 border-b-2 border-accent-400"
        />
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

  const activeModule = activeId ? sections.flatMap(s => s.modules).find(m => m.id === activeId) : null

  return (
    <div className="flex h-full">
      <SectionModal
        isOpen={showSectionModal}
        onClose={() => setShowSectionModal(false)}
        onSave={handleCreateSection}
      />

      {profile && (
        <QRCodeModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          url={`${window.location.origin}/${profile.slug}`}
          profileName={profile.title || profile.slug}
        />
      )}

      <ColorThemeModal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        currentTheme={currentTheme}
        onSelectTheme={handleSelectTheme}
      />

      {/* Main Editor */}
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassPanel className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Builder</h1>
                <p className="text-slate-600 text-sm mt-1">{profile.title}</p>
              </div>
              <div className="flex items-center gap-3">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <GlassButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? <Edit2 className="w-4 h-4 mr-2" /> : <Smartphone className="w-4 h-4 mr-2" />}
                    {showPreview ? 'Edit' : 'Preview'}
                  </GlassButton>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <GlassButton
                    variant="secondary"
                    size="sm"
                    onClick={() => window.open(`/${profile.slug}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Live
                  </GlassButton>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <GlassButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowQRModal(true)}
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    QR Code
                  </GlassButton>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <GlassButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowThemeModal(true)}
                  >
                    <Palette className="w-4 h-4 mr-2" />
                    Theme
                  </GlassButton>
                </motion.div>
              </div>
            </div>

            <GlassInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search modules..."
              icon={<Search className="w-4 h-4" />}
            />
          </GlassPanel>
        </motion.div>

        {/* Module Editor */}
        <AnimatePresence>
          {editingModule && (
            <ModuleEditor
              module={editingModule}
              onSave={(data) => handleUpdateModule(editingModule.id, data)}
              onCancel={() => setEditingModule(null)}
            />
          )}
        </AnimatePresence>

        {/* Sections & Modules */}
        {showPreview ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <GlassPanel className="p-6">
              <div className="max-w-md mx-auto">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">{profile.title}</h2>
                  {profile.bio && <p className="text-slate-600 mt-2">{profile.bio}</p>}
                </div>
                {sections.map((section) => (
                  <div key={section.id} className="space-y-3 mb-6">
                    {section.title && (
                      <h3 className="text-lg font-bold text-slate-700">{section.title}</h3>
                    )}
                    {section.modules.filter(m => m.active).map((module, index) => (
                      <div key={module.id}>
                        <ModuleRenderer module={module} profileId={profile.id} index={index} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </GlassPanel>
          </motion.div>
        ) : (
          <GlassPanel className="p-6">
            <div className="space-y-2">
              {filteredSections.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <p className="text-slate-600 mb-4">No sections found</p>
                  <GlassButton onClick={() => setShowSectionModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Section
                  </GlassButton>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {filteredSections.map((section, sectionIndex) => (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: sectionIndex * 0.05 }}
                      className="space-y-1"
                    >
                      <motion.button
                        onClick={() => toggleSection(section.id)}
                        className="w-full flex items-center gap-2 p-3 hover:bg-white/30 rounded-lg transition-all group"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <motion.div
                          animate={{ rotate: expandedSections.has(section.id) ? 0 : -90 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-4 h-4 text-slate-600" />
                        </motion.div>
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
                      </motion.button>

                      <AnimatePresence>
                        {expandedSections.has(section.id) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="ml-6 space-y-1 overflow-hidden"
                          >
                            <DndContext
                              sensors={sensors}
                              collisionDetection={closestCenter}
                              onDragStart={handleDragStart}
                              onDragEnd={handleDragEnd}
                            >
                              <SortableContext
                                items={section.modules.map(m => m.id)}
                                strategy={verticalListSortingStrategy}
                              >
                                <AnimatePresence>
                                  {section.modules.map((module) => (
                                    <SortableModule
                                      key={module.id}
                                      module={module}
                                      isEditing={editingModule?.id === module.id}
                                      onEdit={() => setEditingModule(module)}
                                      onDelete={() => handleDeleteModule(module.id)}
                                      onToggleActive={() => handleToggleModuleActive(module)}
                                      onDuplicate={() => handleDuplicateModule(module)}
                                    />
                                  ))}
                                </AnimatePresence>
                              </SortableContext>

                              <DragOverlay>
                                {activeModule ? (
                                  <div className="flex items-center gap-3 p-3 bg-white/60 backdrop-blur-xl rounded-lg shadow-lg">
                                    <GripVertical className="w-4 h-4 text-slate-400" />
                                    <div className="p-2 bg-blue-100/50 rounded-lg">
                                      <LinkIcon className="w-4 h-4" />
                                    </div>
                                    <span className="font-semibold text-slate-800">
                                      {activeModule.title || activeModule.type}
                                    </span>
                                  </div>
                                ) : null}
                              </DragOverlay>
                            </DndContext>

                            <motion.button
                              onClick={() => {
                                setActiveSection(section.id)
                                setShowModuleTemplates(true)
                              }}
                              className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 hover:border-accent-400 hover:bg-accent-50/50 rounded-lg transition-all text-slate-600 hover:text-accent-600"
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                            >
                              <Plus className="w-4 h-4" />
                              <span className="text-sm font-semibold">Add Module</span>
                            </motion.button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {sections.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/30">
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <GlassButton
                    variant="secondary"
                    onClick={() => setShowSectionModal(true)}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Section
                  </GlassButton>
                </motion.div>
              </div>
            )}
          </GlassPanel>
        )}
      </div>

      {/* Module Templates Sidebar */}
      <AnimatePresence>
        {showModuleTemplates && (
          <motion.div
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="w-80 border-l border-white/30 bg-white/20 backdrop-blur-sm p-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800">Add Module</h3>
              <motion.button
                onClick={() => setShowModuleTemplates(false)}
                className="p-2 hover:bg-white/50 rounded-lg"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4 text-slate-600" />
              </motion.button>
            </div>

            <div className="space-y-2">
              {MODULE_TEMPLATES.map((template, index) => (
                <motion.button
                  key={template.type}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleAddModule(template)}
                  className="w-full flex items-start gap-3 p-4 bg-white/50 hover:bg-white/70 rounded-xl transition-all text-left group"
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className={`p-2 bg-${template.color}-100/50 rounded-lg`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    {template.icon}
                  </motion.div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">{template.label}</p>
                    <p className="text-xs text-slate-600">{template.description}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
