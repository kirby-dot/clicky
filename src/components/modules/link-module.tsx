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
      className={`block w-full px-6 py-4 text-center font-bold transition-all ${bgColor} border-4 border-black shadow-brutal hover:shadow-brutal-lg hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center justify-center space-x-2 text-black text-lg`}
      whileTap={{ scale: 0.98 }}
    >
      <span>{module.title}</span>
      <ExternalLink className="w-5 h-5" />
    </motion.a>
  )
}
