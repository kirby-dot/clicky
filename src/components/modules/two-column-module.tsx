'use client'

import type { Module } from '@/types'
import { VideoModule } from './video-module'
import { TextModule } from './text-module'
import { ImageModule } from './image-module'
import { SocialLinksModule } from './social-links-module'

interface TwoColumnModuleProps {
  module: Module
}

export function TwoColumnModule({ module }: TwoColumnModuleProps) {
  const content = module.content as any
  const ratio = content.ratio || '50-50'

  // Calculate grid column classes based on ratio
  const getGridClass = () => {
    switch (ratio) {
      case '60-40':
        return 'grid-cols-1 md:grid-cols-[3fr_2fr]'
      case '40-60':
        return 'grid-cols-1 md:grid-cols-[2fr_3fr]'
      default: // '50-50'
        return 'grid-cols-1 md:grid-cols-2'
    }
  }

  // Render content based on type
  const renderContent = (type: string, contentData: any, side: 'left' | 'right') => {
    // Create a temporary module object for rendering
    const tempModule: Module = {
      ...module,
      type: type as any,
      content: contentData || {}
    }

    switch (type) {
      case 'video':
        return <VideoModule module={tempModule} />
      case 'text':
        return <TextModule module={tempModule} />
      case 'image':
        return <ImageModule module={tempModule} />
      case 'social-links':
        return <SocialLinksModule module={tempModule} />
      default:
        return (
          <div className="p-6 bg-gray-100 rounded-xl text-center text-gray-500">
            <p>Select content type for {side} column</p>
          </div>
        )
    }
  }

  return (
    <div className={`grid ${getGridClass()} gap-6`}>
      {/* Left Column */}
      <div className="w-full">
        {renderContent(content.leftType, content.leftContent, 'left')}
      </div>

      {/* Right Column */}
      <div className="w-full">
        {renderContent(content.rightType, content.rightContent, 'right')}
      </div>
    </div>
  )
}
