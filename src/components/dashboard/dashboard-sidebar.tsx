'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Home, BarChart, Settings, LogOut, Box, ChevronDown, Plus, ExternalLink } from 'lucide-react'
import { GlassPanel } from '@/components/ui/glass'
import { cn } from '@/lib/utils'
import { createBrowserClient } from '@/lib/supabase'
import type { Profile } from '@/types'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Builder', href: '/dashboard/builder', icon: Box },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createBrowserClient()

  const [profiles, setProfiles] = useState<Profile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfiles()
  }, [])

  useEffect(() => {
    // Update selected profile based on URL param
    const profileId = searchParams.get('profile')
    if (profileId && profiles.length > 0) {
      const profile = profiles.find(p => p.id === profileId)
      if (profile) setSelectedProfile(profile)
    } else if (profiles.length > 0 && !selectedProfile) {
      setSelectedProfile(profiles[0])
    }
  }, [searchParams, profiles])

  const loadProfiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profilesData } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setProfiles(profilesData || [])
      if (profilesData && profilesData.length > 0) {
        setSelectedProfile(profilesData[0])
      }
    } catch (error) {
      console.error('Error loading profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleProfileSelect = (profile: Profile) => {
    setSelectedProfile(profile)
    setShowProfileDropdown(false)
    router.push(`/dashboard/builder?profile=${profile.id}`)
  }

  return (
    <GlassPanel className="w-64 h-full p-6 flex flex-col gap-6">
      {/* Logo/Branding */}
      <div className="px-2">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-accent-400 to-accent-600 bg-clip-text text-transparent">
          Clicky
        </h1>
        <p className="text-sm text-slate-500 mt-1">Link in Bio Builder</p>
      </div>

      {/* Profile Switcher */}
      {!loading && profiles.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-white/30 hover:bg-white/50 rounded-xl transition-all group"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-400 to-accent-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">
                  {selectedProfile?.title?.charAt(0).toUpperCase() || 'P'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {selectedProfile?.title || 'Select Profile'}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {profiles.length} profile{profiles.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <ChevronDown className={cn(
              "w-4 h-4 text-slate-600 transition-transform",
              showProfileDropdown && "rotate-180"
            )} />
          </button>

          {/* Dropdown */}
          {showProfileDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/50 backdrop-blur-xl rounded-xl border border-white/30 shadow-lg z-50 overflow-hidden">
              <div className="max-h-64 overflow-y-auto p-2">
                {profiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => handleProfileSelect(profile)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left",
                      selectedProfile?.id === profile.id
                        ? "bg-accent-400 text-white"
                        : "hover:bg-white/50 text-slate-800"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                      selectedProfile?.id === profile.id
                        ? "bg-white/20"
                        : "bg-gradient-to-br from-accent-400 to-accent-600"
                    )}>
                      <span className={cn(
                        "font-bold text-xs",
                        selectedProfile?.id === profile.id ? "text-white" : "text-white"
                      )}>
                        {profile.title?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{profile.title}</p>
                      <p className={cn(
                        "text-xs truncate",
                        selectedProfile?.id === profile.id ? "text-white/70" : "text-slate-500"
                      )}>
                        /{profile.slug}
                      </p>
                    </div>
                    {profile.published && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(`/${profile.slug}`, '_blank')
                        }}
                        className={cn(
                          "p-1.5 rounded-lg transition-all",
                          selectedProfile?.id === profile.id
                            ? "hover:bg-white/20"
                            : "hover:bg-white/30"
                        )}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </button>
                ))}
              </div>
              <div className="border-t border-white/30 p-2">
                <button
                  onClick={() => {
                    setShowProfileDropdown(false)
                    router.push('/dashboard/profiles')
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/50 transition-all text-slate-800"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-semibold">New Profile</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all group',
                isActive
                  ? 'bg-accent-400 text-white shadow-md'
                  : 'text-slate-700 hover:bg-white/50 hover:text-slate-900'
              )}
            >
              <div
                className={cn(
                  'p-2 rounded-lg transition-all',
                  isActive
                    ? 'bg-white/20'
                    : 'bg-slate-100/50 group-hover:bg-slate-100'
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="font-semibold text-sm">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-slate-200/50 pt-4 space-y-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-700 hover:bg-red-50/50 hover:text-red-600 w-full group"
        >
          <div className="p-2 rounded-lg bg-slate-100/50 group-hover:bg-red-100/50 transition-all">
            <LogOut className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm">Logout</span>
        </button>
      </div>
    </GlassPanel>
  )
}
