import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useRole } from '../lib/roleContext'
import { scopeProjects, isDistrictOfficer, DISTRICT_OFFICER_DISTRICT } from '../lib/scoping'
import AppShell from '../components/layout/AppShell'
import EmptyState from '../components/EmptyState'
import RiskTag from '../components/ui/RiskTag'

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
  if (n >= 75) return { key: 'high', label: 'High', bar: 'bg-risk-critical', text: 'text-error', chip: 'bg-risk-critical-bg text-error border-error/25', dot: 'bg-risk-critical', rowBorder: 'border-l-error' }
  if (n >= 50) return { key: 'mod', label: 'Medium', bar: 'bg-risk-warning', text: 'text-risk-warning', chip: 'bg-risk-warning-bg text-risk-warning border-risk-warning/25', dot: 'bg-risk-warning', rowBorder: 'border-l-risk-warning' }
  return { key: 'low', label: 'Low', bar: 'bg-risk-success', text: 'text-risk-success', chip: 'bg-risk-success-bg text-risk-success border-risk-success/25', dot: 'bg-risk-success', rowBorder: 'border-l-risk-success' }
}

function abbrState(name) {
  const parts = String(name || '').trim().split(/\s+/)
  if (parts.length === 1) return (parts[0].slice(0, 2)).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export default function Overview() {
  const { email, role } = useRole()
  const [stats, setStats] = useState(null)
  const [projects, setProjects] = useState([])
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [fState, setFState] = useState('')
  const [fDistrict, setFDistrict] = useState('')
  const [fType, setFType] = useState('')
  const [fRisk, setFRisk] = useState('all')

  useEffect(() => {
    const ctrl = new AbortController()
    Promise.all([
      fetch(`${API_BASE}/api/stats`, { signal: ctrl.signal }).then((r) => r.json()),
      fetch(`${API_BASE}/api/projects`, { signal: ctrl.signal }).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      }),
      fetch(`${API_BASE}/api/blocks`, { signal: ctrl.signal }).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      }),
    ])
      .then(([statsData, projectsData, blocksData]) => {
        setStats(statsData)
        setProjects(Array.isArray(projectsData) ? projectsData : [])
        setBlocks(Array.isArray(blocksData) ? blocksData : [])
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message)
      })
      .finally(() => setLoading(false))
    return () => ctrl.abort()
  }, [])

  const scoped = isDistrictOfficer(role)
  const visibleProjects = scopeProjects(projects, role)
  const stateOptions = useMemo(() => Array.from(new Set(blocks.map((b) => b.district).filter(Boolean))).sort(), [blocks])
  const districtOptions = useMemo(
    () => Array.from(new Set(blocks.filter((b) => !fState || b.district === fState).map((b) => b.name).filter(Boolean))).sort(),
    [blocks, fState]
  )
  const typeOptions = useMemo(() => Array.from(new Set(projects.map((p) => p.project_type).filter(Boolean))).sort(), [projects])

  const filteredProjects = useMemo(() => {
    return visibleProjects.filter((p) => {
      if (fState && (p.district || '') !== fState) return false
      if (fDistrict && (p.block || '') !== fDistrict) return false
      if (fType && (p.project_type || '') !== fType) return false
      if (fRisk !== 'all' && riskBand(p.risk_score).key !== fRisk) return false
      return true
    })
  }, [visibleProjects, fState, fDistrict, fType, fRisk])

  const filteredBlocks = useMemo(() => {
    return blocks.filter((b) => {
      if (fState && (b.district || '') !== fState) return false
      if (fDistrict && (b.name || '') !== fDistrict) return false
      return true
    })
  }, [blocks, fState, fDistrict])

  const highRisk = filteredProjects.filter((p) => Number(p.risk_score) >= 75).length
  const attention = filteredProjects.filter((p) => Number(p.risk_score) >= 85 && Number(p.delay_days) > 0).length
  const avgRisk = filteredProjects.length
    ? Math.round(filteredProjects.reduce((s, p) => s + Number(p.risk_score), 0) / filteredProjects.length)
    : 0

  const trendData = useMemo(() => {
    return filteredBlocks
      .map((b) => ({ name: b.name, probability: Number(b.risk_score) }))
      .sort((a, b) => a.probability - b.probability)
      .map((d, i) => ({ ...d, key: `#${i + 1}` }))
  }, [filteredBlocks])

  const topStates = useMemo(() => {
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
      .slice(0, 5)
  }, [filteredBlocks])

  const annualMax = trendData.length ? Math.max(...trendData.map((d) => d.probability)) : 0
  const annualMin = trendData.length ? Math.min(...trendData.map((d) => d.probability)) : 0

  const attentionRows = filteredProjects
    .filter((p) => Number(p.risk_score) >= 75)
    .sort((a, b) => Number(b.risk_score) - Number(a.risk_score) || Number(b.delay_days) - Number(a.delay_days))
    .slice(0, 5)

  const hasActiveFilters = fState || fDistrict || fType || fRisk !== 'all'

  const cardCls = 'bg-surface-card rounded-xl border border-border-crisp shadow-card'

  return (
    <AppShell title="Command Dashboard" subtitle={`Signed in as ${role}${scoped ? ' · District Magistrate' : ''}`}>
      <div className="flex flex-col gap-space-lg">
        <section className={`${cardCls} px-space-lg py-space-md flex flex-wrap items-center justify-between gap-space-sm`}>
          <div className="flex items-center gap-space-sm flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-container text-on-primary-container text-[12px] font-semibold">
              <span className="material-symbols-outlined text-[15px]">verified_user</span>
              {role || 'User'}
            </span>
            <span className="text-[13px] text-text-muted">
              Signed in via {email || 'govnet'} · NIC directory verified
            </span>
          </div>
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-1.5 text-[12px] text-text-muted">
              <span className="w-2 h-2 rounded-full bg-risk-success"></span>
              Live data feed · {blocks.length} blocks
            </div>
            <span className="px-2 py-0.5 rounded-md bg-surface-container text-text-secondary text-[12px] font-medium">AES-256 encrypted</span>
          </div>
        </section>

        {scoped && (
          <div className="flex items-center gap-2 bg-primary-container/70 border border-primary/15 rounded-xl px-4 py-3">
            <span className="material-symbols-outlined text-[16px] text-primary">my_location</span>
            <span className="text-[13px] font-semibold text-on-primary-container">{DISTRICT_OFFICER_DISTRICT} — District scope</span>
            <span className="text-[13px] text-text-muted">Projects are filtered to your jurisdiction.</span>
          </div>
        )}

        {loading && (
          <div className="py-24 text-center">
            <div className="w-9 h-9 border-[3px] border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[14px] text-text-muted">Loading dashboard…</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-surface-card border border-error/25 rounded-xl p-6 max-w-md mx-auto text-center shadow-card">
            <span className="material-symbols-outlined text-[32px] text-error mb-2">error_outline</span>
            <p className="font-semibold text-text-primary mb-1">Failed to load dashboard</p>
            <p className="text-sm text-text-muted">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <section className="flex flex-col gap-space-md">
              <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-md">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-space-sm">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary-container text-on-secondary-container text-[12px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-risk-success"></span>
                      Live GatiShakti feed
                    </span>
                    <span className="text-[12px] text-text-muted">LGD boundaries synced · {blocks.length} blocks</span>
                  </div>
                  <h1 className="text-2xl font-bold text-text-primary tracking-tight">National land acquisition risk telemetry</h1>
                  <p className="text-[14px] text-text-muted max-w-3xl">
                    Predictive evaluation of gazette notification bottlenecks, declaration stalls, Gram Sabha
                    consensus delays, and forest clearance vectors across India.
                  </p>
                </div>
                <div className="flex items-center gap-space-sm flex-wrap self-start xl:self-end">
                  <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-card border border-border-crisp text-text-secondary hover:text-primary hover:border-outline transition-colors text-[13px] font-medium">
                    <span className="material-symbols-outlined text-[17px] text-primary">sync</span>
                    Re-score projects
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-white text-[13px] font-semibold hover:bg-accent-cyan-deep transition-colors shadow-card">
                    <span className="material-symbols-outlined text-[17px]">picture_as_pdf</span>
                    Export briefing
                  </button>
                </div>
              </div>

              <div className={`${cardCls} p-space-md flex flex-col gap-space-md`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-space-md items-end">
                  <div className="lg:col-span-3 flex flex-col gap-1">
                    <label className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">State / UT</label>
                    <div className="relative">
                      <select value={fState} onChange={(e) => { setFState(e.target.value); setFDistrict('') }} className="w-full appearance-none bg-surface-container rounded-lg border border-border-crisp text-text-primary text-[13px] px-3 py-2 pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary">
                        <option value="">All states &amp; UTs</option>
                        {stateOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[17px] text-text-muted pointer-events-none">expand_more</span>
                    </div>
                  </div>
                  <div className="lg:col-span-3 flex flex-col gap-1">
                    <label className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">District</label>
                    <div className="relative">
                      <select value={fDistrict} onChange={(e) => setFDistrict(e.target.value)} className="w-full appearance-none bg-surface-container rounded-lg border border-border-crisp text-text-primary text-[13px] px-3 py-2 pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary">
                        <option value="">All districts</option>
                        {districtOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[17px] text-text-muted pointer-events-none">expand_more</span>
                    </div>
                  </div>
                  <div className="lg:col-span-3 flex flex-col gap-1">
                    <label className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">Project type</label>
                    <div className="relative">
                      <select value={fType} onChange={(e) => setFType(e.target.value)} className="w-full appearance-none bg-surface-container rounded-lg border border-border-crisp text-text-primary text-[13px] px-3 py-2 pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary">
                        <option value="">All types</option>
                        {typeOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[17px] text-text-muted pointer-events-none">expand_more</span>
                    </div>
                  </div>
                  <div className="lg:col-span-3 flex flex-col gap-1">
                    <label className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">Risk level</label>
                    <div className="flex items-center p-1 bg-surface-container rounded-lg border border-border-crisp gap-1">
                      {[['all', 'All'], ['low', 'Low'], ['mod', 'Medium'], ['high', 'High']].map(([k, lbl]) => (
                        <button
                          key={k}
                          onClick={() => setFRisk(k)}
                          className={`flex-1 py-1.5 text-center text-[12px] font-semibold rounded-md transition-all ${fRisk === k ? 'bg-white text-text-primary shadow-sm border border-border-crisp' : 'text-text-muted hover:text-text-primary'} ${k === 'high' && fRisk === 'high' ? 'text-error' : ''}`}
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-space-xs flex-wrap pt-space-xs border-t border-border-crisp">
                  <div className="flex items-center gap-space-xs flex-wrap">
                    <span className="text-[12px] font-semibold text-text-muted mr-1">Active filters:</span>
                    {hasActiveFilters ? (
                      <>
                        {fState && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-container/70 border border-primary/20 text-on-primary-container text-[12px]">
                            <span>State: {fState}</span>
                            <button onClick={() => setFState('')} className="material-symbols-outlined text-[13px] cursor-pointer hover:text-text-primary">close</button>
                          </span>
                        )}
                        {fDistrict && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-container/70 border border-primary/20 text-on-primary-container text-[12px]">
                            <span>District: {fDistrict}</span>
                            <button onClick={() => setFDistrict('')} className="material-symbols-outlined text-[13px] cursor-pointer hover:text-text-primary">close</button>
                          </span>
                        )}
                        {fType && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-container/70 border border-primary/20 text-on-primary-container text-[12px]">
                            <span>Type: {fType}</span>
                            <button onClick={() => setFType('')} className="material-symbols-outlined text-[13px] cursor-pointer hover:text-text-primary">close</button>
                          </span>
                        )}
                        {fRisk !== 'all' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-risk-critical-bg border border-error/25 text-error text-[12px]">
                            <span>Risk: {fRisk === 'mod' ? 'Medium' : fRisk === 'high' ? 'High' : 'Low'}</span>
                            <button onClick={() => setFRisk('all')} className="material-symbols-outlined text-[13px] cursor-pointer">close</button>
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-[12px] text-text-muted">None — full national scope</span>
                    )}
                  </div>
                  <button
                    onClick={() => { setFState(''); setFDistrict(''); setFType(''); setFRisk('all') }}
                    className="inline-flex items-center gap-1 text-[12px] text-text-muted hover:text-error transition-colors font-medium"
                  >
                    <span className="material-symbols-outlined text-[15px]">restart_alt</span>
                    Reset
                  </button>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-base">
              {[
                {
                  label: 'Total projects',
                  value: filteredProjects.length.toLocaleString(),
                  icon: 'inventory_2',
                  iconBg: 'bg-primary-container text-primary',
                  foot: 'Active portfolio pipeline',
                  extra: 'in scope',
                },
                {
                  label: 'High-risk projects',
                  value: highRisk,
                  icon: 'warning',
                  iconBg: 'bg-risk-critical-bg text-error',
                  foot: `${filteredProjects.length ? Math.round((highRisk / filteredProjects.length) * 100) : 0}% of portfolio`,
                  extra: 'Score ≥ 75',
                  accent: 'text-error',
                  badge: 'Score ≥ 75',
                },
                {
                  label: 'Avg delay probability',
                  value: `${avgRisk}%`,
                  icon: 'analytics',
                  iconBg: 'bg-risk-warning-bg text-risk-warning',
                  foot: 'XGBoost hazard baseline',
                  extra: 'portfolio mean',
                },
                {
                  label: 'Needs attention',
                  value: attention,
                  icon: 'crisis_alert',
                  iconBg: 'bg-risk-critical-bg text-error',
                  foot: 'Score ≥ 85 & delayed',
                  extra: 'escalate now',
                  accent: 'text-error',
                  badge: 'Urgent',
                },
              ].map((c) => (
                <div key={c.label} className={`${cardCls} p-space-base flex flex-col justify-between`}>
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[12px] font-semibold text-text-muted tracking-wider uppercase">{c.label}</span>
                      {c.badge && (
                        <span className="inline-flex w-fit items-center px-1.5 py-0.5 rounded-md bg-risk-critical-bg border border-error/25 text-error text-[11px] font-semibold mt-1">{c.badge}</span>
                      )}
                    </div>
                    <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-[20px] ${c.iconBg}`}>
                      <span className="material-symbols-outlined">{c.icon}</span>
                    </span>
                  </div>
                  <span className={`text-3xl font-bold tabular-nums mt-3 ${c.accent || 'text-text-primary'}`}>{c.value}</span>
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border-crisp">
                    <span className="text-[12px] text-text-muted">{c.foot}</span>
                    <span className="text-[12px] font-medium text-text-muted">{c.extra}</span>
                  </div>
                </div>
              ))}
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-12 gap-space-base items-start">
              <div className={`${cardCls} lg:col-span-7 p-space-base lg:p-space-lg flex flex-col gap-space-md`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
                  <div>
                    <p className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">Trend analysis</p>
                    <h2 className="text-base font-semibold text-text-primary mt-0.5">Predicted delay probability</h2>
                  </div>
                  <div className="flex items-center gap-4 text-[12px] text-text-muted">
                    <div className="flex items-center gap-1.5 text-primary font-medium">
                      <span className="w-3 h-1 bg-primary inline-block rounded"></span>
                      Predicted probability
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <span className="w-3 border-t-2 border-dashed border-text-muted inline-block"></span>
                      Baseline
                    </div>
                  </div>
                </div>
                <div className="w-full bg-surface-container-low border border-border-crisp rounded-lg p-space-sm">
                  {trendData.length > 1 ? (
                    <ResponsiveContainer width="100%" height={232}>
                      <AreaChart data={trendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="predAreaGrad" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#3a5583" stopOpacity={0.2} />
                            <stop offset="100%" stopColor="#3a5583" stopOpacity={0.01} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8ee" vertical={false} />
                        <XAxis dataKey="key" stroke="#7d8a99" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#7d8a99" fontSize={10} domain={[0, 100]} tickLine={false} axisLine={false} width={32} />
                        <Tooltip
                          cursor={{ stroke: '#c8d2dc' }}
                          contentStyle={{ borderRadius: 10, border: '1px solid #e2e8ee', fontSize: 12, boxShadow: '0 4px 12px rgba(16,24,40,.08)' }}
                          labelFormatter={(_, payload) => (payload && payload.length ? payload[0].payload.name : '')}
                        />
                        <Area type="monotone" dataKey="probability" name="Delay probability" stroke="#3a5583" strokeWidth={2.5} fill="url(#predAreaGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="py-20 text-center text-text-muted text-[12px]">Insufficient block telemetry.</p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm pt-1">
                  {[
                    ['Maximum', `${annualMax.toFixed(1)}%`, 'text-error'],
                    ['Minimum', `${annualMin.toFixed(1)}%`, 'text-risk-success'],
                    ['Sample', `${trendData.length} blocks`, 'text-primary'],
                  ].map(([l, v, c]) => (
                    <div key={l} className="px-space-sm py-space-xs rounded-lg bg-surface-container-low border border-border-crisp flex flex-col">
                      <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">{l}</span>
                      <span className={`text-sm font-bold tabular-nums ${c}`}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`${cardCls} lg:col-span-5 p-space-base lg:p-space-lg flex flex-col gap-space-md`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">State ranking</p>
                    <h2 className="text-base font-semibold text-text-primary mt-0.5">Top 5 states by average risk</h2>
                  </div>
                  <span className="text-[12px] px-2 py-1 rounded-md bg-risk-critical-bg border border-error/25 text-error font-semibold tabular-nums">
                    {filteredBlocks.filter((b) => Number(b.risk_score) >= 75).length} high-risk
                  </span>
                </div>
                <div className="flex flex-col gap-2.5 pt-1">
                  {topStates.length === 0 && <p className="text-center text-text-muted text-[12px] py-6">No block telemetry in range.</p>}
                  {topStates.map((s) => {
                    const band = riskBand(s.avg)
                    return (
                      <div key={s.name} className="flex flex-col gap-1.5 px-space-sm py-2 rounded-lg bg-surface-container-low border border-border-crisp hover:bg-surface-container transition-colors">
                        <div className="flex items-center justify-between text-[13px]">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono text-[12px] font-bold text-text-primary px-1.5 py-0.5 rounded-md bg-white border border-border-crisp">{abbrState(s.name)}</span>
                            <span className="text-text-primary font-medium truncate">{s.name}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[12px] text-text-muted">Avg <strong className={`font-bold ${band.text}`}>{s.avg}</strong></span>
                            <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-semibold ${s.high > 0 ? 'bg-risk-critical-bg border border-error/25 text-error' : 'bg-risk-success-bg border border-risk-success/25 text-risk-success'}`}>{s.high} high</span>
                          </div>
                        </div>
                        <div className="w-full h-2 rounded-full bg-surface-dim overflow-hidden">
                          <div className={`h-full rounded-full ${band.bar}`} style={{ width: `${s.avg}%` }}></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="pt-1 border-t border-border-crisp flex items-center justify-between text-[12px] text-text-muted">
                  <span>GatiShakti multi-modal analytics</span>
                  <Link to="/analytics" className="inline-flex items-center gap-1 text-primary font-medium hover:underline">
                    View rankings
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </section>

            <section className={`${cardCls} p-space-base lg:p-space-lg flex flex-col gap-space-md`}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-sm">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-error"></span>
                    <h2 className="text-base font-semibold text-text-primary">Projects needing attention</h2>
                    <span className="px-2 py-0.5 rounded-md bg-risk-critical-bg border border-error/25 text-error text-[12px] font-semibold">{attentionRows.length} escalated</span>
                  </div>
                  <span className="text-[13px] text-text-muted mt-0.5">Flagged projects with high delay probability at statutory bottleneck stages.</span>
                </div>
                <span className="text-[12px] text-text-muted">{filteredProjects.length.toLocaleString()} projects in scope</span>
              </div>

              <div className="w-full overflow-x-auto rounded-lg border border-border-crisp">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-surface-container text-text-muted text-[11px] font-semibold uppercase tracking-wider border-b border-border-crisp">
                      <th className="py-2.5 px-4">Project</th>
                      <th className="py-2.5 px-4">District</th>
                      <th className="py-2.5 px-4">State</th>
                      <th className="py-2.5 px-4">Risk score</th>
                      <th className="py-2.5 px-4">Delay probability</th>
                      <th className="py-2.5 px-4">Lifecycle stage</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-crisp text-[13px]">
                    {attentionRows.map((p, i) => {
                      const band = riskBand(p.risk_score)
                      return (
                        <tr key={p.id} className={`transition-colors bg-white hover:bg-surface-container-low ${i % 2 ? 'bg-surface-container-low' : ''}`}>
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <Link to={`/projects/${p.id}`} className="font-semibold text-primary hover:underline inline-flex items-center gap-1 w-fit">
                                <span>{p.name}</span>
                                <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                              </Link>
                              <span className="text-[12px] text-text-muted font-mono">{p.code} · {p.project_type}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium text-text-primary">{p.block || '—'}</td>
                          <td className="py-3 px-4">
                            <span className="text-[12px] font-mono px-1.5 py-0.5 rounded-md bg-surface-container border border-border-crisp text-text-primary">{p.district || '—'}</span>
                          </td>
                          <td className="py-3 px-4"><RiskTag score={p.risk_score} /></td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className={`text-[13px] font-bold tabular-nums ${band.text}`}>{Number(p.risk_score).toFixed(0)}%</span>
                              <div className="w-14 h-1.5 bg-surface-dim rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${band.bar}`} style={{ width: `${Math.min(Number(p.risk_score), 100)}%` }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-md bg-surface-container border border-border-crisp text-text-secondary text-[12px]">{p.project_type}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-md text-[12px] font-semibold capitalize inline-flex items-center gap-1 w-fit ${statusCls(p.status)}`}>
                              <span className="material-symbols-outlined text-[13px]">error</span>
                              {String(p.status || 'unknown').replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Link to={`/projects/${p.id}`} className="inline-flex items-center px-3 py-1.5 rounded-lg bg-primary text-white text-[12px] font-semibold hover:bg-accent-cyan-deep transition-colors">
                              View details
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                    {attentionRows.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-0">
                          <EmptyState
                            icon="task_alt"
                            title="No escalated projects"
                            message="All in-scope projects are below the attention threshold. Check back after the next re-score cycle."
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </AppShell>
  )
}