'use client'

import { motion } from 'framer-motion'
import type { Module } from '@/types'
import { LinkModule } from './link-module'
import { SocialLinksModule } from './social-links-module'
import { HeaderModule } from './header-module'
import { TextModule } from './text-module'
import { ImageModule } from './image-module'
import { DividerModule } from './divider-module'
import { VideoModule } from './video-module'
import { MusicModule } from './music-module'
import { SpacerModule } from './spacer-module'
import { ButtonModule } from './button-module'
import { AccordionModule } from './accordion-module'
import { CountdownModule } from './countdown-module'
import { EmailButtonModule } from './email-button-module'
import { ButtonGridModule } from './button-grid-module'

interface ModuleRendererProps {
  module: Module
  profileId: string
  index: number
  borderAnimation?: boolean
}

export function ModuleRenderer({ module, profileId, index, borderAnimation = false }: ModuleRendererProps) {
  const colors = ['bg-pastel-sky', 'bg-pastel-lavender', 'bg-pastel-mint', 'bg-pastel-rose', 'bg-pastel-peach', 'bg-pastel-butter']
  const bgColor = colors[index % colors.length]

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  }

  const renderModule = () => {
    switch (module.type) {
      case 'link':
        return <LinkModule module={module} profileId={profileId} bgColor={bgColor} />
      case 'social-links':
        return <SocialLinksModule module={module} />
      case 'header':
        return <HeaderModule module={module} />
      case 'text':
        return <TextModule module={module} />
      case 'image':
        return <ImageModule module={module} />
      case 'divider':
        return <DividerModule module={module} />
      case 'video':
        return <VideoModule module={module} />
      case 'music':
        return <MusicModule module={module} />
      case 'spacer':
        return <SpacerModule module={module} />
      case 'button':
        return <ButtonModule module={module} />
      case 'accordion':
        return <AccordionModule module={module} />
      case 'countdown':
        return <CountdownModule module={module} />
      case 'email':
        return <EmailButtonModule module={module} />
      case 'button-grid':
        return <ButtonGridModule module={module} />
      default:
        return null
    }
  }

  return (
    <motion.div
      variants={item}
      style={borderAnimation ? {
        padding: '3px',
        background: 'linear-gradient(90deg, #a855f7, #ec4899, #3b82f6, #10b981, #a855f7)',
        backgroundSize: '300% 300%',
        animation: 'beam-border 3s linear infinite',
        borderRadius: '1rem',
      } : {}}
    >
      <div className={borderAnimation ? 'bg-white rounded-xl' : ''}>
        {renderModule()}
      </div>
    </motion.div>
  )
}
