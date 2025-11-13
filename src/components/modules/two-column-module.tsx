'use client'

import type { Module, TwoColumnContent } from '@/types'
import { ModuleRenderer } from './module-renderer'

interface TwoColumnModuleProps {
  module: Module
  allModules: Module[]
  profileId: string
}

export function TwoColumnModule({ module, allModules, profileId }: TwoColumnModuleProps) {
  const content = module.content as TwoColumnContent
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

  // Find the modules for left and right columns
  const leftModule = content.leftModuleId
    ? allModules.find(m => m.id === content.leftModuleId)
    : null

  const rightModule = content.rightModuleId
    ? allModules.find(m => m.id === content.rightModuleId)
    : null

  // Render column content
  const renderColumn = (columnModule: Module | null | undefined, side: 'left' | 'right') => {
    if (!columnModule) {
      return (
        <div className="p-12 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl text-center text-gray-500">
          <p className="font-semibold mb-2">Empty {side} column</p>
          <p className="text-sm">Edit this module to assign content</p>
        </div>
      )
    }

    return (
      <ModuleRenderer
        module={columnModule}
        profileId={profileId}
        index={0}
        borderAnimation={false}
      />
    )
  }

  return (
    <div className={`grid ${getGridClass()} gap-6`}>
      {/* Left Column */}
      <div className="w-full">
        {renderColumn(leftModule, 'left')}
      </div>

      {/* Right Column */}
      <div className="w-full">
        {renderColumn(rightModule, 'right')}
      </div>
    </div>
  )
}
