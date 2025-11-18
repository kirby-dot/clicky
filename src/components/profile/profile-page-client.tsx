'use client'

import { useState, useEffect } from 'react'
import { PasswordProtection } from '@/components/password-protection'
import ProfileModulesView from '@/components/profile/profile-modules-view'
import type { Profile, Module, Section, Badge } from '@/types'

interface ProfilePageClientProps {
  profile: Profile & { badge: any[] | null }
  modules: Module[]
  sections: Section[]
  subscriptionTier: string
  isOwner: boolean
}

export function ProfilePageClient({
  profile,
  modules,
  sections,
  subscriptionTier,
  isOwner
}: ProfilePageClientProps) {
  const [isUnlocked, setIsUnlocked] = useState(false)

  // Check if profile is password protected
  const metadata = (profile as any).metadata as any
  const isPasswordProtected = !!(metadata?.password_hash)

  // Owners bypass password protection
  const shouldShowContent = isOwner || !isPasswordProtected || isUnlocked

  useEffect(() => {
    // Check if user already has access via cookie
    if (isPasswordProtected && !isOwner) {
      const hasAccess = document.cookie.includes(`profile_access_${profile.id}=granted`)
      if (hasAccess) {
        setIsUnlocked(true)
      }
    }
  }, [profile.id, isPasswordProtected, isOwner])

  const handleUnlock = async (password: string): Promise<boolean> => {
    try {
      // Simple hash verification - in production use bcrypt
      const hash = btoa(password)

      if (hash === metadata?.password_hash) {
        setIsUnlocked(true)
        // Set cookie for persistent access
        document.cookie = `profile_access_${profile.id}=granted; path=/; max-age=604800` // 7 days
        return true
      }

      return false
    } catch (error) {
      console.error('Password verification error:', error)
      return false
    }
  }

  if (!shouldShowContent) {
    return (
      <PasswordProtection
        onUnlock={handleUnlock}
        profileTitle={profile.title}
      />
    )
  }

  return (
    <ProfileModulesView
      profile={profile}
      modules={modules}
      sections={sections}
      subscriptionTier={subscriptionTier}
      badge={profile.badge ? profile.badge[0] : null}
    />
  )
}
