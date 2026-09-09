import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const ML_BASE = import.meta.env.VITE_ML_URL || 'http://localhost:8001'

const RISK_COLORS = {
  Low: '#10b981',
  Medium: '#f59e0b',
  High: '#ef4444',
  Critical: '#7c3aed',
}

const CATEGORY_ORDER = ['Low', 'Medium', 'High', 'Critical']

function riskBadge(cat) {
  const base = 'px-3 py-1 text-sm font-mono font-semibold rounded border'
  switch (cat) {
    case 'Critical': return `${base} bg-purple-100 text-black border-purple-300`
    case 'High': return `${base} bg-red-100 text-black border-red-300`
    case 'Medium': return `${base} bg-amber-100 text-black border-amber-300`
    case 'Low': return `${base} bg-emerald-100 text-black border-emerald-300`
    default: return `${base} bg-slate-100 text-black border-slate-300`
  }
}

function severityCls(sev) {
  switch (sev) {
    case 'critical': return 'bg-red-100 text-black border-red-300'
    case 'high': return 'bg-orange-100 text-black border-orange-300'
    case 'moderate': return 'bg-amber-100 text-black border-amber-300'
    case 'low': return 'bg-emerald-100 text-black border-emerald-300'
    default: return 'bg-slate-100 text-black border-slate-300'
  }
}

function fmtDate(d) {
  if (!d) return '---'
  return new Date(d).toLocaleDateString()
}

