import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const ML_BASE = import.meta.env.VITE_ML_URL || 'http://localhost:8001'

const RISK_COLORS = {
  Low: '#0e7c66',
  Medium: '#b4650a',
  High: '#c0392b',
  Critical: '#6d28d9',
}

const CATEGORY_ORDER = ['Low', 'Medium', 'High', 'Critical']

function riskBadge(cat) {
  const base = 'px-2 py-0.5 text-[11px] font-mono font-semibold rounded-md border'
  switch (cat) {
    case 'Critical': return `${base} bg-[#f3e8fd] text-[#5b21b6] border-[#dfc3f5]`
    case 'High': return `${base} bg-risk-critical-bg text-error border-error/25`
    case 'Medium': return `${base} bg-risk-warning-bg text-risk-warning border-risk-warning/30`
    case 'Low': return `${base} bg-risk-success-bg text-risk-success border-risk-success/30`
    default: return `${base} bg-surface-container text-text-secondary border-border-strong`
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-text-secondary">Fetching ML predictions… {progress}/{total}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-surface-card border border-error/25 rounded-xl p-6 max-w-md text-center shadow-card">
          <span className="material-symbols-outlined text-[32px] text-error mb-2">error_outline</span>
          <p className="font-semibold text-text-primary mb-1">Failed to reach ML server</p>
          <p className="text-sm text-text-muted">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <header className="bg-navy-900">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/analytics" className="flex items-center gap-1 text-[13px] font-medium text-navy-200 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              ML Dashboard
            </Link>
            <span className="h-5 w-px bg-white/15"></span>
            <h1 className="text-base font-semibold text-white tracking-tight">ML risk predictions · West Bengal</h1>
          </div>
          <span className="text-[12px] font-mono text-navy-200">{results.length} predictions</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 pt-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORY_ORDER.map(cat => (
            <div key={cat} className="bg-surface-card rounded-xl border border-border-crisp shadow-card p-4 text-center">
              <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: RISK_COLORS[cat] }}></div>
              <p className="text-2xl font-bold text-text-primary tabular-nums">{results.filter(r => r.risk_category === cat).length}</p>
              <p className="text-[12px] font-mono text-text-muted">{cat}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((r, i) => (
            <div key={i} className="bg-surface-card rounded-xl border border-border-crisp shadow-card p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="font-mono text-[11px] text-text-muted">{r._case_id || `#${i + 1}`}</span>
                  {r._project_name && (
                    <p className="text-sm font-semibold text-text-primary mt-1 truncate">{r._project_name}</p>
                  )}
                  {r._state && (
                    <p className="font-mono text-[11px] text-text-muted">{r._district ? `${r._district}, ` : ''}{r._state}</p>
                  )}
                </div>
                {r.risk_category && (
                  <span className={riskBadge(r.risk_category)}>{r.risk_category}</span>
                )}
              </div>

              {r.risk_score != null && (
                <div>
                  <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider mb-1">Risk score</p>
                  <p className="text-3xl font-bold text-text-primary tabular-nums">{(r.risk_score * 100).toFixed(0)}%</p>
                </div>
              )}

              {r.probabilities && (
                <div>
                  <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider mb-2">Probabilities</p>
                  {CATEGORY_ORDER.map(cat => (
                    <div key={cat} className="flex items-center gap-2 mb-1">
                      <span className="w-16 text-[10px] font-mono text-text-secondary font-semibold">{cat}</span>
                      <div className="flex-1 h-2 bg-surface-dim rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(r.probabilities[cat] || 0) * 100}%`, backgroundColor: RISK_COLORS[cat] }}></div>
                      </div>
                      <span className="w-10 text-right text-[10px] font-mono text-text-secondary tabular-nums">{((r.probabilities[cat] || 0) * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              )}

              {r.explanation?.summary && (
                <p className="text-[13px] text-text-secondary leading-relaxed">{r.explanation.summary}</p>
              )}

              {r.top_factors && r.top_factors.length > 0 && (
                <div>
                  <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider mb-2">Top factors</p>
                  <div className="space-y-1">
                    {r.top_factors.map((f, j) => (
                      <div key={j} className="flex items-center justify-between text-[12px]">
                        <span className="text-text-secondary font-medium truncate pr-2">{f.feature}</span>
                        <span className={`font-mono shrink-0 ${f.direction === 'increases risk' ? 'text-error' : 'text-risk-success'}`}>
                          {f.direction === 'increases risk' ? '+' : ''}{f.impact != null ? (f.impact * 100).toFixed(1) : '—'}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {r.explanation?.recommendations && r.explanation.recommendations.length > 0 && (
                <div>
                  <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider mb-2">Recommendations</p>
                  <ul className="space-y-1 text-[12px] text-text-secondary list-disc list-inside">
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