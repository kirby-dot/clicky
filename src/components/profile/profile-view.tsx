'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Award } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import type { Profile, Link, Theme, ThemeConfig, Badge } from '@/types'

interface ProfileViewProps {
  profile: Profile
  links: Link[]
  theme: Theme | null
  badge?: Badge | null
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

export default function ProfileView({ profile, links, theme, badge }: ProfileViewProps) {
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
        background: themeConfig.gradient?.enabled
          ? `linear-gradient(${themeConfig.gradient.direction || '135deg'}, ${themeConfig.gradient.colors.join(', ')})`
          : themeConfig.colors.background,
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
        <motion.div variants={item} className="text-center mb-12">
          {profile.avatar_url && (
            <div className="mb-6">
              <img
                src={profile.avatar_url}
                alt={profile.title}
                className={`w-32 h-32 mx-auto object-cover shadow-lg ring-4 ring-white/50 ${getBorderRadiusClass()}`}
                style={{ borderRadius: themeConfig.borderRadius === 'full' ? '9999px' : undefined }}
              />
            </div>
          )}

          <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
            <h1
              className="text-4xl md:text-5xl font-bold"
              style={{
                color: themeConfig.colors.text,
                fontFamily: themeConfig.fonts.heading,
              }}
            >
              {profile.title}
            </h1>
            {badge && (() => {
              const BadgeIcon = (LucideIcons as any)[badge.icon] || Award
              return (
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-md"
                  style={{
                    backgroundColor: `${badge.color}15`,
                    border: `2px solid ${badge.color}`,
                  }}
                  title={badge.description || badge.display_name}
                >
                  <BadgeIcon
                    className="w-5 h-5"
                    style={{ color: badge.color }}
                  />
                  <span
                    className="text-sm font-semibold"
                    style={{ color: badge.color }}
                  >
                    {badge.display_name}
                  </span>
                </div>
              )
            })()}
          </div>

          {profile.bio && (
            <p
              className="text-lg max-w-lg mx-auto"
              style={{
                color: themeConfig.colors.text,
                opacity: 0.8,
                fontFamily: themeConfig.fonts.body,
              }}
            >
              {profile.bio}
            </p>
          )}
        </motion.div>

        {/* Links */}
        <motion.div variants={item} className={`max-w-lg mx-auto ${getSpacingClass()}`}>
          {links.map((link) => {
            const linkStyleClass = getLinkStyle()
            const hoverClass = getHoverAnimation()

            let borderStyle = {}
            let shadowStyle = 'shadow-md hover:shadow-lg'

            if (themeConfig.linkStyle === 'outlined') {
              borderStyle = {
                borderColor: themeConfig.colors.primary,
                color: themeConfig.colors.linkText,
              }
              shadowStyle = ''
            } else if (themeConfig.linkStyle === 'minimal') {
              shadowStyle = ''
            } else if (themeConfig.linkStyle === 'shadow') {
              shadowStyle = 'shadow-lg hover:shadow-xl'
            }

            return (
              <motion.a
                key={link.id}
                href={link.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleLinkClick(link)}
                className={`${linkStyleClass} ${hoverClass} ${shadowStyle} flex items-center justify-center gap-2 relative overflow-hidden group`}
                style={{
                  backgroundColor: themeConfig.linkStyle === 'outlined' || themeConfig.linkStyle === 'minimal'
                    ? 'transparent'
                    : themeConfig.colors.linkBackground,
                  color: themeConfig.colors.linkText,
                  ...borderStyle,
                  fontFamily: themeConfig.fonts.body,
                }}
                whileHover={{ scale: themeConfig.animations.hover === 'scale' ? 1.02 : 1 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Hover overlay */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                  style={{ backgroundColor: themeConfig.colors.primary }}
                />

                <span className="relative z-10 font-semibold">{link.title}</span>
                <ExternalLink className="w-4 h-4 relative z-10 opacity-60 group-hover:opacity-100 transition-opacity" />
              </motion.a>
            )
          })}
        </motion.div>

        {links.length === 0 && (
          <motion.div
            variants={item}
            className="text-center py-12"
            style={{ color: themeConfig.colors.text, opacity: 0.6 }}
          >
            <p>No links yet</p>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div variants={item} className="text-center mt-16">
          <a
            href="/"
            className="inline-block text-sm font-semibold px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg"
            style={{
              backgroundColor: themeConfig.colors.primary,
              color: 'white',
            }}
          >
            Create your own Clicky ✨
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
