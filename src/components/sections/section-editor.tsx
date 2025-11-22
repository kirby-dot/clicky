'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Check, Layout, Palette, Maximize2 } from 'lucide-react'
import type { Section, SectionLayout, SectionStyle } from '@/types'

interface SectionEditorProps {
  section: Section
  onSave: (section: Section) => void
  onCancel: () => void
}

export function SectionEditor({ section, onSave, onCancel }: SectionEditorProps) {
  const [editedSection, setEditedSection] = useState<Section>(section)
  const [activeTab, setActiveTab] = useState<'layout' | 'style'>('layout')

  const updateLayout = (key: keyof SectionLayout, value: any) => {
    setEditedSection({
      ...editedSection,
      layout: {
        ...editedSection.layout,
        [key]: value,
      },
    })
  }

  const updateStyle = (key: keyof SectionStyle, value: any) => {
    setEditedSection({
      ...editedSection,
      style: {
        ...editedSection.style,
        [key]: value,
      },
    })
  }

  const updatePadding = (side: 'top' | 'bottom' | 'left' | 'right', value: number) => {
    setEditedSection({
      ...editedSection,
      style: {
        ...editedSection.style,
        padding: {
          ...editedSection.style.padding,
          [side]: value,
        },
      },
    })
  }

  const updateMargin = (side: 'top' | 'bottom', value: number) => {
    setEditedSection({
      ...editedSection,
      style: {
        ...editedSection.style,
        margin: {
          ...editedSection.style.margin,
          [side]: value,
        },
      },
    })
  }

  const updateGradient = (key: string, value: any) => {
    setEditedSection({
      ...editedSection,
      style: {
        ...editedSection.style,
        backgroundGradient: {
          ...(editedSection.style.backgroundGradient || {
            enabled: false,
            type: 'linear',
            direction: 'to bottom',
            colors: ['#ffffff', '#f3f4f6'],
          }),
          [key]: value,
        },
      },
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Edit Section</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Section Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section Title (Optional)
            </label>
            <Input
              value={editedSection.title || ''}
              onChange={(e) => setEditedSection({ ...editedSection, title: e.target.value })}
              placeholder="e.g., About Me, My Links, Contact"
            />
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 border-b">
            <button
              onClick={() => setActiveTab('layout')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'layout'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Layout className="w-4 h-4 inline mr-2" />
              Layout
            </button>
            <button
              onClick={() => setActiveTab('style')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'style'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Palette className="w-4 h-4 inline mr-2" />
              Style
            </button>
          </div>

          {/* Layout Tab */}
          {activeTab === 'layout' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Desktop Columns
                  </label>
                  <select
                    value={editedSection.layout.columns}
                    onChange={(e) => updateLayout('columns', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value={1}>1 Column</option>
                    <option value={2}>2 Columns</option>
                    <option value={3}>3 Columns</option>
                    <option value={4}>4 Columns</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Columns
                  </label>
                  <select
                    value={editedSection.layout.mobileColumns}
                    onChange={(e) => updateLayout('mobileColumns', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value={1}>1 Column</option>
                    <option value={2}>2 Columns</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Column Gap (px)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="64"
                    value={editedSection.layout.gap}
                    onChange={(e) => updateLayout('gap', parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alignment
                  </label>
                  <select
                    value={editedSection.layout.alignment}
                    onChange={(e) => updateLayout('alignment', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Style Tab */}
          {activeTab === 'style' && (
            <div className="space-y-6">
              {/* Background */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Background</h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Background Color
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={editedSection.style.backgroundColor || '#ffffff'}
                      onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={editedSection.style.backgroundColor || ''}
                      onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                      placeholder="#ffffff"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      checked={editedSection.style.backgroundGradient?.enabled || false}
                      onChange={(e) => updateGradient('enabled', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Use Gradient</span>
                  </label>

                  {editedSection.style.backgroundGradient?.enabled && (
                    <div className="space-y-3 ml-6">
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={editedSection.style.backgroundGradient.type}
                          onChange={(e) => updateGradient('type', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        >
                          <option value="linear">Linear</option>
                          <option value="radial">Radial</option>
                        </select>

                        {editedSection.style.backgroundGradient.type === 'linear' && (
                          <select
                            value={editedSection.style.backgroundGradient.direction || 'to bottom'}
                            onChange={(e) => updateGradient('direction', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          >
                            <option value="to bottom">Top to Bottom</option>
                            <option value="to top">Bottom to Top</option>
                            <option value="to right">Left to Right</option>
                            <option value="to left">Right to Left</option>
                            <option value="to bottom right">Diagonal ↘</option>
                            <option value="to top right">Diagonal ↗</option>
                          </select>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Gradient Colors
                        </label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={editedSection.style.backgroundGradient.colors[0] || '#ffffff'}
                            onChange={(e) => {
                              const newColors = [...(editedSection.style.backgroundGradient?.colors || [])]
                              newColors[0] = e.target.value
                              updateGradient('colors', newColors)
                            }}
                            className="w-16"
                          />
                          <Input
                            type="color"
                            value={editedSection.style.backgroundGradient.colors[1] || '#f3f4f6'}
                            onChange={(e) => {
                              const newColors = [...(editedSection.style.backgroundGradient?.colors || [])]
                              newColors[1] = e.target.value
                              updateGradient('colors', newColors)
                            }}
                            className="w-16"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Spacing */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Spacing</h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Padding</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      min="0"
                      value={editedSection.style.padding.top}
                      onChange={(e) => updatePadding('top', parseInt(e.target.value))}
                      placeholder="Top"
                    />
                    <Input
                      type="number"
                      min="0"
                      value={editedSection.style.padding.bottom}
                      onChange={(e) => updatePadding('bottom', parseInt(e.target.value))}
                      placeholder="Bottom"
                    />
                    <Input
                      type="number"
                      min="0"
                      value={editedSection.style.padding.left}
                      onChange={(e) => updatePadding('left', parseInt(e.target.value))}
                      placeholder="Left"
                    />
                    <Input
                      type="number"
                      min="0"
                      value={editedSection.style.padding.right}
                      onChange={(e) => updatePadding('right', parseInt(e.target.value))}
                      placeholder="Right"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Margin</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      min="0"
                      value={editedSection.style.margin.top}
                      onChange={(e) => updateMargin('top', parseInt(e.target.value))}
                      placeholder="Top"
                    />
                    <Input
                      type="number"
                      min="0"
                      value={editedSection.style.margin.bottom}
                      onChange={(e) => updateMargin('bottom', parseInt(e.target.value))}
                      placeholder="Bottom"
                    />
                  </div>
                </div>
              </div>

              {/* Visual Effects */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Visual Effects</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Border Radius (px)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="50"
                      value={editedSection.style.borderRadius}
                      onChange={(e) => updateStyle('borderRadius', parseInt(e.target.value))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Shadow</label>
                    <select
                      value={editedSection.style.shadow}
                      onChange={(e) => updateStyle('shadow', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="none">None</option>
                      <option value="sm">Small</option>
                      <option value="md">Medium</option>
                      <option value="lg">Large</option>
                      <option value="xl">Extra Large</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editedSection.style.fullWidth}
                      onChange={(e) => updateStyle('fullWidth', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      <Maximize2 className="w-4 h-4 inline mr-1" />
                      Full Width
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="pt-4 border-t border-gray-200">
            <Button
              onClick={() => onSave(editedSection)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Check className="w-4 h-4 mr-2" />
              Save Section
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
