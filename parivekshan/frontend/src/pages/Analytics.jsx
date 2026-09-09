import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const ML_BASE = import.meta.env.VITE_ML_URL || 'http://localhost:8001'

const RISK_COLORS = {
  Low: '#10b981',
  Medium: '#f59e0b',
  High: '#ef4444',
  Critical: '#7c3aed',
}

const CATEGORY_ORDER = ['Low', 'Medium', 'High', 'Critical']

const PROJECT_TYPES = [
  {
    name: 'Highway',
    icon: '🛣',
    desc: 'NH widening, bypass, expressway',
    defaults: {
      project_type: 'Highway', state: 'West Bengal', status: 'Under Scrutiny',
      dispute_type: 'none', area_acquired_hectares: 45, dispute_duration_days: 120,
      pending_approvals_count: 3, avg_approval_turnaround_days: 30,
      stakeholder_responsiveness_score: 4.5, compensation_assessed_inr: 850000,
      compensation_disbursed_inr: 340000, compensation_disbursed_pct: 0.4,
      affected_families: 150, displaced_families: 60, rr_progress_percent: 35,
      cohort_benchmark_days: 450, legal_dispute_flag: 1, documentation_complete: 0,
      rr_required: 1,
      duration_proposed_to_scrutiny: 28, duration_scrutiny_to_notification: 65,
      duration_notification_to_declaration: 85, duration_declaration_to_award: 70,
      duration_award_to_compensation: 80, duration_compensation_to_possession: 60,
      duration_possession_to_closed: 55,
    },
  },
  {
    name: 'Railway',
    icon: '🚂',
    desc: 'Rail line, doubling, station redevelopment',
    defaults: {
      project_type: 'Railway', state: 'West Bengal', status: 'Preliminary Notification Issued',
      dispute_type: 'none', area_acquired_hectares: 30, dispute_duration_days: 60,
      pending_approvals_count: 2, avg_approval_turnaround_days: 25,
      stakeholder_responsiveness_score: 5.5, compensation_assessed_inr: 600000,
      compensation_disbursed_inr: 420000, compensation_disbursed_pct: 0.7,
      affected_families: 100, displaced_families: 25, rr_progress_percent: 60,
      cohort_benchmark_days: 480, legal_dispute_flag: 0, documentation_complete: 1,
      rr_required: 0,
      duration_proposed_to_scrutiny: 22, duration_scrutiny_to_notification: 50,
      duration_notification_to_declaration: 70, duration_declaration_to_award: 55,
      duration_award_to_compensation: 65, duration_compensation_to_possession: 50,
      duration_possession_to_closed: 45,
    },
  },
  {
    name: 'Industrial Corridor',
    icon: '🏭',
    desc: 'DMIC nodes, growth corridors',
    defaults: {
      project_type: 'Industrial Corridor', state: 'West Bengal', status: 'Award Passed',
      dispute_type: 'none', area_acquired_hectares: 80, dispute_duration_days: 90,
      pending_approvals_count: 4, avg_approval_turnaround_days: 35,
      stakeholder_responsiveness_score: 3.8, compensation_assessed_inr: 1200000,
      compensation_disbursed_inr: 360000, compensation_disbursed_pct: 0.3,
      affected_families: 200, displaced_families: 80, rr_progress_percent: 25,
      cohort_benchmark_days: 540, legal_dispute_flag: 1, documentation_complete: 0,
      rr_required: 1,
      duration_proposed_to_scrutiny: 35, duration_scrutiny_to_notification: 80,
      duration_notification_to_declaration: 100, duration_declaration_to_award: 85,
      duration_award_to_compensation: 95, duration_compensation_to_possession: 80,
      duration_possession_to_closed: 70,
    },
  },
  {
    name: 'Urban Development',
    icon: '🏙',
    desc: 'Metro, ring road, smart city',
    defaults: {
      project_type: 'Urban Development', state: 'West Bengal', status: 'Declaration Issued',
      dispute_type: 'none', area_acquired_hectares: 15, dispute_duration_days: 30,
      pending_approvals_count: 1, avg_approval_turnaround_days: 20,
      stakeholder_responsiveness_score: 6.0, compensation_assessed_inr: 400000,
      compensation_disbursed_inr: 320000, compensation_disbursed_pct: 0.8,
      affected_families: 60, displaced_families: 15, rr_progress_percent: 70,
      cohort_benchmark_days: 450, legal_dispute_flag: 0, documentation_complete: 1,
      rr_required: 0,
      duration_proposed_to_scrutiny: 20, duration_scrutiny_to_notification: 45,
      duration_notification_to_declaration: 65, duration_declaration_to_award: 50,
      duration_award_to_compensation: 55, duration_compensation_to_possession: 45,
      duration_possession_to_closed: 40,
    },
  },
  {
    name: 'Renewable Energy',
    icon: '☀',
    desc: 'Solar park, wind-solar hybrid',
    defaults: {
      project_type: 'Renewable Energy', state: 'West Bengal', status: 'Compensation Disbursed',
      dispute_type: 'none', area_acquired_hectares: 5, dispute_duration_days: 0,
      pending_approvals_count: 1, avg_approval_turnaround_days: 15,
      stakeholder_responsiveness_score: 7.0, compensation_assessed_inr: 200000,
      compensation_disbursed_inr: 180000, compensation_disbursed_pct: 0.9,
      affected_families: 30, displaced_families: 5, rr_progress_percent: 85,
      cohort_benchmark_days: 330, legal_dispute_flag: 0, documentation_complete: 1,
      rr_required: 0,
      duration_proposed_to_scrutiny: 18, duration_scrutiny_to_notification: 40,
      duration_notification_to_declaration: 55, duration_declaration_to_award: 45,
      duration_award_to_compensation: 50, duration_compensation_to_possession: 42,
      duration_possession_to_closed: 38,
    },
  },
  {
    name: 'Irrigation',
    icon: '💧',
    desc: 'Canal modernization, command area',
    defaults: {
      project_type: 'Irrigation', state: 'West Bengal', status: 'Under Scrutiny',
      dispute_type: 'none', area_acquired_hectares: 25, dispute_duration_days: 45,
      pending_approvals_count: 2, avg_approval_turnaround_days: 22,
      stakeholder_responsiveness_score: 5.0, compensation_assessed_inr: 300000,
      compensation_disbursed_inr: 210000, compensation_disbursed_pct: 0.7,
      affected_families: 90, displaced_families: 20, rr_progress_percent: 55,
      cohort_benchmark_days: 390, legal_dispute_flag: 0, documentation_complete: 1,
      rr_required: 0,
      duration_proposed_to_scrutiny: 20, duration_scrutiny_to_notification: 48,
      duration_notification_to_declaration: 62, duration_declaration_to_award: 52,
      duration_award_to_compensation: 58, duration_compensation_to_possession: 50,
      duration_possession_to_closed: 45,
    },
  },
]

