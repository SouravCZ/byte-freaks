import React, { useEffect, useState, useMemo } from 'react'
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

function SortIcon({ col, sortCol, sortDir }) {
  if (col !== sortCol) return <span className="text-black ml-1">&#x2195;</span>
  return <span className="text-black ml-1">{sortDir === 'asc' ? '&#x2191;' : '&#x2193;'}</span>
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

function projectToMLPayload(p) {
  return {
    project_type: p.project_type || 'Infrastructure',
    state: p.state || 'West Bengal',
    status: p.status || 'active',
    dispute_type: p.dispute_type || 'none',
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
    legal_dispute_flag: Number(p.legal_dispute_flag) || 0,
    documentation_complete: Number(p.documentation_complete) || 1,
    rr_required: Number(p.rr_required) || 0,
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
  const [projects, setProjects] = useState([])
  const [predictions, setPredictions] = useState({})
  const [loading, setLoading] = useState(true)
  const [predicting, setPredicting] = useState(false)
  const [progress, setProgress] = useState(0)

  // Filters
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('All')
  const [filterDistrict, setFilterDistrict] = useState('All')
  const [filterRisk, setFilterRisk] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterDispute, setFilterDispute] = useState('All')

  // Sort
  const [sortCol, setSortCol] = useState('risk_score')
  const [sortDir, setSortDir] = useState('desc')

  // Expanded row
  const [expandedRow, setExpandedRow] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch('/west_bengal_projects.csv')
        const text = await res.text()
        const data = parseCSV(text)
        setProjects(data)
        setLoading(false)

        // Predict for each project
        setPredicting(true)
        const preds = {}
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
              preds[data[i].case_id] = await r.json()
            }
          } catch {
            // skip failed predictions
          }
        }
        setPredictions(preds)
        setPredicting(false)
      } catch (err) {
        console.error('Failed to load CSV:', err)
        setLoading(false)
      }
    }
    load()
  }, [])

  const projectTypes = useMemo(() => [...new Set(projects.map(p => p.project_type))].sort(), [projects])
  const districts = useMemo(() => [...new Set(projects.map(p => p.district))].sort(), [projects])
  const statuses = useMemo(() => [...new Set(projects.map(p => p.status))].sort(), [projects])
  const disputeTypes = useMemo(() => [...new Set(projects.map(p => p.dispute_type).filter(Boolean))].sort(), [projects])

  const enriched = useMemo(() => {
    return projects.map(p => {
      const pred = predictions[p.case_id]
      return {
        ...p,
        ml_category: pred?.risk_category || null,
        ml_score: pred?.risk_score ?? null,
        ml_probabilities: pred?.probabilities || null,
        ml_top_factor: pred?.top_factors?.[0]?.feature || null,
        ml_top_impact: pred?.top_factors?.[0]?.impact ?? null,
        delay_ratio: Number(p.delay_ratio) || 0,
        delay_days: Number(p.delay_days) || 0,
        area: Number(p.area_acquired_hectares) || 0,
      }
    })
  }, [projects, predictions])

  const filtered = useMemo(() => {
    let list = enriched

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.case_id.toLowerCase().includes(q) ||
        p.project_name.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.project_type.toLowerCase().includes(q)
      )
    }
    if (filterType !== 'All') list = list.filter(p => p.project_type === filterType)
    if (filterDistrict !== 'All') list = list.filter(p => p.district === filterDistrict)
    if (filterRisk !== 'All') list = list.filter(p => p.ml_category === filterRisk)
    if (filterStatus !== 'All') list = list.filter(p => p.status === filterStatus)
    if (filterDispute !== 'All') list = list.filter(p => p.dispute_type === filterDispute)

    list.sort((a, b) => {
      let va, vb
      switch (sortCol) {
        case 'case_id': va = a.case_id; vb = b.case_id; break
        case 'project_name': va = a.project_name; vb = b.project_name; break
        case 'project_type': va = a.project_type; vb = b.project_type; break
        case 'district': va = a.district; vb = b.district; break
        case 'area': va = a.area; vb = b.area; break
        case 'status': va = a.status; vb = b.status; break
        case 'ml_category': va = CATEGORY_ORDER.indexOf(a.ml_category); vb = CATEGORY_ORDER.indexOf(b.ml_category); break
        case 'ml_score': va = a.ml_score ?? -1; vb = b.ml_score ?? -1; break
        case 'delay_days': va = a.delay_days; vb = b.delay_days; break
        case 'delay_ratio': va = a.delay_ratio; vb = b.delay_ratio; break
        default: va = 0; vb = 0
      }
      if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
      return sortDir === 'asc' ? va - vb : vb - va
    })

    return list
  }, [enriched, search, filterType, filterDistrict, filterRisk, filterStatus, filterDispute, sortCol, sortDir])

  function toggleSort(col) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir(col === 'ml_score' || col === 'delay_days' || col === 'delay_ratio' || col === 'area' ? 'desc' : 'asc') }
  }

  const riskCounts = useMemo(() => {
    const counts = { Low: 0, Medium: 0, High: 0, Critical: 0 }
    enriched.forEach(p => { if (p.ml_category) counts[p.ml_category]++ })
    return counts
  }, [enriched])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-navy-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black text-sm">Loading West Bengal projects...</p>
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
            <h1 className="text-lg font-bold text-black">West Bengal ML Projects</h1>
          </div>
          <div className="flex items-center gap-3">
            {predicting && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-navy-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-black">{progress}/{projects.length}</span>
              </div>
            )}
            <span className="text-sm font-mono text-black">{filtered.length} / {projects.length} records</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Risk summary */}
        <div className="grid grid-cols-4 gap-3">
          {CATEGORY_ORDER.map(cat => (
            <div key={cat} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: RISK_COLORS[cat] }}></div>
              <p className="text-2xl font-bold text-black">{riskCounts[cat]}</p>
              <p className="text-xs font-mono text-black">{cat}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search by name, ID, district, or type..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500"
              />
            </div>

            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white">
              <option value="All">All Types</option>
              {projectTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <select value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white">
              <option value="All">All Districts</option>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white">
              <option value="All">All Risk</option>
              {CATEGORY_ORDER.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white">
              <option value="All">All Status</option>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select value={filterDispute} onChange={e => setFilterDispute(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white">
              <option value="All">All Disputes</option>
              {disputeTypes.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            {(search || filterType !== 'All' || filterDistrict !== 'All' || filterRisk !== 'All' || filterStatus !== 'All' || filterDispute !== 'All') && (
              <button onClick={() => { setSearch(''); setFilterType('All'); setFilterDistrict('All'); setFilterRisk('All'); setFilterStatus('All'); setFilterDispute('All') }}
                className="px-3 py-2 text-xs font-semibold text-black border border-red-300 rounded-lg hover:bg-red-50 transition">
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-100 text-left text-xs font-mono uppercase tracking-wider text-black">
                  {[
                    ['case_id', 'Case ID', 'w-20'],
                    ['project_name', 'Project Name', 'min-w-[200px]'],
                    ['project_type', 'Type', 'w-32'],
                    ['district', 'District', 'w-28'],
                    ['area', 'Area (ha)', 'w-20'],
                    ['status', 'Status', 'w-36'],
                    ['ml_category', 'ML Risk', 'w-24'],
                    ['ml_score', 'ML Score', 'w-20'],
                    ['delay_days', 'Delay (d)', 'w-20'],
                    ['delay_ratio', 'Delay Ratio', 'w-24'],
                  ].map(([col, label, width]) => (
                    <th key={col} className={`px-3 py-3 cursor-pointer hover:bg-slate-200 transition select-none ${width}`}
                      onClick={() => toggleSort(col)}>
                      <span className="inline-flex items-center">
                        {label}
                        <SortIcon col={col} sortCol={sortCol} sortDir={sortDir} />
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <React.Fragment key={p.case_id}>
                    <tr className={`border-t border-slate-100 hover:bg-slate-50 transition cursor-pointer ${expandedRow === i ? 'bg-navy-500/5' : ''}`}
                      onClick={() => setExpandedRow(expandedRow === i ? null : i)}>
                      <td className="px-3 py-2.5 font-mono text-black text-xs">{p.case_id}</td>
                      <td className="px-3 py-2.5">
                        <span className="font-medium text-black text-xs">{p.project_name}</span>
                      </td>
                      <td className="px-3 py-2.5 text-black text-xs">{p.project_type}</td>
                      <td className="px-3 py-2.5 text-black text-xs">{p.district}</td>
                      <td className="px-3 py-2.5 font-mono text-black text-xs">{p.area.toFixed(1)}</td>
                      <td className="px-3 py-2.5">
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-black rounded">{p.status}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        {p.ml_category ? (
                          <span className={riskBadge(p.ml_category)}>{p.ml_category}</span>
                        ) : (
                          <span className="text-xs text-black">...</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-black font-semibold">
                        {p.ml_score != null ? `${(p.ml_score * 100).toFixed(0)}%` : '...'}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-black text-xs">{p.delay_days}d</td>
                      <td className="px-3 py-2.5 font-mono text-xs">
                        <span className="text-black font-semibold">
                          {p.delay_ratio.toFixed(2)}x
                        </span>
                      </td>
                    </tr>

                    {/* Expanded detail row */}
                    {expandedRow === i && p.ml_probabilities && (
                      <tr className="bg-slate-50">
                        <td colSpan={10} className="px-4 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Probabilities */}
                            <div>
                              <p className="text-[10px] font-mono text-black uppercase mb-2">ML Probabilities</p>
                              {CATEGORY_ORDER.map(cat => (
                                <div key={cat} className="flex items-center gap-2 mb-1">
                                  <span className="w-14 text-[10px] font-mono text-black font-semibold">{cat}</span>
                                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${(p.ml_probabilities[cat] || 0) * 100}%`, backgroundColor: RISK_COLORS[cat] }}></div>
                                  </div>
                                  <span className="w-10 text-right text-[10px] font-mono text-black">{((p.ml_probabilities[cat] || 0) * 100).toFixed(1)}%</span>
                                </div>
                              ))}
                            </div>

                            {/* Project info */}
                            <div>
                              <p className="text-[10px] font-mono text-black uppercase mb-2">Project Details</p>
                              <div className="space-y-1 text-xs text-black">
                                <p><span className="font-semibold">Agency:</span> {p.implementing_agency}</p>
                                <p><span className="font-semibold">Start:</span> {p.start_date}</p>
                                <p><span className="font-semibold">Updated:</span> {p.last_updated}</p>
                                <p><span className="font-semibold">Dispute:</span> {p.dispute_type || 'None'}</p>
                                <p><span className="font-semibold">Dispute Days:</span> {p.dispute_duration_days}d</p>
                                <p><span className="font-semibold">Families:</span> {p.affected_families} affected / {p.displaced_families} displaced</p>
                                <p><span className="font-semibold">Comp. Disbursed:</span> {(Number(p.compensation_disbursed_pct) * 100).toFixed(0)}%</p>
                                <p><span className="font-semibold">RR Progress:</span> {p.rr_progress_percent}%</p>
                              </div>
                            </div>

                            {/* Stage durations */}
                            <div>
                              <p className="text-[10px] font-mono text-black uppercase mb-2">Stage Durations (days)</p>
                              <div className="space-y-1">
                                {[
                                  ['Proposed > Scrutiny', p.duration_proposed_to_scrutiny],
                                  ['Scrutiny > Notification', p.duration_scrutiny_to_notification],
                                  ['Notification > Declaration', p.duration_notification_to_declaration],
                                  ['Declaration > Award', p.duration_declaration_to_award],
                                  ['Award > Compensation', p.duration_award_to_compensation],
                                  ['Compensation > Possession', p.duration_compensation_to_possession],
                                  ['Possession > Closed', p.duration_possession_to_closed],
                                ].map(([label, val]) => {
                                  const num = Number(val) || 0
                                  return (
                                    <div key={label} className="flex items-center gap-2">
                                      <span className="w-36 text-[10px] text-black truncate">{label}</span>
                                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-navy-400 rounded-full" style={{ width: `${Math.min(100, num / 1.5)}%` }}></div>
                                      </div>
                                      <span className="w-10 text-right text-[10px] font-mono text-black">{num}d</span>
                                    </div>
                                  )
                                })}
                              </div>
                              <p className="text-[10px] text-black mt-2">
                                <span className="font-semibold">Total:</span> {Number(p.actual_total_duration_days) || 0}d
                                <span className="ml-2 font-semibold">Benchmark:</span> {p.cohort_benchmark_days}d
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-black">No projects match the current filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
