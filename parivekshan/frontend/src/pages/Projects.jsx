import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useRole } from '../lib/roleContext'
import { scopeProjects } from '../lib/scoping'
import AppShell from '../components/layout/AppShell'
import RiskTag from '../components/ui/RiskTag'
import EmptyState from '../components/EmptyState'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function statusCls(status) {
  switch (status) {
    case 'completed': return 'bg-risk-success-bg text-risk-success'
    case 'active': return 'bg-primary-container text-on-primary-container'
    case 'on_hold': return 'bg-risk-warning-bg text-risk-warning'
    case 'planned': return 'bg-surface-subtle text-text-secondary'
    case 'cancelled': return 'bg-risk-critical-bg text-error'
    default: return 'bg-surface-subtle text-text-secondary'
  }
}

function riskBand(score) {
  const n = Number(score)
  if (n >= 75) return { key: 'high', label: 'High', bar: 'bg-risk-critical', text: 'text-error', pill: 'bg-risk-critical-bg border-error/25 text-error' }
  if (n >= 50) return { key: 'mod', label: 'Medium', bar: 'bg-risk-warning', text: 'text-risk-warning', pill: 'bg-risk-warning-bg border-risk-warning/25 text-risk-warning' }
  return { key: 'low', label: 'Low', bar: 'bg-risk-success', text: 'text-risk-success', pill: 'bg-risk-success-bg border-risk-success/25 text-risk-success' }
}

function riskBucket(score) {
  return riskBand(score).key
}

