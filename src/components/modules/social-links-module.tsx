import { Instagram, Twitter, Youtube, Linkedin, Facebook, Github, Music, MessageCircle, Globe, Mail, Phone, MapPin } from 'lucide-react'
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
  website: Globe,
  email: Mail,
  phone: Phone,
  location: MapPin,
}

const PLATFORM_COLORS: Record<string, string> = {
  instagram: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)',
  twitter: '#1DA1F2',
  tiktok: '#000000',
  youtube: '#FF0000',
  linkedin: '#0077B5',
  facebook: '#1877F2',
  github: '#181717',
  discord: '#5865F2',
  twitch: '#9146FF',
  spotify: '#1DB954',
  website: '#6366f1',
  email: '#ea580c',
  phone: '#16a34a',
  location: '#dc2626',
}

export function SocialLinksModule({ module }: SocialLinksModuleProps) {
  const content = module.content as SocialLinksContent
  const layout = content.layout || 'horizontal'
  const iconStyle = (content as any).iconStyle || 'rounded'

  // Get custom styling properties
  const iconSize = (content as any).iconSize || 32
  const iconColor = (content as any).iconColor
  const customBgColor = (content as any).backgroundColor
  const customBorderRadius = (content as any).borderRadius
  const useGlobalColors = (content as any).useGlobalColors || false

  const styleClasses = {
    rounded: 'rounded-2xl',
    sharp: 'rounded-md',
    minimal: 'rounded-full border-2 border-gray-300'
  }

  return (
    <div className={`flex ${layout === 'grid' ? 'grid grid-cols-4' : 'flex-row justify-center'} gap-3 flex-wrap`}>
      {content.links.map((link, index) => {
        const Icon = SOCIAL_ICONS[link.platform] || MessageCircle
        const platformColor = PLATFORM_COLORS[link.platform]

        // Use custom border radius if provided, otherwise use style class
        const borderRadiusClass = customBorderRadius === undefined ? styleClasses[iconStyle as keyof typeof styleClasses] : ''

        // Determine background styling
        let bgStyle: React.CSSProperties = {}
        let bgClass = ''

        if (customBgColor) {
          bgStyle.backgroundColor = customBgColor
        } else if (useGlobalColors) {
          bgClass = ''
          bgStyle.backgroundColor = 'var(--color-primary)'
        } else if (iconStyle === 'minimal') {
          bgClass = 'bg-white'
        } else if (platformColor) {
          bgStyle.background = platformColor
        } else {
          const colors = ['bg-pastel-sky', 'bg-pastel-lavender', 'bg-pastel-mint', 'bg-pastel-rose', 'bg-pastel-peach', 'bg-pastel-butter']
          bgClass = colors[index % colors.length]
        }

        if (customBorderRadius !== undefined) {
          bgStyle.borderRadius = `${customBorderRadius}px`
        }

        // Use global border radius if not custom
        if (!customBorderRadius && useGlobalColors) {
          bgStyle.borderRadius = 'var(--border-radius)'
        }

        return (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${bgClass} ${borderRadiusClass} shadow-soft hover:shadow-soft-lg transition-all hover:scale-110 active:scale-95 p-4 flex items-center justify-center`}
            style={bgStyle}
            title={link.platform}
            aria-label={link.platform}
          >
            <Icon
              className={iconStyle === 'minimal' ? 'text-gray-700' : 'text-white'}
              style={{
                width: `${iconSize}px`,
                height: `${iconSize}px`,
                ...(iconColor && { color: iconColor })
              }}
            />
          </a>
        )
      })}
    </div>
  )
}
