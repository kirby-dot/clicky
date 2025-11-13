'use client'

import { useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Plus,
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
  Mail,
  DollarSign,
  Calendar,
  MapPin,
  Download,
  Code,
  Grid3x3,
  Columns,
  ArrowUp
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
}

const MODULE_TEMPLATES: ModuleTemplate[] = [
  {
    type: 'link',
    icon: <LinkIcon className="w-5 h-5" />,
    label: 'Link Button',
    description: 'A clickable link button',
    defaultContent: { url: '', icon: '' }
  },
  {
    type: 'social-links',
    icon: <Share2 className="w-5 h-5" />,
    label: 'Social Links',
    description: 'Social media icons',
    defaultContent: { links: [], layout: 'horizontal' }
  },
  {
    type: 'header',
    icon: <Type className="w-5 h-5" />,
    label: 'Header',
    description: 'Section heading',
    defaultContent: { text: '', level: 'h2', align: 'center' }
  },
  {
    type: 'text',
    icon: <Type className="w-5 h-5" />,
    label: 'Text Block',
    description: 'Paragraph text',
    defaultContent: { text: '', align: 'center' }
  },
  {
    type: 'image',
    icon: <ImageIcon className="w-5 h-5" />,
    label: 'Image',
    description: 'Single image',
    defaultContent: { url: '', alt: '' }
  },
  {
    type: 'divider',
    icon: <Minus className="w-5 h-5" />,
    label: 'Divider',
    description: 'Visual separator',
    defaultContent: { style: 'solid' }
  },
  {
    type: 'video',
    icon: <Video className="w-5 h-5" />,
    label: 'Video',
    description: 'Embed video',
    defaultContent: { url: '' }
  },
  {
    type: 'music',
    icon: <Music className="w-5 h-5" />,
    label: 'Music',
    description: 'Music player',
    defaultContent: { url: '' }
  },
  {
    type: 'email-signup',
    icon: <Mail className="w-5 h-5" />,
    label: 'Email Signup',
    description: 'Newsletter form',
    defaultContent: { placeholder: 'Enter your email', buttonText: 'Subscribe' }
  },
  {
    type: 'payment-button',
    icon: <DollarSign className="w-5 h-5" />,
    label: 'Payment',
    description: 'Payment button',
    defaultContent: { provider: 'stripe', url: '' }
  },
  {
    type: 'booking',
    icon: <Calendar className="w-5 h-5" />,
    label: 'Booking',
    description: 'Calendar booking',
    defaultContent: { url: '' }
  },
  {
    type: 'location',
    icon: <MapPin className="w-5 h-5" />,
    label: 'Location',
    description: 'Map/address',
    defaultContent: { address: '' }
  },
  {
    type: 'file-download',
    icon: <Download className="w-5 h-5" />,
    label: 'File Download',
    description: 'Downloadable file',
    defaultContent: { url: '', fileName: '' }
  },
  {
    type: 'custom-code',
    icon: <Code className="w-5 h-5" />,
    label: 'Custom Code',
    description: 'HTML/CSS/JS',
    defaultContent: { html: '' }
  },
  {
    type: 'button-grid',
    icon: <Grid3x3 className="w-5 h-5" />,
    label: 'Button Grid',
    description: '2x2 or 3x3 buttons',
    defaultContent: { buttons: [], columns: 2 }
  },
  {
    type: 'two-column',
    icon: <Columns className="w-5 h-5" />,
    label: 'Two Column',
    description: 'Side by side',
    defaultContent: { left: { type: 'text', content: '' }, right: { type: 'text', content: '' } }
  },
  {
    type: 'spacer',
    icon: <ArrowUp className="w-5 h-5" />,
    label: 'Spacer',
    description: 'Custom spacing',
    defaultContent: { height: 32 }
  },
]

