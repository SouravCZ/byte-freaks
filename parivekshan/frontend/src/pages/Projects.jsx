import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useRole } from '../lib/roleContext'
import { scopeProjects, isDistrictOfficer, DISTRICT_OFFICER_DISTRICT } from '../lib/scoping'
import AppShell from '../components/layout/AppShell'
import RiskTag from '../components/ui/RiskTag'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function statusCls(status) {
  switch (status) {
    case 'completed': return 'bg-risk-success-bg text-risk-success'
    case 'active': return 'bg-primary-container text-primary'
    case 'on_hold': return 'bg-risk-warning-bg text-risk-warning'
    case 'planned': return 'bg-surface-subtle text-text-secondary'
    case 'cancelled': return 'bg-risk-critical-bg text-error'
    default: return 'bg-surface-subtle text-text-secondary'
  }
}

function riskBand(score) {
  const n = Number(score)
  if (n >= 75) return { key: 'high', label: 'High', bar: 'bg-error', text: 'text-error', pill: 'bg-rose-50 border-rose-200 text-rose-700' }
  if (n >= 50) return { key: 'mod', label: 'Medium', bar: 'bg-risk-warning', text: 'text-risk-warning', pill: 'bg-amber-50 border-amber-200 text-amber-700' }
  return { key: 'low', label: 'Low', bar: 'bg-risk-success', text: 'text-risk-success', pill: 'bg-emerald-50 border-emerald-200 text-emerald-700' }
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
    a.download = 'landguard-projects.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <AppShell title="Land Acquisition Projects" subtitle={`${API_BASE}/api/projects`}>
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary text-sm">Loading projects…</p>
        </div>
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell title="Land Acquisition Projects" subtitle={`${API_BASE}/api/projects`}>
        <div className="bg-surface-card border border-error/30 rounded-lg p-6 max-w-md mx-auto text-center">
          <p className="text-error font-semibold mb-2">Failed to load projects</p>
          <p className="text-sm text-text-secondary">{error}</p>
          <p className="text-xs text-text-muted mt-3 font-mono">{API_BASE}/api/projects</p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Projects" subtitle={`${visibleProjects.length} records in scope`}>
      {/* Command Header Strip */}
      <div className="px-space-lg py-space-md bg-surface-card border-b border-border-crisp shadow-sm -mx-space-lg lg:-mx-space-xl mb-0">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md">
          <div className="flex flex-col">
            <div className="flex items-center gap-space-sm">
              <span className="inline-flex p-1.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-700">
                <span className="material-symbols-outlined text-[20px]">folder_managed</span>
              </span>
              <h1 className="font-headline-lg text-headline-lg text-text-primary tracking-tight font-bold">Projects</h1>
              <span className="px-2 py-0.5 rounded-full bg-surface-subtle border border-border-crisp font-code-xs text-code-xs text-text-secondary font-semibold tabular-nums">
                {visibleProjects.length.toLocaleString()} Corridors
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 font-code-xs text-code-xs px-2 py-0.5 rounded bg-risk-success-bg text-risk-success border border-risk-success/20 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span> GatiShakti Live
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-text-secondary mt-0.5">
              Comprehensive land acquisition risk directory and statutory monitoring
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-space-sm">
            <div className="relative flex items-center min-w-[280px] lg:w-80">
              <span className="material-symbols-outlined absolute left-space-sm text-text-muted text-[18px]">search</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full bg-surface-subtle border border-border-crisp pl-9 pr-12 py-1.5 font-body-sm text-body-sm rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
                placeholder="Search by project name, ID, district…"
                type="text"
              />
              <kbd className="absolute right-2 font-code-xs text-code-xs px-1.5 py-0.5 rounded bg-surface-container-high text-text-secondary">⌘K</kbd>
            </div>
            <button onClick={exportCSV} className="px-space-md py-1.5 rounded-lg bg-surface-card border border-border-crisp text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-all font-label-md text-label-md flex items-center gap-1.5 shadow-sm" title="Admin full export">
              <span className="material-symbols-outlined text-[16px] text-primary">file_download</span>
              <span>Export CSV</span>
              <span className="font-code-xs text-[10px] px-1 rounded bg-surface-subtle text-text-muted font-medium">Admin</span>
            </button>
            <button className="inline-flex items-center gap-1.5 px-space-md py-1.5 rounded-lg bg-risk-critical-bg border border-error/30 text-error font-label-sm text-label-sm font-semibold transition-all shadow-sm" title="Batch intervention (demo)">
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              Bulk Actions
            </button>
          </div>
        </div>
      </div>

      {/* Multi-criteria Filtering Ribbon */}
      <div className="px-space-lg py-space-md bg-surface-card border-b border-border-crisp shadow-sm -mx-space-lg lg:-mx-space-xl flex flex-col gap-space-sm">
        <div className="flex flex-wrap items-center justify-between gap-space-sm">
          <div className="flex flex-wrap items-center gap-space-xs">
            <div className="flex items-center gap-space-xs bg-surface-card border border-border-crisp px-space-sm py-1 rounded-lg shadow-sm">
              <span className="font-code-xs text-code-xs text-text-muted uppercase tracking-wider">State:</span>
              <select value={fState} onChange={(e) => { setFState(e.target.value); setFDistrict('ALL') }} className="bg-transparent font-label-md text-label-md text-text-primary focus:outline-none cursor-pointer pr-space-xs">
                <option value="ALL">All States</option>
                {stateOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-space-xs bg-surface-card border border-border-crisp px-space-sm py-1 rounded-lg shadow-sm">
              <span className="font-code-xs text-code-xs text-text-muted uppercase tracking-wider">District:</span>
              <select value={fDistrict} onChange={(e) => setFDistrict(e.target.value)} className="bg-transparent font-label-md text-label-md text-text-primary focus:outline-none cursor-pointer pr-space-xs">
                <option value="ALL">All Districts</option>
                {districtOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-space-xs bg-surface-card border border-border-crisp px-space-sm py-1 rounded-lg shadow-sm">
              <span className="font-code-xs text-code-xs text-text-muted uppercase tracking-wider">Sector:</span>
              <select value={fType} onChange={(e) => setFType(e.target.value)} className="bg-transparent font-label-md text-label-md text-text-primary focus:outline-none cursor-pointer pr-space-xs">
                <option value="ALL">All Sectors</option>
                {typeOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <button onClick={() => { setQ(''); setFState('ALL'); setFDistrict('ALL'); setFType('ALL'); setFRisk('ALL') }} className="px-2.5 py-1 rounded-lg bg-surface-subtle hover:bg-surface-container-high border border-border-crisp text-text-secondary hover:text-text-primary font-label-sm text-label-sm flex items-center gap-1 transition-colors" title="Reset all active filters">
              <span className="material-symbols-outlined text-[14px]">restart_alt</span>
              Clear Filters
            </button>
          </div>
          <div className="flex items-center gap-1 bg-surface-subtle border border-border-crisp p-0.5 rounded-lg">
            <span className="font-code-xs text-code-xs text-text-muted px-1 uppercase font-medium">Risk:</span>
            {[['ALL', 'All'], ['high', 'High Risk (>75)'], ['mod', 'Medium (50-74)'], ['low', 'Low (<50)']].map(([k, lbl]) => (
              <button
                key={k}
                onClick={() => setFRisk(k)}
                className={`px-2 py-0.5 rounded font-code-xs text-code-xs transition-colors ${fRisk === k ? 'bg-surface-card text-text-primary font-semibold shadow-sm' : 'hover:bg-white text-rose-700'}`}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isDistrictOfficer(role) && (
        <div className="mb-6 flex items-center gap-2 bg-primary-container/60 border border-primary/20 rounded-lg px-4 py-3">
          <span className="label-caps text-primary">Scope:</span>
          <span className="text-xs font-mono font-semibold text-primary">{DISTRICT_OFFICER_DISTRICT}</span>
          <span className="text-xs text-text-secondary">District Magistrate — filtered client-side</span>
        </div>
      )}

      {/* Risk summary chips */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-risk-critical-bg border border-error/20">
          <span className="w-2 h-2 rounded-full bg-error"></span>
          <span className="font-code-xs text-code-xs text-error font-bold tabular-nums">{counts.high} High</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-risk-warning-bg border border-risk-warning/20">
          <span className="w-2 h-2 rounded-full bg-risk-warning"></span>
          <span className="font-code-xs text-code-xs text-risk-warning font-bold tabular-nums">{counts.mod} Medium</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-risk-success-bg border border-risk-success/20">
          <span className="w-2 h-2 rounded-full bg-risk-success"></span>
          <span className="font-code-xs text-code-xs text-risk-success font-bold tabular-nums">{counts.low} Low</span>
        </div>
        <span className="font-code-xs text-code-xs text-text-muted">Showing {filtered.length.toLocaleString()} / {visibleProjects.length.toLocaleString()}</span>
      </div>

      {/* Main table */}
      <div className="w-full overflow-x-auto relative bg-surface-card border border-border-crisp rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-30">
            <tr className="bg-surface-subtle font-label-sm text-label-sm uppercase tracking-wider text-text-secondary select-none border-b border-border-crisp">
              <th className="w-10 px-space-md py-space-sm text-center">
                <input className="w-3.5 h-3.5 rounded border-border-crisp bg-surface-card cursor-pointer accent-primary" type="checkbox" checked={selected.length > 0 && selected.length === filtered.length} onChange={toggleAll} title="Select all (Admin batch)" />
              </th>
              <th className="px-space-md py-space-sm">Project ID</th>
              <th className="px-space-md py-space-sm">Project Name</th>
              <th className="px-space-md py-space-sm">State</th>
              <th className="px-space-md py-space-sm">District</th>
              <th className="px-space-md py-space-sm text-right">PAFs</th>
              <th className="px-space-md py-space-sm">Status</th>
              <th className="px-space-md py-space-sm text-center">Risk Score</th>
              <th className="px-space-md py-space-sm">Delay Probability</th>
              <th className="px-space-md py-space-sm text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-crisp font-body-sm text-body-sm">
            {filtered.map((p) => {
              const band = riskBand(p.risk_score)
              return (
                <tr key={p.id} className="bg-surface-card hover:bg-surface-subtle transition-colors">
                  <td className="w-10 px-space-md py-3 text-center relative">
                    {band.key === 'high' && <span className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500"></span>}
                    <input className="w-3.5 h-3.5 rounded border-border-crisp bg-surface-card cursor-pointer accent-primary" type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleRow(p.id)} />
                  </td>
                  <td className="px-space-md py-3 whitespace-nowrap">
                    <Link to={`/projects/${p.id}`} className="flex items-center gap-1.5 font-code-sm text-code-sm text-text-primary font-bold hover:text-primary">
                      <span>{p.code}</span>
                      <span className="material-symbols-outlined text-[14px] text-text-muted opacity-50">content_copy</span>
                    </Link>
                    <span className="font-code-xs text-code-xs text-text-muted font-medium">{p.project_type || '—'}</span>
                  </td>
                  <td className="px-space-md py-3">
                    <Link to={`/projects/${p.id}`} className="font-headline-sm text-body-md font-semibold text-text-primary group-hover:text-primary hover:text-primary transition-colors">{p.name}</Link>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="px-1.5 py-0.5 rounded bg-surface-subtle border border-border-crisp font-code-xs text-code-xs text-text-secondary font-medium">{p.project_type}</span>
                      <span className="font-code-xs text-code-xs text-text-muted">{p.agency || `Seq ${p.id}`}</span>
                    </div>
                  </td>
                  <td className="px-space-md py-3 font-medium text-text-primary">{p.district || '—'}</td>
                  <td className="px-space-md py-3 text-text-secondary">{p.block || '—'}</td>
                  <td className="px-space-md py-3 text-right font-code-sm text-code-sm text-text-primary tabular-nums">{Number(p.mouzas_affected || 0).toLocaleString()}</td>
                  <td className="px-space-md py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded font-code-xs text-code-xs font-semibold capitalize ${statusCls(p.status)}`}>
                      {String(p.status || 'unknown').replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-space-md py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-code-sm text-code-sm font-bold tabular-nums ${band.pill}`}>
                      <span>{Number(p.risk_score).toFixed(0)}</span>
                      <span className="font-label-sm uppercase text-[10px]">{band.label}</span>
                    </span>
                  </td>
                  <td className="px-space-md py-3">
                    <div className="w-28">
                      <div className="flex items-center justify-between font-code-xs text-code-xs mb-0.5">
                        <span className={`font-bold font-code-sm tabular-nums ${band.text}`}>{Number(p.risk_score).toFixed(0)}%</span>
                        <span className="text-text-muted font-code-xs">{band.label} Risk</span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-dim rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${band.bar}`} style={{ width: `${Math.min(Number(p.risk_score), 100)}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-space-md py-3 text-center whitespace-nowrap">
                    <Link to={`/projects/${p.id}`} className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-sky-50 border border-sky-200 hover:bg-primary hover:text-on-primary text-primary font-code-xs text-code-xs transition-colors font-semibold shadow-sm">
                      <span>Deep-Dive</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </Link>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} className="px-space-md py-10 text-center text-text-muted font-code-xs text-code-xs">No projects match the current filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  )
}