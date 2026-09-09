import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
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
  if (n >= 75) return { key: 'high', label: 'High', bar: 'bg-error', text: 'text-error', chip: 'bg-risk-critical-bg text-error border-error/20', dot: 'bg-error', rowBorder: 'border-l-error' }
  if (n >= 50) return { key: 'mod', label: 'Medium', bar: 'bg-risk-warning', text: 'text-risk-warning', chip: 'bg-risk-warning-bg text-risk-warning border-risk-warning/20', dot: 'bg-risk-warning', rowBorder: 'border-l-risk-warning' }
  return { key: 'low', label: 'Low', bar: 'bg-risk-success', text: 'text-risk-success', chip: 'bg-risk-success-bg text-risk-success border-risk-success/20', dot: 'bg-risk-success', rowBorder: 'border-l-risk-success' }
}

function abbrState(name) {
  const parts = String(name || '').trim().split(/\s+/)
  if (parts.length === 1) return (parts[0].slice(0, 2)).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export default function Overview() {
  const { role } = useRole()
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

  return (
    <AppShell title="Command Dashboard" subtitle={role ? `Signed in as ${role}${scoped ? ' · District Magistrate' : ''}` : 'Not signed in'}>
      {/* Role Credential & Operational Sync Banner */}
      <div className="w-full bg-surface-card border-b border-border-crisp px-space-lg py-space-xs flex flex-wrap items-center justify-between gap-space-sm">
        <div className="flex items-center gap-space-sm flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-space-sm py-space-2xs rounded bg-risk-success-bg border border-tertiary/20 text-tertiary">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            <span className="font-code-xs text-code-xs uppercase tracking-wider font-semibold">ROLE: {String(role || 'ADMIN').replace(/_/g, '_')} • TIER-1 CLEARANCE</span>
          </div>
          <span className="font-code-xs text-code-xs text-text-muted">NIC-Geospatial Node: <span className="text-text-primary font-semibold">DL-SEC-4</span> (Encrypted AES-256)</span>
        </div>
        <div className="flex items-center gap-space-md">
          <div className="flex items-center gap-1.5 font-code-xs text-code-xs text-text-muted">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
            <span>Telemetry Active: {blocks.length} Blocks</span>
          </div>
          <span className="px-space-xs py-space-2xs rounded bg-surface-subtle border border-border-crisp text-primary font-code-xs text-code-xs font-semibold">Audit Trail v4.9</span>
        </div>
      </div>

      {scoped && (
        <div className="mb-6 flex items-center gap-2 bg-primary-container/60 border border-primary/20 rounded-lg px-4 py-3">
          <span className="label-caps text-primary">Scope:</span>
          <span className="text-xs font-mono font-semibold text-primary">{DISTRICT_OFFICER_DISTRICT}</span>
          <span className="text-xs text-text-secondary">District Magistrate — projects filtered client-side</span>
        </div>
      )}

      {loading && (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary text-sm">Loading dashboard…</p>
        </div>
      )}

      {!loading && error && (
        <div className="bg-surface-card border border-error/30 rounded-lg p-6 max-w-md mx-auto text-center">
          <p className="text-error font-semibold mb-2">Failed to load dashboard</p>
          <p className="text-sm text-text-secondary">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="flex flex-col gap-space-xl">
          {/* Section 1: Executive header + filtering ribbon */}
          <section className="flex flex-col gap-space-md">
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-md">
              <div className="flex flex-col gap-space-2xs">
                <div className="flex items-center gap-space-sm">
                  <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded bg-primary-container text-primary font-code-xs text-code-xs font-semibold uppercase tracking-wider border border-primary/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                    Live GatiShakti Feed • Q1-2026
                  </span>
                  <span className="font-code-xs text-code-xs text-text-muted">State Level LGD Synced 8m ago</span>
                </div>
                <h1 className="font-headline-xl text-headline-xl text-text-primary tracking-tight font-bold">National Land Acquisition Risk Telemetry</h1>
                <p className="font-body-md text-body-md text-text-secondary max-w-3xl">
                  Real-time multi-variate predictive engine evaluating gazette notification bottlenecks, Section 19 declaration stalls, Gram Sabha consensus delays, and forest clearance compliance vectors across India.
                </p>
              </div>
              <div className="flex items-center gap-space-sm flex-wrap self-start xl:self-end">
                <button className="flex items-center gap-1.5 px-space-md py-space-sm rounded-lg bg-surface-card border border-border-crisp text-primary hover:bg-surface-subtle font-label-md text-label-md font-semibold transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-[16px] text-primary">sync</span>
                  <span>Trigger AI Re-score</span>
                </button>
                <button className="flex items-center gap-1.5 px-space-md py-space-sm rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-accent-cyan-deep transition-colors shadow-sm" title="Export briefing (client-side demo)">
                  <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                  <span>Export Briefing PDF</span>
                </button>
              </div>
            </div>

            <div className="p-space-md rounded-lg bg-surface-card border border-border-crisp shadow-sm flex flex-col gap-space-md">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-space-md items-end">
                <div className="lg:col-span-3 flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-text-muted uppercase tracking-wider font-semibold">State Authority</label>
                  <div className="relative">
                    <select value={fState} onChange={(e) => { setFState(e.target.value); setFDistrict('') }} className="w-full appearance-none bg-surface-subtle border border-border-crisp text-text-primary font-body-sm text-body-sm px-space-sm py-space-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-primary pr-8 cursor-pointer shadow-sm">
                      <option value="">All States &amp; UTs</option>
                      {stateOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <span className="material-symbols-outlined absolute right-2 top-2 text-[18px] text-text-muted pointer-events-none">expand_more</span>
                  </div>
                </div>
                <div className="lg:col-span-3 flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-text-muted uppercase tracking-wider font-semibold">District</label>
                  <div className="relative">
                    <select value={fDistrict} onChange={(e) => setFDistrict(e.target.value)} className="w-full appearance-none bg-surface-subtle border border-border-crisp text-text-primary font-body-sm text-body-sm px-space-sm py-space-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-primary pr-8 cursor-pointer shadow-sm">
                      <option value="">All Districts ({districtOptions.length})</option>
                      {districtOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <span className="material-symbols-outlined absolute right-2 top-2 text-[18px] text-text-muted pointer-events-none">expand_more</span>
                  </div>
                </div>
                <div className="lg:col-span-3 flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-text-muted uppercase tracking-wider font-semibold">Project Type</label>
                  <div className="relative">
                    <select value={fType} onChange={(e) => setFType(e.target.value)} className="w-full appearance-none bg-surface-subtle border border-border-crisp text-text-primary font-body-sm text-body-sm px-space-sm py-space-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-primary pr-8 cursor-pointer shadow-sm">
                      <option value="">All Types</option>
                      {typeOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <span className="material-symbols-outlined absolute right-2 top-2 text-[18px] text-text-muted pointer-events-none">expand_more</span>
                  </div>
                </div>
                <div className="lg:col-span-3 flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-text-muted uppercase tracking-wider font-semibold">Risk Level</label>
                  <div className="flex items-center p-0.5 bg-surface-subtle border border-border-crisp rounded-lg">
                    {[['all', 'All'], ['low', 'Low'], ['mod', 'Medium'], ['high', 'High']].map(([k, lbl]) => (
                      <button
                        key={k}
                        onClick={() => setFRisk(k)}
                        className={`flex-1 py-1 text-center font-code-xs text-code-xs font-semibold rounded transition-colors ${fRisk === k ? 'bg-surface-card text-text-primary shadow-sm border border-border-crisp' : 'text-text-muted hover:text-text-primary'} ${k === 'high' && fRisk === 'high' ? 'text-error' : ''}`}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-space-xs flex-wrap pt-space-xs border-t border-border-crisp">
                <div className="flex items-center gap-space-xs flex-wrap">
                  <span className="font-code-xs text-code-xs text-text-muted mr-space-xs font-semibold">ACTIVE FILTERS:</span>
                  {hasActiveFilters ? (
                    <>
                      {fState && (
                        <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded bg-primary-container/60 border border-primary/20 text-primary font-code-xs text-code-xs font-medium">
                          <span>State: {fState}</span>
                          <button onClick={() => setFState('')} className="material-symbols-outlined text-[12px] cursor-pointer hover:text-text-primary">close</button>
                        </span>
                      )}
                      {fDistrict && (
                        <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded bg-primary-container/60 border border-primary/20 text-primary font-code-xs text-code-xs font-medium">
                          <span>District: {fDistrict}</span>
                          <button onClick={() => setFDistrict('')} className="material-symbols-outlined text-[12px] cursor-pointer hover:text-text-primary">close</button>
                        </span>
                      )}
                      {fType && (
                        <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded bg-primary-container/60 border border-primary/20 text-primary font-code-xs text-code-xs font-medium">
                          <span>Type: {fType}</span>
                          <button onClick={() => setFType('')} className="material-symbols-outlined text-[12px] cursor-pointer hover:text-text-primary">close</button>
                        </span>
                      )}
                      {fRisk !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded bg-risk-critical-bg border border-error/20 text-error font-code-xs text-code-xs font-medium">
                          <span>Risk Level: {fRisk === 'mod' ? 'Medium' : fRisk === 'high' ? 'High' : 'Low'}</span>
                          <button onClick={() => setFRisk('all')} className="material-symbols-outlined text-[12px] cursor-pointer hover:text-text-primary">close</button>
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="font-code-xs text-code-xs text-text-muted">None — full national scope</span>
                  )}
                </div>
                <button
                  onClick={() => { setFState(''); setFDistrict(''); setFType(''); setFRisk('all') }}
                  className="font-code-xs text-code-xs text-text-muted hover:text-error transition-colors font-medium flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">restart_alt</span>
                  Reset Parameters
                </button>
              </div>
            </div>
          </section>

          {/* Section 2: Four telemetry left-border metric cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-base">
            <div className="bg-surface-card p-space-base rounded-lg border border-border-crisp border-l-4 border-l-[#4059aa] flex flex-col justify-between shadow-sm relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="font-code-xs text-code-xs text-text-muted uppercase tracking-wider font-semibold">Total Projects</span>
                  <span className="font-headline-xl text-headline-xl text-text-primary mt-space-2xs font-bold tabular-nums">{filteredProjects.length.toLocaleString()}</span>
                </div>
                <div className="w-9 h-9 rounded-lg bg-surface-subtle border border-border-crisp flex items-center justify-center text-text-muted">
                  <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 mt-space-md pt-space-xs border-t border-border-crisp">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary font-code-xs text-code-xs">Active Portfolio Pipeline</span>
                  <div className="inline-flex items-center gap-1 font-code-xs text-code-xs text-risk-success font-semibold">
                    <span>↑ in-scope</span>
                    <span className="text-text-muted font-normal">live /api/projects</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-card p-space-base rounded-lg border border-border-crisp border-l-4 border-l-error bg-gradient-to-r from-risk-critical-bg/40 to-surface-card flex flex-col justify-between shadow-sm relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-code-xs text-code-xs text-error uppercase tracking-wider font-bold">High-Risk Projects</span>
                    <span className="px-1.5 py-0.5 rounded bg-risk-critical-bg border border-error/20 text-error font-code-xs text-[10px] font-bold">Score ≥ 75</span>
                  </div>
                  <span className="font-headline-xl text-headline-xl text-error mt-space-2xs font-bold tabular-nums">{highRisk}</span>
                </div>
                <div className="w-9 h-9 rounded-lg bg-risk-critical-bg border border-error/20 flex items-center justify-center text-error">
                  <span className="material-symbols-outlined text-[20px]">warning</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 mt-space-md pt-space-xs border-t border-border-crisp">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary font-code-xs text-code-xs">{filteredProjects.length ? Math.round((highRisk / filteredProjects.length) * 100) : 0}% of portfolio</span>
                  <div className="inline-flex items-center gap-1 font-code-xs text-code-xs text-error font-semibold">
                    <span>needs action</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-card p-space-base rounded-lg border border-border-crisp border-l-4 border-l-[#D97706] bg-gradient-to-r from-risk-warning-bg/60 to-surface-card flex flex-col justify-between shadow-sm relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="font-code-xs text-code-xs text-risk-warning uppercase tracking-wider font-bold">Avg Delay Probability</span>
                  <span className="font-headline-xl text-headline-xl text-text-primary mt-space-2xs font-bold tabular-nums">{avgRisk}%</span>
                </div>
                <div className="w-9 h-9 rounded-lg bg-risk-warning-bg border border-risk-warning/20 flex items-center justify-center text-risk-warning">
                  <span className="material-symbols-outlined text-[20px]">analytics</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 mt-space-md pt-space-xs border-t border-border-crisp">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary font-code-xs text-code-xs">XGBoost Hazard Baseline</span>
                  <div className="inline-flex items-center gap-1 font-code-xs text-code-xs text-risk-success font-semibold">
                    <span>portfolio mean</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-card p-space-base rounded-lg border border-border-crisp border-l-4 border-l-error bg-gradient-to-r from-risk-critical-bg/40 to-surface-card flex flex-col justify-between shadow-sm relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-code-xs text-code-xs text-error uppercase tracking-wider font-bold">Projects Needing Attention</span>
                    <span className="px-1.5 py-0.5 rounded bg-risk-critical-bg border border-error/20 text-error font-code-xs text-[10px] font-bold">Urgent</span>
                  </div>
                  <span className="font-headline-xl text-headline-xl text-error mt-space-2xs font-bold tabular-nums">{attention}</span>
                </div>
                <div className="w-9 h-9 rounded-lg bg-risk-critical-bg border border-error/20 flex items-center justify-center text-error">
                  <span className="material-symbols-outlined text-[20px]">crisis_alert</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 mt-space-md pt-space-xs border-t border-border-crisp">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary font-code-xs text-code-xs">Score ≥ 85 &amp; delayed</span>
                  <div className="inline-flex items-center gap-1 font-code-xs text-code-xs text-error font-semibold">
                    <span>escalate now</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Dual analytical visualizations */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-space-base items-start">
            <div className="lg:col-span-7 bg-surface-card border border-border-crisp p-space-base lg:p-space-lg rounded-lg flex flex-col gap-space-md shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
                <div>
                  <span className="font-code-xs text-code-xs text-text-muted uppercase tracking-wider font-semibold">Delay Trend Analysis</span>
                  <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold">Delay Probability Trend (Live /api/blocks)</h2>
                </div>
                <div className="flex items-center gap-space-md font-code-xs text-code-xs font-medium">
                  <div className="flex items-center gap-1.5 text-primary font-semibold">
                    <span className="w-3 h-1 bg-primary inline-block rounded"></span>
                    <span>Predicted Probability</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-text-muted font-semibold">
                    <span className="w-3 h-0.5 bg-text-muted inline-block border-t-2 border-dashed border-text-muted"></span>
                    <span>Baseline</span>
                  </div>
                </div>
              </div>
              <div className="w-full bg-surface-subtle border border-border-crisp rounded-lg p-space-sm">
                {trendData.length > 1 ? (
                  <ResponsiveContainer width="100%" height={224}>
                    <AreaChart data={trendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="predAreaGrad" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#0284C7" stopOpacity={0.22} />
                          <stop offset="100%" stopColor="#0284C7" stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="key" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748B" fontSize={10} domain={[0, 100]} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,.08)' }}
                        labelFormatter={(_, payload) => (payload && payload.length ? payload[0].payload.name : '')}
                      />
                      <Area type="monotone" dataKey="probability" stroke="#0284C7" strokeWidth={2.5} fill="url(#predAreaGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="py-20 text-center text-text-muted font-code-xs text-code-xs">Insufficient block telemetry.</p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm pt-space-xs">
                <div className="p-space-xs rounded-lg bg-surface-subtle border border-border-crisp flex flex-col">
                  <span className="font-code-xs text-code-xs text-text-muted font-semibold">MAXIMUM</span>
                  <span className="font-code-sm text-code-sm text-error font-bold">{annualMax.toFixed(1)}%</span>
                </div>
                <div className="p-space-xs rounded-lg bg-surface-subtle border border-border-crisp flex flex-col">
                  <span className="font-code-xs text-code-xs text-text-muted font-semibold">MINIMUM</span>
                  <span className="font-code-sm text-code-sm text-risk-success font-bold">{annualMin.toFixed(1)}%</span>
                </div>
                <div className="p-space-xs rounded-lg bg-surface-subtle border border-border-crisp flex flex-col">
                  <span className="font-code-xs text-code-xs text-text-muted font-semibold">SAMPLE SIZE</span>
                  <span className="font-code-sm text-code-sm text-primary font-bold">{trendData.length} Blocks</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-surface-card border border-border-crisp p-space-base lg:p-space-lg rounded-lg flex flex-col gap-space-md shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-code-xs text-code-xs text-text-muted uppercase tracking-wider font-semibold">STATE-LEVEL JURISDICTION RISK</span>
                  <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold">Top 5 States by Avg Risk Score</h2>
                </div>
                <span className="font-code-xs text-code-xs px-2 py-0.5 rounded bg-risk-critical-bg border border-error/20 text-error font-bold tabular-nums">{filteredBlocks.filter((b) => Number(b.risk_score) >= 75).length} High Risk</span>
              </div>
              <div className="flex flex-col gap-space-sm pt-space-xs">
                {topStates.length === 0 && <p className="text-center text-text-muted font-code-xs text-code-xs py-6">No block telemetry in range.</p>}
                {topStates.map((s) => {
                  const band = riskBand(s.avg)
                  return (
                    <div key={s.name} className="flex flex-col gap-1.5 p-space-xs rounded-lg bg-surface-subtle border border-border-crisp hover:bg-slate-100 transition-colors">
                      <div className="flex items-center justify-between text-body-sm font-body-sm">
                        <div className="flex items-center gap-space-xs">
                          <span className="font-code-xs text-code-xs font-bold text-text-primary bg-white px-1.5 py-0.5 rounded border border-border-crisp">{abbrState(s.name)}</span>
                          <span className="text-text-primary font-semibold">{s.name}</span>
                        </div>
                        <div className="flex items-center gap-space-xs">
                          <span className="font-code-xs text-code-xs text-text-muted">Avg Risk: <strong className={`font-bold ${band.text}`}>{s.avg}</strong></span>
                          <span className={`font-code-xs text-code-xs px-1.5 py-0.5 rounded font-bold ${s.high > 0 ? 'bg-risk-critical-bg border border-error/20 text-error' : 'bg-risk-success-bg border border-risk-success/20 text-risk-success'}`}>{s.high} High-Risk</span>
                        </div>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                        <div className={`h-full rounded-full ${band.bar}`} style={{ width: `${s.avg}%` }}></div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="pt-space-xs border-t border-border-crisp flex items-center justify-between font-code-xs text-code-xs text-text-muted">
                <span>PM GatiShakti Multi-Modal Analytics</span>
                <Link to="/analytics" className="text-primary font-semibold hover:underline flex items-center gap-1">
                  <span>View All State Rankings</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          </section>

          {/* Section 4: Attention-needed table */}
          <section className="bg-surface-card rounded-lg border border-border-crisp p-space-base lg:p-space-lg shadow-sm flex flex-col gap-space-md">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-sm">
              <div className="flex flex-col">
                <div className="flex items-center gap-space-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-error animate-ping"></span>
                  <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold">Projects Needing Immediate Attention</h2>
                  <span className="px-space-xs py-0.5 rounded bg-risk-critical-bg border border-error/20 text-error font-code-xs text-code-xs font-bold">{attentionRows.length} Escalated</span>
                </div>
                <span className="font-body-sm text-body-sm text-text-secondary">Real-time flagged projects with high delay probability and statutory bottleneck stages.</span>
              </div>
              <div className="flex items-center gap-space-sm flex-wrap">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-2.5 top-2 text-[16px] text-text-muted">search</span>
                  <input className="bg-surface-subtle border border-border-crisp pl-8 pr-3 py-1.5 text-body-sm font-body-sm rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary w-48 sm:w-60 shadow-sm" placeholder="Filter table records…" type="text" readOnly />
                </div>
                <span className="font-code-xs text-code-xs text-text-muted">{filteredProjects.length.toLocaleString()} projects in scope</span>
              </div>
            </div>

            <div className="w-full overflow-x-auto rounded-lg border border-border-crisp bg-surface-card shadow-sm">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-surface-subtle text-text-muted font-label-sm text-label-sm uppercase tracking-wider border-b border-border-crisp">
                    <th className="py-space-sm px-space-md">Project Name &amp; Identifier</th>
                    <th className="py-space-sm px-space-md">District</th>
                    <th className="py-space-sm px-space-md">State</th>
                    <th className="py-space-sm px-space-md">Risk Score</th>
                    <th className="py-space-sm px-space-md">Delay Probability</th>
                    <th className="py-space-sm px-space-md">Lifecycle Stage</th>
                    <th className="py-space-sm px-space-md">Status</th>
                    <th className="py-space-sm px-space-md text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-crisp font-body-sm text-body-sm">
                  {attentionRows.map((p, i) => {
                    const band = riskBand(p.risk_score)
                    return (
                      <tr key={p.id} className={`transition-colors border-l-4 ${band.rowBorder} ${i % 2 ? 'bg-surface-container-low' : 'bg-white'}`}>
                        <td className="py-space-sm px-space-md">
                          <div className="flex flex-col">
                            <Link to={`/projects/${p.id}`} className="font-semibold text-primary hover:text-accent-cyan-deep hover:underline flex items-center gap-1">
                              <span>{p.name}</span>
                              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                            </Link>
                            <span className="font-code-xs text-code-xs text-text-muted font-medium">ID: {p.code} • {p.project_type}</span>
                          </div>
                        </td>
                        <td className="py-space-sm px-space-md font-medium text-text-primary">{p.block || '—'}</td>
                        <td className="py-space-sm px-space-md">
                          <span className="font-code-xs text-code-xs px-1.5 py-0.5 rounded bg-surface-subtle border border-border-crisp text-text-primary font-bold">{p.district || '—'}</span>
                        </td>
                        <td className="py-space-sm px-space-md">
                          <RiskTag score={p.risk_score} />
                        </td>
                        <td className="py-space-sm px-space-md">
                          <div className="flex items-center gap-2">
                            <span className={`font-code-sm text-code-sm font-bold ${band.text}`}>{Number(p.risk_score).toFixed(0)}%</span>
                            <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${band.bar}`} style={{ width: `${Math.min(Number(p.risk_score), 100)}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-space-sm px-space-md">
                          <span className="px-space-xs py-0.5 rounded bg-surface-subtle border border-border-crisp text-text-secondary font-code-xs text-code-xs font-medium">{p.project_type}</span>
                        </td>
                        <td className="py-space-sm px-space-md">
                          <span className={`px-space-xs py-0.5 rounded font-code-xs text-code-xs font-semibold capitalize inline-flex items-center gap-1 w-fit ${statusCls(p.status)}`}>
                            <span className="material-symbols-outlined text-[12px]">error</span>
                            {String(p.status || 'unknown').replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-space-sm px-space-md text-right">
                          <Link to={`/projects/${p.id}`} className="px-space-xs py-1 rounded bg-primary text-on-primary font-label-sm text-label-sm font-semibold hover:bg-accent-cyan-deep transition-colors shadow-sm inline-flex items-center gap-1">
                            View Details
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                  {attentionRows.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-space-sm px-space-md text-center text-text-muted font-code-xs text-code-xs">
                        No escalated projects — all in-scope projects below the attention threshold.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </AppShell>
  )
}