function StatCard({ label, value, sub, color }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <p className="text-xs font-mono text-black uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color || 'text-black'}`}>{value}</p>
      {sub && <p className="text-xs text-black mt-1">{sub}</p>}
    </div>
  )
}

function riskBadge(cat, size) {
  const s = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
  const base = `${s} font-mono font-semibold rounded border`
  switch (cat) {
    case 'Critical': return `${base} bg-purple-100 text-black border-purple-300`
    case 'High': return `${base} bg-red-100 text-black border-red-300`
    case 'Medium': return `${base} bg-amber-100 text-black border-amber-300`
    case 'Low': return `${base} bg-emerald-100 text-black border-emerald-300`
    default: return `${base} bg-slate-100 text-black border-slate-300`
  }
}

function PredictionCard({ title, icon, desc, prediction, loading: isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{icon}</span>
          <h3 className="font-bold text-black">{title}</h3>
        </div>
        <div className="flex items-center justify-center py-6">
          <div className="w-6 h-6 border-2 border-navy-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-xs text-black">Predicting...</span>
        </div>
      </div>
    )
  }

  if (!prediction || prediction.error) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{icon}</span>
          <h3 className="font-bold text-black">{title}</h3>
        </div>
        <p className="text-xs text-black py-4 text-center">{prediction?.error || 'No data'}</p>
      </div>
    )
  }

  const p = prediction
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h3 className="font-bold text-black">{title}</h3>
        </div>
        <span className={riskBadge(p.risk_category, 'sm')}>{p.risk_category}</span>
      </div>
      {desc && <p className="text-[10px] text-black mb-3">{desc}</p>}

      <div className="flex items-end gap-3 mb-3">
        <p className="text-3xl font-bold text-black">
          {(p.risk_score * 100).toFixed(0)}%
        </p>
        <p className="text-[10px] text-black mb-1">confidence</p>
      </div>

      {/* Mini probability bars */}
      <div className="space-y-1 mb-3">
        {CATEGORY_ORDER.map(cat => (
          <div key={cat} className="flex items-center gap-2">
            <span className="w-14 text-[10px] font-mono text-black font-semibold">{cat}</span>
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${(p.probabilities[cat] || 0) * 100}%`, backgroundColor: RISK_COLORS[cat] }}></div>
            </div>
            <span className="w-10 text-right text-[10px] font-mono text-black">{((p.probabilities[cat] || 0) * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>

      {/* Top 3 factors */}
      {p.top_factors && p.top_factors.length > 0 && (
        <div className="pt-2 border-t border-slate-100">
          <p className="text-[10px] font-mono text-black mb-1">Top Factors</p>
          {p.top_factors.slice(0, 3).map((f, i) => {
            const isNeg = f.impact < 0
            return (
              <div key={i} className="flex items-center gap-2 text-[11px]">
                <span className="text-black w-3">{i + 1}.</span>
                <span className="w-32 text-black truncate" title={f.feature}>{f.feature.replace(/_/g, ' ')}</span>
                <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${isNeg ? 'bg-emerald-400' : 'bg-red-400'}`} style={{ width: `${Math.min(100, Math.abs(f.impact) * 200)}%` }}></div>
                </div>
                <span className="w-14 text-right font-mono text-black">
                  {isNeg ? '-' : '+'}{(Math.abs(f.impact) * 100).toFixed(0)}%
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Explanation */}
      {p.explanation && (
        <div className="mt-2 pt-2 border-t border-slate-100">
          <p className="text-[10px] text-black leading-relaxed">{p.explanation.summary}</p>
          {p.explanation.recommendations?.length > 0 && (
            <p className="text-[10px] text-black mt-1">{p.explanation.recommendations[0]}</p>
          )}
        </div>
      )}
    </div>
  )
}

