import React from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'

const USER_ROLE_PILLS = [
  { label: 'Collector', chip: 'bg-navy-500/10 text-navy-700 border-navy-500/20' },
  { label: 'ADM (LA)', chip: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' },
  { label: 'BDO', chip: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' },
  { label: 'LAO', chip: 'bg-amber-500/10 text-amber-700 border-amber-500/20' },
]

export default function Users() {
  return (
    <AppShell title="Users" subtitle="Role-based access control directory">
      <div className="flex flex-wrap gap-2 mb-6">
        {USER_ROLE_PILLS.map((r) => (
          <span key={r.label} className={`px-3 py-1.5 rounded text-xs font-mono font-semibold uppercase tracking-wider border ${r.chip}`}>
            {r.label}
          </span>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-10 text-center">
        <div className="mx-auto mb-4 flex items-center justify-center w-14 h-14 rounded-full bg-slate-100 border border-slate-200">
          <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">User directory not exposed yet</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-4">
          The backend seeds 4 RBAC users (Collector, ADM, BDO, LAO) but does not currently expose a
          <code className="text-navy-600 font-mono text-xs"> GET /api/users </code> endpoint.
          This screen is wired to render the directory as soon as the endpoint lands.
        </p>
        <p className="text-xs font-mono text-slate-400">Expected: GET {import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users</p>
      </div>

      <div className="text-center mt-6">
        <Link to="/projects" className="text-xs font-mono text-navy-500 font-semibold hover:underline">← Back to projects</Link>
      </div>
    </AppShell>
  )
}