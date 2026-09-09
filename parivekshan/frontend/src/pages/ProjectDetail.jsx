import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts'
import AppShell from '../components/layout/AppShell'
import RiskTag from '../components/ui/RiskTag'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function severityCls(sev) {
  switch (sev) {
    case 'critical': return 'bg-risk-critical-bg text-error border-error/20'
    case 'high': return 'bg-risk-warning-bg text-risk-warning border-risk-warning/20'
    case 'moderate': return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'low': return 'bg-risk-success-bg text-risk-success border-risk-success/20'
    default: return 'bg-surface-subtle text-text-secondary border-border-crisp'
  }
}

function statusCls(status) {
  switch (status) {
    case 'completed': return 'bg-risk-success-bg text-risk-success border-risk-success/20'
    case 'active': return 'bg-primary-container text-primary border-primary/20'
    case 'on_hold': return 'bg-risk-warning-bg text-risk-warning border-risk-warning/20'
    case 'planned': return 'bg-surface-subtle text-text-secondary border-border-crisp'
    case 'cancelled': return 'bg-risk-critical-bg text-error border-error/20'
    default: return 'bg-surface-subtle text-text-secondary border-border-crisp'
  }
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
}

function riskBand(score) {
  const n = Number(score)
  if (n >= 75) return { label: 'HIGH RISK', color: '#DC2626', ring: '#DC2626', text: 'text-error' }
  if (n >= 50) return { label: 'MODERATE', color: '#D97706', ring: '#D97706', text: 'text-risk-warning' }
  return { label: 'LOW RISK', color: '#059669', ring: '#059669', text: 'text-risk-success' }
}

