import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useRole } from '../lib/roleContext'
import { scopeProjects, isDistrictOfficer, DISTRICT_OFFICER_DISTRICT } from '../lib/scoping'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function riskLevel(score) {
  if (score >= 75) return { label: 'HIGH', cls: 'bg-red-100 text-red-800 border-red-300' }
  if (score >= 50) return { label: 'MOD', cls: 'bg-amber-100 text-amber-800 border-amber-300' }
  return { label: 'LOW', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' }
}

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-navy-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 text-sm">Loading projects...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white border border-red-200 rounded-xl p-6 max-w-md text-center">
          <p className="text-red-600 font-semibold mb-2">Failed to load projects</p>
          <p className="text-sm text-slate-500">{error}</p>
          <p className="text-xs text-slate-400 mt-3 font-mono">{API_BASE}/api/projects</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-navy-500 text-sm font-semibold hover:underline">← Back home</Link>
          <h1 className="text-lg font-bold text-slate-900">Land Acquisition Projects</h1>
          <span className="text-sm font-mono text-slate-400">{visibleProjects.length} records</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {isDistrictOfficer(role) && (
          <div className="mb-6 flex items-center gap-2 bg-navy-500/5 border border-navy-500/20 rounded-xl px-4 py-3">
            <span className="text-xs font-mono">Scope:</span>
            <span className="text-xs font-mono font-semibold text-navy-700">{DISTRICT_OFFICER_DISTRICT}</span>
            <span className="text-xs text-slate-500">District Magistrate — filtered client-side</span>
          </div>
        )}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 text-left text-xs font-mono uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Block</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Risk</th>
                <th className="px-4 py-3 text-right">Delay</th>
              </tr>
            </thead>
            <tbody>
              {visibleProjects.map((p) => {
                const risk = riskLevel(Number(p.risk_score))
                return (
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
                      <span className={`px-2 py-0.5 text-xs font-semibold capitalize rounded ${statusCls(p.status)}`}>{p.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2 py-0.5 text-xs font-mono font-semibold rounded border ${risk.cls}`}>
                        {Number(p.risk_score).toFixed(0)}% {risk.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-500">{p.delay_days}d</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {visibleProjects.length === 0 && (
            <p className="p-8 text-center text-slate-400">No projects found.</p>
          )}
        </div>
      </main>
    </div>
  )
}
