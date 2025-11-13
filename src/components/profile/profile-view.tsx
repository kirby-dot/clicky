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
    <div
      className="min-h-screen py-12 px-4"
      style={{
        backgroundColor: themeConfig.colors.background,
        color: themeConfig.colors.text,
        fontFamily: themeConfig.fonts.body,
      }}
    >
      <motion.div
        className="max-w-2xl mx-auto"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Profile Header */}
        <motion.div variants={item} className="text-center mb-8">
          {profile.avatar_url && (
            <div className="mb-4">
              <img
                src={profile.avatar_url}
                alt={profile.title}
                className="w-24 h-24 rounded-full mx-auto object-cover border-4"
                style={{ borderColor: themeConfig.colors.primary }}
              />
            </div>
          )}

          <h1
            className="text-3xl font-bold mb-2"
            style={{ fontFamily: themeConfig.fonts.heading }}
          >
            {profile.title}
          </h1>

          {profile.bio && (
            <p className="text-lg opacity-80 max-w-lg mx-auto">{profile.bio}</p>
          )}
        </motion.div>

        {/* Links */}
        <motion.div variants={item} className={`max-w-lg mx-auto ${getSpacingClass()}`}>
          {links.map((link, index) => (
            <motion.a
              key={link.id}
              href={link.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleLinkClick(link)}
              className={`${getLinkStyle()} ${getHoverAnimation()} flex items-center justify-center space-x-2`}
              style={{
                backgroundColor:
                  themeConfig.linkStyle === 'filled'
                    ? themeConfig.colors.linkBackground
                    : 'transparent',
                color: themeConfig.colors.linkText,
                borderColor:
                  themeConfig.linkStyle === 'outlined'
                    ? themeConfig.colors.primary
                    : undefined,
              }}
              whileHover={{ scale: themeConfig.animations.hover === 'scale' ? 1.05 : 1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>{link.title}</span>
              <ExternalLink className="w-4 h-4" />
            </motion.a>
          ))}
        </motion.div>

        {links.length === 0 && (
          <motion.div variants={item} className="text-center text-gray-500 py-12">
            <p>No links yet</p>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div variants={item} className="text-center mt-12">
          <a
            href="/"
            className="text-sm opacity-60 hover:opacity-100 transition-opacity"
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
