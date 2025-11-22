import type { Module, SpacerContent } from '@/types'

interface SpacerModuleProps {
  module: Module
}

export function SpacerModule({ module }: SpacerModuleProps) {
  const content = module.content as SpacerContent
  const height = content.height || 32

  return <div style={{ height: `${height}px` }} />
}
