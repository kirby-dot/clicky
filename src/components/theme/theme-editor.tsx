'use client'

import { useState } from 'react'
import { X, Type, Palette, Layout } from 'lucide-react'
import type { GlobalTheme } from '@/types'

interface ThemeEditorProps {
  theme: GlobalTheme
  onSave: (theme: GlobalTheme) => void
  onCancel: () => void
}

export function ThemeEditor({ theme, onSave, onCancel }: ThemeEditorProps) {
  const [editedTheme, setEditedTheme] = useState<GlobalTheme>(theme)

  const handleSave = () => {
    onSave(editedTheme)
  }

  const fontOptions = [
    { value: 'Inter, system-ui, sans-serif', label: 'Inter', preview: 'Inter' },
    { value: 'system-ui, sans-serif', label: 'System', preview: 'System UI' },
    { value: 'Georgia, serif', label: 'Georgia', preview: 'Georgia' },
    { value: '"Times New Roman", serif', label: 'Times', preview: 'Times New Roman' },
    { value: 'Arial, sans-serif', label: 'Arial', preview: 'Arial' },
    { value: 'Verdana, sans-serif', label: 'Verdana', preview: 'Verdana' },
    { value: 'ui-monospace, monospace', label: 'Mono', preview: 'Monospace' },
    { value: '"Courier New", monospace', label: 'Courier', preview: 'Courier New' },
  ]

  const roundnessOptions = [
    { value: 'square' as const, label: 'Square', borderRadius: '0px' },
    { value: 'slightly-rounded' as const, label: 'Slightly Rounded', borderRadius: '6px' },
    { value: 'rounded' as const, label: 'Rounded', borderRadius: '12px' },
    { value: 'pill' as const, label: 'Pill', borderRadius: '9999px' },
  ]

  const spacingOptions = [
    { value: 'tight' as const, label: 'Tight', gap: '8px' },
    { value: 'normal' as const, label: 'Normal', gap: '16px' },
    { value: 'loose' as const, label: 'Loose', gap: '32px' },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Global Theme</h2>
            <p className="text-sm text-gray-600 mt-1">
              Customize fonts, colors, and spacing for your entire profile
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
          {/* Typography Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Type className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Typography</h3>
            </div>

            <div className="space-y-4 pl-14">
              {/* Font Family */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Family
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {fontOptions.map((font) => (
                    <button
                      key={font.value}
                      onClick={() =>
                        setEditedTheme({
                          ...editedTheme,
                          typography: { ...editedTheme.typography, fontFamily: font.value },
                        })
                      }
                      className={`px-4 py-3 text-sm border-2 rounded-lg transition-all ${
                        editedTheme.typography.fontFamily === font.value
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                      style={{ fontFamily: font.value }}
                    >
                      {font.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Heading Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heading Size
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['small', 'medium', 'large', 'xl'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() =>
                        setEditedTheme({
                          ...editedTheme,
                          typography: { ...editedTheme.typography, headingSize: size },
                        })
                      }
                      className={`px-4 py-3 text-sm border-2 rounded-lg transition-all capitalize ${
                        editedTheme.typography.headingSize === size
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Body Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Body Text Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() =>
                        setEditedTheme({
                          ...editedTheme,
                          typography: { ...editedTheme.typography, bodySize: size },
                        })
                      }
                      className={`px-4 py-3 text-sm border-2 rounded-lg transition-all capitalize ${
                        editedTheme.typography.bodySize === size
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Colors Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Palette className="w-5 h-5 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Colors</h3>
            </div>

            <div className="space-y-4 pl-14">
              <div className="grid grid-cols-2 gap-4">
                <ColorInput
                  label="Primary Color"
                  value={editedTheme.colors.primary}
                  onChange={(value) =>
                    setEditedTheme({
                      ...editedTheme,
                      colors: { ...editedTheme.colors, primary: value },
                    })
                  }
                />
                <ColorInput
                  label="Secondary Color"
                  value={editedTheme.colors.secondary}
                  onChange={(value) =>
                    setEditedTheme({
                      ...editedTheme,
                      colors: { ...editedTheme.colors, secondary: value },
                    })
                  }
                />
                <ColorInput
                  label="Accent Color"
                  value={editedTheme.colors.accent}
                  onChange={(value) =>
                    setEditedTheme({
                      ...editedTheme,
                      colors: { ...editedTheme.colors, accent: value },
                    })
                  }
                />
                <ColorInput
                  label="Background"
                  value={editedTheme.colors.background}
                  onChange={(value) =>
                    setEditedTheme({
                      ...editedTheme,
                      colors: { ...editedTheme.colors, background: value },
                    })
                  }
                />
                <ColorInput
                  label="Text Color"
                  value={editedTheme.colors.text}
                  onChange={(value) =>
                    setEditedTheme({
                      ...editedTheme,
                      colors: { ...editedTheme.colors, text: value },
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Layout Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Layout className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Layout</h3>
            </div>

            <div className="space-y-4 pl-14">
              {/* Button Roundness */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Button & Module Roundness
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {roundnessOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        setEditedTheme({
                          ...editedTheme,
                          layout: { ...editedTheme.layout, buttonRoundness: option.value },
                        })
                      }
                      className={`px-4 py-3 text-sm border-2 rounded-lg transition-all ${
                        editedTheme.layout.buttonRoundness === option.value
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div
                        className="w-full h-8 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mb-1"
                        style={{ borderRadius: option.borderRadius }}
                      />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section Spacing */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Spacing
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {spacingOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        setEditedTheme({
                          ...editedTheme,
                          layout: { ...editedTheme.layout, sectionSpacing: option.value },
                        })
                      }
                      className={`px-4 py-3 text-sm border-2 rounded-lg transition-all ${
                        editedTheme.layout.sectionSpacing === option.value
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <div className="w-6 h-6 bg-purple-300 rounded" />
                        <div style={{ width: option.gap }} />
                        <div className="w-6 h-6 bg-purple-300 rounded" />
                      </div>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Module Spacing */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Module Spacing
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {spacingOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        setEditedTheme({
                          ...editedTheme,
                          layout: { ...editedTheme.layout, moduleSpacing: option.value },
                        })
                      }
                      className={`px-4 py-3 text-sm border-2 rounded-lg transition-all ${
                        editedTheme.layout.moduleSpacing === option.value
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1 mb-1">
                        <div className="w-12 h-4 bg-pink-300 rounded" />
                        <div style={{ height: option.gap }} />
                        <div className="w-12 h-4 bg-pink-300 rounded" />
                      </div>
                      {option.label}
                    </button>
                  ))}
                </div>
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
            onClick={handleSave}
            className="px-6 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Save Theme
          </button>
        </div>
      </div>
    </div>
  )
}

// Color Input Component
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
          className="w-14 h-10 rounded-lg border border-gray-300 cursor-pointer"
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
