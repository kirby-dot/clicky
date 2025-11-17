'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Link as LinkIcon, BarChart, Users, Settings, LogOut, Palette, Box } from 'lucide-react'
import { GlassPanel } from '@/components/ui/glass'
import { cn } from '@/lib/utils'
import { createBrowserClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Builder', href: '/dashboard/builder', icon: Box },
  { name: 'Profiles', href: '/dashboard/profiles', icon: LinkIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart },
  { name: 'Appearance', href: '/dashboard/appearance', icon: Palette },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createBrowserClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
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