export default function Projects() {
  const { role } = useRole()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [q, setQ] = useState('')
  const [fState, setFState] = useState('ALL')
  const [fDistrict, setFDistrict] = useState('ALL')
  const [fType, setFType] = useState('ALL')
  const [fRisk, setFRisk] = useState('ALL')
  const [selected, setSelected] = useState([])

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

  const stateOptions = useMemo(() => Array.from(new Set(visibleProjects.map((p) => p.district).filter(Boolean))).sort(), [visibleProjects])
  const districtOptions = useMemo(
    () => Array.from(new Set(visibleProjects.filter((p) => fState === 'ALL' || p.district === fState).map((p) => p.block).filter(Boolean))).sort(),
    [visibleProjects, fState]
  )
  const typeOptions = useMemo(() => Array.from(new Set(visibleProjects.map((p) => p.project_type).filter(Boolean))).sort(), [visibleProjects])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return visibleProjects.filter((p) => {
      if (fState !== 'ALL' && (p.district || '') !== fState) return false
      if (fDistrict !== 'ALL' && (p.block || '') !== fDistrict) return false
      if (fType !== 'ALL' && (p.project_type || '') !== fType) return false
      if (fRisk !== 'ALL' && riskBucket(p.risk_score) !== fRisk) return false
      if (term && !`${p.name} ${p.code} ${p.block || ''} ${p.district || ''}`.toLowerCase().includes(term)) return false
      return true
    })
  }, [visibleProjects, q, fState, fDistrict, fType, fRisk])

  const counts = visibleProjects.reduce((acc, p) => {
    acc[riskBucket(p.risk_score)] += 1
    return acc
  }, { high: 0, mod: 0, low: 0 })

  const toggleRow = (id) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  const toggleAll = () => setSelected((prev) => (prev.length === filtered.length ? [] : filtered.map((p) => p.id)))

  const exportCSV = () => {
    const headers = ['code', 'name', 'project_type', 'district', 'block', 'mouzas_affected', 'status', 'risk_score', 'delay_days']
    const rows = filtered.map((p) => headers.map((h) => p[h] ?? '').join(','))
    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'parivekshan-projects.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const cardCls = 'bg-surface-card rounded-xl border border-border-crisp shadow-card'

  if (loading) {
    return (
      <AppShell title="Project Directory" subtitle={`${API_BASE}/api/projects`}>
        <div className="py-24 text-center">
          <div className="w-9 h-9 border-[3px] border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[14px] text-text-muted">Loading projects…</p>
        </div>
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell title="Project Directory" subtitle={`${API_BASE}/api/projects`}>
        <div className="bg-surface-card border border-error/25 rounded-xl p-6 max-w-md mx-auto text-center shadow-card">
          <span className="material-symbols-outlined text-[32px] text-error mb-2">error_outline</span>
          <p className="font-semibold text-text-primary mb-1">Failed to load projects</p>
          <p className="text-sm text-text-muted">{error}</p>
          <p className="text-xs text-text-muted mt-3 font-mono">{API_BASE}/api/projects</p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Project Directory" subtitle={`${visibleProjects.length} records in scope`}>
      <div className="flex flex-col gap-space-lg">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md">
          <div className="flex flex-col">
            <div className="flex items-center gap-space-sm">
              <span className="inline-flex p-2 rounded-lg bg-primary-container text-primary">
                <span className="material-symbols-outlined text-[20px]">folder_managed</span>
              </span>
              <h1 className="text-xl font-bold text-text-primary tracking-tight">Projects</h1>
              <span className="px-2 py-0.5 rounded-full bg-surface-container border border-border-crisp text-[12px] font-semibold text-text-secondary tabular-nums">
                {visibleProjects.length.toLocaleString()} corridors
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[12px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-risk-success"></span> GatiShakti live
              </span>
            </div>
            <p className="text-[13px] text-text-muted mt-1">Land acquisition risk directory and statutory monitoring</p>
          </div>
          <div className="flex flex-wrap items-center gap-space-sm">
            <div className="relative flex items-center min-w-[280px] lg:w-80">
              <span className="material-symbols-outlined absolute left-3 text-text-muted text-[18px]">search</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full bg-surface-container rounded-lg border border-border-crisp pl-9 pr-11 py-2 text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/25 focus:bg-white focus:border-primary transition-all"
                placeholder="Search by name, ID, district…"
                type="text"
              />
              <kbd className="absolute right-2.5 text-[10px] px-1.5 py-0.5 rounded bg-surface-card border border-border-crisp text-text-muted font-mono">⌘K</kbd>
            </div>
            <button onClick={exportCSV} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-card border border-border-crisp text-text-secondary hover:text-text-primary hover:bg-surface-container transition-all text-[13px] font-medium">
              <span className="material-symbols-outlined text-[17px] text-primary">file_download</span>
              Export CSV
            </button>
            <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-risk-critical-bg border border-error/25 text-error text-[13px] font-semibold transition-all" title="Batch intervention (demo)">
              <span className="material-symbols-outlined text-[17px]">bolt</span>
              Bulk actions
            </button>
          </div>
        </div>

        <div className={`${cardCls} px-space-lg py-space-md flex flex-col gap-space-sm`}>
          <div className="flex flex-wrap items-center justify-between gap-space-sm">
            <div className="flex flex-wrap items-center gap-space-xs">
              {[
                { key: 'fState', val: fState, set: setFState, label: 'State', options: stateOptions, reset: () => setFDistrict('ALL'), prefix: 'All states' },
                { key: 'fDistrict', val: fDistrict, set: setFDistrict, label: 'District', options: districtOptions, prefix: 'All districts' },
                { key: 'fType', val: fType, set: setFType, label: 'Sector', options: typeOptions, prefix: 'All sectors' },
              ].map((f) => (
                <div key={f.key} className="flex items-center gap-2 bg-surface-container-low border border-border-crisp pl-3 pr-1.5 py-1 rounded-lg">
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">{f.label}</span>
                  <select
                    value={f.val}
                    onChange={(e) => {
                      f.set(e.target.value)
                      if (f.reset) f.reset()
                    }}
                    className="bg-transparent text-[13px] font-medium text-text-primary focus:outline-none cursor-pointer py-1"
                  >
                    <option value="ALL">{f.prefix}</option>
                    {f.options.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <span className="material-symbols-outlined text-[15px] text-text-muted pointer-events-none">expand_more</span>
                </div>
              ))}
              <button onClick={() => { setQ(''); setFState('ALL'); setFDistrict('ALL'); setFType('ALL'); setFRisk('ALL') }} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-border-crisp text-text-secondary hover:text-text-primary text-[12px] transition-colors" title="Reset all filters">
                <span className="material-symbols-outlined text-[15px]">restart_alt</span>
                Clear filters
              </button>
            </div>
            <div className="flex items-center gap-1 bg-surface-container border border-border-crisp p-1 rounded-lg">
              {[['ALL', 'All'], ['high', 'High'], ['mod', 'Medium'], ['low', 'Low']].map(([k, lbl]) => (
                <button
                  key={k}
                  onClick={() => setFRisk(k)}
                  className={`px-3 py-1.5 rounded-md text-[12px] transition-all ${fRisk === k ? 'bg-white text-text-primary font-semibold shadow-sm border border-border-crisp' : 'text-text-muted hover:text-text-primary'}`}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-risk-critical-bg border border-error/25">
            <span className="w-2 h-2 rounded-full bg-risk-critical"></span>
            <span className="text-[12px] font-bold text-error tabular-nums">{counts.high} high</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-risk-warning-bg border border-risk-warning/25">
            <span className="w-2 h-2 rounded-full bg-risk-warning"></span>
            <span className="text-[12px] font-bold text-risk-warning tabular-nums">{counts.mod} medium</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-risk-success-bg border border-risk-success/25">
            <span className="w-2 h-2 rounded-full bg-risk-success"></span>
            <span className="text-[12px] font-bold text-risk-success tabular-nums">{counts.low} low</span>
          </div>
          <span className="text-[12px] text-text-muted">Showing {filtered.length.toLocaleString()} of {visibleProjects.length.toLocaleString()}</span>
        </div>

        <div className={`${cardCls} w-full overflow-x-auto`}>
          <table className="w-full text-left border-collapse min-w-[1080px]">
            <thead>
              <tr className="bg-surface-container text-text-muted text-[11px] font-semibold uppercase tracking-wider border-b border-border-crisp">
                <th className="w-10 px-4 py-2.5 text-center">
                  <input className="w-3.5 h-3.5 rounded border-border-strong cursor-pointer accent-primary" type="checkbox" checked={selected.length > 0 && selected.length === filtered.length} onChange={toggleAll} title="Select all (batch)" />
                </th>
                <th className="px-4 py-2.5">ID</th>
                <th className="px-4 py-2.5">Project name</th>
                <th className="px-4 py-2.5">State</th>
                <th className="px-4 py-2.5">District</th>
                <th className="px-4 py-2.5 text-right">PAFs</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-center">Risk</th>
                <th className="px-4 py-2.5">Delay probability</th>
                <th className="px-4 py-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-crisp text-[13px]">
              {filtered.map((p) => {
                const band = riskBand(p.risk_score)
                return (
                  <tr key={p.id} className="bg-white hover:bg-surface-container-low transition-colors">
                    <td className="w-10 px-4 py-3 text-center relative">
                      {band.key === 'high' && <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-risk-critical"></span>}
                      <input className="w-3.5 h-3.5 rounded border-border-strong cursor-pointer accent-primary" type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleRow(p.id)} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link to={`/projects/${p.id}`} className="flex items-center gap-1.5 font-mono text-[12px] text-text-primary font-bold hover:text-primary">
                        <span>{p.code}</span>
                        <span className="material-symbols-outlined text-[13px] text-text-muted opacity-40">content_copy</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/projects/${p.id}`} className="font-semibold text-text-primary hover:text-primary transition-colors">{p.name}</Link>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="px-1.5 py-0.5 rounded bg-surface-container border border-border-crisp text-[11px] text-text-secondary">{p.project_type}</span>
                        <span className="text-[11px] text-text-muted">{p.agency || `Seq ${p.id}`}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-text-primary">{p.district || '—'}</td>
                    <td className="px-4 py-3 text-text-secondary">{p.block || '—'}</td>
                    <td className="px-4 py-3 text-right font-mono text-[13px] text-text-primary tabular-nums">{Number(p.mouzas_affected || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[12px] font-semibold capitalize ${statusCls(p.status)}`}>
                        {String(p.status || 'unknown').replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[12px] font-bold tabular-nums ${band.pill}`}>
                        <span>{Number(p.risk_score).toFixed(0)}</span>
                        <span className="text-[10px] font-semibold uppercase">{band.label}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-28">
                        <div className="flex items-center justify-between text-[11px] mb-0.5">
                          <span className={`font-mono font-bold tabular-nums ${band.text}`}>{Number(p.risk_score).toFixed(0)}%</span>
                          <span className="text-text-muted">{band.label} risk</span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-dim rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${band.bar}`} style={{ width: `${Math.min(Number(p.risk_score), 100)}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <Link to={`/projects/${p.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-container text-on-primary-container text-[12px] font-semibold hover:bg-primary hover:text-on-primary transition-colors">
                        Open
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-0">
                    <EmptyState
                      icon="search_off"
                      title="No projects match"
                      message="No projects in the directory match the current filters. Try widening your search or clearing the filter selections."
                      action={{ to: '/projects', label: 'Clear filters', icon: 'restart_alt' }}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  )
}