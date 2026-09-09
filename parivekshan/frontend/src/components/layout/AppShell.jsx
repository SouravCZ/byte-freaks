import React from 'react'
import { useRole } from '../../lib/roleContext'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AppShell({ icon, title, subtitle, children }) {
  const { role } = useRole()

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-sidebar-width flex flex-col min-h-screen">
        <Topbar title={title} subtitle={subtitle} />
        <main className="flex-1 w-full max-w-[1680px] mx-auto px-space-lg lg:px-space-xl py-space-lg lg:py-space-xl">
          {children}
        </main>
        <footer className="border-t border-border-crisp bg-surface-card">
          <div className="max-w-[1680px] mx-auto px-space-lg lg:px-space-xl py-space-md flex items-center justify-between gap-2">
            <p className="font-code-xs text-code-xs text-text-muted uppercase tracking-wider">LandGuard AI · MoRD GeoRisk Suite · NSDSS</p>
            <p className="font-code-xs text-code-xs text-text-muted uppercase tracking-wider">GovNet Session: {role || 'anonymous'}</p>
          </div>
        </footer>
      </div>
    </div>
  )
}