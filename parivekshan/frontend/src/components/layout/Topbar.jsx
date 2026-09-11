import React, { useEffect, useState } from 'react'
import { useRole } from '../../lib/roleContext'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function Topbar({ title, subtitle }) {
  const { email, role, clearRole } = useRole()
  const [unread, setUnread] = useState(null)

  useEffect(() => {
    const ctrl = new AbortController()
    fetch(`${API_BASE}/api/stats`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => setUnread(Number(d?.unreadAlerts) || 0))
      .catch(() => {})
    return () => ctrl.abort()
  }, [])

  return (
    <header className="sticky top-0 z-40 bg-surface-card/90 backdrop-blur border-b border-border-crisp">
      <div className="max-w-[1680px] mx-auto px-space-lg lg:px-space-xl h-14 flex items-center justify-between gap-4">
        <div className="min-w-0 flex flex-col justify-center">
          <p className="hidden md:block font-code-xs text-code-xs text-text-muted truncate leading-tight">
            Parivekshan AI / <span className="text-text-secondary font-semibold">{title}</span>
          </p>
          <p className="md:hidden text-[13px] font-semibold text-text-primary truncate leading-tight">{title}</p>
          {subtitle && <p className="hidden md:block text-[11px] text-text-muted truncate leading-tight mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-space-md shrink-0">
          <button className="hidden md:flex items-center gap-2 w-60 lg:w-72 px-3 py-1.5 rounded-lg bg-surface-container border border-border-crisp text-text-muted text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30" title="Search projects, districts, alerts…">
            <span className="material-symbols-outlined text-[17px]">search</span>
            <span>Search portal…</span>
            <kbd className="ml-auto font-code-xs text-[10px] px-1.5 py-0.5 rounded bg-surface-card border border-border-crisp text-text-muted">⌘K</kbd>
          </button>

          <div className="relative">
            <button className="relative w-9 h-9 rounded-lg bg-surface-container border border-border-crisp flex items-center justify-center text-text-muted hover:text-primary hover:border-border-strong transition-colors" aria-label="Notifications">
              <span className="material-symbols-outlined text-[19px]">notifications_none</span>
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-error text-on-error font-code-xs text-[9px] font-bold flex items-center justify-center">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center justify-center shrink-0">
              {(email || role || 'U').charAt(0).toUpperCase()}
            </span>
            <div className="text-left leading-tight">
              <p className="text-[13px] font-semibold text-text-primary max-w-[160px] truncate">{email || 'signed-in@gov.in'}</p>
              <p className="text-[11px] text-text-muted">{role || 'user'}</p>
            </div>
          </div>

          <button
            onClick={clearRole}
            className="flex items-center gap-1.5 text-[12px] font-medium text-text-muted hover:text-error border border-border-crisp rounded-lg px-2.5 py-2 hover:border-error/40 transition"
            title="Sign out"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  )
}