import { Instagram, Twitter, Youtube, Linkedin, Facebook, Github, Music, MessageCircle } from 'lucide-react'
import type { Module, SocialLinksContent } from '@/types'

interface SocialLinksModuleProps {
  module: Module
}

const SOCIAL_ICONS = {
  instagram: Instagram,
  twitter: Twitter,
  tiktok: Music,
  youtube: Youtube,
  linkedin: Linkedin,
  facebook: Facebook,
  github: Github,
  discord: MessageCircle,
  twitch: Music,
  spotify: Music,
}

export function SocialLinksModule({ module }: SocialLinksModuleProps) {
  const content = module.content as SocialLinksContent
  const layout = content.layout || 'horizontal'
  const iconStyle = (content as any).iconStyle || 'rounded'

  const styleClasses = {
    rounded: 'rounded-2xl',
    sharp: 'rounded-md',
    minimal: 'rounded-full border-2 border-gray-300'
  }

  return (
    <div className={`flex ${layout === 'grid' ? 'grid grid-cols-4' : 'flex-row justify-center'} gap-3`}>
      {content.links.map((link, index) => {
        const Icon = SOCIAL_ICONS[link.platform] || MessageCircle
        const colors = ['bg-pastel-sky', 'bg-pastel-lavender', 'bg-pastel-mint', 'bg-pastel-rose', 'bg-pastel-peach', 'bg-pastel-butter']
        const bgColor = colors[index % colors.length]

        return (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${iconStyle === 'minimal' ? 'bg-white' : bgColor} ${styleClasses[iconStyle as keyof typeof styleClasses]} shadow-soft hover:shadow-soft-lg transition-all hover:scale-110 active:scale-95 p-4 flex items-center justify-center`}
            title={link.platform}
          >
            <Icon className="w-6 h-6 text-gray-700" />
          </a>
        )
      })}
    </div>
  )
}
