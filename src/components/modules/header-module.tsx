import type { Module, HeaderContent } from '@/types'

interface HeaderModuleProps {
  module: Module
}

export function HeaderModule({ module }: HeaderModuleProps) {
  const content = module.content as HeaderContent
  const level = content.level || 'h2'
  const align = content.align || 'center'

  // Font weight mapping
  const fontWeightClass = content.fontWeight
    ? content.fontWeight === 'normal' ? 'font-normal' :
      content.fontWeight === 'medium' ? 'font-medium' :
      content.fontWeight === 'semibold' ? 'font-semibold' :
      content.fontWeight === 'bold' ? 'font-bold' :
      'font-black'
    : 'font-black'

  // Default font sizes based on level (if not specified)
  const defaultFontSize = level === 'h1' ? 'text-4xl md:text-5xl' :
    level === 'h2' ? 'text-3xl md:text-4xl' :
    'text-2xl md:text-3xl'

  const className = `${fontWeightClass} ${!content.fontSize ? defaultFontSize : ''} ${
    align === 'left' ? 'text-left' :
    align === 'right' ? 'text-right' :
    'text-center'
  } mb-4`

  const inlineStyles: React.CSSProperties = {
    ...(content.color && { color: content.color }),
    ...(content.fontSize && { fontSize: `${content.fontSize}px` }),
  }

  const Tag = level as keyof JSX.IntrinsicElements

  return <Tag className={className} style={inlineStyles}>{content.text || module.title}</Tag>
}
