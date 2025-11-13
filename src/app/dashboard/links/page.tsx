'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, GripVertical, ExternalLink, Eye, EyeOff } from 'lucide-react'
import { isValidUrl } from '@/lib/utils'
import type { Link, Profile } from '@/types'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export default function LinksPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddLink, setShowAddLink] = useState(false)
  const [newLink, setNewLink] = useState({ title: '', url: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

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

      const { data: linksData } = await supabase
        .from('links')
        .select('*')
        .eq('profile_id', profileData.id)
        .order('position')

      setLinks(linksData || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!isValidUrl(newLink.url)) {
      setError('Please enter a valid URL (include https://)')
      return
    }

    if (!profile) return

    setSaving(true)

    try {
      const { data, error } = await supabase
        .from('links')
        .insert({
          profile_id: profile.id,
          title: newLink.title,
          url: newLink.url,
          position: links.length,
          type: 'link',
        })
        .select()
        .single()

      if (error) throw error

      setLinks([...links, data])
      setNewLink({ title: '', url: '' })
      setShowAddLink(false)
    } catch (error: any) {
      setError(error.message || 'Failed to add link')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteLink = async (id: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return

    try {
      const { error } = await supabase.from('links').delete().eq('id', id)

      if (error) throw error

      setLinks(links.filter((link) => link.id !== id))
    } catch (error) {
      console.error('Error deleting link:', error)
    }
  }

  const handleToggleActive = async (link: Link) => {
    try {
      const { error } = await supabase
        .from('links')
        .update({ active: !link.active })
        .eq('id', link.id)

      if (error) throw error

      setLinks(
        links.map((l) => (l.id === link.id ? { ...l, active: !l.active } : l))
      )
    } catch (error) {
      console.error('Error updating link:', error)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const oldIndex = links.findIndex((link) => link.id === active.id)
    const newIndex = links.findIndex((link) => link.id === over.id)

    const newLinks = arrayMove(links, oldIndex, newIndex)
    setLinks(newLinks)

    // Update positions in database
    try {
      const updates = newLinks.map((link, index) =>
        supabase.from('links').update({ position: index }).eq('id', link.id)
      )
      await Promise.all(updates)
    } catch (error) {
      console.error('Error updating positions:', error)
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
          <CardDescription>Create a profile first to manage links</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left side: Link Editor */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Links</h1>
            <p className="text-gray-600 mt-1 font-medium">Add and organize your links</p>
          </div>
          <Button onClick={() => setShowAddLink(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Add link
          </Button>
        </div>

      {showAddLink && (
        <Card>
          <CardHeader>
            <CardTitle>Add new link</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddLink} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link title
                </label>
                <Input
                  placeholder="My Portfolio"
                  value={newLink.title}
                  onChange={(e) =>
                    setNewLink({ ...newLink, title: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL
                </label>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={newLink.url}
                  onChange={(e) =>
                    setNewLink({ ...newLink, url: e.target.value })
                  }
                  required
                />
              </div>

              {error && (
                <div className="p-3 rounded-md text-sm bg-red-50 text-red-800 border border-red-200">
                  {error}
                </div>
              )}

              <div className="flex space-x-3">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Adding...' : 'Add link'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddLink(false)
                    setError('')
                    setNewLink({ title: '', url: '' })
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {links.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">No links yet</p>
            <Button onClick={() => setShowAddLink(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add your first link
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={links.map((link) => link.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {links.map((link) => (
                <SortableLink
                  key={link.id}
                  link={link}
                  onDelete={handleDeleteLink}
                  onToggleActive={handleToggleActive}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      </div>

      {/* Right side: Live Preview */}
      <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-8rem)]">
        <Card className="h-full overflow-hidden">
          <CardHeader className="bg-neo-yellow border-b-4 border-black">
            <CardTitle className="flex items-center justify-between">
              <span>Live Preview</span>
              <a
                href={`/${profile.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium underline flex items-center gap-1"
              >
                View Page
                <ExternalLink className="w-4 h-4" />
              </a>
            </CardTitle>
            <CardDescription className="text-gray-700">
              This is how your profile looks to visitors
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 h-[calc(100%-5rem)] bg-gray-50">
            <iframe
              src={`/${profile.slug}`}
              className="w-full h-full border-0"
              title="Profile Preview"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SortableLink({
  link,
  onDelete,
  onToggleActive,
}: {
  link: Link
  onDelete: (id: string) => void
  onToggleActive: (link: Link) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: link.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-4 transition-all hover:shadow-brutal-lg ${
        link.active ? '' : 'opacity-50'
      }`}
    >
      <div className="flex items-center space-x-4">
        <button
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-black transition-colors"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-6 h-6" />
        </button>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate text-lg">{link.title}</h3>
          <a
            href={link.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-600 hover:text-neo-blue font-medium truncate flex items-center space-x-1 transition-colors"
          >
            <span className="truncate">{link.url}</span>
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-neo-yellow border-2 border-black px-3 py-1 text-sm font-bold">
            {link.clicks} clicks
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onToggleActive(link)}
            title={link.active ? 'Hide link' : 'Show link'}
          >
            {link.active ? (
              <Eye className="w-5 h-5" />
            ) : (
              <EyeOff className="w-5 h-5" />
            )}
          </Button>
          <Button
            size="icon"
            variant="destructive"
            onClick={() => onDelete(link.id)}
            className="hover:scale-105 transition-transform"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
