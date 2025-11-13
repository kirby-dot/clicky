import type { Module, ImageContent } from '@/types'

interface ImageModuleProps {
  module: Module
}

export function ImageModule({ module }: ImageModuleProps) {
  const content = module.content as ImageContent

  const imageElement = (
    <img
      src={content.url}
      alt={content.alt || module.title || ''}
      className="w-full h-auto border-4 border-black shadow-brutal"
    />
  )

  if (content.link) {
    return (
      <a href={content.link} target="_blank" rel="noopener noreferrer" className="block hover:shadow-brutal-lg transition-shadow">
        {imageElement}
        {content.caption && (
          <p className="text-sm text-gray-600 mt-2 font-medium text-center">{content.caption}</p>
        )}
      </a>
    )
  }

  return (
    <div>
      {imageElement}
      {content.caption && (
        <p className="text-sm text-gray-600 mt-2 font-medium text-center">{content.caption}</p>
      )}
    </div>
  )
}
