import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useRole } from '../lib/roleContext'
import { scopeProjects, isDistrictOfficer, DISTRICT_OFFICER_DISTRICT } from '../lib/scoping'
import AppShell from '../components/layout/AppShell'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function riskBand(score) {
  const n = Number(score)
  if (n >= 75) return { key: 'high', label: 'High', hex: '#ef4444', tile: 'bg-[#fca5a5]', bar: 'bg-gradient-to-r from-amber-500 to-red-600', text: 'text-error' }
  if (n >= 50) return { key: 'mod', label: 'Medium', hex: '#f59e0b', tile: 'bg-[#fdba74]', bar: 'bg-gradient-to-r from-amber-400 to-orange-500', text: 'text-risk-warning' }
  return { key: 'low', label: 'Low', hex: '#10b981', tile: 'bg-[#86efac]', bar: 'bg-gradient-to-r from-emerald-400 to-emerald-500', text: 'text-risk-success' }
}

function abbrState(name) {
  const parts = String(name || '').trim().split(/\s+/)
  if (parts.length === 1) return (parts[0].slice(0, 2)).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export default function Analytics() {
  const { role } = useRole()
  const [stats, setStats] = useState(null)
  const [blocks, setBlocks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [fState, setFState] = useState('ALL')
  const [fRisk, setFRisk] = useState('ALL')

  useEffect(() => {
    const ctrl = new AbortController()
    Promise.all([
      fetch(`${API_BASE}/api/stats`, { signal: ctrl.signal }).then((r) => r.json()),
      fetch(`${API_BASE}/api/blocks`, { signal: ctrl.signal }).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      }),
      fetch(`${API_BASE}/api/projects`, { signal: ctrl.signal }).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      }),
    ])
      .then(([statsData, blocksData, projectsData]) => {
        setStats(statsData)
        setBlocks(Array.isArray(blocksData) ? blocksData : [])
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
  const scopedBlocks = scoped
    ? blocks.filter((b) => (b.district || '') === DISTRICT_OFFICER_DISTRICT)
    : blocks

  const stateOptions = useMemo(() => Array.from(new Set(scopedBlocks.map((b) => b.district).filter(Boolean))).sort(), [scopedBlocks])

  const filteredBlocks = useMemo(() => {
    return scopedBlocks.filter((b) => {
      if (fState !== 'ALL' && (b.district || '') !== fState) return false
      if (fRisk !== 'ALL' && riskBand(b.risk_score).key !== fRisk) return false
      return true
    })
  }, [scopedBlocks, fState, fRisk])

  const highCount = scopedBlocks.filter((b) => Number(b.risk_score) >= 75).length
  const modCount = scopedBlocks.filter((b) => Number(b.risk_score) >= 50 && Number(b.risk_score) < 75).length

  const stateBars = useMemo(() => {
    const by = {}
    filteredBlocks.forEach((b) => {
      const s = b.district || 'Unknown'
      by[s] = by[s] || { count: 0, sum: 0, high: 0 }
      by[s].count += 1
      by[s].sum += Number(b.risk_score)
      if (Number(b.risk_score) >= 75) by[s].high += 1
    })
    return Object.entries(by)
      .map(([name, v]) => ({ name, avg: Math.round(v.sum / v.count), high: v.high }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 10)
  }, [filteredBlocks])

  const topCluster = stateBars[0]?.name || '—'

  const heatGrid = useMemo(() => {
    return filteredBlocks
      .map((b) => ({
        name: b.name,
        state: b.district,
        risk: Number(b.risk_score),
        projects: visibleProjects.filter((p) => (p.block || '') === b.name).length,
        topFactor: projector(b),
      }))
      .sort((a, b) => b.risk - a.risk)
  }, [filteredBlocks, visibleProjects])

  function projector(block) {
    const list = visibleProjects.filter((p) => (p.block || '') === block.name)
    const counts = {}
    list.forEach((p) => {
      const f = Array.isArray(p.drivers) && p.drivers.length ? p.drivers[0].factor : (p.project_type || '')
      counts[f] = (counts[f] || 0) + 1
    })
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
    return top ? top[0].slice(0, 28) : '—'
  }

  const pinned = heatGrid[0] || null
  const legendCounts = heatGrid.reduce((acc, b) => {
    acc[riskBand(b.risk).key] += 1
    return acc
  }, { high: 0, mod: 0, low: 0 })

  if (loading) {
    return (
      <AppShell title="District Analytics" subtitle={`${API_BASE}/api/blocks`}>
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary text-sm">Loading analytics…</p>
        </div>
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell title="District Analytics" subtitle={`${API_BASE}/api/blocks`}>
        <div className="bg-surface-card border border-error/30 rounded-lg p-6 max-w-md mx-auto text-center">
          <p className="text-error font-semibold mb-2">Failed to load analytics</p>
          <p className="text-sm text-text-secondary">{error}</p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Analytics" subtitle="National infrastructure risk telemetry">
      {/* Header strip */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-md mb-space-md">
        <div>
          <div className="flex items-center gap-space-sm">
            <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded bg-primary-container text-primary font-code-xs text-code-xs font-semibold uppercase tracking-wider border border-primary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
              Live Spatial Telemetry
            </span>
            <span className="font-code-xs text-code-xs text-text-muted">{scopedBlocks.length} blocks monitored</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-text-primary tracking-tight font-bold">District Risk Analytics</h1>
          <p className="font-body-md text-body-md text-text-secondary max-w-2xl">Cross-district heat-mapping of acquisition delay probability with state-level aggregation and anomaly cluster detection.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="px-space-md py-space-md bg-surface-card rounded-lg border border-border-crisp shadow-sm flex flex-wrap items-center justify-between gap-space-sm mb-space-base">
        <div className="flex items-center gap-space-xs">
          <div className="flex items-center gap-space-xs bg-surface-card border border-border-crisp px-space-sm py-1 rounded-lg shadow-sm">
            <span className="font-code-xs text-code-xs text-text-muted uppercase tracking-wider">Jurisdiction:</span>
            <select value={fState} onChange={(e) => setFState(e.target.value)} className="bg-transparent font-label-md text-label-md text-text-primary focus:outline-none cursor-pointer pr-space-xs">
              <option value="ALL">All India ({stateOptions.length})</option>
              {stateOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button onClick={() => { setFState('ALL'); setFRisk('ALL') }} className="px-2.5 py-1 rounded-lg bg-surface-subtle hover:bg-surface-container-high border border-border-crisp text-text-secondary hover:text-text-primary font-label-sm text-label-sm flex items-center gap-1 transition-colors">
            <span className="material-symbols-outlined text-[14px]">restart_alt</span>
            Clear
          </button>
        </div>
        <div className="flex items-center gap-1 bg-surface-subtle border border-border-crisp p-0.5 rounded-lg">
          <span className="font-code-xs text-code-xs text-text-muted px-1 uppercase font-medium">Risk:</span>
          {[['ALL', 'All'], ['high', 'High'], ['mod', 'Medium'], ['low', 'Low']].map(([k, lbl]) => (
            <button
              key={k}
              onClick={() => setFRisk(k)}
              className={`px-2 py-0.5 rounded font-code-xs text-code-xs transition-colors ${fRisk === k ? 'bg-surface-card text-text-primary font-semibold shadow-sm' : 'hover:bg-white'}`}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* Telemetry strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-base mb-space-base">
        <div className="bg-surface-card p-space-md rounded-lg border border-border-crisp border-l-4 border-l-[#4059aa] shadow-sm">
          <span className="font-code-xs text-code-xs text-text-muted uppercase tracking-wider font-semibold">Monitored Blocks</span>
          <p className="font-headline-xl text-headline-xl text-text-primary mt-1 font-bold tabular-nums">{scopedBlocks.length}</p>
        </div>
        <div className="bg-surface-card p-space-md rounded-lg border border-border-crisp border-l-4 border-l-error bg-gradient-to-r from-risk-critical-bg/40 to-surface-card shadow-sm">
          <span className="font-code-xs text-code-xs text-error uppercase tracking-wider font-bold">Red Zones ≥ 75</span>
          <p className="font-headline-xl text-headline-xl text-error mt-1 font-bold tabular-nums">{highCount}</p>
        </div>
        <div className="bg-surface-card p-space-md rounded-lg border border-border-crisp border-l-4 border-l-[#D97706] bg-gradient-to-r from-risk-warning-bg/60 to-surface-card shadow-sm">
          <span className="font-code-xs text-code-xs text-risk-warning uppercase tracking-wider font-bold">Amber Zones 50-74</span>
          <p className="font-headline-xl text-headline-xl text-text-primary mt-1 font-bold tabular-nums">{modCount}</p>
        </div>
        <div className="bg-surface-card p-space-md rounded-lg border border-border-crisp border-l-4 border-l-primary shadow-sm">
          <span className="font-code-xs text-code-xs text-text-muted uppercase tracking-wider font-semibold">Top Cluster</span>
          <p className="font-headline-sm text-headline-sm text-primary mt-1 font-bold truncate">{topCluster}</p>
          <p className="font-code-xs text-code-xs text-text-muted mt-1">by avg risk score</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-base items-start">
        {/* LEFT: District risk matrix */}
        <div className="lg:col-span-7 bg-surface-card border border-border-crisp rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-space-md py-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm border-b border-border-crisp">
            <div>
              <span className="font-code-xs text-code-xs text-text-muted uppercase tracking-wider font-semibold">DISTRICT INSET • LGD 2026</span>
              <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold">Risk Heat Matrix</h2>
            </div>
            <div className="flex items-center gap-1">
              <button className="w-7 h-7 rounded bg-surface-subtle border border-border-crisp flex items-center justify-center text-text-muted hover:text-primary transition-colors" title="Zoom in"><span className="material-symbols-outlined text-[15px]">add</span></button>
              <button className="w-7 h-7 rounded bg-surface-subtle border border-border-crisp flex items-center justify-center text-text-muted hover:text-primary transition-colors" title="Zoom out"><span className="material-symbols-outlined text-[15px]">remove</span></button>
              <button className="w-7 h-7 rounded bg-surface-subtle border border-border-crisp flex items-center justify-center text-text-muted hover:text-primary transition-colors" title="Layers"><span className="material-symbols-outlined text-[15px]">layers</span></button>
              <button className="w-7 h-7 rounded bg-surface-subtle border border-border-crisp flex items-center justify-center text-text-muted hover:text-primary transition-colors" title="Opacity"><span className="material-symbols-outlined text-[15px]">opacity</span></button>
            </div>
          </div>

          <div className="relative flex-1 p-space-md bg-surface-container-low/60 min-h-[300px]">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 justify-items-stretch gap-1.5 pr-1">
              {heatGrid.map((b) => {
                const band = riskBand(b.risk)
                return (
                  <div
                    key={b.name}
                    title={`${b.name} (${b.state || '—'}) — ${b.risk}% · ${b.projects} projects`}
                    className={`group relative h-8 rounded border border-border-crisp/70 ${band.tile} opacity-85 hover:opacity-100 hover:ring-1 hover:ring-primary transition-all cursor-pointer`}
                  >
                    <span className="absolute inset-x-0 bottom-0 text-center font-code-xs text-[8px] text-slate-800 font-semibold truncate px-0.5 leading-tight">
                      {b.name.split(' ').slice(0, 2).join(' ').slice(0, 12)}
                    </span>
                  </div>
                )
              })}
            </div>

            {pinned && (
              <div className="absolute left-space-sm bottom-space-sm z-30 w-72 bg-white/95 backdrop-blur-md p-space-md rounded-xl shadow-xl border border-border-crisp border-l-4 border-l-error hidden sm:block">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-headline-sm text-headline-sm text-text-primary font-bold">{pinned.name}</span>
                      {pinned.state && <span className="font-code-xs text-code-xs text-primary px-1.5 py-0.5 rounded bg-sky-50 border border-sky-200 font-semibold">{pinned.state}</span>}
                    </div>
                    <span className="font-code-xs text-code-xs text-text-muted">Highest avg delay probability</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-red-100 text-error font-code-xs text-code-xs font-bold uppercase tracking-wider border border-red-200">{riskBand(pinned.risk).label} Risk</span>
                </div>
                <div className="space-y-2 pt-1 font-body-sm text-body-sm">
                  <div className="flex justify-between items-center bg-surface-subtle border border-border-crisp px-2 py-1 rounded">
                    <span className="text-text-secondary font-medium"># Projects:</span>
                    <span className="font-code-sm text-code-sm text-text-primary font-bold tabular-nums">{pinned.projects}</span>
                  </div>
                  <div className="flex justify-between items-center bg-surface-subtle border border-border-crisp px-2 py-1 rounded">
                    <span className="text-text-secondary font-medium">Avg Risk Score:</span>
                    <span className="font-code-sm text-code-sm text-error font-bold bg-red-100 rounded px-1.5 py-0.5 border border-red-200 tabular-nums">{pinned.risk}/100</span>
                  </div>
                  <div className="flex flex-col gap-1 bg-red-50/80 border border-red-200/60 p-2 rounded">
                    <span className="font-label-sm text-label-sm text-error uppercase font-semibold">Top Factor</span>
                    <span className="font-code-xs text-code-xs text-text-primary font-medium leading-tight">{pinned.topFactor}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="absolute right-space-sm bottom-space-sm z-20 flex flex-col gap-1.5 bg-white/95 backdrop-blur-md p-space-sm rounded-xl shadow-md border border-border-crisp">
              <span className="font-label-sm text-label-sm text-text-secondary font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-primary">map</span>Map Risk Legend
              </span>
              <div className="flex flex-col gap-1.5 font-code-xs text-code-xs">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#ef4444]"></span><span className="text-text-primary font-medium">High Risk (70 - 100)</span><span className="text-text-muted ml-auto font-semibold tabular-nums">{legendCounts.high} Dists</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#f59e0b]"></span><span className="text-text-primary font-medium">Medium Risk (40 - 69)</span><span className="text-text-muted ml-auto font-semibold tabular-nums">{legendCounts.mod} Dists</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#10b981]"></span><span className="text-text-primary font-medium">Low Risk (0 - 39)</span><span className="text-text-muted ml-auto font-semibold tabular-nums">{legendCounts.low} Dists</span></div>
              </div>
            </div>
          </div>

          <div className="px-space-md py-2 bg-surface-subtle border-t border-border-crisp flex items-center justify-between font-code-xs text-code-xs text-text-muted">
            <div className="flex items-center gap-space-sm">
              <span className="flex items-center gap-1 text-risk-success font-medium"><span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> LGD Unified Boundary v2.8</span>
              <span>•</span>
              <span>EPSG: 4326 (WGS84)</span>
            </div>
            <span className="font-medium text-text-secondary">NIC Geospatial Sync</span>
          </div>
        </div>

        {/* RIGHT column */}
        <div className="lg:col-span-5 flex flex-col gap-space-md">
          {/* Card 1: State-wise average risk */}
          <div className="bg-surface-card p-space-md rounded-xl flex flex-col gap-space-sm shadow-sm border border-border-crisp">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold">State-Wise Average Delay Risk</h2>
                <span className="font-code-xs text-code-xs text-text-muted">Top {stateBars.length} states ranked by average risk score</span>
              </div>
              <span className="material-symbols-outlined text-text-muted text-[18px]">bar_chart</span>
            </div>
            <div className="flex flex-col gap-2 pt-space-xs font-body-sm text-body-sm">
              {stateBars.map((s) => {
                const band = riskBand(s.avg)
                return (
                  <div key={s.name} className="flex flex-col gap-1">
                    <div className="flex justify-between items-baseline font-code-xs text-code-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-text-primary font-semibold">{s.name} ({abbrState(s.name)})</span>
                        <span className={`px-1 rounded font-bold text-[10px] ${s.high > 0 ? 'bg-red-100 text-error' : 'bg-emerald-100 text-risk-success'}`}>{s.high} High</span>
                      </div>
                      <span className={`font-bold text-code-xs tabular-nums ${band.text}`}>{s.avg} / 100</span>
                    </div>
                    <div className="w-full h-2.5 bg-surface-dim border border-border-crisp/80 rounded-sm overflow-hidden flex">
                      <div className={`h-full ${band.bar} rounded-sm`} style={{ width: `${s.avg}%` }}></div>
                    </div>
                  </div>
                )
              })}
              {stateBars.length === 0 && <p className="text-center text-text-muted font-code-xs text-code-xs py-4">No state data in range.</p>}
            </div>
          </div>

          {/* Card 2: Top 10 high-risk districts table */}
          <div className="bg-surface-card rounded-xl flex flex-col shadow-sm border border-border-crisp overflow-hidden">
            <div className="p-space-md pb-space-xs flex items-center justify-between">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold">Top {Math.min(10, heatGrid.length)} High-Risk Districts</h2>
                <span className="font-code-xs text-code-xs text-error font-semibold">Ranked by Predictive Delay Probability</span>
              </div>
              <span className="font-code-xs text-code-xs bg-surface-subtle border border-border-crisp px-2 py-1 rounded text-primary font-bold tabular-nums">{heatGrid.length} Blocks</span>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-subtle border-y border-border-crisp font-label-sm text-label-sm text-text-muted uppercase tracking-wider">
                  <tr>
                    <th className="py-2 px-space-sm text-center">#</th>
                    <th className="py-2 px-space-sm">District</th>
                    <th className="py-2 px-space-sm text-center">State</th>
                    <th className="py-2 px-space-sm text-right"># Projects</th>
                    <th className="py-2 px-space-sm text-right">Avg Risk</th>
                    <th className="py-2 px-space-sm">Top Factor</th>
                  </tr>
                </thead>
                <tbody className="font-body-sm text-body-sm divide-y divide-border-crisp">
                  {heatGrid.slice(0, 10).map((d, i) => {
                    const band = riskBand(d.risk)
                    return (
                      <tr key={d.name} className={`transition-colors border-l-4 ${i === 0 ? 'bg-red-50/40 border-l-error hover:bg-red-50/70' : 'hover:bg-surface-subtle border-l-transparent'}`}>
                        <td className="py-1.5 px-space-sm text-center font-code-xs text-code-xs text-text-muted font-bold tabular-nums">{String(i + 1).padStart(2, '0')}</td>
                        <td className="py-1.5 px-space-sm font-semibold text-text-primary">{d.name}</td>
                        <td className="py-1.5 px-space-sm text-center font-code-xs text-code-xs text-text-secondary font-semibold">{d.state ? abbrState(d.state) : '—'}</td>
                        <td className="py-1.5 px-space-sm text-right font-code-xs text-code-xs text-text-primary font-medium tabular-nums">{d.projects}</td>
                        <td className="py-1.5 px-space-sm text-right">
                          <span className={`font-code-xs text-code-xs px-1.5 py-0.5 rounded font-bold tabular-nums ${i === 0 ? 'bg-red-100 text-error border border-red-200' : i < 3 ? 'bg-amber-100 text-risk-warning border border-amber-200' : 'bg-surface-subtle text-text-secondary border border-border-crisp'}`}>{d.risk}</span>
                        </td>
                        <td className="py-1.5 px-space-sm font-code-xs text-code-xs text-text-secondary truncate max-w-[120px]" title={d.topFactor}>{d.topFactor}</td>
                      </tr>
                    )
                  })}
                  {heatGrid.length === 0 && (
                    <tr><td colSpan={6} className="py-4 text-center text-text-muted font-code-xs text-code-xs">No district data in range.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 3: Cluster anomaly */}
          <div className="bg-surface-card p-space-md rounded-xl flex flex-col gap-space-sm border border-border-crisp border-l-4 border-l-error shadow-sm relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-red-100 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-space-xs text-error font-headline-sm text-headline-sm font-bold">
                <span className="material-symbols-outlined text-[20px]">warning</span>
                Spatial Anomaly Detected
              </div>
              <span className="font-code-xs text-code-xs bg-red-100 text-error border border-red-200 font-semibold px-2 py-0.5 rounded">High Confidence</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-label-md text-label-md text-primary font-semibold">{topCluster} Risk Cluster</span>
              <p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">
                {topCluster !== '—'
                  ? `${topCluster} exhibits an elevated mean delay probability of ${stateBars[0]?.avg || '—'}/100 across ${stateBars[0]?.count || 0} monitored districts (${stateBars[0]?.high || 0} high-risk). High overlap between statutory clearance bottlenecks and compensation disbursal holds.
                  `
                  : 'No cluster detected in the current analytic scope'}
              </p>
            </div>
            <div className="pt-space-xs flex items-center justify-between gap-space-sm border-t border-border-crisp">
              <div className="font-code-xs text-code-xs text-text-secondary flex items-center gap-1 font-medium">
                <span className="material-symbols-outlined text-[16px] text-risk-success">check_circle</span>
                Joint Secy Alert Triggered
              </div>
              <button className="px-space-md py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-container-high text-text-primary font-label-sm text-label-sm font-semibold transition-colors flex items-center gap-1.5 border border-border-crisp shadow-sm">
                <span className="material-symbols-outlined text-[16px] text-primary">description</span>
                Download Zonal Briefing Dossier
              </button>
            </div>
          </div>

          <div className="text-center">
            <Link to="/projects" className="font-code-xs text-code-xs text-text-muted hover:text-primary font-semibold hover:underline">← Back to projects</Link>
          </div>
        </div>
      </div>
    </AppShell>
  )
}