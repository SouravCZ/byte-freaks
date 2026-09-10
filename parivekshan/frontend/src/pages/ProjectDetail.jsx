import React, { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts'
import AppShell from '../components/layout/AppShell'
import ProjectMap from '../components/dashboard/ProjectMap'
import { useRole } from '../lib/roleContext'
import { can, canEditProject } from '../lib/permissions'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function severityCls(sev) {
  switch (sev) {
    case 'critical': return 'bg-risk-critical-bg text-error border-error/25'
    case 'high': return 'bg-risk-warning-bg text-risk-warning border-risk-warning/25'
    case 'moderate': return 'bg-risk-warning-bg text-risk-warning border-risk-warning/25'
    case 'low': return 'bg-risk-success-bg text-risk-success border-risk-success/25'
    default: return 'bg-surface-container text-text-secondary border-border-crisp'
  }
}

function statusCls(status) {
  switch (status) {
    case 'completed': return 'bg-risk-success-bg text-risk-success border-risk-success/25'
    case 'active': return 'bg-primary-container text-on-primary-container border-primary/20'
    case 'on_hold': return 'bg-risk-warning-bg text-risk-warning border-risk-warning/25'
    case 'planned': return 'bg-surface-container text-text-secondary border-border-crisp'
    case 'cancelled': return 'bg-risk-critical-bg text-error border-error/25'
    default: return 'bg-surface-container text-text-secondary border-border-crisp'
  }
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
}

function riskBand(score) {
  const n = Number(score)
  if (n >= 75) return { label: 'High risk', color: '#c0392b', ring: '#c0392b', text: 'text-error' }
  if (n >= 50) return { label: 'Moderate risk', color: '#b4650a', ring: '#b4650a', text: 'text-risk-warning' }
  return { label: 'Low risk', color: '#0e7c66', ring: '#0e7c66', text: 'text-risk-success' }
}

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { role } = useRole()
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

  const cardCls = 'bg-surface-card rounded-xl border border-border-crisp shadow-card'

  if (loading) {
    return (
      <AppShell title="Project detail" subtitle={id}>
        <div className="py-24 text-center">
          <div className="w-9 h-9 border-[3px] border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[14px] text-text-muted">Loading project…</p>
        </div>
      </AppShell>
    )
  }

  if (error || !project) {
    return (
      <AppShell title="Project detail" subtitle={id}>
        <div className="bg-surface-card border border-error/25 rounded-xl p-6 max-w-md mx-auto text-center shadow-card">
          <span className="material-symbols-outlined text-[32px] text-error mb-2">error_outline</span>
          <p className="font-semibold text-text-primary mb-1">Could not load project</p>
          <p className="text-sm text-text-muted">{error || 'Project not found'}</p>
          <Link to="/projects" className="inline-block mt-4 text-[13px] text-primary font-semibold hover:underline">← Back to projects</Link>
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

  const canEdit = canEditProject(role, project.district)
  const canDelete = can(role, 'delete_project')

  const handleDelete = () => {
    if (!window.confirm(`Delete ${project.code} — ${project.name}? This cannot be undone.`)) return
    fetch(`${API_BASE}/api/projects/${id}`, { method: 'DELETE' })
      .then(async (r) => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}))
          throw new Error(body.error || `HTTP ${r.status}`)
        }
        navigate('/projects')
      })
      .catch((err) => window.alert(`Delete request failed: ${err.message}. The demo backend is read-only.`))
  }

  return (
    <AppShell title={project.name} subtitle={`${project.code} · ${project.block || '—'} · ${project.district || ''}`}>
      <Link to="/projects" className="inline-flex items-center gap-1 text-[12px] font-medium text-text-muted hover:text-primary transition-colors mb-4">
        <span className="material-symbols-outlined text-[15px]">arrow_back</span>
        All projects
      </Link>

      <div className={`${cardCls} p-space-lg flex flex-col gap-space-lg`}>
        <div className="flex flex-col xl:flex-row xl:items-center gap-space-lg">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="text-[12px] font-mono px-2 py-0.5 rounded-md bg-surface-container border border-border-crisp text-text-secondary font-semibold">{project.project_type}</span>
              <span className={`px-2 py-0.5 rounded-md text-[12px] font-semibold capitalize border ${statusCls(project.status)}`}>{String(project.status || 'unknown').replace(/_/g, ' ')}</span>
              <span className="text-[12px] px-2 py-0.5 rounded-md bg-primary-container text-on-primary-container border border-primary/20 font-semibold">{project.block || '—'}, {project.district || ''}</span>
            </div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">{project.name}</h1>
            <p className="flex items-center gap-1.5 font-mono text-[12px] text-text-muted mt-1.5">
              <span className="material-symbols-outlined text-[14px]">tag</span>
              {project.code}
            </p>
            {project.description && <p className="text-[14px] text-text-secondary leading-relaxed mt-3 max-w-3xl">{project.description}</p>}
            {canDelete && (
              <div className="mt-3 flex items-center gap-2">
                <button onClick={handleDelete} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-risk-critical-bg border border-error/25 text-error text-[12px] font-semibold transition-colors hover:bg-risk-critical hover:text-white">
                  <span className="material-symbols-outlined text-[14px]">delete</span>
                  Delete project
                </button>
                {!canEdit && <span className="text-[11px] font-mono text-text-muted">Ministry Admin · full access</span>}
              </div>
            )}
          </div>

          <div className="shrink-0 bg-surface-container-low border border-border-crisp rounded-xl p-space-md flex items-center gap-space-md">
            <div className="relative w-[104px] h-[104px]">
              <svg className="w-[104px] h-[104px] -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#dfe6ee" strokeWidth="9" />
                <circle
                  cx="50" cy="50" r="40" fill="none"
                  stroke={band.ring} strokeWidth="9" strokeLinecap="round"
                  strokeDasharray={C} strokeDashoffset={dashOffset}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-text-primary tabular-nums">{score.toFixed(0)}</span>
                <span className="text-[10px] font-medium text-text-muted tracking-wider">/ 100</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className={`text-base font-bold ${band.text}`}>{band.label}</span>
              <span className="text-[12px] text-text-muted">XGBoost delay engine</span>
              <span className="inline-flex w-fit items-center gap-1 px-2 py-0.5 rounded-md bg-surface-card border border-border-crisp text-[12px] text-text-secondary">
                <span className="material-symbols-outlined text-[13px] text-risk-warning">schedule</span>
                {project.delay_days}d delayed
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-base mt-space-lg items-start">
        <div className="lg:col-span-7 flex flex-col gap-space-base">
          {drivers.length > 0 && (
            <div className={`${cardCls} p-space-lg`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">SHAP-style attribution</p>
                  <h2 className="text-base font-semibold text-text-primary mt-0.5">Risk driver breakdown</h2>
                </div>
                <span className="text-[12px] px-2 py-1 rounded-md bg-risk-critical-bg border border-error/25 text-error font-semibold">Top: {drivers[0]?.factor}</span>
              </div>
              <div className="space-y-3">
                {drivers.map((d, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="font-mono text-[12px] text-text-muted w-6 tabular-nums shrink-0">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-[13px] text-text-primary w-56 shrink-0 font-medium truncate" title={d.factor}>{d.factor}</span>
                    <div className="flex-1 h-2 bg-surface-dim rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${i === 0 ? 'bg-risk-critical' : i === 1 ? 'bg-risk-warning' : 'bg-primary'}`}
                        style={{ width: `${(Number(d.impact_pct) / maxDriver) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-[13px] font-mono text-text-secondary w-12 text-right tabular-nums shrink-0">{Number(d.impact_pct).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {history.length > 0 && (
            <div className={`${cardCls} p-space-lg`}>
              <p className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">12-month snapshot</p>
              <h2 className="text-base font-semibold text-text-primary mt-0.5 mb-3">Risk history trajectory</h2>
              <ResponsiveContainer width="100%" height={204}>
                <BarChart data={history.map((h) => ({ ...h, month: new Date(h.recorded_on).toLocaleDateString(undefined, { month: 'short' }) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8ee" vertical={false} />
                  <XAxis dataKey="month" stroke="#7d8a99" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#7d8a99" fontSize={10} domain={[0, 100]} tickLine={false} axisLine={false} width={32} />
                  <Tooltip
                    cursor={{ fill: 'rgba(43,76,126,0.06)' }}
                    contentStyle={{ borderRadius: 10, border: '1px solid #e2e8ee', fontSize: 12, boxShadow: '0 4px 12px rgba(16,24,40,.08)' }}
                  />
                  <Bar dataKey="risk_score" name="Risk score" radius={[4, 4, 0, 0]}>
                    {history.map((h, i) => (
                      <Cell key={i} fill={Number(h.risk_score) >= 75 ? '#c0392b' : Number(h.risk_score) >= 50 ? '#b4650a' : '#0e7c66'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {alerts.length > 0 && (
            <div className={`${cardCls} p-space-lg`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">Discrete events</p>
                  <h2 className="text-base font-semibold text-text-primary mt-0.5">Project alerts</h2>
                </div>
                <span className="text-[12px] px-2 py-0.5 rounded-md bg-surface-container border border-border-crisp text-text-secondary font-semibold tabular-nums">{alerts.length}</span>
              </div>
              <div className="space-y-3">
                {alerts.map((a) => (
                  <div key={a.id} className="border border-border-crisp rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-md border ${severityCls(a.severity)}`}>{a.severity}</span>
                      <span className="font-semibold text-text-primary text-[13px]">{a.title}</span>
                      {!a.is_read && <span className="px-1.5 py-0.5 rounded bg-risk-critical-bg text-error font-mono text-[10px] font-bold uppercase border border-error/25">Unread</span>}
                    </div>
                    {a.message && <p className="text-[13px] text-text-secondary leading-relaxed">{a.message}</p>}
                    <p className="text-[12px] text-text-muted mt-2 font-mono">{new Date(a.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 flex flex-col gap-space-base lg:sticky lg:top-20">
          <div className={`${cardCls} overflow-hidden`}>
            <div className="px-space-lg pt-space-lg pb-2">
              <p className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">Geospatial</p>
              <h2 className="text-base font-semibold text-text-primary mt-0.5">Project location</h2>
            </div>
            <ProjectMap project={project} className="h-[340px]" />
          </div>

          <div className="grid grid-cols-2 gap-space-base">
            {[
              { label: 'Delay days', value: `${project.delay_days}d`, meta: 'since target baseline', cls: 'text-error' },
              { label: 'Est. lead time', value: `${project.lead_time_days}d`, meta: 'acquisition lifecycle', cls: 'text-text-primary' },
              { label: 'PAFs / Mouzas', value: Number(project.mouzas_affected || 0).toLocaleString(), meta: 'affected families', cls: 'text-text-primary' },
              { label: 'Start → Target', value: `${fmtDate(project.start_date)}`, value2: `→ ${fmtDate(project.target_date)}`, meta: 'schedule window', cls: 'text-text-primary' },
            ].map((c) => (
              <div key={c.label} className={`${cardCls} p-space-md`}>
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">{c.label}</span>
                <p className={`text-lg font-bold mt-1 tabular-nums ${c.cls}`}>{c.value}</p>
                {c.value2 && <p className="text-[13px] font-semibold text-text-primary">{c.value2}</p>}
                <p className="text-[11px] text-text-muted mt-1">{c.meta}</p>
              </div>
            ))}
          </div>

          <div className={`${cardCls} p-space-lg border-l-4 border-l-primary`}>
            <p className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">AI diagnostic</p>
            <h2 className="text-base font-semibold text-text-primary mt-1 mb-2">Execution readiness</h2>
            <p className="text-[13px] text-text-secondary leading-relaxed">
              {score >= 75
                ? `Critical delay probability (${score.toFixed(0)}%) driven primarily by ${drivers[0]?.factor || 'statutory bottlenecks'}. Recommended immediate empowered-committee escalation and compensation disbursal acceleration.`
                : score >= 50
                  ? `Elevated delay probability (${score.toFixed(0)}%) — monitor ${drivers[0]?.factor || 'gazette notification timelines'} and streamline consent documentation.`
                  : `Low delay probability (${score.toFixed(0)}%). Acquisition pipeline on track; re-score recommended at next statutory milestone.`}
            </p>
            {canEdit && (
              <div className="mt-4 pt-3 border-t border-border-crisp">
                <div className="flex items-center gap-2">
                  <label htmlFor="project-status" className="text-[12px] font-medium text-text-muted">Update status</label>
                  <select id="project-status" value={project.status || 'planned'} onChange={(e) => setProject((p) => ({ ...p, status: e.target.value }))} className="bg-surface-container border border-border-crisp text-text-primary text-[13px] font-medium py-1.5 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer appearance-none">
                    {['planned', 'active', 'on_hold', 'completed', 'cancelled'].map((s) => (
                      <option key={s} value={s}>{String(s).replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                  <span className="ml-auto text-[11px] text-text-muted font-mono">demo · local state</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button className="px-3.5 py-2 rounded-lg bg-risk-critical-bg border border-error/25 text-error text-[13px] font-semibold transition-colors hover:bg-risk-critical hover:text-white">Escalate review</button>
                  <button className="px-3.5 py-2 rounded-lg bg-primary text-white text-[13px] font-semibold transition-colors hover:bg-accent-cyan-deep">Run re-score</button>
                </div>
              </div>
            )}
          </div>

          <div className={`${cardCls} p-space-lg`}>
            <h2 className="text-base font-semibold text-text-primary mb-2">Project snapshot</h2>
            <dl className="divide-y divide-border-crisp text-[13px]">
              {[
                ['Project ID', project.code],
                ['Sector / type', project.project_type],
                ['State', project.district],
                ['District', project.block],
                ['Risk score', `${score.toFixed(0)} / 100`],
                ['Status', project.status],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-2">
                  <dt className="text-text-muted">{k}</dt>
                  <dd className="font-mono text-[13px] text-text-primary font-semibold capitalize">{v || '—'}</dd>
                </div>
              ))}
            </dl>
          </div>

          <Link to="/analytics" className="inline-flex items-center gap-1 text-[12px] font-medium text-text-muted hover:text-primary transition-colors">
            View district analytics
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </Link>
        </div>
      </div>
    </AppShell>
  )
}