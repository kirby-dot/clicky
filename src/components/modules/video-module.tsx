import type { Module, VideoContent } from '@/types'

interface VideoModuleProps {
  module: Module
}

export function VideoModule({ module }: VideoModuleProps) {
  const content = module.content as VideoContent

  const getEmbedUrl = (url: string) => {
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&\s?]+)/)?.[1]
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url
    }
    // Vimeo
    if (url.includes('vimeo.com')) {
      const videoId = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1]
      return videoId ? `https://player.vimeo.com/video/${videoId}` : url
    }
    // TikTok
    if (url.includes('tiktok.com')) {
      const videoId = url.match(/tiktok\.com\/(?:@[\w.-]+\/video\/|v\/)(\d+)/)?.[1]
      return videoId ? `https://www.tiktok.com/embed/v2/${videoId}` : url
    }
    // Loom
    if (url.includes('loom.com')) {
      const videoId = url.match(/loom\.com\/share\/([^?]+)/)?.[1]
      return videoId ? `https://www.loom.com/embed/${videoId}` : url
    }
    return url
  }

  return (
    <div className="relative w-full rounded-2xl shadow-soft overflow-hidden" style={{ paddingBottom: '56.25%' }}>
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
