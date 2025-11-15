import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import ProfileView from '@/components/profile/profile-view'
import ProfileModulesView from '@/components/profile/profile-modules-view'
import type { Database } from '@/types/database'
import type { Module, Section } from '@/types'

export const revalidate = 10 // Revalidate every 10 seconds for live preview

type Props = {
  params: { username: string }
}

// Helper to create server Supabase client
function createServerClient() {
  return createClient<Database>(
    'https://ddekvujqgnhkndhvdfma.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkZWt2dWpxZ25oa25kaHZkZm1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMTcwMTYsImV4cCI6MjA3ODU5MzAxNn0.9pwv0Ma6HMnjxM8XsysmsovJKFnd6eqsfxNJuSeNBY8',
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    }
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createServerClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('slug', params.username)
    .eq('published', true)
    .single()

  if (!profile) {
    return {
      title: 'Profile Not Found',
    }
  }

  return {
    title: `${profile.title} - Clicky`,
    description: profile.bio || `Check out ${profile.title}'s links`,
    openGraph: {
      title: profile.title,
      description: profile.bio || undefined,
      images: profile.avatar_url ? [profile.avatar_url] : [],
    },
  }
}

export default async function ProfilePage({ params }: Props) {
  const supabase = createServerClient()

  // Get current user to check if they own this profile
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch profile - allow unpublished if user owns it
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      badge:badges(*)
    `)
    .eq('slug', params.username)
    .single()

  if (!profile) {
    notFound()
  }

  // Check if profile is viewable (published OR owned by current user)
  const isOwner = user && profile.user_id === user.id
  if (!profile.published && !isOwner) {
    notFound()
  }

  // Check for sections and modules (new system)
  const { data: sections } = await supabase
    .from('sections')
    .select('*')
    .eq('profile_id', profile.id)
    .eq('active', true)
    .order('order')

  const { data: modules } = await supabase
    .from('modules')
    .select('*')
    .eq('profile_id', profile.id)
    .eq('active', true)
    .order('position')

  // If modules exist, use the new module-based view
  if (modules && modules.length > 0) {
    return (
      <ProfileModulesView
        profile={profile}
        modules={modules as Module[]}
        sections={(sections as Section[]) || []}
        badge={profile.badge ? profile.badge[0] : null}
      />
    )
  }

  // Otherwise, fall back to links (backward compatibility)
  const { data: links } = await supabase
    .from('links')
    .select('*')
    .eq('profile_id', profile.id)
    .eq('active', true)
    .order('position')

  return (
    <ProfileView
      profile={profile}
      links={links || []}
      theme={profile.theme ? profile.theme[0] : null}
      badge={profile.badge ? profile.badge[0] : null}
    />
  )
}
