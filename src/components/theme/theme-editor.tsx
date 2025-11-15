'use client'

import { useState } from 'react'
import { X, Type, Palette, Ruler, Wand2 } from 'lucide-react'
import type { GlobalTheme } from '@/types'

interface ThemeEditorProps {
  theme: GlobalTheme
  onSave: (theme: GlobalTheme) => void
  onCancel: () => void
}

export function ThemeEditor({ theme, onSave, onCancel }: ThemeEditorProps) {
  const [activeTab, setActiveTab] = useState<'typography' | 'colors' | 'spacing' | 'effects'>('typography')
  const [editedTheme, setEditedTheme] = useState<GlobalTheme>(theme)

  const handleSave = () => {
    onSave(editedTheme)
  }

  const tabs = [
    { id: 'typography' as const, label: 'Typography', icon: Type },
    { id: 'colors' as const, label: 'Colors', icon: Palette },
    { id: 'spacing' as const, label: 'Spacing', icon: Ruler },
    { id: 'effects' as const, label: 'Effects', icon: Wand2 },
  ]

  const fontOptions = [
    { value: 'Inter, system-ui, sans-serif', label: 'Inter (Default)' },
    { value: 'system-ui, sans-serif', label: 'System UI' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'ui-monospace, monospace', label: 'Monospace' },
    { value: '"Times New Roman", serif', label: 'Times New Roman' },
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: '"Courier New", monospace', label: 'Courier New' },
    { value: 'Verdana, sans-serif', label: 'Verdana' },
    { value: '"Trebuchet MS", sans-serif', label: 'Trebuchet MS' },
    { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Global Theme</h2>
            <p className="text-sm text-gray-600 mt-1">
              Customize typography, colors, and spacing for your entire profile
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
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'typography' && (
            <TypographyTab
              typography={editedTheme.typography}
              fontOptions={fontOptions}
              onChange={(typography) =>
                setEditedTheme({ ...editedTheme, typography })
              }
            />
          )}

          {activeTab === 'colors' && (
            <ColorsTab
              colors={editedTheme.colors}
              onChange={(colors) => setEditedTheme({ ...editedTheme, colors })}
            />
          )}

          {activeTab === 'spacing' && (
            <SpacingTab
              spacing={editedTheme.spacing}
              onChange={(spacing) => setEditedTheme({ ...editedTheme, spacing })}
            />
          )}

          {activeTab === 'effects' && (
            <EffectsTab
              effects={editedTheme.effects}
              onChange={(effects) => setEditedTheme({ ...editedTheme, effects })}
            />
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

// Typography Tab Component
function TypographyTab({
  typography,
  fontOptions,
  onChange,
}: {
  typography: GlobalTheme['typography']
  fontOptions: Array<{ value: string; label: string }>
  onChange: (typography: GlobalTheme['typography']) => void
}) {
  return (
    <div className="space-y-8">
      {/* Font Family */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Font Family
        </label>
        <select
          value={typography.fontFamily}
          onChange={(e) =>
            onChange({ ...typography, fontFamily: e.target.value })
          }
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          style={{ fontFamily: typography.fontFamily }}
        >
          {fontOptions.map((font) => (
            <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
              {font.label}
            </option>
          ))}
        </select>
      </div>

      {/* Font Sizes */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Font Sizes
        </label>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(typography.fontSize).map(([key, value]) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                {key.toUpperCase()}
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) =>
                  onChange({
                    ...typography,
                    fontSize: { ...typography.fontSize, [key]: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="16px"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Font Weights */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Font Weights
        </label>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(typography.fontWeight).map(([key, value]) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-700 mb-1.5 capitalize">
                {key}
              </label>
              <select
                value={value}
                onChange={(e) =>
                  onChange({
                    ...typography,
                    fontWeight: {
                      ...typography.fontWeight,
                      [key]: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="100">100 (Thin)</option>
                <option value="200">200 (Extra Light)</option>
                <option value="300">300 (Light)</option>
                <option value="400">400 (Normal)</option>
                <option value="500">500 (Medium)</option>
                <option value="600">600 (Semibold)</option>
                <option value="700">700 (Bold)</option>
                <option value="800">800 (Extra Bold)</option>
                <option value="900">900 (Black)</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Line Height */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Line Height
        </label>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(typography.lineHeight).map(([key, value]) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-700 mb-1.5 capitalize">
                {key}
              </label>
              <input
                type="number"
                step="0.05"
                value={value}
                onChange={(e) =>
                  onChange({
                    ...typography,
                    lineHeight: {
                      ...typography.lineHeight,
                      [key]: parseFloat(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Letter Spacing */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Letter Spacing
        </label>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(typography.letterSpacing).map(([key, value]) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-700 mb-1.5 capitalize">
                {key}
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) =>
                  onChange({
                    ...typography,
                    letterSpacing: {
                      ...typography.letterSpacing,
                      [key]: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Colors Tab Component
function ColorsTab({
  colors,
  onChange,
}: {
  colors: GlobalTheme['colors']
  onChange: (colors: GlobalTheme['colors']) => void
}) {
  return (
    <div className="space-y-8">
      {/* Brand Colors */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Brand Colors</h3>
        <div className="grid grid-cols-3 gap-4">
          <ColorInput
            label="Primary"
            value={colors.primary}
            onChange={(value) => onChange({ ...colors, primary: value })}
          />
          <ColorInput
            label="Secondary"
            value={colors.secondary}
            onChange={(value) => onChange({ ...colors, secondary: value })}
          />
          <ColorInput
            label="Accent"
            value={colors.accent}
            onChange={(value) => onChange({ ...colors, accent: value })}
          />
        </div>
      </div>

      {/* Background Colors */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Background Colors</h3>
        <div className="grid grid-cols-2 gap-4">
          <ColorInput
            label="Light Background"
            value={colors.background.light}
            onChange={(value) =>
              onChange({ ...colors, background: { ...colors.background, light: value } })
            }
          />
          <ColorInput
            label="Dark Background"
            value={colors.background.dark}
            onChange={(value) =>
              onChange({ ...colors, background: { ...colors.background, dark: value } })
            }
          />
        </div>
      </div>

      {/* Text Colors */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Text Colors</h3>
        <div className="grid grid-cols-2 gap-4">
          <ColorInput
            label="Heading"
            value={colors.text.heading}
            onChange={(value) =>
              onChange({ ...colors, text: { ...colors.text, heading: value } })
            }
          />
          <ColorInput
            label="Body"
            value={colors.text.body}
            onChange={(value) =>
              onChange({ ...colors, text: { ...colors.text, body: value } })
            }
          />
          <ColorInput
            label="Muted"
            value={colors.text.muted}
            onChange={(value) =>
              onChange({ ...colors, text: { ...colors.text, muted: value } })
            }
          />
          <ColorInput
            label="Inverse"
            value={colors.text.inverse}
            onChange={(value) =>
              onChange({ ...colors, text: { ...colors.text, inverse: value } })
            }
          />
        </div>
      </div>

      {/* Utility Colors */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Utility Colors</h3>
        <div className="grid grid-cols-2 gap-4">
          <ColorInput
            label="Border"
            value={colors.border}
            onChange={(value) => onChange({ ...colors, border: value })}
          />
          <ColorInput
            label="Success"
            value={colors.success}
            onChange={(value) => onChange({ ...colors, success: value })}
          />
          <ColorInput
            label="Warning"
            value={colors.warning}
            onChange={(value) => onChange({ ...colors, warning: value })}
          />
          <ColorInput
            label="Error"
            value={colors.error}
            onChange={(value) => onChange({ ...colors, error: value })}
          />
        </div>
      </div>
    </div>
  )
}

// Spacing Tab Component
function SpacingTab({
  spacing,
  onChange,
}: {
  spacing: GlobalTheme['spacing']
  onChange: (spacing: GlobalTheme['spacing']) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Spacing Scale</h3>
        <p className="text-sm text-gray-600 mb-6">
          Define consistent spacing values used throughout your profile for padding, margins, and gaps.
        </p>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(spacing).map(([key, value]) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                {key.toUpperCase()}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={value}
                  onChange={(e) =>
                    onChange({ ...spacing, [key]: e.target.value })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="16px"
                />
                <div
                  className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{ width: value, height: value }}
                >
                  {value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Effects Tab Component
function EffectsTab({
  effects,
  onChange,
}: {
  effects: GlobalTheme['effects']
  onChange: (effects: GlobalTheme['effects']) => void
}) {
  return (
    <div className="space-y-8">
      {/* Border Radius */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Border Radius</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(effects.borderRadius).map(([key, value]) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                {key.toUpperCase()}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={value}
                  onChange={(e) =>
                    onChange({
                      ...effects,
                      borderRadius: { ...effects.borderRadius, [key]: e.target.value },
                    })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="8px"
                />
                <div
                  className="w-12 h-12 bg-purple-500"
                  style={{ borderRadius: value }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shadows */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Shadows</h3>
        <div className="space-y-3">
          {Object.entries(effects.shadow).map(([key, value]) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                {key.toUpperCase()}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={value}
                  onChange={(e) =>
                    onChange({
                      ...effects,
                      shadow: { ...effects.shadow, [key]: e.target.value },
                    })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                  placeholder="0 4px 6px rgba(0,0,0,0.1)"
                />
                <div
                  className="w-16 h-16 bg-white rounded-lg border border-gray-200"
                  style={{ boxShadow: value }}
                />
              </div>
            </div>
          ))}
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
      <label className="block text-xs font-medium text-gray-700 mb-1.5">{label}</label>
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
