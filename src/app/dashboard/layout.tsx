'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase'
import { Link2, LayoutDashboard, Link as LinkIcon, Palette, BarChart3, Settings, LogOut, User, Layout } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Link2 className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                Clicky
              </span>
            </Link>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <nav className="bg-white rounded-lg border p-4 space-y-1 sticky top-24">
              <NavItem
                href="/dashboard"
                icon={<LayoutDashboard className="w-5 h-5" />}
                label="Dashboard"
              />
              <NavItem
                href="/dashboard/builder"
                icon={<Layout className="w-5 h-5" />}
                label="Page Builder"
              />
              <NavItem
                href="/dashboard/links"
                icon={<LinkIcon className="w-5 h-5" />}
                label="Links (Legacy)"
              />
              <NavItem
                href="/dashboard/appearance"
                icon={<Palette className="w-5 h-5" />}
                label="Appearance"
              />
              <NavItem
                href="/dashboard/analytics"
                icon={<BarChart3 className="w-5 h-5" />}
                label="Analytics"
              />
              <NavItem
                href="/dashboard/settings"
                icon={<Settings className="w-5 h-5" />}
                label="Settings"
              />
            </nav>

            {user && (
              <div className="mt-4 bg-white rounded-lg border p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.email}
                    </p>
                    <p className="text-xs text-gray-500">Free plan</p>
                  </div>
                </div>
              </div>
            )}
          </aside>

          {/* Main content */}
          <main className="lg:col-span-9">{children}</main>
        </div>
      </div>
    </div>
  )
}

function NavItem({
  href,
  icon,
  label,
}: {
  href: string
  icon: React.ReactNode
  label: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900"
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  )
}