export default function BuilderPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [previewKey, setPreviewKey] = useState(0) // For force refresh

  const supabase = createBrowserClient()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

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
      refreshPreview()
    } catch (error: any) {
      console.error('Error adding module:', error)
    }
  }

  const handleDeleteModule = async (id: string) => {
    if (!confirm('Delete this module?')) return

    try {
      const { error } = await supabase.from('modules').delete().eq('id', id)

      if (error) throw error

      setModules(modules.filter((m) => m.id !== id))
      refreshPreview()
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
      refreshPreview()
    } catch (error) {
      console.error('Error updating module:', error)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

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
      refreshPreview()
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
      refreshPreview()
    } catch (error: any) {
      console.error('Error updating module:', error)
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
    <div className="flex gap-6 h-screen">
      {/* Left Sidebar - Module Templates */}
      <div className="w-64 overflow-y-auto border-r-4 border-black p-4 space-y-2">
        <h2 className="text-xl font-black mb-4">Add Modules</h2>
        {MODULE_TEMPLATES.map((template) => (
          <button
            key={template.type}
            onClick={() => handleAddModule(template)}
            className="w-full p-3 border-3 border-black bg-white hover:bg-neo-yellow transition-colors text-left shadow-brutal-sm hover:shadow-brutal"
          >
            <div className="flex items-center gap-2 mb-1">
              {template.icon}
              <span className="font-bold text-sm">{template.label}</span>
            </div>
            <p className="text-xs text-gray-600">{template.description}</p>
          </button>
        ))}
      </div>

      {/* Center - Builder Canvas */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Page Builder</h1>
            <p className="text-gray-600 mt-1 font-medium">
              Drag and drop modules to build your page
            </p>
          </div>
        </div>

        {modules.length === 0 ? (
          <Card className="py-12">
            <CardContent className="text-center">
              <p className="text-gray-500 mb-4 font-medium">No modules yet</p>
              <p className="text-sm text-gray-400">
                Click modules from the left sidebar to add them
              </p>
            </CardContent>
          </Card>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={modules.map((m) => m.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
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
          </DndContext>
        )}
      </div>

      {/* Right Sidebar - Live Preview */}
      <div className="w-96 border-l-4 border-black bg-gray-50 overflow-hidden">
        <div className="bg-neo-yellow border-b-4 border-black p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-black">Live Preview</h2>
            <a
              href={`/${profile.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold underline flex items-center gap-1"
            >
              View Page
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <p className="text-sm text-gray-700 font-medium">
            Updates automatically
          </p>
        </div>
        <iframe
          key={previewKey}
          src={`/${profile.slug}`}
          className="w-full h-full border-0"
          title="Profile Preview"
        />
      </div>

      {/* Edit Module Modal */}
      {editingModule && (
        <ModuleEditor
          module={editingModule}
          onSave={handleUpdateModule}
          onCancel={() => setEditingModule(null)}
        />
      )}
    </div>
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
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: module.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const template = MODULE_TEMPLATES.find((t) => t.type === module.type)

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-4 transition-all hover:shadow-brutal-lg ${
        module.active ? '' : 'opacity-50'
      }`}
    >
      <div className="flex items-center gap-4">
        <button
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-black transition-colors"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-6 h-6" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {template?.icon}
            <h3 className="font-bold text-gray-900 text-lg">{module.title}</h3>
          </div>
          <p className="text-sm text-gray-600 font-medium">{template?.description}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" onClick={() => onEdit(module)}>
            <Code className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onToggleActive(module)}
            title={module.active ? 'Hide' : 'Show'}
          >
            {module.active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </Button>
          <Button
            size="icon"
            variant="destructive"
            onClick={() => onDelete(module.id)}
            className="hover:scale-105 transition-transform"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </Card>
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

  const updateContent = (key: string, value: any) => {
    setEditedModule({
      ...editedModule,
      content: {
        ...editedModule.content,
        [key]: value,
      },
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-neo-blue border-b-4 border-black">
          <CardTitle>Edit Module</CardTitle>
          <CardDescription className="text-gray-700">
            Configure module settings
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
            <Input
              value={editedModule.title || ''}
              onChange={(e) =>
                setEditedModule({ ...editedModule, title: e.target.value })
              }
            />
          </div>

          {/* Module-specific fields */}
          {module.type === 'link' && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">URL</label>
              <Input
                value={(editedModule.content as any).url || ''}
                onChange={(e) => updateContent('url', e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          )}

          {module.type === 'header' && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Text</label>
              <Input
                value={(editedModule.content as any).text || ''}
                onChange={(e) => updateContent('text', e.target.value)}
              />
            </div>
          )}

          {module.type === 'text' && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Text</label>
              <Textarea
                value={(editedModule.content as any).text || ''}
                onChange={(e) => updateContent('text', e.target.value)}
              />
            </div>
          )}

          {module.type === 'image' && (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Image URL
                </label>
                <Input
                  value={(editedModule.content as any).url || ''}
                  onChange={(e) => updateContent('url', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Alt Text
                </label>
                <Input
                  value={(editedModule.content as any).alt || ''}
                  onChange={(e) => updateContent('alt', e.target.value)}
                />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <Button onClick={() => onSave(editedModule)}>Save Changes</Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
