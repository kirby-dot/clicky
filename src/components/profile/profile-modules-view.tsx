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

        {/* Modules */}
        <div className="max-w-lg mx-auto space-y-4">
          {modules.map((module, index) => (
            <ModuleRenderer
              key={module.id}
              module={module}
              profileId={profile.id}
              index={index}
            />
          ))}
        </div>

        {modules.length === 0 && (
          <motion.div variants={item} className="text-center text-gray-700 py-12 font-medium">
            <p>No content yet</p>
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
