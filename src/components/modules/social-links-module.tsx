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
        const colors = ['bg-neo-yellow', 'bg-neo-pink', 'bg-neo-blue', 'bg-neo-green', 'bg-neo-purple', 'bg-neo-orange']
        const bgColor = colors[index % colors.length]

        return (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${bgColor} border-4 border-black shadow-brutal hover:shadow-brutal-lg transition-all p-4 flex items-center justify-center active:translate-x-1 active:translate-y-1 active:shadow-none`}
            title={link.platform}
          >
            <Icon className="w-6 h-6 text-black" />
          </a>
        )
      })}
    </div>
  )
}
