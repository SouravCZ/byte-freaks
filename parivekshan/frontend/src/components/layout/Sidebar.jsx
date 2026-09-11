import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useRole } from '../../lib/roleContext'
import { can } from '../../lib/permissions'
import Logo from '../Logo'

const NAV = [
  { to: '/dashboard', label: 'Overview', icon: 'dashboard', action: 'view_dashboard' },
  { to: '/projects', label: 'Projects', icon: 'folder_managed', action: 'view_projects' },
  { to: '/analytics', label: 'Analytics', icon: 'location_on', action: 'view_analytics' },
  { to: '/alerts', label: 'Alerts', icon: 'notifications_active', action: 'view_alerts' },
  { to: '/users', label: 'Users', icon: 'verified_user', action: 'manage_users' },
]

export default function Sidebar() {
  const { role } = useRole()
  const items = NAV.filter((item) => can(role, item.action))

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-sidebar-width bg-[#0F2C59] border-r border-white/10 z-50 flex-col justify-between select-none">
      <div className="flex flex-col flex-1 min-h-0">
        <div className="px-space-lg pt-space-lg pb-space-md">
          <Link to="/dashboard" className="block w-fit">
            <Logo className="h-9 brightness-0 invert" />
          </Link>
        </div>

        <nav className="flex flex-col gap-0.5 px-space-md py-space-md flex-1 min-h-0 overflow-y-auto scrollbar-none">
          <p className="px-space-sm pb-space-sm font-code-xs text-code-xs text-white/40 tracking-wider uppercase">
            Command Suite
          </p>
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group relative flex items-center justify-between px-space-md py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#bef264] text-[#0F2C59] font-semibold'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-space-sm">
                    <span
                      className={`material-symbols-outlined text-[19px] transition-colors ${
                        isActive ? 'text-[#0F2C59]' : 'text-white/40 group-hover:text-white/80'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="text-[13px]">{item.label}</span>
                  </div>
                  {item.to === '/alerts' && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#0F2C59]' : 'bg-[#bef264]'}`}></span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-space-md py-space-md border-t border-white/10">
          <Link
            to="/"
            className="flex items-center gap-2 px-space-md py-2 rounded-lg text-white/50 hover:text-[#bef264] hover:bg-white/10 transition-colors text-[13px] font-medium"
          >
            <span className="material-symbols-outlined text-[18px]">public</span>
            Public portal
          </Link>
          <div className="mt-space-md px-space-md py-space-sm rounded-lg bg-white/10 border border-white/10">
            <p className="font-code-xs text-code-xs text-white/40 tracking-wider uppercase">GovNet session</p>
            <p className="text-[12px] font-medium text-white mt-0.5 truncate">{role || 'Not signed in'}</p>
            <p className="font-code-xs text-code-xs text-white/40 mt-0.5">Parivekshan NSDSS · v2.8</p>
          </div>
        </div>
      </div>
    </aside>
  )
}