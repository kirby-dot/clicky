'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassButton } from '@/components/ui/glass'
import { X, Check, Palette } from 'lucide-react'

export interface ColorTheme {
  id: string
  name: string
  description: string
  colors: {
    primary: string
    secondary: string
    background: string
    text: string
    accent: string
  }
}

export const COLOR_THEMES: ColorTheme[] = [
  {
    id: 'ocean',
    name: 'Ocean Breeze',
    description: 'Cool blues and teals',
    colors: {
      primary: '#0EA5E9',
      secondary: '#06B6D4',
      background: '#F0F9FF',
      text: '#0C4A6E',
      accent: '#22D3EE'
    }
  },
  {
    id: 'sunset',
    name: 'Sunset Glow',
    description: 'Warm oranges and pinks',
    colors: {
      primary: '#F97316',
      secondary: '#FB923C',
      background: '#FFF7ED',
      text: '#7C2D12',
      accent: '#FDBA74'
    }
  },
  {
    id: 'forest',
    name: 'Forest Green',
    description: 'Natural greens',
    colors: {
      primary: '#10B981',
      secondary: '#34D399',
      background: '#F0FDF4',
      text: '#065F46',
      accent: '#6EE7B7'
    }
  },
  {
    id: 'lavender',
    name: 'Lavender Dream',
    description: 'Soft purples',
    colors: {
      primary: '#A78BFA',
      secondary: '#C4B5FD',
      background: '#FAF5FF',
      text: '#5B21B6',
      accent: '#DDD6FE'
    }
  },
  {
    id: 'rose',
    name: 'Rose Garden',
    description: 'Romantic pinks',
    colors: {
      primary: '#F43F5E',
      secondary: '#FB7185',
      background: '#FFF1F2',
      text: '#881337',
      accent: '#FDA4AF'
    }
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Dark and elegant',
    colors: {
      primary: '#1E293B',
      secondary: '#334155',
      background: '#0F172A',
      text: '#F1F5F9',
      accent: '#64748B'
    }
  },
  {
    id: 'coral',
    name: 'Coral Reef',
    description: 'Vibrant coral tones',
    colors: {
      primary: '#FF6B6B',
      secondary: '#FFB347',
      background: '#FFF5F5',
      text: '#7F1D1D',
      accent: '#FFA07A'
    }
  },
  {
    id: 'mint',
    name: 'Fresh Mint',
    description: 'Cool mint greens',
    colors: {
      primary: '#2DD4BF',
      secondary: '#5EEAD4',
      background: '#F0FDFA',
      text: '#115E59',
      accent: '#99F6E4'
    }
  }
]

interface ColorThemeModalProps {
  isOpen: boolean
  onClose: () => void
  currentTheme?: ColorTheme
  onSelectTheme: (theme: ColorTheme) => void
}

export function ColorThemeModal({ isOpen, onClose, currentTheme, onSelectTheme }: ColorThemeModalProps) {
  const [selectedTheme, setSelectedTheme] = useState<ColorTheme | undefined>(currentTheme)

  const handleSelect = (theme: ColorTheme) => {
    setSelectedTheme(theme)
    onSelectTheme(theme)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[9998]"
            onClick={onClose}
          />

          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white/50 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 w-full max-w-3xl pointer-events-auto overflow-hidden max-h-[90vh]"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <motion.div
                      initial={{ rotate: -180, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="p-3 bg-accent-100/50 rounded-xl"
                    >
                      <Palette className="w-6 h-6 text-accent-600" />
                    </motion.div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">Choose Color Theme</h2>
                      <p className="text-sm text-slate-600">Pick a theme for your profile</p>
                    </div>
                  </div>
                  <motion.button
                    onClick={onClose}
                    className="p-2 hover:bg-white/50 rounded-lg"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-5 h-5 text-slate-600" />
                  </motion.button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 max-h-[60vh] overflow-y-auto pr-2">
                  {COLOR_THEMES.map((theme, index) => (
                    <motion.button
                      key={theme.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSelect(theme)}
                      className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                        selectedTheme?.id === theme.id
                          ? 'border-accent-400 bg-accent-50/50'
                          : 'border-white/30 bg-white/50 hover:bg-white/70'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {selectedTheme?.id === theme.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 bg-accent-400 rounded-full p-1"
                        >
                          <Check className="w-4 h-4 text-white" />
                        </motion.div>
                      )}

                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-bold text-slate-800">{theme.name}</h3>
                      </div>
                      <p className="text-xs text-slate-600 mb-3">{theme.description}</p>

                      {/* Color Swatches */}
                      <div className="flex gap-2">
                        <div
                          className="w-8 h-8 rounded-lg shadow-sm border border-white/30"
                          style={{ backgroundColor: theme.colors.primary }}
                          title="Primary"
                        />
                        <div
                          className="w-8 h-8 rounded-lg shadow-sm border border-white/30"
                          style={{ backgroundColor: theme.colors.secondary }}
                          title="Secondary"
                        />
                        <div
                          className="w-8 h-8 rounded-lg shadow-sm border border-white/30"
                          style={{ backgroundColor: theme.colors.accent }}
                          title="Accent"
                        />
                        <div
                          className="w-8 h-8 rounded-lg shadow-sm border border-white/30"
                          style={{ backgroundColor: theme.colors.background }}
                          title="Background"
                        />
                      </div>
                    </motion.button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <GlassButton
                    variant="secondary"
                    className="flex-1"
                    onClick={onClose}
                  >
                    Close
                  </GlassButton>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
