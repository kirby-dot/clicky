import type { Module, TextContent } from '@/types'

interface TextModuleProps {
  module: Module
}

export function TextModule({ module }: TextModuleProps) {
  const content = module.content as TextContent
  const align = content.align || 'center'

  // Font weight mapping
  const fontWeightClass = content.fontWeight
    ? content.fontWeight === 'normal' ? 'font-normal' :
      content.fontWeight === 'medium' ? 'font-medium' :
      content.fontWeight === 'semibold' ? 'font-semibold' :
      content.fontWeight === 'bold' ? 'font-bold' :
      'font-medium'
    : 'font-medium'

  const className = `${fontWeightClass} ${
    align === 'left' ? 'text-left' :
    align === 'right' ? 'text-right' :
    'text-center'
  }`

  const inlineStyles: React.CSSProperties = {
    whiteSpace: 'pre-wrap',
    color: content.color || 'var(--color-text, inherit)',
    fontSize: content.fontSize ? `${content.fontSize}px` : 'var(--body-size, inherit)',
  }

  return (
    <p className={className} style={inlineStyles}>
      {content.text}
    </p>
  )
}
