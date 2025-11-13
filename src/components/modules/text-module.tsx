import type { Module, TextContent } from '@/types'

interface TextModuleProps {
  module: Module
}

export function TextModule({ module }: TextModuleProps) {
  const content = module.content as TextContent
  const align = content.align || 'center'

  const className = `text-gray-700 font-medium ${
    align === 'left' ? 'text-left' :
    align === 'right' ? 'text-right' :
    'text-center'
  }`

  return (
    <p className={className} style={{ whiteSpace: 'pre-wrap' }}>
      {content.text}
    </p>
  )
}
