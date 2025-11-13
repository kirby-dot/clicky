import type { Module, VideoContent } from '@/types'

interface VideoModuleProps {
  module: Module
}

export function VideoModule({ module }: VideoModuleProps) {
  const content = module.content as VideoContent

  const getEmbedUrl = (url: string) => {
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1]
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url
    }
    // Vimeo
    if (url.includes('vimeo.com')) {
      const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1]
      return videoId ? `https://player.vimeo.com/video/${videoId}` : url
    }
    return url
  }

  return (
    <div className="relative w-full border-4 border-black shadow-brutal overflow-hidden" style={{ paddingBottom: '56.25%' }}>
      <iframe
        src={getEmbedUrl(content.url)}
        className="absolute top-0 left-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title={module.title || 'Video'}
      />
    </div>
  )
}
