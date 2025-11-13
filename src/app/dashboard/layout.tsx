'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase'
import { Link2, LayoutDashboard, Link as LinkIcon, Palette, BarChart3, Settings, LogOut, User, Layout, Zap, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase])

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    if (saved !== null) {
      setSidebarCollapsed(saved === 'true')
    }
  }, [])

  // Save collapsed state to localStorage
  const toggleSidebar = () => {
    const newState = !sidebarCollapsed
    setSidebarCollapsed(newState)
    localStorage.setItem('sidebarCollapsed', String(newState))
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-soft">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-soft">
                <Link2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                Clicky
              </span>
            </Link>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-6 py-10">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className={`flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
            <nav className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-3 space-y-2 sticky top-28 shadow-soft">
              <NavItem
                href="/dashboard"
                icon={<LayoutDashboard className="w-5 h-5" />}
                label="Dashboard"
                collapsed={sidebarCollapsed}
              />
              <NavItem
                href="/dashboard/builder"
                icon={<Layout className="w-5 h-5" />}
                label="Page Builder"
                collapsed={sidebarCollapsed}
              />
              <NavItem
                href="/dashboard/links"
                icon={<LinkIcon className="w-5 h-5" />}
                label="Links (Legacy)"
                collapsed={sidebarCollapsed}
              />
              <NavItem
                href="/dashboard/appearance"
                icon={<Palette className="w-5 h-5" />}
                label="Appearance"
                collapsed={sidebarCollapsed}
              />
              <NavItem
                href="/dashboard/analytics"
                icon={<BarChart3 className="w-5 h-5" />}
                label="Analytics"
                collapsed={sidebarCollapsed}
              />
              <NavItem
                href="/dashboard/integrations"
                icon={<Zap className="w-5 h-5" />}
                label="Integrations"
                collapsed={sidebarCollapsed}
              />
              <NavItem
                href="/dashboard/settings"
                icon={<Settings className="w-5 h-5" />}
                label="Settings"
                collapsed={sidebarCollapsed}
              />

              {/* Collapse/Expand Button */}
              <button
                onClick={toggleSidebar}
                className="w-full flex items-center justify-center px-4 py-3 rounded-xl hover:bg-gray-100 transition-all text-gray-600 hover:text-gray-900 mt-2"
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-5 h-5" />
                ) : (
                  <>
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    <span className="font-semibold text-sm">Collapse</span>
                  </>
                )}
              </button>
            </nav>

            {user && !sidebarCollapsed && (
              <div className="mt-6 bg-gradient-to-br from-pastel-sky to-pastel-lavender rounded-2xl border border-gray-200 p-5 shadow-soft">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-soft">
                    <User className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user.email}
                    </p>
                    <p className="text-xs text-gray-600 mt-1 font-medium">Free Plan</p>
                  </div>
                </div>
              </div>
            )}

            {user && sidebarCollapsed && (
              <div className="mt-6 bg-gradient-to-br from-pastel-sky to-pastel-lavender rounded-2xl border border-gray-200 p-3 shadow-soft flex items-center justify-center">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-soft" title={user.email}>
                  <User className="w-5 h-5 text-primary-600" />
                </div>
              </div>
            )}
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  )
}

function NavItem({
  href,
  icon,
  label,
  collapsed,
}: {
  href: string
  icon: React.ReactNode
  label: string
  collapsed: boolean
}) {
  if (collapsed) {
    return (
      <div className="relative group">
        <Link
          href={href}
          className="flex items-center justify-center px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-pastel-sky hover:to-pastel-lavender transition-all text-gray-700 hover:text-gray-900 hover:shadow-soft"
        >
          <span className="group-hover:scale-110 transition-transform">{icon}</span>
        </Link>

        {/* Tooltip */}
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
          {label}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
        </div>
      </div>
    )
  }

  return (
    <Link
      href={href}
      className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-pastel-sky hover:to-pastel-lavender transition-all text-gray-700 hover:text-gray-900 hover:shadow-soft group"
    >
      <span className="group-hover:scale-110 transition-transform">{icon}</span>
      <span className="font-semibold text-sm">{label}</span>
    </Link>
  )
}
