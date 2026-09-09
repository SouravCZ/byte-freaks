import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const ML_BASE = import.meta.env.VITE_ML_URL || 'http://localhost:8001'

const RISK_COLORS = {
  Low: '#10b981',
  Medium: '#f59e0b',
  High: '#ef4444',
  Critical: '#7c3aed',
}

const CATEGORY_ORDER = ['Low', 'Medium', 'High', 'Critical']

function riskBadge(cat) {
  const base = 'px-2 py-0.5 text-xs font-mono font-semibold rounded border'
  switch (cat) {
    case 'Critical': return `${base} bg-purple-100 text-black border-purple-300`
    case 'High': return `${base} bg-red-100 text-black border-red-300`
    case 'Medium': return `${base} bg-amber-100 text-black border-amber-300`
    case 'Low': return `${base} bg-emerald-100 text-black border-emerald-300`
    default: return `${base} bg-slate-100 text-black border-slate-300`
  }
}

function parseCSV(text) {
  const lines = text.trim().split('\n')
  const headers = lines[0].split(',')
  return lines.slice(1).map(line => {
    const values = line.split(',')
    const obj = {}
    headers.forEach((h, i) => { obj[h.trim()] = values[i]?.trim() || '' })
    return obj
  })
}

function toBool(v) {
  return String(v).trim().toLowerCase() === 'true' ? 1 : 0
}

function projectToMLPayload(p) {
  return {
    project_type: p.project_type || 'Infrastructure',
    state: p.state || 'West Bengal',
    status: p.status || 'active',
    dispute_type: (p.dispute_type && p.dispute_type !== 'NaN') ? p.dispute_type : 'none',
    area_acquired_hectares: Number(p.area_acquired_hectares) || 5,
    dispute_duration_days: Number(p.dispute_duration_days) || 0,
    pending_approvals_count: Number(p.pending_approvals_count) || 0,
    avg_approval_turnaround_days: Number(p.avg_approval_turnaround_days) || 20,
    stakeholder_responsiveness_score: Number(p.stakeholder_responsiveness_score) || 5,
    compensation_assessed_inr: Number(p.compensation_assessed_inr) || 500000,
    compensation_disbursed_inr: Number(p.compensation_disbursed_inr) || 250000,
    compensation_disbursed_pct: Number(p.compensation_disbursed_pct) || 0.5,
    affected_families: Number(p.affected_families) || 50,
    displaced_families: Number(p.displaced_families) || 20,
    rr_progress_percent: Number(p.rr_progress_percent) || 50,
    cohort_benchmark_days: Number(p.cohort_benchmark_days) || 450,
    legal_dispute_flag: toBool(p.legal_dispute_flag),
    documentation_complete: toBool(p.documentation_complete),
    rr_required: toBool(p.rr_required),
    duration_proposed_to_scrutiny: Number(p.duration_proposed_to_scrutiny) || 25,
    duration_scrutiny_to_notification: Number(p.duration_scrutiny_to_notification) || 55,
    duration_notification_to_declaration: Number(p.duration_notification_to_declaration) || 75,
    duration_declaration_to_award: Number(p.duration_declaration_to_award) || 60,
    duration_award_to_compensation: Number(p.duration_award_to_compensation) || 65,
    duration_compensation_to_possession: Number(p.duration_compensation_to_possession) || 55,
    duration_possession_to_closed: Number(p.duration_possession_to_closed) || 50,
  }
}

export default function MLProjects() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/west_bengal_projects.csv')
        const text = await res.text()
        const data = parseCSV(text)
        setTotal(data.length)

        const preds = []
        for (let i = 0; i < data.length; i++) {
          setProgress(i + 1)
          try {
            const payload = projectToMLPayload(data[i])
            const r = await fetch(`${ML_BASE}/predict`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            })
            if (r.ok) {
              const result = await r.json()
              result._case_id = data[i].case_id || ''
              result._project_name = data[i].project_name || ''
              result._state = data[i].state || ''
              result._district = data[i].district || ''
              preds.push(result)
            }
          } catch {
            // skip failed predictions
          }
        }
        setResults(preds)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-navy-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black text-sm">Fetching ML predictions... {progress}/{total}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">Failed to reach ML server</p>
          <p className="text-sm text-black">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/analytics" className="text-black text-sm font-semibold hover:underline">&larr; ML Dashboard</Link>
            <h1 className="text-lg font-bold text-black">ML Predictions</h1>
          </div>
          <span className="text-sm font-mono text-black">{results.length} predictions</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Risk summary */}
        <div className="grid grid-cols-4 gap-3">
          {CATEGORY_ORDER.map(cat => (
            <div key={cat} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: RISK_COLORS[cat] }}></div>
              <p className="text-2xl font-bold text-black">{results.filter(r => r.risk_category === cat).length}</p>
              <p className="text-xs font-mono text-black">{cat}</p>
            </div>
          ))}
        </div>

        {/* Prediction cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((r, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs text-black">{r._case_id || `#${i + 1}`}</span>
                  {r._project_name && (
                    <p className="text-sm font-semibold text-black mt-1">{r._project_name}</p>
                  )}
                  {r._state && (
                    <p className="text-[10px] font-mono text-slate-500">{r._district ? `${r._district}, ` : ''}{r._state}</p>
                  )}
                </div>
                {r.risk_category && (
                  <span className={riskBadge(r.risk_category)}>{r.risk_category}</span>
                )}
              </div>

              {r.risk_score != null && (
                <div>
                  <p className="text-[10px] font-mono text-black uppercase mb-1">Risk Score</p>
                  <p className="text-3xl font-bold text-black">{(r.risk_score * 100).toFixed(0)}%</p>
                </div>
              )}

              {r.probabilities && (
                <div>
                  <p className="text-[10px] font-mono text-black uppercase mb-2">Probabilities</p>
                  {CATEGORY_ORDER.map(cat => (
                    <div key={cat} className="flex items-center gap-2 mb-1">
                      <span className="w-16 text-[10px] font-mono text-black font-semibold">{cat}</span>
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(r.probabilities[cat] || 0) * 100}%`, backgroundColor: RISK_COLORS[cat] }}></div>
                      </div>
                      <span className="w-10 text-right text-[10px] font-mono text-black">{((r.probabilities[cat] || 0) * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              )}

              {r.explanation?.summary && (
                <p className="text-sm text-black">{r.explanation.summary}</p>
              )}

              {r.top_factors && r.top_factors.length > 0 && (
                <div>
                  <p className="text-[10px] font-mono text-black uppercase mb-2">Top Factors</p>
                  <div className="space-y-1">
                    {r.top_factors.map((f, j) => (
                      <div key={j} className="flex items-center justify-between text-xs">
                        <span className="text-black font-medium">{f.feature}</span>
                        <span className={`font-mono ${f.direction === 'increases risk' ? 'text-red-600' : 'text-emerald-600'}`}>
                          {f.direction === 'increases risk' ? '+' : ''}{f.impact != null ? (f.impact * 100).toFixed(1) : '—'}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {r.explanation?.recommendations && r.explanation.recommendations.length > 0 && (
                <div>
                  <p className="text-[10px] font-mono text-black uppercase mb-2">Recommendations</p>
                  <ul className="space-y-1 text-xs text-black list-disc list-inside">
                    {r.explanation.recommendations.map((rec, j) => (
                      <li key={j}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
