import type { Module, MusicContent } from '@/types'

interface MusicModuleProps {
  module: Module
}

export function MusicModule({ module }: MusicModuleProps) {
  const content = module.content as MusicContent

  const getEmbedUrl = (url: string) => {
    // Spotify
    if (url.includes('spotify.com')) {
      const trackId = url.match(/track\/([a-zA-Z0-9]+)/)?.[1]
      if (trackId) return `https://open.spotify.com/embed/track/${trackId}`
      const playlistId = url.match(/playlist\/([a-zA-Z0-9]+)/)?.[1]
      if (playlistId) return `https://open.spotify.com/embed/playlist/${playlistId}`
    }
    // SoundCloud
    if (url.includes('soundcloud.com')) {
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`
    }
    return url
  }

  return (
    <div className="border-4 border-black shadow-brutal overflow-hidden">
      <iframe
        src={getEmbedUrl(content.url)}
        className="w-full h-32"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        title={module.title || 'Music'}
      />
    </div>
  )
}
