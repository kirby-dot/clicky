'use client'

import { useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  Plus
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
]

export default function BuilderPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [previewKey, setPreviewKey] = useState(0)
  const [saving, setSaving] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

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
        <Button
          onClick={refreshPreview}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Preview
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar - Module Templates */}
        <div className="lg:col-span-1 space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-900">Add Modules</h2>
            <p className="text-sm text-gray-500 mb-4">Click to add to your page</p>
          </div>
          <div className="space-y-2">
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
        <div className="lg:col-span-3 space-y-6">
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

          {/* Live Preview */}
          {profile && (
            <Card className="mt-8">
              <CardHeader className="bg-gradient-to-r from-pastel-sky to-pastel-lavender">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-gray-900">Live Preview</span>
                  <a
                    href={`/${profile.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  >
                    View Page
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </CardTitle>
                <CardDescription className="text-gray-700">
                  Updates automatically after changes
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative w-full bg-gray-50" style={{ height: '600px' }}>
                  <iframe
                    key={previewKey}
                    src={`/${profile.slug}?preview=${Date.now()}`}
                    className="w-full h-full border-0"
                    title="Profile Preview"
                  />
                </div>
              </CardContent>
            </Card>
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-pastel-lavender to-pastel-sky">
          <CardTitle className="text-gray-900">Edit Module</CardTitle>
          <CardDescription className="text-gray-700">
            Configure your module settings
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Title</label>
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
              <label className="block text-sm font-semibold text-gray-900 mb-2">URL</label>
              <Input
                value={(editedModule.content as any).url || ''}
                onChange={(e) => updateContent('url', e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          )}

          {module.type === 'header' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Text</label>
                <Input
                  value={(editedModule.content as any).text || ''}
                  onChange={(e) => updateContent('text', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Level</label>
                <select
                  value={(editedModule.content as any).level || 'h2'}
                  onChange={(e) => updateContent('level', e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-gray-300 bg-white"
                >
                  <option value="h1">H1</option>
                  <option value="h2">H2</option>
                  <option value="h3">H3</option>
                </select>
              </div>
            </>
          )}

          {module.type === 'text' && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Text</label>
              <Textarea
                value={(editedModule.content as any).text || ''}
                onChange={(e) => updateContent('text', e.target.value)}
                rows={6}
              />
            </div>
          )}

          {module.type === 'image' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Image URL
                </label>
                <Input
                  value={(editedModule.content as any).url || ''}
                  onChange={(e) => updateContent('url', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Alt Text
                </label>
                <Input
                  value={(editedModule.content as any).alt || ''}
                  onChange={(e) => updateContent('alt', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Caption (optional)
                </label>
                <Input
                  value={(editedModule.content as any).caption || ''}
                  onChange={(e) => updateContent('caption', e.target.value)}
                />
              </div>
            </>
          )}

          {module.type === 'video' && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Video URL (YouTube or Vimeo)
              </label>
              <Input
                value={(editedModule.content as any).url || ''}
                onChange={(e) => updateContent('url', e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          )}

          {module.type === 'music' && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Music URL (Spotify or SoundCloud)
              </label>
              <Input
                value={(editedModule.content as any).url || ''}
                onChange={(e) => updateContent('url', e.target.value)}
                placeholder="https://open.spotify.com/track/..."
              />
            </div>
          )}

          {module.type === 'spacer' && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Height (pixels)
              </label>
              <Input
                type="number"
                value={(editedModule.content as any).height || 32}
                onChange={(e) => updateContent('height', parseInt(e.target.value))}
                min="8"
                max="200"
              />
            </div>
          )}

          {module.type === 'divider' && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Style</label>
              <select
                value={(editedModule.content as any).style || 'solid'}
                onChange={(e) => updateContent('style', e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-gray-300 bg-white"
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
                <option value="double">Double</option>
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-6 border-t">
            <Button onClick={() => onSave(editedModule)} className="flex-1">
              Save Changes
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
