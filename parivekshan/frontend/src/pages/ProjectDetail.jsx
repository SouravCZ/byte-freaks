import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import RiskTag from '../components/ui/RiskTag'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function severityCls(sev) {
  switch (sev) {
    case 'critical': return 'bg-red-50 text-red-700 border-red-200'
    case 'high': return 'bg-orange-50 text-orange-700 border-orange-200'
    case 'moderate': return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'low': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    default: return 'bg-slate-50 text-slate-700 border-slate-200'
  }
}

function statusCls(status) {
  return status === 'active' ? 'bg-navy-500/10 text-navy-700' : 'bg-slate-100 text-slate-700'
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString()
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
          <div className="w-10 h-10 border-4 border-navy-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 text-sm">Loading project...</p>
        </div>
      </AppShell>
    )
  }

  if (error || !project) {
    return (
      <AppShell title="Project Detail" subtitle={id}>
        <div className="bg-white border border-red-200 rounded-lg p-6 max-w-md mx-auto text-center">
          <p className="text-red-600 font-semibold mb-2">Could not load project</p>
          <p className="text-sm text-slate-500">{error || 'Project not found'}</p>
          <Link to="/projects" className="inline-block mt-4 text-navy-500 text-sm font-semibold hover:underline">← Back to projects</Link>
        </div>
      </AppShell>
    )
  }

  const maxDriver = project.drivers && project.drivers.length
    ? Math.max(...project.drivers.map((d) => Number(d.impact_pct)))
    : 100

  return (
    <AppShell title={project.name} subtitle={`${project.code} · ${project.block || '—'} · ${project.district || ''} · ${project.project_type}`}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <RiskTag score={project.risk_score} />
          <span className={`px-2.5 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider capitalize rounded ${statusCls(project.status)}`}>
            {project.status}
          </span>
          <Link to="/projects" className="ml-auto text-xs font-mono text-navy-500 font-semibold hover:underline">← All projects</Link>
        </div>

        {project.description && (
          <p className="text-sm text-slate-600 leading-relaxed bg-white border border-slate-200 rounded-lg p-4">{project.description}</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="label-caps text-slate-400 mb-1">Delay Days</p>
            <p className="text-2xl font-bold text-red-600 tabular-nums">{project.delay_days}d</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="label-caps text-slate-400 mb-1">Lead Time</p>
            <p className="text-2xl font-bold text-slate-900 tabular-nums">{project.lead_time_days}d</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="label-caps text-slate-400 mb-1">Mouzas Affected</p>
            <p className="text-2xl font-bold text-slate-900 tabular-nums">{project.mouzas_affected}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="label-caps text-slate-400 mb-1">Start / Target</p>
            <p className="text-sm font-semibold text-slate-900">{fmtDate(project.start_date)} → {fmtDate(project.target_date)}</p>
          </div>
        </div>

        {project.drivers && project.drivers.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h2 className="font-bold text-slate-900 mb-1">Risk Drivers</h2>
            <p className="label-caps text-slate-400 mb-4">SHAP-style factor attribution</p>
            <div className="space-y-3">
              {project.drivers.map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-400 w-6 tabular-nums">{i + 1}.</span>
                  <span className="text-sm text-slate-700 w-64 shrink-0">{d.factor}</span>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${(Number(d.impact_pct) / maxDriver) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-mono text-slate-600 w-12 text-right tabular-nums">{Number(d.impact_pct).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {project.history && project.history.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h2 className="font-bold text-slate-900 mb-1">Risk History</h2>
            <p className="label-caps text-slate-400 mb-4">12-month snapshot</p>
            <div className="flex items-end gap-1.5 h-24">
              {project.history.map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 justify-end">
                  <span className="text-[9px] font-mono text-slate-400 tabular-nums">{Number(h.risk_score).toFixed(0)}</span>
                  <div
                    className={`w-full rounded ${Number(h.risk_score) >= 75 ? 'bg-red-400' : Number(h.risk_score) >= 50 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                    style={{ height: `${Math.min(Number(h.risk_score), 100)}%` }}
                  ></div>
                  <span className="text-[9px] font-mono text-slate-400">{new Date(h.recorded_on).toLocaleDateString(undefined, { month: 'short' })}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {project.alerts && project.alerts.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h2 className="font-bold text-slate-900 mb-4">Alerts</h2>
            <div className="space-y-3">
              {project.alerts.map((a) => (
                <div key={a.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider rounded border ${severityCls(a.severity)}`}>
                      {a.severity}
                    </span>
                    <span className="font-semibold text-slate-900 text-sm">{a.title}</span>
                  </div>
                  {a.message && <p className="text-sm text-slate-600">{a.message}</p>}
                  <p className="text-xs text-slate-400 mt-2">{new Date(a.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {(!project.drivers || project.drivers.length === 0) && (!project.history || project.history.length === 0) && (!project.alerts || project.alerts.length === 0) && (
          <p className="text-center text-slate-400 py-8">No drivers or alerts recorded for this project yet.</p>
        )}
      </div>
    </AppShell>
  )
}