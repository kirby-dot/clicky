'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import type { Profile, Module } from '@/types'
import { ModuleRenderer } from '../modules/module-renderer'

interface ProfileModulesViewProps {
  profile: Profile
  modules: Module[]
}

export default function ProfileModulesView({ profile, modules }: ProfileModulesViewProps) {
  useEffect(() => {
    // Track page view
    trackEvent('view', profile.id)
  }, [profile.id])

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

  // Get page style from profile
  const pageStyle = (profile.style as any) || {}
  const containerWidth = pageStyle.containerWidth || 'contained'
  const animation = pageStyle.animation || 'fade-up'
  const borderAnimation = pageStyle.borderAnimation || false

  // Different animation variants
  const getItemVariant = () => {
    switch (animation) {
      case 'fade-in':
        return { hidden: { opacity: 0 }, show: { opacity: 1 } }
      case 'fade-up':
        return { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }
      case 'scale-in':
        return { hidden: { scale: 0.8, opacity: 0 }, show: { scale: 1, opacity: 1 } }
      case 'none':
        return { hidden: {}, show: {} }
      default:
        return { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }
    }
  }

  const itemVariant = getItemVariant()

  return (
    <div
      className="min-h-screen py-12 px-4"
      style={{
        background: pageStyle.backgroundColor || 'linear-gradient(to-br, #f0f9ff, #faf5ff)',
        backgroundImage: pageStyle.backgroundImage ? `url(${pageStyle.backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <motion.div
        className={containerWidth === 'full' ? 'w-full' : 'max-w-2xl mx-auto'}
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Profile Header */}
        <motion.div variants={itemVariant} className="text-center mb-12">
          {profile.avatar_url && (
            <div className="mb-6">
              <img
                src={profile.avatar_url}
                alt={profile.title}
                className="w-32 h-32 mx-auto object-cover rounded-full border-2 border-gray-200 shadow-soft-lg"
              />
            </div>
          )}

          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            {profile.title}
          </h1>

          {profile.bio && (
            <p className="text-lg text-gray-600 max-w-lg mx-auto">{profile.bio}</p>
          )}
        </motion.div>

        {/* Modules */}
        {(() => {
          const layout = pageStyle.layout || 'stack'
          const moduleSpacing = pageStyle.moduleSpacing || 4

          // Map spacing to Tailwind gap classes
          const gapClass = ({
            2: 'gap-2',
            3: 'gap-3',
            4: 'gap-4',
            6: 'gap-6',
            8: 'gap-8'
          } as Record<number, string>)[moduleSpacing] || 'gap-4'

          const spaceClass = ({
            2: 'space-y-2',
            3: 'space-y-3',
            4: 'space-y-4',
            6: 'space-y-6',
            8: 'space-y-8'
          } as Record<number, string>)[moduleSpacing] || 'space-y-4'

          // Choose container class based on layout
          const containerClasses = ({
            'stack': `max-w-lg mx-auto ${spaceClass}`,
            'grid': `max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 ${gapClass}`,
            'masonry': `max-w-4xl mx-auto columns-1 md:columns-2 ${gapClass}`,
            'centered': `max-w-md mx-auto ${spaceClass}`
          } as Record<string, string>)[layout] || `max-w-lg mx-auto ${spaceClass}`

          return (
            <div className={containerClasses}>
              {modules.map((module, index) => (
                <div
                  key={module.id}
                  className={layout === 'masonry' ? 'break-inside-avoid mb-4' : ''}
                >
                  <ModuleRenderer
                    module={module}
                    profileId={profile.id}
                    index={index}
                    borderAnimation={borderAnimation}
                  />
                </div>
              ))}
            </div>
          )
        })()}


        {modules.length === 0 && (
          <motion.div variants={item} className="text-center text-gray-600 py-12">
            <p>No content yet</p>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div variants={item} className="text-center mt-16">
          <a
            href="/"
            className="inline-block text-sm bg-gradient-to-r from-primary-500 to-purple-500 text-white font-semibold px-6 py-3 rounded-xl shadow-soft-lg hover:shadow-soft-xl hover:scale-105 active:scale-95 transition-all"
          >
            Create your own Clicky
          </a>
        </motion.div>
      </motion.div>
    </div>
  )
}

function trackEvent(type: 'view' | 'click', profileId: string, moduleId?: string) {
  if (typeof window !== 'undefined') {
    const data = {
      profile_id: profileId,
      link_id: moduleId,
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
    }).catch(() => {})
  }
}
