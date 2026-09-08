import React, { useEffect, useState } from 'react'
import { useRole } from '../../lib/roleContext'
import { isDistrictOfficer, DISTRICT_OFFICER_DISTRICT } from '../../lib/scoping'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function Topbar({ title, subtitle }) {
  const { email, role, clearRole } = useRole()
  const scoped = isDistrictOfficer(role)
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
    <header className="sticky top-0 z-40 bg-surface-card/95 backdrop-blur border-b border-border-crisp">
      <div className="max-w-[1680px] mx-auto px-space-lg lg:px-space-xl h-14 flex items-center justify-between gap-4">
        <div className="min-w-0 flex items-center gap-2">
          <nav className="hidden md:flex items-center gap-1.5 font-code-xs text-code-xs text-text-muted truncate">
            <span>MoRD</span>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span>PM GatiShakti</span>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span className="text-text-secondary font-semibold">{title}</span>
          </nav>
          <h1 className="md:hidden text-body-lg font-bold text-text-primary truncate">{title}</h1>
        </div>

        <div className="flex items-center gap-space-md shrink-0">
          <div className="hidden xl:block relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[17px] text-text-muted">search</span>
            <input
              className="w-64 bg-surface-subtle border border-border-crisp rounded-lg pl-8 pr-8 py-1.5 text-body-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              placeholder="Search projects, districts, alerts…"
              readOnly
              type="text"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 font-code-xs text-[10px] px-1 py-0.5 rounded bg-surface-card border border-border-crisp text-text-muted">⌘K</kbd>
          </div>

          {scoped && DISTRICT_OFFICER_DISTRICT && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-primary-container text-primary font-code-xs text-code-xs font-semibold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {DISTRICT_OFFICER_DISTRICT}
            </span>
          )}

          <div className="relative">
            <button className="relative w-9 h-9 rounded-lg bg-surface-subtle border border-border-crisp flex items-center justify-center text-text-muted hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[18px]">notifications</span>
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-error text-on-error font-code-xs text-[9px] font-bold flex items-center justify-center">
                  {unread}
                </span>
              )}
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 px-space-md py-1.5 rounded-lg bg-surface-subtle border border-border-crisp">
            <span className="w-7 h-7 rounded bg-primary text-on-primary font-bold text-xs flex items-center justify-center shrink-0">
              {(email || role || 'U').charAt(0).toUpperCase()}
            </span>
            <div className="text-left leading-tight">
              <p className="text-xs font-semibold text-text-primary max-w-[160px] truncate">{email || 'signed-in@gov.in'}</p>
              <p className="text-[10px] font-code-xs text-text-muted uppercase tracking-wider">{role || 'user'}</p>
            </div>
          </div>

          <button
            onClick={clearRole}
            className="flex items-center gap-1 text-[11px] font-code-xs text-text-muted hover:text-error border border-border-crisp rounded-lg px-2.5 py-2 hover:border-error/40 transition"
            title="Logout"
          >
            <span className="material-symbols-outlined text-[15px]">logout</span>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}