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

  // Get customization options from content.style
  // Only use module-specific styles if explicitly set, otherwise use global CSS variables
  const style = content.style || {}
  const backgroundColor = style.backgroundColor || undefined
  const textColor = style.textColor || undefined
  const borderColor = style.borderColor || undefined
  const borderWidth = style.borderWidth
  const borderRadius = style.borderRadius
  const shadow = style.shadow || 'sm'
  const fontSize = style.fontSize
  const fontWeight = style.fontWeight || 'semibold'
  const align = style.align || 'center'
  const fullWidth = style.fullWidth !== undefined ? style.fullWidth : true

  // Map shadow values to Tailwind classes
  const shadowClass = {
    'none': '',
    'sm': 'shadow-sm hover:shadow-md',
    'md': 'shadow-md hover:shadow-lg',
    'lg': 'shadow-lg hover:shadow-xl'
  }[shadow] || 'shadow-sm hover:shadow-md'

  // Map fontWeight to Tailwind classes
  const fontWeightClass = {
    'normal': 'font-normal',
    'medium': 'font-medium',
    'semibold': 'font-semibold',
    'bold': 'font-bold'
  }[fontWeight] || 'font-semibold'

  // Map align to text alignment classes
  const textAlignClass = {
    'left': 'text-left justify-start',
    'center': 'text-center justify-center',
    'right': 'text-right justify-end'
  }[align] || 'text-center justify-center'

  return (
    <motion.a
      href={content.url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`block px-6 py-4 ${fontWeightClass} transition-all ${shadowClass} hover:scale-105 active:scale-95 flex items-center space-x-2 ${textAlignClass} ${fullWidth ? 'w-full' : 'w-auto'}`}
      style={{
        backgroundColor: backgroundColor || 'var(--color-primary)',
        color: textColor || 'white',
        borderColor: borderColor || 'transparent',
        borderWidth: borderWidth !== undefined ? `${borderWidth}px` : '0px',
        borderStyle: borderWidth && borderWidth > 0 ? 'solid' : 'none',
        borderRadius: borderRadius !== undefined ? (typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius) : 'var(--border-radius)',
        fontSize: fontSize !== undefined ? (typeof fontSize === 'number' ? `${fontSize}px` : fontSize) : 'var(--body-size)',
      }}
      whileTap={{ scale: 0.95 }}
    >
      <span>{module.title}</span>
      <ExternalLink className="w-4 h-4" />
    </motion.a>
  )
}