export default function ProjectDetail() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [mlPrediction, setMlPrediction] = useState(null)
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
      .then(async (data) => {
        setProject(data)

        // Fetch ML prediction for this project
        try {
          const mlPayload = {
            project_type: data.project_type || 'Infrastructure',
            state: 'West Bengal',
            status: data.status || 'active',
            dispute_type: 'none',
            area_acquired_hectares: data.mouzas_affected * 2.5 || 5.0,
            dispute_duration_days: data.delay_days || 0,
            pending_approvals_count: Math.floor((data.risk_score || 0) / 25),
            avg_approval_turnaround_days: 20.0,
            stakeholder_responsiveness_score: Math.max(1, 10 - (data.risk_score || 0) / 10),
            compensation_assessed_inr: 500000,
            compensation_disbursed_inr: 500000 * (1 - (data.risk_score || 0) / 100),
            compensation_disbursed_pct: 1 - (data.risk_score || 0) / 100,
            affected_families: data.mouzas_affected * 8 || 50,
            displaced_families: Math.floor((data.mouzas_affected * 8 || 50) * 0.4),
            rr_progress_percent: Math.max(0, 100 - (data.risk_score || 0)),
            cohort_benchmark_days: 450,
            legal_dispute_flag: data.risk_score > 60 ? 1 : 0,
            documentation_complete: data.risk_score < 50 ? 1 : 0,
            rr_required: 0,
          }
          const mlRes = await fetch(`${ML_BASE}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mlPayload),
            signal: ctrl.signal,
          })
          if (mlRes.ok) {
            const mlData = await mlRes.json()
            setMlPrediction(mlData)
          }
        } catch {
          // ML server may be offline, that's OK
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message)
      })
      .finally(() => setLoading(false))
    return () => ctrl.abort()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-navy-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black text-sm">Loading project...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white border border-red-200 rounded-xl p-6 max-w-md text-center">
          <p className="text-black font-semibold mb-2">Could not load project</p>
          <p className="text-sm text-black">{error || 'Project not found'}</p>
          <Link to="/projects" className="inline-block mt-4 text-black text-sm font-semibold hover:underline">&larr; Back to projects</Link>
        </div>
      </div>
    )
  }

  const maxDriver = project.drivers && project.drivers.length
    ? Math.max(...project.drivers.map((d) => Number(d.impact_pct)))
    : 100

  // Prepare probability chart data
  const probData = mlPrediction?.probabilities
    ? CATEGORY_ORDER.map(cat => ({
        name: cat,
        probability: Number(((mlPrediction.probabilities[cat] || 0) * 100).toFixed(1)),
        fill: RISK_COLORS[cat],
      }))
    : []

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/projects" className="text-black text-sm font-semibold hover:underline">&larr; All projects</Link>
          <span className="font-mono text-black text-sm">{project.code}</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* Project Header + ML Risk Badge */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-black">{project.name}</h1>
              <p className="text-sm text-black mt-1">
                {project.block || '---'} - {project.district || ''} - {project.project_type}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {mlPrediction && (
                <span className={riskBadge(mlPrediction.risk_category)}>{mlPrediction.risk_category}</span>
              )}
              <span className="px-3 py-1 text-sm font-mono font-semibold rounded border bg-slate-100 text-black border-slate-300">
                DB: {Number(project.risk_score).toFixed(0)}%
              </span>
              <span className={`px-3 py-1 text-sm font-semibold capitalize rounded ${project.status === 'active' ? 'bg-navy-500/10 text-black' : 'bg-slate-100 text-black'}`}>
                {project.status}
              </span>
            </div>
          </div>

          {project.description && (
            <p className="text-sm text-black leading-relaxed mb-6">{project.description}</p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-xs font-mono text-black uppercase tracking-wider mb-1">Delay Days</p>
              <p className="text-xl font-bold text-black">{project.delay_days}d</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-xs font-mono text-black uppercase tracking-wider mb-1">Lead Time</p>
              <p className="text-xl font-bold text-black">{project.lead_time_days}d</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-xs font-mono text-black uppercase tracking-wider mb-1">Mouzas Affected</p>
              <p className="text-xl font-bold text-black">{project.mouzas_affected}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-xs font-mono text-black uppercase tracking-wider mb-1">Start / Target</p>
              <p className="text-sm font-semibold text-black">{fmtDate(project.start_date)} &rarr; {fmtDate(project.target_date)}</p>
            </div>
          </div>
        </div>

        {/* ML Prediction Details */}
        {mlPrediction && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-black">ML Prediction</h2>
                <p className="text-xs text-black">XGBoost multi-class model (West Bengal)</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-black">
                  {(mlPrediction.risk_score * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-black">Confidence</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Probabilities */}
              <div>
                <p className="text-xs font-mono text-black uppercase mb-2">Class Probabilities</p>
                <div className="space-y-2">
                  {CATEGORY_ORDER.map(cat => {
                    const pct = (mlPrediction.probabilities[cat] || 0) * 100
                    return (
                      <div key={cat} className="flex items-center gap-3">
                        <span className="w-20 text-xs font-mono text-black font-semibold">{cat}</span>
                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: RISK_COLORS[cat] }}></div>
                        </div>
                        <span className="w-12 text-right text-xs font-mono text-black">{pct.toFixed(1)}%</span>
                      </div>
                    )
                  })}
                </div>

                {probData.length > 0 && (
                  <div className="mt-4">
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={probData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} unit="%" />
                        <Tooltip formatter={(v) => [`${v}%`, 'Probability']} />
                        <Bar dataKey="probability" radius={[4, 4, 0, 0]}>
                          {probData.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Top Factors */}
              <div>
                <p className="text-xs font-mono text-black uppercase mb-2">Top Risk Factors (SHAP)</p>
                {mlPrediction.top_factors && mlPrediction.top_factors.length > 0 ? (
                  <div className="space-y-2">
                    {mlPrediction.top_factors.map((f, i) => {
                      const isNeg = f.impact < 0
                      return (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className="text-xs font-mono text-black w-4">{i + 1}.</span>
                          <span className="w-40 text-black shrink-0 truncate text-xs" title={f.feature}>
                            {f.feature.replace(/_/g, ' ')}
                          </span>
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${isNeg ? 'bg-emerald-500' : 'bg-red-500'}`}
                              style={{ width: `${Math.min(100, Math.abs(f.impact) * 200)}%` }}></div>
                          </div>
                          <span className="text-[10px] font-mono w-20 text-right text-black">
                            {isNeg ? 'DOWN' : 'UP'} {(Math.abs(f.impact) * 100).toFixed(1)}%
                          </span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-black py-4 text-center">No SHAP factors available</p>
                )}

                {/* Explanation */}
                {mlPrediction.explanation && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <p className="text-xs font-mono text-black mb-1">Assessment</p>
                    <p className="text-sm text-black mb-2">{mlPrediction.explanation.summary}</p>
                    {mlPrediction.explanation.recommendations && mlPrediction.explanation.recommendations.length > 0 && (
                      <div>
                        <p className="text-xs font-mono text-black mb-1">Recommendations</p>
                        <ul className="space-y-1">
                          {mlPrediction.explanation.recommendations.map((r, i) => (
                            <li key={i} className="text-xs text-black flex items-start gap-1.5">
                              <span className="text-black mt-0.5">*</span>
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* DB Risk Drivers (legacy) */}
        {project.drivers && project.drivers.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-black mb-1">Database Risk Drivers</h2>
            <p className="text-xs text-black mb-4">Factor attribution from database records</p>
            <div className="space-y-3">
              {project.drivers.map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-black w-6">{i + 1}.</span>
                  <span className="text-sm text-black w-64 shrink-0">{d.factor}</span>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${(Number(d.impact_pct) / maxDriver) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-mono text-black w-12 text-right">{Number(d.impact_pct).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alerts */}
        {project.alerts && project.alerts.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-black mb-4">Alerts</h2>
            <div className="space-y-3">
              {project.alerts.map((a) => (
                <div key={a.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 text-xs font-mono font-semibold uppercase rounded border ${severityCls(a.severity)}`}>
                      {a.severity}
                    </span>
                    <span className="font-semibold text-black text-sm">{a.title}</span>
                  </div>
                  {a.message && <p className="text-sm text-black">{a.message}</p>}
                  <p className="text-xs text-black mt-2">{new Date(a.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!project.drivers?.length && !project.alerts?.length && !mlPrediction && (
          <p className="text-center text-black py-8">No ML predictions or alerts available for this project yet.</p>
        )}
      </main>
    </div>
  )
}
