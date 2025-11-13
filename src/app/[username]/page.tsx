import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import ProfileView from '@/components/profile/profile-view'
import ProfileModulesView from '@/components/profile/profile-modules-view'
import type { Database } from '@/types/database'
import type { Module } from '@/types'

export const revalidate = 10 // Revalidate every 10 seconds for live preview

type Props = {
  params: { username: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cookieStore = cookies()
  const supabase = createServerComponentClient<Database>({
    cookies: () => cookieStore
  })

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
  const cookieStore = cookies()
  const supabase = createServerComponentClient<Database>({
    cookies: () => cookieStore
  })

  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      theme:themes(*)
    `)
    .eq('slug', params.username)
    .eq('published', true)
    .single()

  if (!profile) {
    notFound()
  }

  // Check for modules first (new system)
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
    />
  )
}
