'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Award } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import type { Profile, Module, Badge, Section, SectionWithModules, ProfileStyle } from '@/types'
import { ModuleRenderer } from '../modules/module-renderer'
import { SectionRenderer } from '../sections/section-renderer'
import { StyleProvider } from '../style/style-provider'

interface ProfileModulesViewProps {
  profile: Profile
  modules: Module[]
  sections?: Section[]
  badge?: Badge | null
}

export default function ProfileModulesView({ profile, modules, sections = [], badge }: ProfileModulesViewProps) {
  const profileStyle = (profile.style as Partial<ProfileStyle>) || {}

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

  const animation = profileStyle.animation || 'fade-up'

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

  const bgColor = profileStyle.backgroundColor || '#ffffff'
  const bgImage = profileStyle.backgroundImage
  const bgGradient = profileStyle.backgroundGradient

  return (
    <StyleProvider style={profileStyle}>
      <div
        className="min-h-screen py-12 px-4"
        style={{
          backgroundColor: bgColor,
          backgroundImage: bgGradient || (bgImage ? `url(${bgImage})` : undefined),
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
      <motion.div
        className="max-w-2xl mx-auto"
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
                className="w-32 h-32 mx-auto object-cover rounded-full shadow-lg ring-4 ring-white/50"
              />
            </div>
          )}

          <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
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
            <p className="text-lg text-gray-600 max-w-lg mx-auto">{profile.bio}</p>
          )}
        </motion.div>

        {/* Sections and Modules */}
        {(() => {
          // If we have sections, render them with their modules
          if (sections && sections.length > 0) {
            // Group modules by section
            const sectionsWithModules: SectionWithModules[] = sections.map(section => ({
              ...section,
              modules: modules.filter(m => m.section_id === section.id)
            }))

            // Get modules not in any section
            const modulesWithoutSection = modules.filter(m => !m.section_id)

            return (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--section-spacing, 32px)'
                }}
              >
                {/* Render sections */}
                {sectionsWithModules.map((section, index) => (
                  <SectionRenderer
                    key={section.id}
                    section={section}
                    profileId={profile.id}
                    sectionIndex={index}
                  />
                ))}

                {/* Render modules without section */}
                {modulesWithoutSection.length > 0 && (
                  <div
                    className="max-w-lg mx-auto"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--module-spacing, 16px)'
                    }}
                  >
                    {modulesWithoutSection.map((module, index) => (
                      <ModuleRenderer
                        key={module.id}
                        module={module}
                        profileId={profile.id}
                        index={index}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          }

          // Fallback to original layout if no sections
          const layout = 'stack'
          const moduleSpacing = 4

          const spaceClass = ({
            2: 'space-y-2',
            3: 'space-y-3',
            4: 'space-y-4',
            6: 'space-y-6',
            8: 'space-y-8'
          } as Record<number, string>)[moduleSpacing] || 'space-y-4'

          const gapClass = ({
            2: 'gap-2',
            3: 'gap-3',
            4: 'gap-4',
            6: 'gap-6',
            8: 'gap-8'
          } as Record<number, string>)[moduleSpacing] || 'gap-4'

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

        {/* Made by Clicky Banner */}
        <motion.div
          variants={item}
          className="text-center mt-16 pb-8"
        >
          <a
            href="/"
            className="inline-flex flex-col items-center gap-2 group"
          >
            <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
              </svg>
              <span>Create your own Clicky</span>
            </div>
            <span className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">
              Made with ✨ by Clicky
            </span>
          </a>
        </motion.div>
      </motion.div>
    </div>
    </StyleProvider>
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
