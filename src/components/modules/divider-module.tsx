import type { Module, DividerContent } from '@/types'

interface DividerModuleProps {
  module: Module
}

export function DividerModule({ module }: DividerModuleProps) {
  const content = module.content as DividerContent
  const style = content.style || 'solid'

  const borderStyle = {
    solid: 'border-solid',
    dashed: 'border-dashed',
    dotted: 'border-dotted',
    double: 'border-double',
  }[style]

  return (
    <hr
      className={`border-t-4 border-black ${borderStyle} my-6`}
      style={{ borderColor: content.color || '#000' }}
    />
  )
}
