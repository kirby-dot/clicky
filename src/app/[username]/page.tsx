import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import ProfileView from '@/components/profile/profile-view'
import type { Database } from '@/types/database'

export const revalidate = 60 // Revalidate every 60 seconds

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
