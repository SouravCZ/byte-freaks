import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useRole } from '../lib/roleContext'
import { scopeProjects, scopeStats, isDistrictOfficer, DISTRICT_OFFICER_DISTRICT } from '../lib/scoping'

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

export default function Overview() {
  const { email, role, clearRole } = useRole()
  const [stats, setStats] = useState(null)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const ctrl = new AbortController()
    Promise.all([
      fetch(`${API_BASE}/api/stats`, { signal: ctrl.signal }).then((r) => r.json()),
      fetch(`${API_BASE}/api/projects`, { signal: ctrl.signal }).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      }),
    ])
      .then(([statsData, projectsData]) => {
        setStats(statsData)
        setProjects(Array.isArray(projectsData) ? projectsData : [])
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message)
      })
      .finally(() => setLoading(false))
    return () => ctrl.abort()
  }, [])

  const scoped = isDistrictOfficer(role)
  const visibleProjects = scopeProjects(projects, role)
  const displayStats = scopeStats({ stats, projects, role })

  const kpis = [
    { label: 'Projects', value: displayStats?.totalProjects ?? '—' },
    { label: 'High Risk', value: displayStats?.highRiskProjects ?? '—', cls: Number(displayStats?.highRiskProjects) > 0 ? 'text-red-600' : 'text-emerald-600' },
    { label: 'Unread Alerts', value: displayStats?.unreadAlerts ?? '—' },
    { label: 'Mouzas Tracked', value: displayStats?.mouzasTracked ?? '—' },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/" className="text-navy-500 text-sm font-semibold hover:underline whitespace-nowrap">← Home</Link>
            <h1 className="text-lg font-bold text-slate-900 truncate">Parivekshan Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-slate-700 truncate max-w-[200px]">{email}</p>
              <p className="text-[10px] font-mono text-slate-400 uppercase">{role}</p>
            </div>
            <button
              onClick={clearRole}
              className="text-xs font-mono text-slate-500 hover:text-red-600 border border-slate-200 rounded-lg px-2.5 py-1.5 hover:border-red-300 transition whitespace-nowrap"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {scoped && (
          <div className="mb-6 flex items-center gap-2 bg-navy-500/5 border border-navy-500/20 rounded-xl px-4 py-3">
            <span className="text-xs font-mono">Scope:</span>
            <span className="text-xs font-mono font-semibold text-navy-700">{DISTRICT_OFFICER_DISTRICT}</span>
            <span className="text-xs text-slate-500">District Magistrate — projects filtered client-side</span>
          </div>
        )}

        {loading && (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-navy-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500 text-sm">Loading dashboard...</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-white border border-red-200 rounded-xl p-6 max-w-md mx-auto text-center">
            <p className="text-red-600 font-semibold mb-2">Failed to load dashboard</p>
            <p className="text-sm text-slate-500">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {kpis.map((k) => (
                <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-5">
                  <p className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">{k.label}</p>
                  <p className={`text-2xl font-bold text-slate-900 ${k.cls || ''}`}>{k.value}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900">Projects</h2>
              <span className="text-sm font-mono text-slate-400">{visibleProjects.length} / {projects.length} records</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-100 text-left text-xs font-mono uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Project</th>
                    <th className="px-4 py-3">District</th>
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
                        <td className="px-4 py-3 text-slate-500">{p.district || '—'}</td>
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
                <p className="p-8 text-center text-slate-400">No projects in scope.</p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}