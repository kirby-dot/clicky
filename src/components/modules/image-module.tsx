import type { Module, ImageContent } from '@/types'

interface ImageModuleProps {
  module: Module
}

export function ImageModule({ module }: ImageModuleProps) {
  const content = module.content as ImageContent

  // Get customization options from content
  const width = content.width !== undefined ? content.width : 100 // 1-100 percentage
  const borderRadius = content.borderRadius !== undefined ? content.borderRadius : 16 // 0-50 pixels
  const align = content.align || 'center' // 'left' | 'center' | 'right'
  const shadow = content.shadow || 'sm' // 'none' | 'sm' | 'md' | 'lg'

  // Map shadow values to Tailwind classes
  const shadowClass = {
    'none': '',
    'sm': 'shadow-sm',
    'md': 'shadow-md',
    'lg': 'shadow-lg'
  }[shadow] || 'shadow-sm'

  // Map align to container classes
  const alignClass = {
    'left': 'mr-auto',
    'center': 'mx-auto',
    'right': 'ml-auto'
  }[align] || 'mx-auto'

  const imageElement = (
    <img
      src={content.url}
      alt={content.alt || module.title || ''}
      className={`h-auto ${shadowClass} ${alignClass} transition-all`}
      style={{
        width: `${width}%`,
        borderRadius: `${borderRadius}px`,
        display: 'block'
      }}
    />
  )

  if (content.link) {
    return (
      <a href={content.link} target="_blank" rel="noopener noreferrer" className="block hover:opacity-90 transition-all">
        {imageElement}
        {content.caption && (
          <p className={`text-sm text-gray-600 mt-3 ${align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center'}`}>{content.caption}</p>
        )}
      </a>
    )
  }

  return (
    <div>
      {imageElement}
      {content.caption && (
        <p className={`text-sm text-gray-600 mt-3 ${align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center'}`}>{content.caption}</p>
      )}
    </div>
  )
}