function OverallCard({ predictions, loading }) {
  const loaded = Object.values(predictions).filter(p => p && !p.error)

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📊</span>
          <h3 className="text-lg font-bold text-black">Overall Risk Assessment</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-sm text-black">Computing aggregate...</span>
        </div>
      </div>
    )
  }

  if (loaded.length === 0) return null

  // Average probabilities across all types
  const avgProbs = {}
  CATEGORY_ORDER.forEach(c => { avgProbs[c] = 0 })
  loaded.forEach(p => {
    CATEGORY_ORDER.forEach(c => { avgProbs[c] += (p.probabilities[c] || 0) })
  })
  CATEGORY_ORDER.forEach(c => { avgProbs[c] /= loaded.length })

  const predIdx = CATEGORY_ORDER.indexOf(
    CATEGORY_ORDER.reduce((best, c) => avgProbs[c] > avgProbs[best] ? c : best, 'Low')
  )
  const overallCategory = CATEGORY_ORDER[predIdx]
  const overallScore = avgProbs[overallCategory]

  // Aggregate top factors (union, take top 5 by absolute impact)
  const factorMap = {}
  loaded.forEach(p => {
    p.top_factors?.forEach(f => {
      if (!factorMap[f.feature]) factorMap[f.feature] = { ...f, count: 0, totalImpact: 0 }
      factorMap[f.feature].count++
      factorMap[f.feature].totalImpact += f.impact
    })
  })
  const topFactors = Object.values(factorMap)
    .sort((a, b) => Math.abs(b.totalImpact) - Math.abs(a.totalImpact))
    .slice(0, 5)

  return (
    <div className="bg-white border-2 border-slate-300 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          <div>
            <h3 className="text-lg font-bold text-black">Overall Risk Assessment</h3>
            <p className="text-xs text-black">Average across all {loaded.length} project types</p>
          </div>
        </div>
        <span className="px-3 py-1 text-sm font-mono font-bold rounded border border-slate-300 bg-slate-100 text-black">
          {overallCategory}
        </span>
      </div>

      <div className="flex items-end gap-4 mb-5">
        <p className="text-5xl font-extrabold text-black">{(overallScore * 100).toFixed(0)}%</p>
        <div className="mb-1">
          <p className="text-xs text-black">Average confidence</p>
        </div>
      </div>

      {/* Probability bars */}
      <div className="space-y-2 mb-5">
        {CATEGORY_ORDER.map(cat => (
          <div key={cat} className="flex items-center gap-2">
            <span className="w-16 text-xs font-mono text-black font-semibold">{cat}</span>
            <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${avgProbs[cat] * 100}%`, backgroundColor: RISK_COLORS[cat] }}></div>
            </div>
            <span className="w-12 text-right text-xs font-mono text-black">{(avgProbs[cat] * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>

      {/* Top aggregate factors */}
      {topFactors.length > 0 && (
        <div className="pt-4 border-t border-slate-200">
          <p className="text-[10px] font-mono text-black uppercase mb-2">Most Influential Factors (across all types)</p>
          {topFactors.map((f, i) => {
            const avgImpact = f.totalImpact / f.count
            const isNeg = avgImpact < 0
            return (
              <div key={i} className="flex items-center gap-2 text-xs mb-1">
                <span className="text-black w-3">{i + 1}.</span>
                <span className="w-36 text-black truncate" title={f.feature}>{f.feature.replace(/_/g, ' ')}</span>
                <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${isNeg ? 'bg-emerald-400' : 'bg-red-400'}`} style={{ width: `${Math.min(100, Math.abs(avgImpact) * 200)}%` }}></div>
                </div>
                <span className="w-16 text-right font-mono text-black">
                  {isNeg ? '-' : '+'}{(Math.abs(avgImpact) * 100).toFixed(0)}%
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function Analytics() {
  const [mlHealth, setMlHealth] = useState(null)
  const [modelInfo, setModelInfo] = useState(null)
  const [typePredictions, setTypePredictions] = useState({})
  const [loading, setLoading] = useState(true)
  const [predictingTypes, setPredictingTypes] = useState(true)

  useEffect(() => {
    const ctrl = new AbortController()

    async function loadAll() {
      setLoading(true)

      // 1. Health + model info
      const [health, info] = await Promise.all([
        fetch(`${ML_BASE}/health`, { signal: ctrl.signal }).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`${ML_BASE}/model/info`, { signal: ctrl.signal }).then(r => r.ok ? r.json() : null).catch(() => null),
      ])
      setMlHealth(health)
      setModelInfo(info)
      setLoading(false)

      if (health?.status !== 'ok') {
        setPredictingTypes(false)
        return
      }

      // 2. Predict for each project type in parallel
      setPredictingTypes(true)
      const results = await Promise.all(
        PROJECT_TYPES.map(async (pt) => {
          try {
            const res = await fetch(`${ML_BASE}/predict`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(pt.defaults),
              signal: ctrl.signal,
            })
            if (!res.ok) return { error: `HTTP ${res.status}` }
            return res.json()
          } catch (e) {
            if (e.name === 'AbortError') return null
            return { error: e.message }
          }
        })
      )

      const map = {}
      PROJECT_TYPES.forEach((pt, i) => { if (results[i]) map[pt.name] = results[i] })
      setTypePredictions(map)
      setPredictingTypes(false)
    }

    loadAll()
    return () => ctrl.abort()
  }, [])

  const metrics = modelInfo?.metrics
  const featureMeta = modelInfo?.feature_meta

  const featureImportance = metrics?.feature_importance
    ? Object.entries(metrics.feature_importance)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
        .map(([name, value]) => ({
          name: name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          importance: Number((value * 100).toFixed(1)),
        }))
    : []

  const confusionMatrix = metrics?.confusion_matrix || []

  const mlDown = mlHealth?.status !== 'ok'

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-navy-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black text-sm">Loading ML dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-black text-sm font-semibold hover:underline">&larr; Home</Link>
            <h1 className="text-lg font-bold text-black">ML Risk Prediction Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${mlDown ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
            <span className="text-xs font-mono text-black">
              {mlDown ? 'ML Server Offline' : 'ML Server Online'}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {mlDown && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-black font-semibold mb-2">ML Model Server is Offline</p>
            <p className="text-sm text-black">Start the Python model server to enable predictions:</p>
            <code className="block mt-3 bg-slate-100 text-black text-sm px-4 py-2 rounded-lg font-mono border border-slate-300">
              cd ml/src &amp;&amp; python model_server.py
            </code>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Model Accuracy" value={metrics ? `${(metrics.accuracy * 100).toFixed(1)}%` : '---'}
            sub={`Baseline: ${metrics ? (metrics.baseline_accuracy * 100).toFixed(1) + '%' : '---'}`}
            color="text-black" />
          <StatCard label="F1 Score (Weighted)" value={metrics ? `${(metrics.f1_weighted * 100).toFixed(1)}%` : '---'} sub="Macro-averaged F1" />
          <StatCard label="CV Accuracy" value={metrics ? `${(metrics.cv_mean * 100).toFixed(1)}%` : '---'}
            sub={metrics ? `+/- ${(metrics.cv_std * 100).toFixed(1)}% (5-fold)` : '---'} />
          <StatCard label="Features" value={metrics?.n_features || '---'}
            sub={`${metrics?.n_train || 0} train / ${metrics?.n_test || 0} test`} />
        </div>

        {/* Overall + Per-Type Predictions */}
        <div>
          <h2 className="text-lg font-bold text-black mb-1">Predictions by Project Type</h2>
          <p className="text-xs text-black mb-4">Auto-predicted using default West Bengal parameters</p>

          {/* Overall card - full width */}
          <OverallCard predictions={typePredictions} loading={predictingTypes} />

          {/* Per-type cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {PROJECT_TYPES.map(pt => (
              <PredictionCard
                key={pt.name}
                title={pt.name}
                icon={pt.icon}
                desc={pt.desc}
                prediction={typePredictions[pt.name]}
                loading={predictingTypes && !typePredictions[pt.name]}
              />
            ))}
          </div>
        </div>

        {/* Feature Importance + Confusion Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-black mb-1">Feature Importance</h2>
            <p className="text-xs text-black mb-4">Top 12 features driving predictions</p>
            {featureImportance.length > 0 ? (
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={featureImportance} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} unit="%" />
                  <YAxis dataKey="name" type="category" width={180} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => [`${v}%`, 'Importance']} />
                  <Bar dataKey="importance" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-black py-8 text-center">No feature importance data</p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-black mb-1">Confusion Matrix</h2>
            <p className="text-xs text-black mb-4">Actual vs predicted risk categories</p>
            {confusionMatrix.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-xs font-mono text-black text-left">Actual / Pred</th>
                      {CATEGORY_ORDER.map(c => (
                        <th key={c} className="px-3 py-2 text-xs font-mono text-black text-center">{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {CATEGORY_ORDER.map((rowCat, ri) => (
                      <tr key={rowCat}>
                        <td className="px-3 py-2 text-xs font-mono font-semibold text-black">{rowCat}</td>
                        {CATEGORY_ORDER.map((colCat, ci) => {
                          const val = confusionMatrix[ri]?.[ci] || 0
                          const isDiag = ri === ci
                          const bg = isDiag
                            ? val > 0 ? 'bg-emerald-100 text-black' : 'bg-slate-50 text-black'
                            : val > 0 ? 'bg-red-50 text-black' : 'bg-slate-50 text-black'
                          return (
                            <td key={colCat} className={`px-3 py-2 text-center font-mono font-bold rounded ${bg}`}>{val}</td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-black py-8 text-center">No confusion matrix data</p>
            )}
            {featureMeta && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <p className="text-xs font-mono text-black mb-2">Target Classes</p>
                <div className="flex gap-2 flex-wrap">
                  {featureMeta.target_classes.map(c => (
                    <span key={c} className="px-3 py-1 text-xs font-semibold rounded-full border" style={{ borderColor: RISK_COLORS[c] + '40', backgroundColor: RISK_COLORS[c] + '15', color: '#000' }}>{c}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Model Details */}
        {featureMeta && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-black mb-4">Model Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs font-mono text-black uppercase tracking-wider mb-2">Encoder Classes</p>
                {featureMeta.encoder_classes && Object.entries(featureMeta.encoder_classes).map(([key, vals]) => (
                  <div key={key} className="mb-2">
                    <span className="text-xs font-semibold text-black">{key}:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {vals.filter(v => v !== null).map(v => (
                        <span key={v} className="px-2 py-0.5 text-[10px] font-mono bg-slate-100 text-black rounded">{v}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs font-mono text-black uppercase tracking-wider mb-2">Training Info</p>
                <div className="space-y-1 text-sm text-black">
                  <p><span className="font-semibold">Version:</span> {metrics?.model_version || '---'}</p>
                  <p><span className="font-semibold">Trained:</span> {metrics?.training_date ? new Date(metrics.training_date).toLocaleDateString() : '---'}</p>
                  <p><span className="font-semibold">Features:</span> {metrics?.n_features || '---'}</p>
                  <p><span className="font-semibold">Train/Test:</span> {metrics?.n_train || 0} / {metrics?.n_test || 0}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-mono text-black uppercase tracking-wider mb-2">Performance</p>
                <div className="space-y-1 text-sm text-black">
                  <p><span className="font-semibold">Accuracy:</span> {metrics ? (metrics.accuracy * 100).toFixed(1) + '%' : '---'}</p>
                  <p><span className="font-semibold">Precision:</span> {metrics ? (metrics.precision_weighted * 100).toFixed(1) + '%' : '---'}</p>
                  <p><span className="font-semibold">Recall:</span> {metrics ? (metrics.recall_weighted * 100).toFixed(1) + '%' : '---'}</p>
                  <p><span className="font-semibold">F1:</span> {metrics ? (metrics.f1_weighted * 100).toFixed(1) + '%' : '---'}</p>
                  <p><span className="font-semibold">Baseline:</span> {metrics ? (metrics.baseline_accuracy * 100).toFixed(1) + '%' : '---'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* West Bengal Projects */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-black mb-1">West Bengal Projects</h2>
          <p className="text-xs text-black mb-4">Projects from the ML training dataset (West Bengal only - 56 projects - 8 districts)</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { district: 'Bardhaman', count: 10, color: 'bg-navy-500' },
              { district: 'Jalpaiguri', count: 9, color: 'bg-emerald-500' },
              { district: 'Hooghly', count: 8, color: 'bg-amber-500' },
              { district: 'Kolkata', count: 8, color: 'bg-purple-500' },
              { district: 'Howrah', count: 8, color: 'bg-rose-500' },
              { district: 'Murshidabad', count: 6, color: 'bg-cyan-500' },
              { district: 'Malda', count: 4, color: 'bg-orange-500' },
              { district: 'Nadia', count: 3, color: 'bg-indigo-500' },
            ].map(d => (
              <div key={d.district} className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${d.color}`}></span>
                  <span className="text-sm font-semibold text-black">{d.district}</span>
                </div>
                <p className="text-lg font-bold text-black">{d.count}</p>
                <p className="text-[10px] text-black">projects</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex gap-4 text-xs text-black">
            <span>Low: 24</span><span>Medium: 17</span><span>High: 12</span><span>Critical: 3</span>
          </div>
        </div>
      </main>
    </div>
  )
}
