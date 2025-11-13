import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import type { Module, LinkModuleContent } from '@/types'

interface LinkModuleProps {
  module: Module
  profileId: string
  bgColor: string
}

export function LinkModule({ module, profileId, bgColor }: LinkModuleProps) {
  const content = module.content as LinkModuleContent

  const handleClick = () => {
    // Track click
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile_id: profileId,
        link_id: module.id,
        event_type: 'click',
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {})
  }

  return (
    <motion.a
      href={content.url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`block w-full px-6 py-4 text-center font-semibold transition-all ${bgColor} rounded-2xl shadow-soft hover:shadow-soft-lg hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 text-gray-900 text-lg border border-gray-200`}
      whileTap={{ scale: 0.95 }}
    >
      <span>{module.title}</span>
      <ExternalLink className="w-4 h-4" />
    </motion.a>
  )
}
