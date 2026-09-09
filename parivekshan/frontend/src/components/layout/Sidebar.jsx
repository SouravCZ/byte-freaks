import React from 'react'
import { NavLink } from 'react-router-dom'

const NAV = [
  { to: '/dashboard', label: 'Overview', icon: 'dashboard' },
  { to: '/projects', label: 'Projects', icon: 'folder_managed' },
  { to: '/analytics', label: 'Analytics', icon: 'location_on' },
  { to: '/alerts', label: 'Alerts', icon: 'notifications_active' },
  { to: '/users', label: 'Users', icon: 'verified_user' },
]

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-sidebar-width bg-surface-container-lowest border-r border-border-crisp z-50 flex-col justify-between select-none">
      <div className="flex flex-col flex-1 min-h-0">
        <div className="p-space-base bg-surface-container-low/80 border-b border-border-crisp">
          <div className="flex items-center gap-space-sm">
            <span className="h-9 w-9 shrink-0 rounded-lg bg-primary text-on-primary flex items-center justify-center text-lg font-bold font-mono">L</span>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-space-xs">
                <span className="font-headline-sm text-headline-sm tracking-tight text-primary font-bold truncate">LandGuard AI</span>
              </div>
              <span className="font-code-xs text-code-xs text-text-muted truncate">MoRD • GeoRisk Suite</span>
            </div>
          </div>
          <div className="mt-space-sm flex items-center justify-between px-space-xs py-space-2xs bg-surface-subtle border border-border-crisp rounded-lg">
            <span className="inline-flex items-center gap-1.5 font-code-xs text-code-xs text-tertiary font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>NIC VERIFIED
            </span>
            <span className="font-code-xs text-code-xs text-text-muted tracking-wider">GOV.IN / PS-26017</span>
          </div>
        </div>

        <nav className="flex flex-col gap-space-2xs px-space-sm py-space-md flex-1 min-h-0 overflow-y-auto scrollbar-none">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-space-md py-space-sm rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-container text-on-surface font-semibold border border-primary/20 shadow-sm'
                    : 'text-text-muted hover:bg-surface-subtle hover:text-text-primary'
                }`
              }
            >
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                <span className="font-label-md text-label-md">{item.label}</span>
              </div>
              {item.to === '/alerts' && <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span>}
            </NavLink>
          ))}
        </nav>

        <div className="px-space-md py-space-md border-t border-border-crisp space-y-1">
          <p className="font-code-xs text-code-xs text-text-muted tracking-wider uppercase mb-space-xs">Govt Tier-IV</p>
          <p className="font-body-sm text-body-sm text-text-secondary">Parivekshan NSDSS</p>
          <p className="font-code-xs text-code-xs text-text-muted">NIC LGD Sync • v2.8</p>
        </div>
      </div>
    </aside>
  )
}