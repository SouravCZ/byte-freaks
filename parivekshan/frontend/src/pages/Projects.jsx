import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useRole } from '../lib/roleContext'
import { scopeProjects, isDistrictOfficer, DISTRICT_OFFICER_DISTRICT } from '../lib/scoping'
import AppShell from '../components/layout/AppShell'
import RiskTag from '../components/ui/RiskTag'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function statusCls(status) {
  switch (status) {
    case 'completed': return 'bg-emerald-100 text-emerald-800'
    case 'active': return 'bg-navy-500/10 text-navy-700'
    case 'on_hold': return 'bg-amber-100 text-amber-800'
    case 'planned': return 'bg-slate-100 text-slate-700'
    case 'cancelled': return 'bg-red-100 text-red-800'
    default: return 'bg-slate-100 text-slate-700'
  }
}

function riskBucket(score) {
  const n = Number(score)
  if (n >= 75) return 'high'
  if (n >= 50) return 'mod'
  return 'low'
}

export default function Projects() {
  const { role } = useRole()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const ctrl = new AbortController()
    fetch(`${API_BASE}/api/projects`, { signal: ctrl.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data) => setProjects(Array.isArray(data) ? data : []))
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message)
      })
      .finally(() => setLoading(false))
    return () => ctrl.abort()
  }, [])

  const visibleProjects = scopeProjects(projects, role)

  const counts = visibleProjects.reduce(
    (acc, p) => {
      acc[riskBucket(p.risk_score)] += 1
      return acc
    },
    { high: 0, mod: 0, low: 0 }
  )

  if (loading) {
    return (
      <AppShell title="Land Acquisition Projects" subtitle={`${API_BASE}/api/projects`}>
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-navy-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 text-sm">Loading projects...</p>
        </div>
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell title="Land Acquisition Projects" subtitle={`${API_BASE}/api/projects`}>
        <div className="bg-white border border-red-200 rounded-lg p-6 max-w-md mx-auto text-center">
          <p className="text-red-600 font-semibold mb-2">Failed to load projects</p>
          <p className="text-sm text-slate-500">{error}</p>
          <p className="text-xs text-slate-400 mt-3 font-mono">{API_BASE}/api/projects</p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Land Acquisition Projects" subtitle={`${visibleProjects.length} records in scope`}>
      <div className="grid grid-cols-3 gap-3 mb-6 max-w-md">
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="label-caps text-red-600 mb-0.5">High Risk</p>
          <p className="text-2xl font-bold text-red-700 tabular-nums">{counts.high}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="label-caps text-amber-600 mb-0.5">Moderate</p>
          <p className="text-2xl font-bold text-amber-700 tabular-nums">{counts.mod}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
          <p className="label-caps text-emerald-600 mb-0.5">Low Risk</p>
          <p className="text-2xl font-bold text-emerald-700 tabular-nums">{counts.low}</p>
        </div>
      </div>

      {isDistrictOfficer(role) && (
        <div className="mb-6 flex items-center gap-2 bg-navy-500/5 border border-navy-500/20 rounded-lg px-4 py-3">
          <span className="label-caps text-navy-700">Scope:</span>
          <span className="text-xs font-mono font-semibold text-navy-700">{DISTRICT_OFFICER_DISTRICT}</span>
          <span className="text-xs text-slate-500">District Magistrate — filtered client-side</span>
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left label-caps text-slate-500">
              <th className="px-4 py-3 font-semibold">Code</th>
              <th className="px-4 py-3 font-semibold">Project</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Block</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Risk</th>
              <th className="px-4 py-3 font-semibold text-right">Delay</th>
            </tr>
          </thead>
          <tbody>
            {visibleProjects.map((p) => (
              <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50 transition">
                <td className="px-4 py-3 font-mono text-navy-600">
                  <Link to={`/projects/${p.id}`} className="hover:underline">{p.code}</Link>
                </td>
                <td className="px-4 py-3">
                  <Link to={`/projects/${p.id}`} className="font-medium text-slate-900 hover:text-navy-600 hover:underline">
                    {p.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-500">{p.project_type}</td>
                <td className="px-4 py-3 text-slate-500">{p.block || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 text-[10px] font-semibold capitalize rounded font-mono uppercase tracking-wider ${statusCls(p.status)}`}>{p.status}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <RiskTag score={p.risk_score} />
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-500">{p.delay_days}d</td>
              </tr>
            ))}
          </tbody>
        </table>
        {visibleProjects.length === 0 && (
          <p className="p-8 text-center text-slate-400">No projects found.</p>
        )}
      </div>
    </AppShell>
  )
}