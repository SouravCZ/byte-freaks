import React from 'react'
import { useRole } from '../../lib/roleContext'
import { isDistrictOfficer, DISTRICT_OFFICER_DISTRICT } from '../../lib/scoping'

export default function Topbar({ title, subtitle }) {
  const { email, role, clearRole } = useRole()
  const scoped = isDistrictOfficer(role)

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-base font-bold text-slate-900 truncate">{title}</h1>
          {subtitle && <p className="text-[11px] font-mono text-slate-400 truncate">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {scoped && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-navy-500/5 border border-navy-500/20 rounded text-[10px] font-mono font-semibold text-navy-700 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {DISTRICT_OFFICER_DISTRICT}
            </span>
          )}
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-slate-700 truncate max-w-[180px]">{email}</p>
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{role}</p>
          </div>
          <button
            onClick={clearRole}
            className="text-[11px] font-mono text-slate-500 hover:text-red-600 border border-slate-200 rounded px-2.5 py-1.5 hover:border-red-300 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}