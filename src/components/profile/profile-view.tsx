'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import type { Profile, Link, Theme, ThemeConfig } from '@/types'

interface ProfileViewProps {
  profile: Profile
  links: Link[]
  theme: Theme | null
}

const defaultTheme: ThemeConfig = {
  colors: {
    primary: '#0EA5E9',
    secondary: '#0284C7',
    background: '#FFFFFF',
    text: '#1F2937',
    linkBackground: '#F3F4F6',
    linkText: '#1F2937',
  },
  fonts: {
    heading: 'Inter',
    body: 'Inter',
  },
  spacing: 'normal',
  animations: {
    entrance: true,
    hover: 'scale',
  },
  borderRadius: 'lg',
  linkStyle: 'filled',
}

export default function ProfileView({ profile, links, theme }: ProfileViewProps) {
  const themeConfig: ThemeConfig = (theme?.config as unknown as ThemeConfig) || defaultTheme

  useEffect(() => {
    // Track page view
    trackEvent('view', profile.id)
  }, [profile.id])

  const handleLinkClick = (link: Link) => {
    trackEvent('click', profile.id, link.id)
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  }

  const getSpacingClass = () => {
    switch (themeConfig.spacing) {
      case 'tight':
        return 'space-y-2'
      case 'loose':
        return 'space-y-6'
      default:
        return 'space-y-4'
    }
  }

  const getBorderRadiusClass = () => {
    switch (themeConfig.borderRadius) {
      case 'none':
        return 'rounded-none'
      case 'sm':
        return 'rounded-sm'
      case 'md':
        return 'rounded-md'
      case 'lg':
        return 'rounded-lg'
      case 'full':
        return 'rounded-full'
      default:
        return 'rounded-lg'
    }
  }

  const getLinkStyle = () => {
    const baseStyle = `block w-full px-6 py-4 text-center font-medium transition-all ${getBorderRadiusClass()}`

    switch (themeConfig.linkStyle) {
      case 'outlined':
        return `${baseStyle} bg-transparent border-2`
      case 'minimal':
        return `${baseStyle} bg-transparent`
      case 'shadow':
        return `${baseStyle} shadow-lg hover:shadow-xl`
      default:
        return baseStyle
    }
  }

  const getHoverAnimation = () => {
    switch (themeConfig.animations.hover) {
      case 'lift':
        return 'hover:-translate-y-1'
      case 'glow':
        return 'hover:shadow-lg'
      case 'none':
        return ''
      default:
        return 'hover:scale-105'
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-white">
      <motion.div
        className="max-w-2xl mx-auto"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Profile Header */}
        <motion.div variants={item} className="text-center mb-12">
          {profile.avatar_url && (
            <div className="mb-6">
              <img
                src={profile.avatar_url}
                alt={profile.title}
                className="w-32 h-32 mx-auto object-cover border-4 border-black shadow-brutal"
              />
            </div>
          )}

          <h1 className="text-4xl md:text-5xl font-black mb-4 text-black">
            {profile.title}
          </h1>

          {profile.bio && (
            <p className="text-lg text-gray-700 max-w-lg mx-auto font-medium">{profile.bio}</p>
          )}
        </motion.div>

        {/* Links */}
        <motion.div variants={item} className="max-w-lg mx-auto space-y-4">
          {links.map((link, index) => {
            const colors = ['bg-neo-yellow', 'bg-neo-pink', 'bg-neo-blue', 'bg-neo-green', 'bg-neo-purple', 'bg-neo-orange']
            const bgColor = colors[index % colors.length]

            return (
              <motion.a
                key={link.id}
                href={link.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleLinkClick(link)}
                className={`block w-full px-6 py-4 text-center font-bold transition-all ${bgColor} border-4 border-black shadow-brutal hover:shadow-brutal-lg hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center justify-center space-x-2 text-black text-lg`}
                whileTap={{ scale: 0.98 }}
              >
                <span>{link.title}</span>
                <ExternalLink className="w-5 h-5" />
              </motion.a>
            )
          })}
        </motion.div>

        {links.length === 0 && (
          <motion.div variants={item} className="text-center text-gray-700 py-12 font-medium">
            <p>No links yet</p>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div variants={item} className="text-center mt-16">
          <a
            href="/"
            className="inline-block text-sm text-black font-bold hover:underline bg-neo-yellow border-3 border-black px-6 py-3 shadow-brutal hover:shadow-brutal-lg transition-all"
          >
            Create your own Clicky
          </a>
        </motion.div>
      </motion.div>
    </div>
  )
}

function trackEvent(type: 'view' | 'click', profileId: string, linkId?: string) {
  // Send tracking beacon
  if (typeof window !== 'undefined') {
    const data = {
      profile_id: profileId,
      link_id: linkId,
      event_type: type,
      timestamp: new Date().toISOString(),
      referrer: document.referrer,
      device_type: /mobile/i.test(navigator.userAgent)
        ? 'mobile'
        : /tablet|ipad/i.test(navigator.userAgent)
        ? 'tablet'
        : 'desktop',
    }

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => {
      // Silently fail
    })
  }
}
