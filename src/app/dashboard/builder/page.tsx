'use client'

import { useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ModuleRenderer } from '@/components/modules/module-renderer'
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
  Mail
} from 'lucide-react'
import type { Module, ModuleType, Profile } from '@/types'
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
}

const MODULE_TEMPLATES: ModuleTemplate[] = [
  {
    type: 'link',
    icon: <LinkIcon className="w-4 h-4" />,
    label: 'Link Button',
    description: 'Clickable link',
    defaultContent: { url: 'https://example.com' },
    color: 'bg-pastel-sky'
  },
  {
    type: 'header',
    icon: <Type className="w-4 h-4" />,
    label: 'Header',
    description: 'Section title',
    defaultContent: { text: 'New Heading', level: 'h2', align: 'center' },
    color: 'bg-pastel-lavender'
  },
  {
    type: 'text',
    icon: <Type className="w-4 h-4" />,
    label: 'Text Block',
    description: 'Paragraph',
    defaultContent: { text: 'Add your text...', align: 'center' },
    color: 'bg-pastel-peach'
  },
  {
    type: 'image',
    icon: <ImageIcon className="w-4 h-4" />,
    label: 'Image',
    description: 'Photo/graphic',
    defaultContent: { url: '', alt: '' },
    color: 'bg-pastel-mint'
  },
  {
    type: 'divider',
    icon: <Minus className="w-4 h-4" />,
    label: 'Divider',
    description: 'Separator line',
    defaultContent: { style: 'solid' },
    color: 'bg-pastel-sage'
  },
  {
    type: 'video',
    icon: <Video className="w-4 h-4" />,
    label: 'Video',
    description: 'YouTube/Vimeo',
    defaultContent: { url: '' },
    color: 'bg-pastel-rose'
  },
  {
    type: 'music',
    icon: <Music className="w-4 h-4" />,
    label: 'Music',
    description: 'Spotify/etc',
    defaultContent: { url: '' },
    color: 'bg-pastel-butter'
  },
  {
    type: 'social-links',
    icon: <Share2 className="w-4 h-4" />,
    label: 'Social Links',
    description: 'Social icons',
    defaultContent: { links: [], layout: 'horizontal' },
    color: 'bg-pastel-lilac'
  },
  {
    type: 'spacer',
    icon: <ArrowUp className="w-4 h-4" />,
    label: 'Spacer',
    description: 'Empty space',
    defaultContent: { height: 32 },
    color: 'bg-gray-100'
  },
  {
    type: 'button',
    icon: <MousePointerClick className="w-4 h-4" />,
    label: 'Button/CTA',
    description: 'Call-to-action',
    defaultContent: { url: '', text: 'Click Here', style: 'primary' },
    color: 'bg-pastel-rose'
  },
  {
    type: 'accordion',
    icon: <HelpCircle className="w-4 h-4" />,
    label: 'Accordion/FAQ',
    description: 'Expandable Q&A',
    defaultContent: { question: 'Question?', answer: 'Answer here...' },
    color: 'bg-pastel-mint'
  },
  {
    type: 'countdown',
    icon: <Clock className="w-4 h-4" />,
    label: 'Countdown',
    description: 'Timer/Launch',
    defaultContent: { targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), title: 'Coming Soon' },
    color: 'bg-pastel-lavender'
  },
  {
    type: 'email',
    icon: <Mail className="w-4 h-4" />,
    label: 'Email Button',
    description: 'Contact button',
    defaultContent: { email: '', buttonText: 'Get in Touch' },
    color: 'bg-pastel-sage'
  },
  {
    type: 'button-grid',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>,
    label: 'Button Grid',
    description: '2-3 columns',
    defaultContent: { buttons: [{ title: 'Button 1', url: '' }, { title: 'Button 2', url: '' }], columns: 2 },
    color: 'bg-pastel-butter'
  },
]

