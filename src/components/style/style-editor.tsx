'use client'

import { useState } from 'react'
import { X, Type, Palette, Layout as LayoutIcon, Sparkles, Image as ImageIcon } from 'lucide-react'
import type { ProfileStyle } from '@/types'

interface StyleEditorProps {
  style: Partial<ProfileStyle>
  onSave: (style: ProfileStyle) => void
  onCancel: () => void
}

const DEFAULT_STYLE: ProfileStyle = {
  fontFamily: 'Inter, system-ui, sans-serif',
  headingSize: 'large',
  bodySize: 'medium',
  primaryColor: '#6366f1',
  secondaryColor: '#8b5cf6',
  accentColor: '#ec4899',
  backgroundColor: '#ffffff',
  textColor: '#111827',
  buttonRoundness: 'rounded',
  sectionSpacing: 'normal',
  moduleSpacing: 'normal',
  animation: 'fade-up',
}

const STYLE_TEMPLATES = [
  {
    name: 'Clean White',
    style: {
      fontFamily: 'Inter, system-ui, sans-serif',
      headingSize: 'large' as const,
      bodySize: 'medium' as const,
      primaryColor: '#6366f1',
      secondaryColor: '#8b5cf6',
      accentColor: '#ec4899',
      backgroundColor: '#ffffff',
      textColor: '#111827',
      buttonRoundness: 'rounded' as const,
      sectionSpacing: 'normal' as const,
      moduleSpacing: 'normal' as const,
      animation: 'fade-up' as const,
    },
  },
  {
    name: 'Midnight',
    style: {
      fontFamily: 'Inter, system-ui, sans-serif',
      headingSize: 'large' as const,
      bodySize: 'medium' as const,
      primaryColor: '#8b5cf6',
      secondaryColor: '#6366f1',
      accentColor: '#ec4899',
      backgroundColor: '#0f172a',
      textColor: '#f1f5f9',
      buttonRoundness: 'rounded' as const,
      sectionSpacing: 'normal' as const,
      moduleSpacing: 'normal' as const,
      animation: 'fade-up' as const,
    },
  },
  {
    name: 'Sunset',
    style: {
      fontFamily: 'Georgia, serif',
      headingSize: 'xl' as const,
      bodySize: 'large' as const,
      primaryColor: '#f97316',
      secondaryColor: '#dc2626',
      accentColor: '#fbbf24',
      backgroundColor: '#fff7ed',
      backgroundGradient: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
      textColor: '#78350f',
      buttonRoundness: 'pill' as const,
      sectionSpacing: 'loose' as const,
      moduleSpacing: 'normal' as const,
      animation: 'scale-in' as const,
    },
  },
  {
    name: 'Ocean Breeze',
    style: {
      fontFamily: 'system-ui, sans-serif',
      headingSize: 'large' as const,
      bodySize: 'medium' as const,
      primaryColor: '#0ea5e9',
      secondaryColor: '#06b6d4',
      accentColor: '#22d3ee',
      backgroundColor: '#f0f9ff',
      backgroundGradient: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
      textColor: '#0c4a6e',
      buttonRoundness: 'rounded' as const,
      sectionSpacing: 'normal' as const,
      moduleSpacing: 'normal' as const,
      animation: 'fade-up' as const,
    },
  },
  {
    name: 'Forest',
    style: {
      fontFamily: 'system-ui, sans-serif',
      headingSize: 'large' as const,
      bodySize: 'medium' as const,
      primaryColor: '#16a34a',
      secondaryColor: '#15803d',
      accentColor: '#84cc16',
      backgroundColor: '#f7fee7',
      backgroundGradient: 'linear-gradient(135deg, #f7fee7 0%, #d9f99d 100%)',
      textColor: '#14532d',
      buttonRoundness: 'slightly-rounded' as const,
      sectionSpacing: 'normal' as const,
      moduleSpacing: 'tight' as const,
      animation: 'fade-in' as const,
    },
  },
  {
    name: 'Lavender Dream',
    style: {
      fontFamily: '"Times New Roman", serif',
      headingSize: 'xl' as const,
      bodySize: 'medium' as const,
      primaryColor: '#a855f7',
      secondaryColor: '#c026d3',
      accentColor: '#e879f9',
      backgroundColor: '#faf5ff',
      backgroundGradient: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
      textColor: '#581c87',
      buttonRoundness: 'pill' as const,
      sectionSpacing: 'loose' as const,
      moduleSpacing: 'loose' as const,
      animation: 'scale-in' as const,
    },
  },
  {
    name: 'Monochrome',
    style: {
      fontFamily: 'ui-monospace, monospace',
      headingSize: 'medium' as const,
      bodySize: 'small' as const,
      primaryColor: '#171717',
      secondaryColor: '#404040',
      accentColor: '#737373',
      backgroundColor: '#ffffff',
      textColor: '#0a0a0a',
      buttonRoundness: 'square' as const,
      sectionSpacing: 'tight' as const,
      moduleSpacing: 'tight' as const,
      animation: 'none' as const,
    },
  },
  {
    name: 'Candy',
    style: {
      fontFamily: 'Arial, sans-serif',
      headingSize: 'xl' as const,
      bodySize: 'large' as const,
      primaryColor: '#ec4899',
      secondaryColor: '#f472b6',
      accentColor: '#fbbf24',
      backgroundColor: '#fef3c7',
      backgroundGradient: 'linear-gradient(135deg, #fef3c7 0%, #fce7f3 50%, #e0e7ff 100%)',
      textColor: '#831843',
      buttonRoundness: 'pill' as const,
      sectionSpacing: 'loose' as const,
      moduleSpacing: 'normal' as const,
      animation: 'scale-in' as const,
    },
  },
]

