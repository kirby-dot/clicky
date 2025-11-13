import { Instagram, Twitter, Youtube, Linkedin, Facebook, Github, Music as TwitchIcon, MessageCircle } from 'lucide-react'
import type { Module, SocialLinksContent } from '@/types'

interface SocialLinksModuleProps {
  module: Module
}

const SOCIAL_ICONS = {
  instagram: Instagram,
  twitter: Twitter,
  tiktok: Music as TwitchIcon,
  youtube: Youtube,
  linkedin: Linkedin,
  facebook: Facebook,
  github: Github,
  discord: MessageCircle,
  twitch: TwitchIcon,
  spotify: Music,
}

export function SocialLinksModule({ module }: SocialLinksModuleProps) {
  const content = module.content as SocialLinksContent
  const layout = content.layout || 'horizontal'

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
            className={`${bgColor} rounded-2xl shadow-soft hover:shadow-soft-lg transition-all hover:scale-110 active:scale-95 p-4 flex items-center justify-center border border-gray-200`}
            title={link.platform}
          >
            <Icon className="w-6 h-6 text-gray-700" />
          </a>
        )
      })}
    </div>
  )
}
