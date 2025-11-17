'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { GlassPanel, GlassCard, GlassButton, GlassInput, GlassBadge } from '@/components/ui/glass'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ModuleRenderer } from '@/components/modules/module-renderer'
import {
  Search, Plus, GripVertical, MoreHorizontal, ChevronDown, ChevronRight,
  Link as LinkIcon, Type, Image as ImageIcon, Video, Mail, Users, Eye, EyeOff,
  Edit2, Trash2, ExternalLink, X, Check, Save, Smartphone, Copy, Settings as SettingsIcon,
  Instagram, Twitter, Youtube, Linkedin, Facebook, Github, MessageCircle, Send, Music
} from 'lucide-react'
import type { Module, ModuleType, Section, Profile } from '@/types'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
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
}

function SortableModule({ module, isEditing, onEdit, onDelete, onToggleActive }: SortableModuleProps) {
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

  const template = MODULE_TEMPLATES.find(t => t.type === module.type)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-white/20 hover:bg-white/40 rounded-lg transition-all group ${
        isEditing ? 'ring-2 ring-accent-400' : ''
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-4 h-4 text-slate-400" />
      </div>

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
        <button
          onClick={onToggleActive}
          className="p-2 hover:bg-white/50 rounded-lg transition-opacity opacity-0 group-hover:opacity-100"
        >
          {module.active ? (
            <Eye className="w-4 h-4 text-green-600" />
          ) : (
            <EyeOff className="w-4 h-4 text-slate-400" />
          )}
        </button>
        <button
          onClick={onEdit}
          className="p-2 hover:bg-white/50 rounded-lg transition-opacity opacity-0 group-hover:opacity-100"
        >
          <Edit2 className="w-4 h-4 text-blue-600" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 hover:bg-white/50 rounded-lg transition-opacity opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </button>
      </div>
    </div>
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
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

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
    if (!profile || !activeSection) return

    try {
      const section = sections.find(s => s.id === activeSection)
      const nextOrder = section ? section.modules.length : 0

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

      if (error) throw error

      await loadData()
      setShowModuleTemplates(false)
      setEditingModule(data)
    } catch (error) {
      console.error('Error adding module:', error)
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

  const handleAddSection = async () => {
    if (!profile) return

    const title = prompt('Enter section name:')
    if (!title) return

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
    } catch (error) {
      console.error('Error adding section:', error)
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
    <div className="flex h-full">
      {/* Main Editor */}
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <GlassPanel className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Builder</h1>
              <p className="text-slate-600 text-sm mt-1">{profile.title}</p>
            </div>
            <div className="flex items-center gap-3">
              <GlassButton
                variant="secondary"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <Edit2 className="w-4 h-4 mr-2" /> : <Smartphone className="w-4 h-4 mr-2" />}
                {showPreview ? 'Edit' : 'Preview'}
              </GlassButton>
              <GlassButton
                variant="secondary"
                size="sm"
                onClick={() => window.open(`/${profile.slug}`, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Live
              </GlassButton>
            </div>
          </div>

          <GlassInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search modules..."
            icon={<Search className="w-4 h-4" />}
          />
        </GlassPanel>

        {/* Module Editor */}
        {editingModule && (
          <ModuleEditor
            module={editingModule}
            onSave={(data) => handleUpdateModule(editingModule.id, data)}
            onCancel={() => setEditingModule(null)}
          />
        )}

        {/* Sections & Modules */}
        {showPreview ? (
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
        ) : (
          <GlassPanel className="p-6">
            <div className="space-y-2">
              {filteredSections.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-600 mb-4">No sections found</p>
                  <GlassButton onClick={handleAddSection}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Section
                  </GlassButton>
                </div>
              ) : (
                filteredSections.map((section) => (
                  <div key={section.id} className="space-y-1">
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

                    {expandedSections.has(section.id) && (
                      <div className="ml-6 space-y-1">
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleDragEnd}
                          onDragStart={() => setActiveSection(section.id)}
                        >
                          <SortableContext
                            items={section.modules.map(m => m.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            {section.modules.map((module) => (
                              <SortableModule
                                key={module.id}
                                module={module}
                                isEditing={editingModule?.id === module.id}
                                onEdit={() => setEditingModule(module)}
                                onDelete={() => handleDeleteModule(module.id)}
                                onToggleActive={() => handleToggleModuleActive(module)}
                              />
                            ))}
                          </SortableContext>
                        </DndContext>

                        <button
                          onClick={() => {
                            setActiveSection(section.id)
                            setShowModuleTemplates(true)
                          }}
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
        )}
      </div>

      {/* Module Templates Sidebar */}
      {showModuleTemplates && (
        <div className="w-80 border-l border-white/30 bg-white/20 backdrop-blur-sm p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Add Module</h3>
            <button
              onClick={() => setShowModuleTemplates(false)}
              className="p-2 hover:bg-white/50 rounded-lg"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          <div className="space-y-2">
            {MODULE_TEMPLATES.map((template) => (
              <button
                key={template.type}
                onClick={() => handleAddModule(template)}
                className="w-full flex items-start gap-3 p-4 bg-white/50 hover:bg-white/70 rounded-xl transition-all text-left group"
              >
                <div className={`p-2 bg-${template.color}-100/50 rounded-lg group-hover:scale-110 transition-transform`}>
                  {template.icon}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{template.label}</p>
                  <p className="text-xs text-slate-600">{template.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
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
