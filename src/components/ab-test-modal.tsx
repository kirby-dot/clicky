'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassButton } from '@/components/ui/glass'
import { X, Plus, Trash2, FlaskConical, TrendingUp } from 'lucide-react'
import type { Module } from '@/types'

interface Variant {
  id: string
  name: string
  title: string
  content: any
  split: number
  clicks: number
  views: number
}

interface ABTestModalProps {
  isOpen: boolean
  onClose: () => void
  module: Module
  onSave: (variants: Variant[]) => Promise<void>
}

export function ABTestModal({ isOpen, onClose, module, onSave }: ABTestModalProps) {
  const [variants, setVariants] = useState<Variant[]>([
    {
      id: 'original',
      name: 'Original',
      title: module.title || 'Untitled',
      content: module.content,
      split: 50,
      clicks: 0,
      views: 0
    },
    {
      id: 'variant-a',
      name: 'Variant A',
      title: module.title || 'Untitled',
      content: module.content,
      split: 50,
      clicks: 0,
      views: 0
    }
  ])
  const [isSaving, setIsSaving] = useState(false)

  const handleAddVariant = () => {
    const newVariant: Variant = {
      id: `variant-${Date.now()}`,
      name: `Variant ${String.fromCharCode(65 + variants.length - 1)}`,
      title: module.title || 'Untitled',
      content: module.content,
      split: 0,
      clicks: 0,
      views: 0
    }

    // Recalculate splits
    const equalSplit = Math.floor(100 / (variants.length + 1))
    const updated = [...variants, newVariant].map(v => ({ ...v, split: equalSplit }))

    setVariants(updated)
  }

  const handleRemoveVariant = (id: string) => {
    if (variants.length <= 2) return

    const filtered = variants.filter(v => v.id !== id)
    const equalSplit = Math.floor(100 / filtered.length)
    const updated = filtered.map(v => ({ ...v, split: equalSplit }))

    setVariants(updated)
  }

  const handleUpdateVariant = (id: string, field: 'name' | 'title' | 'split', value: string | number) => {
    setVariants(variants.map(v =>
      v.id === id ? { ...v, [field]: value } : v
    ))
  }

  const handleSave = async () => {
    // Validate that splits add up to 100
    const totalSplit = variants.reduce((sum, v) => sum + v.split, 0)
    if (totalSplit !== 100) {
      alert('Traffic splits must add up to 100%')
      return
    }

    setIsSaving(true)
    try {
      await onSave(variants)
      onClose()
    } catch (error) {
      console.error('Error saving variants:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const getConversionRate = (variant: Variant) => {
    if (variant.views === 0) return 0
    return ((variant.clicks / variant.views) * 100).toFixed(1)
  }

  const getBestPerformer = () => {
    return variants.reduce((best, current) => {
      const currentRate = current.views > 0 ? current.clicks / current.views : 0
      const bestRate = best.views > 0 ? best.clicks / best.views : 0
      return currentRate > bestRate ? current : best
    })
  }

  const totalSplit = variants.reduce((sum, v) => sum + v.split, 0)
  const bestPerformer = getBestPerformer()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[9998]"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 w-full max-w-4xl max-h-[90vh] overflow-hidden pointer-events-auto"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-2">
                  <FlaskConical className="w-8 h-8" />
                  <h2 className="text-3xl font-bold">A/B Test - {module.title}</h2>
                </div>
                <p className="text-white/90">Create variants and test which performs better</p>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {/* Variants */}
                <div className="space-y-4 mb-6">
                  {variants.map((variant, index) => (
                    <div
                      key={variant.id}
                      className={`bg-white/50 backdrop-blur-xl border-2 rounded-2xl p-4 ${
                        variant.id === bestPerformer.id && variant.views > 10
                          ? 'border-green-400'
                          : 'border-white/30'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={variant.name}
                              onChange={(e) => handleUpdateVariant(variant.id, 'name', e.target.value)}
                              className="font-semibold text-lg bg-white/50 border border-white/30 rounded-xl px-3 py-1 focus:outline-none focus:ring-2 focus:ring-accent-400/50"
                            />
                            {variant.id === bestPerformer.id && variant.views > 10 && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                Best
                              </span>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Title</label>
                            <input
                              type="text"
                              value={variant.title}
                              onChange={(e) => handleUpdateVariant(variant.id, 'title', e.target.value)}
                              className="w-full bg-white/50 border border-white/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-400/50"
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">Traffic %</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={variant.split}
                                onChange={(e) => handleUpdateVariant(variant.id, 'split', parseInt(e.target.value) || 0)}
                                className="w-full bg-white/50 border border-white/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-400/50"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">Views</label>
                              <div className="px-3 py-2 bg-blue-100/50 rounded-xl text-sm font-semibold text-blue-700">
                                {variant.views}
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">CTR</label>
                              <div className="px-3 py-2 bg-green-100/50 rounded-xl text-sm font-semibold text-green-700">
                                {getConversionRate(variant)}%
                              </div>
                            </div>
                          </div>
                        </div>

                        {variants.length > 2 && variant.id !== 'original' && (
                          <button
                            onClick={() => handleRemoveVariant(variant.id)}
                            className="p-2 hover:bg-red-100/50 rounded-xl transition-colors text-red-600"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Variant Button */}
                {variants.length < 5 && (
                  <button
                    onClick={handleAddVariant}
                    className="w-full bg-white/50 border-2 border-dashed border-white/30 rounded-2xl p-4 hover:bg-white/70 transition-all flex items-center justify-center gap-2 text-slate-600 font-semibold"
                  >
                    <Plus className="w-5 h-5" />
                    Add Variant
                  </button>
                )}

                {/* Total Split Warning */}
                {totalSplit !== 100 && (
                  <div className="mt-4 p-3 bg-yellow-100/50 border border-yellow-300 rounded-xl text-sm text-yellow-800">
                    ⚠️ Traffic splits must add up to 100% (currently {totalSplit}%)
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/30 flex items-center justify-between bg-white/50">
                <GlassButton variant="secondary" onClick={onClose}>
                  Cancel
                </GlassButton>

                <GlassButton
                  onClick={handleSave}
                  disabled={totalSplit !== 100 || isSaving}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                >
                  {isSaving ? 'Saving...' : 'Save A/B Test'}
                </GlassButton>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
