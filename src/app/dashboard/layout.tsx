'use client'

import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="min-h-screen w-full fixed inset-0 overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at center, #f3e8ff 0%, #fff7f3 100%)',
      }}
    >
      {/* Main Container */}
      <div className="w-full h-full max-w-[1600px] mx-auto p-8 flex items-center justify-center">
        <div className="w-full h-full bg-white/30 backdrop-blur-sm rounded-3xl shadow-lg overflow-hidden flex">
          {/* Sidebar */}
          <div className="flex-shrink-0">
            <DashboardSidebar />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
