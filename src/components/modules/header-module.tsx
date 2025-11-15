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

  const className = `${fontWeightClass} ${
    align === 'left' ? 'text-left' :
    align === 'right' ? 'text-right' :
    'text-center'
  } mb-4`

  const inlineStyles: React.CSSProperties = {
    color: content.color || 'var(--color-text)',
    fontSize: content.fontSize ? `${content.fontSize}px` : 'var(--heading-size)',
  }

  const Tag = level as keyof JSX.IntrinsicElements

  return <Tag className={className} style={inlineStyles}>{content.text || module.title}</Tag>
}
