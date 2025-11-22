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
      className={`border-t-2 border-gray-300 ${borderStyle} my-8`}
      style={{ borderColor: content.color || '#E5E7EB' }}
    />
  )
}