export default function ProjectDetail() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const ctrl = new AbortController()
    setLoading(true)
    setError(null)
    fetch(`${API_BASE}/api/projects/${id}`, { signal: ctrl.signal })
      .then(async (r) => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}))
          throw new Error(body.error || `HTTP ${r.status}`)
        }
        return r.json()
      })
      .then((data) => setProject(data))
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message)
      })
      .finally(() => setLoading(false))
    return () => ctrl.abort()
  }, [id])

  if (loading) {
    return (
      <AppShell title="Project Detail" subtitle={id}>
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary text-sm">Loading project…</p>
        </div>
      </AppShell>
    )
  }

  if (error || !project) {
    return (
      <AppShell title="Project Detail" subtitle={id}>
        <div className="bg-surface-card border border-error/30 rounded-lg p-6 max-w-md mx-auto text-center">
          <p className="text-error font-semibold mb-2">Could not load project</p>
          <p className="text-sm text-text-secondary">{error || 'Project not found'}</p>
          <Link to="/projects" className="inline-block mt-4 text-primary text-sm font-semibold hover:underline">← Back to projects</Link>
        </div>
      </AppShell>
    )
  }

  const score = Math.min(Math.max(Number(project.risk_score) || 0, 0), 100)
  const band = riskBand(score)
  const C = 2 * Math.PI * 40
  const dashOffset = C * (1 - score / 100)

  const drivers = Array.isArray(project.drivers) ? project.drivers : []
  const maxDriver = drivers.length ? Math.max(...drivers.map((d) => Number(d.impact_pct))) : 100
  const history = Array.isArray(project.history) ? project.history : []
  const alerts = Array.isArray(project.alerts) ? project.alerts : []

  return (
    <AppShell title={project.name} subtitle={`${project.code} · ${project.block || '—'} · ${project.district || ''}`}>
      <Link to="/projects" className="inline-flex items-center gap-1 font-code-xs text-code-xs text-text-muted hover:text-primary font-semibold mb-4 transition-colors">
        <span className="material-symbols-outlined text-[14px]">arrow_back</span>
        ALL PROJECTS DIRECTORY
      </Link>

      {/* Header card */}
      <div className="bg-surface-card rounded-lg border border-border-crisp p-space-lg shadow-sm flex flex-col gap-space-lg">
        <div className="flex flex-col xl:flex-row xl:items-center gap-space-lg">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-code-xs text-code-xs px-2 py-0.5 rounded bg-surface-subtle border border-border-crisp text-text-secondary font-semibold uppercase tracking-wider">{project.project_type}</span>
              <span className={`px-2 py-0.5 rounded font-code-xs text-code-xs font-semibold capitalize border ${statusCls(project.status)}`}>{String(project.status || 'unknown').replace(/_/g, ' ')}</span>
              <span className="font-code-xs text-code-xs px-2 py-0.5 rounded bg-primary-container text-primary border border-primary/20 font-semibold">MoRD • {project.block || '—'}, {project.district || ''}</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-text-primary font-bold tracking-tight">{project.name}</h1>
            <p className="font-code-sm text-code-sm text-text-muted mt-1">
              <span className="material-symbols-outlined text-[14px] align-[-2px]">tag</span> {project.code}
            </p>
            {project.description && <p className="font-body-md text-body-md text-text-secondary leading-relaxed mt-space-md max-w-3xl">{project.description}</p>}
          </div>

          {/* Risk gauge */}
          <div className="shrink-0 bg-surface-subtle border border-border-crisp rounded-lg p-space-md flex items-center gap-space-md">
            <div className="relative w-28 h-28">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#E2E8F0" strokeWidth="10" />
                <circle
                  cx="50" cy="50" r="40" fill="none"
                  stroke={band.ring} strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={C} strokeDashoffset={dashOffset}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-code-lg text-code-lg font-bold text-text-primary tabular-nums">{score.toFixed(0)}</span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">/ 100</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className={`font-headline-sm text-headline-sm font-bold ${band.text}`}>{band.label}</span>
              <span className="font-code-xs text-code-xs text-text-muted">XGBoost Delay Engine</span>
              <span className="inline-flex w-fit items-center gap-1 px-1.5 py-0.5 rounded bg-surface-card border border-border-crisp font-code-xs text-code-xs text-text-secondary">
                <span className="material-symbols-outlined text-[12px] text-risk-warning">schedule</span>{project.delay_days}d delayed
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-base mt-space-lg items-start">
        {/* Left column */}
        <div className="lg:col-span-7 flex flex-col gap-space-base">
          {drivers.length > 0 && (
            <div className="bg-surface-card border border-border-crisp p-space-lg rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <span className="font-code-xs text-code-xs text-text-muted uppercase tracking-wider font-semibold">SHAP-STYLE ATTRIBUTION</span>
                  <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold">Risk Driver Breakdown</h2>
                </div>
                <span className="font-code-xs text-code-xs px-2 py-0.5 rounded bg-risk-critical-bg border border-error/20 text-error font-bold">Top Driver: {drivers[0]?.factor}</span>
              </div>
              <div className="space-y-3 mt-space-md">
                {drivers.map((d, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="font-code-xs text-code-xs text-text-muted w-6 tabular-nums shrink-0">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-sm text-text-primary w-56 shrink-0 font-medium truncate" title={d.factor}>{d.factor}</span>
                    <div className="flex-1 h-2 bg-surface-dim rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${i === 0 ? 'bg-error' : i === 1 ? 'bg-risk-warning' : 'bg-primary'}`}
                        style={{ width: `${(Number(d.impact_pct) / maxDriver) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-code-sm text-text-secondary w-12 text-right tabular-nums shrink-0">{Number(d.impact_pct).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {history.length > 0 && (
            <div className="bg-surface-card border border-border-crisp p-space-lg rounded-lg shadow-sm">
              <span className="font-code-xs text-code-xs text-text-muted uppercase tracking-wider font-semibold">12-MONTH SNAPSHOT</span>
              <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold mb-3">Risk History Trajectory</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={history.map((h) => ({ ...h, month: new Date(h.recorded_on).toLocaleDateString(undefined, { month: 'short' }) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748B" fontSize={10} domain={[0, 100]} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,.08)' }}
                  />
                  <Bar dataKey="risk_score" radius={[4, 4, 0, 0]}>
                    {history.map((h, i) => (
                      <Cell key={i} fill={Number(h.risk_score) >= 75 ? '#DC2626' : Number(h.risk_score) >= 50 ? '#F59E0B' : '#059669'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {alerts.length > 0 && (
            <div className="bg-surface-card border border-border-crisp p-space-lg rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-code-xs text-code-xs text-text-muted uppercase tracking-wider font-semibold">DISCRETE EVENTS</span>
                  <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold">Project Alerts</h2>
                </div>
                <span className="font-code-xs text-code-xs px-2 py-0.5 rounded bg-surface-subtle border border-border-crisp text-text-secondary font-bold tabular-nums">{alerts.length}</span>
              </div>
              <div className="space-y-3">
                {alerts.map((a) => (
                  <div key={a.id} className="border border-border-crisp rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`px-2 py-0.5 text-[10px] font-code-xs font-semibold uppercase tracking-wider rounded border ${severityCls(a.severity)}`}>{a.severity}</span>
                      <span className="font-semibold text-text-primary text-sm">{a.title}</span>
                      {!a.is_read && <span className="px-1.5 py-0.5 rounded bg-error text-on-error font-code-xs text-[9px] font-bold uppercase">Unread</span>}
                    </div>
                    {a.message && <p className="text-sm text-text-secondary">{a.message}</p>}
                    <p className="text-xs text-text-muted mt-2 font-code-xs">{new Date(a.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="lg:col-span-5 flex flex-col gap-space-base lg:sticky lg:top-20">
          <div className="grid grid-cols-2 gap-space-base">
            <div className="bg-surface-card border border-border-crisp rounded-lg p-space-md">
              <span className="font-code-xs text-code-xs text-text-muted uppercase tracking-wider font-semibold">Delay Days</span>
              <p className="font-headline-md text-headline-md font-bold text-error mt-1 tabular-nums">{project.delay_days}d</p>
              <p className="font-code-xs text-code-xs text-text-muted mt-1">since target baseline</p>
            </div>
            <div className="bg-surface-card border border-border-crisp rounded-lg p-space-md">
              <span className="font-code-xs text-code-xs text-text-muted uppercase tracking-wider font-semibold">Est. Lead Time</span>
              <p className="font-headline-md text-headline-md font-bold text-text-primary mt-1 tabular-nums">{project.lead_time_days}d</p>
              <p className="font-code-xs text-code-xs text-text-muted mt-1">acquisition lifecycle</p>
            </div>
            <div className="bg-surface-card border border-border-crisp rounded-lg p-space-md">
              <span className="font-code-xs text-code-xs text-text-muted uppercase tracking-wider font-semibold">PAFs / Mouzas</span>
              <p className="font-headline-md text-headline-md font-bold text-text-primary mt-1 tabular-nums">{Number(project.mouzas_affected || 0).toLocaleString()}</p>
              <p className="font-code-xs text-code-xs text-text-muted mt-1">affected families</p>
            </div>
            <div className="bg-surface-card border border-border-crisp rounded-lg p-space-md">
              <span className="font-code-xs text-code-xs text-text-muted uppercase tracking-wider font-semibold">Start / Target</span>
              <p className="text-sm font-semibold text-text-primary mt-1">{fmtDate(project.start_date)}</p>
              <p className="text-sm font-semibold text-text-primary">→ {fmtDate(project.target_date)}</p>
            </div>
          </div>

          <div className="bg-surface-card border border-border-crisp rounded-lg p-space-lg shadow-sm border-l-4 border-l-primary">
            <span className="font-code-xs text-code-xs text-text-muted uppercase tracking-wider font-semibold">AI DIAGNOSTIC</span>
            <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold mt-1 mb-2">Execution Readiness</h2>
            <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
              {score >= 75
                ? `Critical delay probability (${score.toFixed(0)}%) driven primarily by ${drivers[0]?.factor || 'statutory bottlenecks'}. Recommended immediate empowered-committee escalation and compensation disbursal acceleration.`
                : score >= 50
                  ? `Elevated delay probability (${score.toFixed(0)}%) — monitor ${drivers[0]?.factor || 'gazette notification timelines'} and streamline consent documentation.`
                  : `Low delay probability (${score.toFixed(0)}%). Acquisition pipeline on track; re-score recommended at next statutory milestone.`}
            </p>
            <div className="mt-space-md flex items-center gap-space-sm pt-space-xs border-t border-border-crisp">
              <button className="px-space-md py-1.5 rounded-lg bg-risk-critical-bg border border-error/30 text-error font-label-sm text-label-sm font-semibold transition-colors">Escalate Review</button>
              <button className="px-space-md py-1.5 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold transition-colors hover:bg-accent-cyan-deep">Run Re-score</button>
            </div>
          </div>

          <div className="bg-surface-card border border-border-crisp rounded-lg p-space-lg shadow-sm">
            <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold mb-3">Project Snapshot</h2>
            <dl className="divide-y divide-border-crisp font-body-sm text-body-sm">
              {[
                ['Project ID', project.code],
                ['Sector / Type', project.project_type],
                ['State', project.district],
                ['District', project.block],
                ['Risk Score', `${score.toFixed(0)} / 100`],
                ['Status', project.status],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-2">
                  <dt className="text-text-muted">{k}</dt>
                  <dd className="font-code-sm text-code-sm text-text-primary font-semibold capitalize">{v || '—'}</dd>
                </div>
              ))}
            </dl>
          </div>

          <Link to="/analytics" className="inline-flex items-center gap-1 font-code-xs text-code-xs text-text-muted hover:text-primary font-semibold transition-colors">
            View district analytics
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>
      </div>
    </AppShell>
  )
}