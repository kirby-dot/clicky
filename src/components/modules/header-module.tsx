import type { Module, HeaderContent } from '@/types'

interface HeaderModuleProps {
  module: Module
}

export function HeaderModule({ module }: HeaderModuleProps) {
  const content = module.content as HeaderContent
  const level = content.level || 'h2'
  const align = content.align || 'center'

  const className = `font-black text-black ${
    level === 'h1' ? 'text-4xl md:text-5xl' :
    level === 'h2' ? 'text-3xl md:text-4xl' :
    'text-2xl md:text-3xl'
  } ${
    align === 'left' ? 'text-left' :
    align === 'right' ? 'text-right' :
    'text-center'
  } mb-4`

  const Tag = level as keyof JSX.IntrinsicElements

  return <Tag className={className}>{content.text || module.title}</Tag>
}
