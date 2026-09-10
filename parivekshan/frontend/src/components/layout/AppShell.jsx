import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useRole } from '../../lib/roleContext'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AppShell({ title, subtitle, children }) {
  const { role } = useRole()
  const location = useLocation()
  const navigate = useNavigate()
  const [deniedOpen, setDeniedOpen] = useState(false)

  useEffect(() => {
    setDeniedOpen(Boolean(location.state?.accessDenied))
  }, [location.state?.accessDenied])

  const dismissedDenied = () => {
    setDeniedOpen(false)
    navigate(location.pathname, { replace: true, state: null })
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-sidebar-width flex flex-col min-h-screen">
        <Topbar title={title} subtitle={subtitle} />
        <main className="flex-1 w-full max-w-[1680px] mx-auto px-space-lg lg:px-space-xl py-space-lg lg:py-space-xl">
          {deniedOpen && (
            <div className="mb-space-base flex items-center gap-3 px-space-md py-space-sm rounded-xl border border-risk-warning/25 bg-risk-warning-bg text-risk-warning shadow-card" role="alert">
              <span className="material-symbols-outlined text-[18px] shrink-0">lock</span>
              <p className="text-[13px] font-medium">
                You don't have access to {location.state.accessDenied}. This view is restricted under the role-based access policy.
              </p>
              <button onClick={dismissedDenied} className="ml-auto shrink-0 text-[12px] font-semibold px-2.5 py-1 rounded-lg border border-risk-warning/30 hover:bg-risk-warning hover:text-white transition-colors">
                Dismiss
              </button>
            </div>
          )}
          {children}
        </main>
        <footer className="border-t border-border-crisp bg-surface-card">
          <div className="max-w-[1680px] mx-auto px-space-lg lg:px-space-xl py-space-md flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="font-code-xs text-code-xs text-text-muted">Parivekshan AI · MoRD GeoRisk Suite · NSDSS</p>
            <p className="font-code-xs text-code-xs text-text-muted">GovNet session: {role || 'anonymous'}</p>
          </div>
        </footer>
      </div>
    </div>
  )
}