export default function BuilderPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [previewKey, setPreviewKey] = useState(0)
  const [saving, setSaving] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [showStyleEditor, setShowStyleEditor] = useState(false)
  const [pageStyle, setPageStyle] = useState<{
    backgroundColor?: string
    backgroundImage?: string
    containerWidth?: 'full' | 'contained'
  }>({
    backgroundColor: profile?.bg_color || '#f9fafb',
    containerWidth: 'contained'
  })

  const supabase = createBrowserClient()

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

      if (!profileData) return

      setProfile(profileData)

      const { data: modulesData } = await supabase
        .from('modules')
        .select('*')
        .eq('profile_id', profileData.id)
        .order('position')

      setModules((modulesData as Module[]) || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshPreview = useCallback(() => {
    setPreviewKey(prev => prev + 1)
  }, [])

  const handleAddModule = async (template: ModuleTemplate) => {
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

    if (!over || active.id === over.id) return

    const oldIndex = modules.findIndex((m) => m.id === active.id)
    const newIndex = modules.findIndex((m) => m.id === over.id)

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Page Builder</h1>
          <p className="text-gray-500 mt-2">Drag modules to reorder, click to edit</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowStyleEditor(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            Page Styling
          </Button>
          <Button
            onClick={refreshPreview}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar - Module Templates */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-900">Add Modules</h2>
            <p className="text-sm text-gray-500 mb-4">Click to add to your page</p>
          </div>
          <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
            {MODULE_TEMPLATES.map((template) => (
              <button
                key={template.type}
                onClick={() => handleAddModule(template)}
                disabled={saving}
                className={`w-full p-3 ${template.color} rounded-xl text-left shadow-soft hover:shadow-soft-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    {template.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-gray-900">{template.label}</div>
                    <div className="text-xs text-gray-600">{template.description}</div>
                  </div>
                  <Plus className="w-4 h-4 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Center - Builder Canvas */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-900">Your Modules</h2>
            <p className="text-sm text-gray-500 mb-4">Drag to reorder, click to edit</p>
          </div>
          <div className="max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
          {modules.length === 0 ? (
            <Card className="py-16">
              <CardContent className="text-center">
                <div className="max-w-sm mx-auto">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Plus className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">No modules yet</p>
                  <p className="text-sm text-gray-500">
                    Click any module from the left sidebar to add it to your page
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
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
                <div className="space-y-4">
                  {modules.map((module) => (
                    <SortableModule
                      key={module.id}
                      module={module}
                      onDelete={handleDeleteModule}
                      onToggleActive={handleToggleActive}
                      onEdit={setEditingModule}
                    />
                  ))}
                </div>
              </SortableContext>
              <DragOverlay>
                {activeModule ? (
                  <div className="opacity-90">
                    <ModuleCard module={activeModule} isDragging={true} />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
          </div>
        </div>

        {/* Right - Live Preview */}
        <div className="lg:col-span-5">
          {profile && (
            <div className="sticky top-8">
              <Card>
                <CardHeader className="bg-gradient-to-r from-pastel-sky to-pastel-lavender">
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-gray-900">Live Preview</span>
                    {profile.slug && (
                      <a
                        href={`/${profile.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                      >
                        View Page
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </CardTitle>
                  <CardDescription className="text-gray-700">
                    Real-time preview - updates instantly
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="relative w-full overflow-y-auto rounded-b-2xl" style={{ height: 'calc(100vh - 280px)', background: pageStyle.backgroundColor || 'linear-gradient(to-br, #f0f9ff, #faf5ff)', backgroundImage: pageStyle.backgroundImage ? `url(${pageStyle.backgroundImage})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    <LivePreview profile={profile} modules={modules.filter(m => m.active)} containerWidth={pageStyle.containerWidth} />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Edit Module Modal */}
      {editingModule && (
        <ModuleEditor
          module={editingModule}
          onSave={handleUpdateModule}
          onCancel={() => setEditingModule(null)}
        />
      )}

      {/* Page Style Editor Modal */}
      {showStyleEditor && (
        <PageStyleEditor
          style={pageStyle}
          onSave={(newStyle) => {
            setPageStyle(newStyle)
            setShowStyleEditor(false)
          }}
          onCancel={() => setShowStyleEditor(false)}
        />
      )}
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
  onSave,
  onCancel,
}: {
  module: Module
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

// Page Style Editor Component
function PageStyleEditor({
  style,
  onSave,
  onCancel,
}: {
  style: { backgroundColor?: string; backgroundImage?: string; containerWidth?: "full" | "contained" }
  onSave: (style: { backgroundColor?: string; backgroundImage?: string; containerWidth?: "full" | "contained" }) => void
  onCancel: () => void
}) {
  const [editedStyle, setEditedStyle] = useState(style)

  const backgroundPresets = [
    { name: 'Light Gray', value: '#f9fafb' },
    { name: 'White', value: '#ffffff' },
    { name: 'Sky', value: 'linear-gradient(to-br, #f0f9ff, #e0f2fe)' },
    { name: 'Sunset', value: 'linear-gradient(to-br, #fef3c7, #fecaca)' },
    { name: 'Ocean', value: 'linear-gradient(to-br, #dbeafe, #e0e7ff)' },
  ]

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-lg" onClick={onCancel}>
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-8 rounded-t-3xl">
          <h2 className="text-3xl font-bold text-white">Page Styling</h2>
          <p className="text-white/90 mt-1">Customize your page appearance</p>
        </div>

        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-3">
            <label className="font-bold text-gray-900">Background</label>
            <div className="grid grid-cols-5 gap-3">
              {backgroundPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setEditedStyle({ ...editedStyle, backgroundColor: preset.value })}
                  className={`h-20 rounded-xl border-2 ${editedStyle.backgroundColor === preset.value ? 'ring-4 ring-purple-500' : 'border-gray-200'}`}
                  style={{ background: preset.value }}
                >
                  <span className="text-xs font-bold bg-white/90 px-2 py-1 rounded">{preset.name}</span>
                </button>
              ))}
            </div>
            <Input
              value={editedStyle.backgroundColor || ''}
              onChange={(e) => setEditedStyle({ ...editedStyle, backgroundColor: e.target.value })}
              placeholder="Custom color or gradient"
              className="mt-2"
            />
          </div>

          <div className="space-y-3">
            <label className="font-bold text-gray-900">Background Image URL (optional)</label>
            <Input
              value={editedStyle.backgroundImage || ''}
              onChange={(e) => setEditedStyle({ ...editedStyle, backgroundImage: e.target.value })}
              placeholder="https://example.com/bg.jpg"
            />
          </div>

          <div className="space-y-3">
            <label className="font-bold text-gray-900">Container Width</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setEditedStyle({ ...editedStyle, containerWidth: 'contained' })}
                className={`p-4 rounded-xl border-2 ${editedStyle.containerWidth === 'contained' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}
              >
                <p className="font-bold">Contained</p>
                <p className="text-sm text-gray-600">Max width with margins</p>
              </button>
              <button
                onClick={() => setEditedStyle({ ...editedStyle, containerWidth: 'full' })}
                className={`p-4 rounded-xl border-2 ${editedStyle.containerWidth === 'full' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}
              >
                <p className="font-bold">Full Width</p>
                <p className="text-sm text-gray-600">Edge to edge content</p>
              </button>
            </div>
          </div>
        </div>

        <div className="border-t p-6 flex gap-4">
          <Button onClick={() => onSave(editedStyle)} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500">
            Apply Styling
          </Button>
          <Button onClick={onCancel} variant="outline">Cancel</Button>
        </div>
      </div>
    </div>
  )
}
