'use client'

import { useState } from 'react'
import { X, Type, Palette, Layout as LayoutIcon, Sparkles } from 'lucide-react'
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

export function StyleEditor({ style, onSave, onCancel }: StyleEditorProps) {
  const [editedStyle, setEditedStyle] = useState<ProfileStyle>({
    ...DEFAULT_STYLE,
    ...style,
  })

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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Style</h2>
            <p className="text-sm text-gray-600 mt-1">
              Customize your profile&apos;s look and feel
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Fonts */}
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