export function StyleEditor({ style, onSave, onCancel }: StyleEditorProps) {
  const [editedStyle, setEditedStyle] = useState<ProfileStyle>({
    ...DEFAULT_STYLE,
    ...style,
  })
  const [activeTab, setActiveTab] = useState<'templates' | 'customize'>('templates')

  const fontOptions = [
    { value: 'Inter, system-ui, sans-serif', label: 'Inter' },
    { value: 'system-ui, sans-serif', label: 'System' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: '"Times New Roman", serif', label: 'Times' },
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: 'Verdana, sans-serif', label: 'Verdana' },
    { value: 'ui-monospace, monospace', label: 'Mono' },
    { value: '"Courier New", monospace', label: 'Courier' },
  ]

  const roundnessOptions = [
    { value: 'square' as const, label: 'Square', preview: '0px' },
    { value: 'slightly-rounded' as const, label: 'Slight', preview: '6px' },
    { value: 'rounded' as const, label: 'Rounded', preview: '12px' },
    { value: 'pill' as const, label: 'Pill', preview: '9999px' },
  ]

  const spacingOptions = [
    { value: 'tight' as const, label: 'Tight' },
    { value: 'normal' as const, label: 'Normal' },
    { value: 'loose' as const, label: 'Loose' },
  ]

  const animationOptions = [
    { value: 'none' as const, label: 'None' },
    { value: 'fade-in' as const, label: 'Fade In' },
    { value: 'fade-up' as const, label: 'Fade Up' },
    { value: 'scale-in' as const, label: 'Scale' },
  ]

  const gradientPresets = [
    { name: 'None', value: '' },
    { name: 'Sunset', value: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)', preview: 'from-orange-50 to-orange-200' },
    { name: 'Ocean', value: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)', preview: 'from-sky-100 to-sky-200' },
    { name: 'Forest', value: 'linear-gradient(135deg, #f7fee7 0%, #d9f99d 100%)', preview: 'from-lime-50 to-lime-200' },
    { name: 'Lavender', value: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)', preview: 'from-purple-50 to-purple-100' },
    { name: 'Rose', value: 'linear-gradient(135deg, #fff1f2 0%, #fecdd3 100%)', preview: 'from-rose-50 to-rose-200' },
    { name: 'Candy', value: 'linear-gradient(135deg, #fef3c7 0%, #fce7f3 50%, #e0e7ff 100%)', preview: 'from-amber-100 via-pink-100 to-indigo-100' },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Style Your Profile</h2>
            <p className="text-sm text-gray-600 mt-1">
              Choose a template or customize every detail
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 py-3 px-4 font-medium transition-colors ${
              activeTab === 'templates'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ✨ Templates
          </button>
          <button
            onClick={() => setActiveTab('customize')}
            className={`flex-1 py-3 px-4 font-medium transition-colors ${
              activeTab === 'customize'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🎨 Customize
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'templates' ? (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Start with a beautiful template and customize it to your liking
              </p>
              <div className="grid grid-cols-2 gap-4">
                {STYLE_TEMPLATES.map((template) => (
                  <button
                    key={template.name}
                    onClick={() => setEditedStyle({ ...editedStyle, ...template.style })}
                    className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-purple-500 transition-all duration-200 hover:shadow-lg"
                  >
                    <div
                      className="h-32 p-4 flex flex-col justify-center items-center"
                      style={{
                        background: template.style.backgroundGradient || template.style.backgroundColor,
                      }}
                    >
                      <div
                        className="w-20 h-10 mb-2"
                        style={{
                          backgroundColor: template.style.primaryColor,
                          borderRadius:
                            template.style.buttonRoundness === 'square'
                              ? '0px'
                              : template.style.buttonRoundness === 'slightly-rounded'
                              ? '6px'
                              : template.style.buttonRoundness === 'rounded'
                              ? '12px'
                              : '9999px',
                        }}
                      />
                      <div className="flex gap-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: template.style.primaryColor }}
                        />
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: template.style.secondaryColor }}
                        />
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: template.style.accentColor }}
                        />
                      </div>
                    </div>
                    <div className="p-3 bg-white border-t border-gray-200">
                      <p className="font-semibold text-gray-900">{template.name}</p>
                    </div>
                    <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium">
                        Apply Template
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8">{/* Fonts */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Type className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Fonts</h3>
            </div>

            <div className="space-y-4 pl-14">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Family
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {fontOptions.map((font) => (
                    <button
                      key={font.value}
                      onClick={() =>
                        setEditedStyle({ ...editedStyle, fontFamily: font.value })
                      }
                      className={`px-4 py-3 text-sm border-2 rounded-lg transition-all ${
                        editedStyle.fontFamily === font.value
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ fontFamily: font.value }}
                    >
                      {font.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heading Size
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['small', 'medium', 'large', 'xl'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() =>
                          setEditedStyle({ ...editedStyle, headingSize: size })
                        }
                        className={`px-3 py-2 text-sm border-2 rounded-lg transition-all capitalize ${
                          editedStyle.headingSize === size
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Body Size
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['small', 'medium', 'large'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() =>
                          setEditedStyle({ ...editedStyle, bodySize: size })
                        }
                        className={`px-3 py-2 text-sm border-2 rounded-lg transition-all capitalize ${
                          editedStyle.bodySize === size
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Colors */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Palette className="w-5 h-5 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Colors</h3>
            </div>

            <div className="pl-14">
              <div className="grid grid-cols-2 gap-4">
                <ColorInput
                  label="Primary"
                  value={editedStyle.primaryColor}
                  onChange={(value) =>
                    setEditedStyle({ ...editedStyle, primaryColor: value })
                  }
                />
                <ColorInput
                  label="Secondary"
                  value={editedStyle.secondaryColor}
                  onChange={(value) =>
                    setEditedStyle({ ...editedStyle, secondaryColor: value })
                  }
                />
                <ColorInput
                  label="Accent"
                  value={editedStyle.accentColor}
                  onChange={(value) =>
                    setEditedStyle({ ...editedStyle, accentColor: value })
                  }
                />
                <ColorInput
                  label="Background"
                  value={editedStyle.backgroundColor}
                  onChange={(value) =>
                    setEditedStyle({ ...editedStyle, backgroundColor: value })
                  }
                />
                <ColorInput
                  label="Text"
                  value={editedStyle.textColor}
                  onChange={(value) =>
                    setEditedStyle({ ...editedStyle, textColor: value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Background */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <ImageIcon className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Background</h3>
            </div>

            <div className="space-y-4 pl-14">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gradient Preset
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {gradientPresets.map((gradient) => (
                    <button
                      key={gradient.name}
                      onClick={() => {
                        if (gradient.value) {
                          setEditedStyle({
                            ...editedStyle,
                            backgroundGradient: gradient.value,
                            backgroundImage: undefined,
                          })
                        } else {
                          setEditedStyle({
                            ...editedStyle,
                            backgroundGradient: undefined,
                            backgroundImage: undefined,
                          })
                        }
                      }}
                      className={`px-3 py-2 text-xs border-2 rounded-lg transition-all ${
                        editedStyle.backgroundGradient === gradient.value
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {gradient.preview && (
                        <div
                          className={`w-full h-8 rounded mb-1 bg-gradient-to-br ${gradient.preview}`}
                        />
                      )}
                      {gradient.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Gradient (CSS)
                </label>
                <input
                  type="text"
                  value={editedStyle.backgroundGradient || ''}
                  onChange={(e) =>
                    setEditedStyle({
                      ...editedStyle,
                      backgroundGradient: e.target.value,
                      backgroundImage: e.target.value ? undefined : editedStyle.backgroundImage,
                    })
                  }
                  placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Image URL
                </label>
                <input
                  type="text"
                  value={editedStyle.backgroundImage || ''}
                  onChange={(e) =>
                    setEditedStyle({
                      ...editedStyle,
                      backgroundImage: e.target.value,
                      backgroundGradient: e.target.value ? undefined : editedStyle.backgroundGradient,
                    })
                  }
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Overrides gradient if set
                </p>
              </div>
            </div>
          </div>

          {/* Layout */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <LayoutIcon className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Layout</h3>
            </div>

            <div className="space-y-4 pl-14">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Button Roundness
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {roundnessOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        setEditedStyle({ ...editedStyle, buttonRoundness: option.value })
                      }
                      className={`px-3 py-3 text-sm border-2 rounded-lg transition-all ${
                        editedStyle.buttonRoundness === option.value
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className="w-full h-8 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mb-1"
                        style={{ borderRadius: option.preview }}
                      />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section Spacing
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {spacingOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          setEditedStyle({ ...editedStyle, sectionSpacing: option.value })
                        }
                        className={`px-3 py-2 text-sm border-2 rounded-lg transition-all ${
                          editedStyle.sectionSpacing === option.value
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Module Spacing
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {spacingOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          setEditedStyle({ ...editedStyle, moduleSpacing: option.value })
                        }
                        className={`px-3 py-2 text-sm border-2 rounded-lg transition-all ${
                          editedStyle.moduleSpacing === option.value
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Animation */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Animation</h3>
            </div>

            <div className="pl-14">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Module Entrance
              </label>
              <div className="grid grid-cols-4 gap-2">
                {animationOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() =>
                      setEditedStyle({ ...editedStyle, animation: option.value })
                    }
                    className={`px-4 py-3 text-sm border-2 rounded-lg transition-all ${
                      editedStyle.animation === option.value
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(editedStyle)}
            className="px-6 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Save Style
          </button>
        </div>
      </div>
    </div>
  )
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
          placeholder="#000000"
        />
      </div>
    </div>
  )
}
