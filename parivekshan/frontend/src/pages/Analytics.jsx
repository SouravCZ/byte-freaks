import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useRole } from '../lib/roleContext'
import { scopeProjects, isDistrictOfficer, DISTRICT_OFFICER_DISTRICT } from '../lib/scoping'
import AppShell from '../components/layout/AppShell'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function riskBand(score) {
  const n = Number(score)
  if (n >= 75) return { key: 'high', label: 'High', hex: '#c0392b', tile: 'bg-risk-critical-bg border-risk-critical/25 text-on-error-container', bar: 'bg-risk-critical', text: 'text-error' }
  if (n >= 50) return { key: 'mod', label: 'Medium', hex: '#b4650a', tile: 'bg-risk-warning-bg border-risk-warning/25 text-on-tertiary-container', bar: 'bg-risk-warning', text: 'text-risk-warning' }
  return { key: 'low', label: 'Low', hex: '#0e7c66', tile: 'bg-risk-success-bg border-risk-success/25 text-on-secondary-container', bar: 'bg-risk-success', text: 'text-risk-success' }
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

  const cardCls = 'bg-surface-card rounded-xl border border-border-crisp shadow-card'

  if (loading) {
    return (
      <AppShell title="District Analytics" subtitle={`${API_BASE}/api/blocks`}>
        <div className="py-24 text-center">
          <div className="w-9 h-9 border-[3px] border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[14px] text-text-muted">Loading analytics…</p>
        </div>
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell title="District Analytics" subtitle={`${API_BASE}/api/blocks`}>
        <div className="bg-surface-card border border-error/25 rounded-xl p-6 max-w-md mx-auto text-center shadow-card">
          <span className="material-symbols-outlined text-[32px] text-error mb-2">error_outline</span>
          <p className="font-semibold text-text-primary mb-1">Failed to load analytics</p>
          <p className="text-sm text-text-muted">{error}</p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="District Analytics" subtitle={`${scopedBlocks.length} blocks monitored`}>
      <div className="flex flex-col gap-space-lg">
        <div className="flex flex-col gap-space-md">
          <div className="flex items-center gap-space-sm">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary-container text-on-secondary-container text-[12px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-risk-success"></span>
              Live spatial telemetry
            </span>
            <span className="text-[12px] text-text-muted">{scopedBlocks.length} blocks monitored</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">District risk analytics</h1>
            <p className="text-[14px] text-text-muted mt-1 max-w-2xl">
              Cross-district heat-mapping of acquisition delay probability with state-level aggregation
              and anomaly cluster detection.
            </p>
          </div>
        </div>

        <div className={`${cardCls} px-space-md py-space-md flex flex-wrap items-center justify-between gap-space-sm`}>
          <div className="flex items-center gap-space-xs flex-wrap">
            <div className="flex items-center gap-2 bg-surface-container-low border border-border-crisp pl-3 pr-1.5 py-1 rounded-lg">
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Jurisdiction</span>
              <select value={fState} onChange={(e) => setFState(e.target.value)} className="bg-transparent text-[13px] font-medium text-text-primary focus:outline-none cursor-pointer py-1 pr-1">
                <option value="ALL">All India ({stateOptions.length})</option>
                {stateOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <span className="material-symbols-outlined text-[15px] text-text-muted pointer-events-none">expand_more</span>
            </div>
            <button onClick={() => { setFState('ALL'); setFRisk('ALL') }} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-border-crisp text-text-secondary hover:text-text-primary text-[12px] transition-colors">
              <span className="material-symbols-outlined text-[15px]">restart_alt</span>
              Clear
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-base">
          {[
            { label: 'Monitored blocks', value: scopedBlocks.length, icon: 'map', iconCls: 'bg-primary-container text-primary' },
            { label: 'Red zones · ≥ 75', value: highCount, icon: 'warning', iconCls: 'bg-risk-critical-bg text-error', accent: 'text-error' },
            { label: 'Amber zones · 50–74', value: modCount, icon: 'timeline', iconCls: 'bg-risk-warning-bg text-risk-warning', accent: 'text-risk-warning' },
            { label: 'Top cluster', value: topCluster, icon: 'location_on', iconCls: 'bg-secondary-container text-on-secondary-container', accent: 'text-primary' },
          ].map((c) => (
            <div key={c.label} className={`${cardCls} p-space-md flex flex-col justify-between`}>
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-text-muted tracking-wider uppercase">{c.label}</span>
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[19px] ${c.iconCls}`}>
                  <span className="material-symbols-outlined">{c.icon}</span>
                </span>
              </div>
              <p className={`text-3xl font-bold tabular-nums mt-3 truncate ${c.accent || 'text-text-primary'}`}>{c.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-base items-start">
          <div className={`${cardCls} lg:col-span-7 overflow-hidden flex flex-col`}>
            <div className="px-space-md py-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm border-b border-border-crisp">
              <div>
                <p className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">District inset · LGD 2026</p>
                <h2 className="text-base font-semibold text-text-primary mt-0.5">Risk heat matrix</h2>
              </div>
              <span className="text-[12px] text-text-muted">{heatGrid.length} districts · EPSG:4326</span>
            </div>

            <div className="relative flex-1 p-space-md bg-surface-container-low min-h-[300px]">
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 justify-items-stretch gap-1.5 pr-1">
                {heatGrid.map((b) => {
                  const band = riskBand(b.risk)
                  return (
                    <div
                      key={b.name}
                      title={`${b.name} (${b.state || '—'}) — ${b.risk}% · ${b.projects} projects`}
                      className={`group relative h-9 rounded-md border-2 ${band.tile} opacity-90 hover:opacity-100 hover:ring-1 hover:ring-primary transition-all cursor-pointer`}
                    >
                      <span className="absolute inset-x-0 bottom-0 text-center text-[8px] font-mono font-semibold truncate px-0.5 leading-tight">
                        {b.name.split(' ').slice(0, 2).join(' ').slice(0, 12)}
                      </span>
                    </div>
                  )
                })}
              </div>

              {pinned && (
                <div className="absolute left-space-sm bottom-space-sm z-30 w-72 bg-white/95 backdrop-blur-md p-space-md rounded-xl shadow-lifted border border-border-crisp border-l-4 border-l-error hidden sm:block">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-semibold text-text-primary">{pinned.name}</span>
                        {pinned.state && <span className="text-[12px] font-mono px-1.5 py-0.5 rounded-md bg-primary-container text-primary font-semibold">{pinned.state}</span>}
                      </div>
                      <span className="text-[12px] text-text-muted">Highest avg delay probability</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-risk-critical-bg text-error text-[12px] font-bold uppercase tracking-wider border border-error/25">{riskBand(pinned.risk).label} risk</span>
                  </div>
                  <div className="space-y-2 pt-1 text-[13px]">
                    <div className="flex justify-between items-center bg-surface-container-low border border-border-crisp px-2 py-1.5 rounded-lg">
                      <span className="text-text-secondary">Projects</span>
                      <span className="font-mono font-bold text-text-primary tabular-nums">{pinned.projects}</span>
                    </div>
                    <div className="flex justify-between items-center bg-surface-container-low border border-border-crisp px-2 py-1.5 rounded-lg">
                      <span className="text-text-secondary">Avg risk score</span>
                      <span className="font-mono font-bold text-error bg-risk-critical-bg rounded-md px-1.5 py-0.5 border border-error/25 tabular-nums">{pinned.risk}/100</span>
                    </div>
                    <div className="flex flex-col gap-1 bg-risk-critical-bg/70 border border-risk-critical/20 p-2 rounded-lg">
                      <span className="text-[11px] font-semibold text-error uppercase tracking-wider">Top factor</span>
                      <span className="text-[12px] font-mono text-text-primary leading-tight">{pinned.topFactor}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="absolute right-space-sm bottom-space-sm z-20 flex flex-col gap-1.5 bg-white/95 backdrop-blur-md p-space-sm rounded-xl shadow-card border border-border-crisp">
                <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Legend</span>
                <div className="flex flex-col gap-1.5 text-[11px]">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-risk-critical"></span><span className="text-text-primary font-medium">High risk</span><span className="text-text-muted ml-auto font-semibold tabular-nums">{legendCounts.high}</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-risk-warning"></span><span className="text-text-primary font-medium">Medium risk</span><span className="text-text-muted ml-auto font-semibold tabular-nums">{legendCounts.mod}</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-risk-success"></span><span className="text-text-primary font-medium">Low risk</span><span className="text-text-muted ml-auto font-semibold tabular-nums">{legendCounts.low}</span></div>
                </div>
              </div>
            </div>

            <div className="px-space-md py-2 bg-surface-container border-t border-border-crisp flex items-center justify-between text-[11px] text-text-muted">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-risk-success"></span> LGD unified boundary · EPSG 4326 (WGS84)
              </span>
              <span className="font-medium text-text-secondary">NIC geospatial sync</span>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-space-md">
            <div className={`${cardCls} p-space-md flex flex-col gap-space-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-text-primary">State-wise average delay risk</h2>
                  <span className="text-[12px] text-text-muted">Top {stateBars.length} states by average risk score</span>
                </div>
                <span className="material-symbols-outlined text-text-muted text-[20px]">bar_chart</span>
              </div>
              <div className="flex flex-col gap-2.5 pt-1 text-[13px]">
                {stateBars.map((s) => {
                  const band = riskBand(s.avg)
                  return (
                    <div key={s.name} className="flex flex-col gap-1">
                      <div className="flex justify-between items-baseline">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-text-primary font-semibold truncate">{s.name}</span>
                          <span className={`px-1 rounded text-[10px] font-bold ${s.high > 0 ? 'bg-risk-critical-bg text-error' : 'bg-risk-success-bg text-risk-success'}`}>{s.high} high</span>
                        </div>
                        <span className={`font-mono font-bold text-[12px] tabular-nums ${band.text}`}>{s.avg} / 100</span>
                      </div>
                      <div className="w-full h-2 bg-surface-dim rounded-sm overflow-hidden">
                        <div className={`h-full ${band.bar}`} style={{ width: `${s.avg}%` }}></div>
                      </div>
                    </div>
                  )
                })}
                {stateBars.length === 0 && <p className="text-center text-text-muted text-[12px] py-4">No state data in range.</p>}
              </div>
            </div>

            <div className={`${cardCls} flex flex-col overflow-hidden`}>
              <div className="p-space-md pb-space-xs flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-text-primary">High-risk districts</h2>
                  <span className="text-[12px] text-error font-semibold">Ranked by predictive delay probability</span>
                </div>
                <span className="text-[12px] bg-surface-container border border-border-crisp px-2 py-1 rounded-md text-primary font-bold tabular-nums">{heatGrid.length} blocks</span>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[560px]">
                  <thead className="bg-surface-container border-y border-border-crisp text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                    <tr>
                      <th className="py-2 px-space-sm text-center">#</th>
                      <th className="py-2 px-space-sm">District</th>
                      <th className="py-2 px-space-sm text-center">State</th>
                      <th className="py-2 px-space-sm text-right">Projects</th>
                      <th className="py-2 px-space-sm text-right">Avg risk</th>
                      <th className="py-2 px-space-sm">Top factor</th>
                    </tr>
                  </thead>
                  <tbody className="text-[13px] divide-y divide-border-crisp">
                    {heatGrid.slice(0, 10).map((d, i) => {
                      const band = riskBand(d.risk)
                      return (
                        <tr key={d.name} className={`transition-colors hover:bg-surface-container-low ${i === 0 ? 'bg-risk-critical-bg/50' : 'bg-white'}`}>
                          <td className="py-2 px-space-sm text-center font-mono text-[12px] text-text-muted font-bold tabular-nums">{String(i + 1).padStart(2, '0')}</td>
                          <td className="py-2 px-space-sm font-semibold text-text-primary">{d.name}</td>
                          <td className="py-2 px-space-sm text-center font-mono text-[12px] text-text-secondary font-semibold">{d.state ? abbrState(d.state) : '—'}</td>
                          <td className="py-2 px-space-sm text-right font-mono text-[12px] text-text-primary tabular-nums">{d.projects}</td>
                          <td className="py-2 px-space-sm text-right">
                            <span className={`font-mono text-[12px] px-1.5 py-0.5 rounded-md font-bold tabular-nums ${i === 0 ? 'bg-risk-critical-bg text-error border border-error/25' : i < 3 ? 'bg-risk-warning-bg text-risk-warning border border-risk-warning/25' : 'bg-surface-container text-text-secondary border border-border-crisp'}`}>{d.risk}</span>
                          </td>
                          <td className="py-2 px-space-sm font-mono text-[12px] text-text-secondary truncate max-w-[130px]" title={d.topFactor}>{d.topFactor}</td>
                        </tr>
                      )
                    })}
                    {heatGrid.length === 0 && (
                      <tr><td colSpan={6} className="py-4 text-center text-text-muted text-[12px]">No district data in range.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={`${cardCls} p-space-md flex flex-col gap-space-sm border-l-4 border-l-error relative overflow-hidden`}>
              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-risk-critical-bg rounded-full blur-2xl pointer-events-none"></div>
              <div className="flex items-start justify-between relative">
                <div className="flex items-center gap-2 text-error font-semibold">
                  <span className="material-symbols-outlined text-[20px]">warning</span>
                  Spatial anomaly detected
                </div>
                <span className="text-[11px] bg-risk-critical-bg text-error border border-error/25 font-semibold px-2 py-0.5 rounded-md">High confidence</span>
              </div>
              <div className="flex flex-col gap-1 relative">
                <span className="text-[13px] font-semibold text-primary">{topCluster} risk cluster</span>
                <p className="text-[13px] text-text-secondary leading-relaxed">
                  {topCluster !== '—'
                    ? `${topCluster} shows an elevated mean delay probability of ${stateBars[0]?.avg || '—'}/100 across ${scopedBlocks.length} monitored districts (${stateBars[0]?.high || 0} high-risk). Strong overlap between statutory clearance bottlenecks and compensation disbursal holds.
                    `
                    : 'No cluster detected in the current analytic scope.'}
                </p>
              </div>
              <div className="pt-3 flex items-center justify-between gap-space-sm border-t border-border-crisp relative">
                <div className="text-[12px] text-text-secondary flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-[16px] text-risk-success">check_circle</span>
                  Joint Secretary alert triggered
                </div>
                <button className="px-3.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-text-primary text-[12px] font-semibold transition-colors flex items-center gap-1.5 border border-border-crisp">
                  <span className="material-symbols-outlined text-[16px] text-primary">description</span>
                  Download zonal dossier
                </button>
              </div>
            </div>

            <div className="text-center">
              <Link to="/projects" className="text-[12px] font-medium text-text-muted hover:text-primary hover:underline">← Back to projects</Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}