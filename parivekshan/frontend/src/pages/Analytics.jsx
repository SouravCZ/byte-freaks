import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts'
import { useRole } from '../lib/roleContext'
import { scopeProjects, isDistrictOfficer, DISTRICT_OFFICER_DISTRICT } from '../lib/scoping'
import AppShell from '../components/layout/AppShell'
import StatCard from '../components/dashboard/StatCard'
import RiskTag from '../components/ui/RiskTag'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function Analytics() {
  const { role } = useRole()
  const [stats, setStats] = useState(null)
  const [blocks, setBlocks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const ctrl = new AbortController()
    Promise.all([
      fetch(`${API_BASE}/api/stats`, { signal: ctrl.signal }).then((r) => r.json()),
      fetch(`${API_BASE}/api/blocks`, { signal: ctrl.signal }).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      }),
      fetch(`${API_BASE}/api/projects`, { signal: ctrl.signal }).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      }),
    ])
      .then(([statsData, blocksData, projectsData]) => {
        setStats(statsData)
        setBlocks(Array.isArray(blocksData) ? blocksData : [])
        setProjects(Array.isArray(projectsData) ? projectsData : [])
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message)
      })
      .finally(() => setLoading(false))
    return () => ctrl.abort()
  }, [])

  const scoped = isDistrictOfficer(role)
  const visibleProjects = scopeProjects(projects, role)
  const scopedBlocks = scoped
    ? blocks.filter((b) => (b.district || '') === DISTRICT_OFFICER_DISTRICT)
    : blocks

  const highRiskPct = visibleProjects.length
    ? Math.round((visibleProjects.filter((p) => Number(p.risk_score) >= 75).length / visibleProjects.length) * 100)
    : 0
  const avgRisk = visibleProjects.length
    ? Math.round(visibleProjects.reduce((s, p) => s + Number(p.risk_score), 0) / visibleProjects.length)
    : 0
  const avgDelay = visibleProjects.length
    ? Math.round(visibleProjects.reduce((s, p) => s + Number(p.delay_days || 0), 0) / visibleProjects.length)
    : 0

  const kpis = [
    { label: 'High Delay Risk', value: `${highRiskPct}%`, accent: highRiskPct > 0 ? 'text-red-600' : 'text-emerald-600', hint: `${visibleProjects.filter((p) => Number(p.risk_score) >= 75).length} of ${visibleProjects.length} in scope` },
    { label: 'Avg Block Risk', value: `${avgRisk}%`, hint: 'weighted block mean' },
    { label: 'Avg Delay', value: `${avgDelay}d`, accent: 'text-amber-600' },
    { label: 'Unread Alerts', value: stats?.unreadAlerts ?? '—', hint: 'via /api/stats' },
  ]

  const statusData = (() => {
    const by = {}
    visibleProjects.forEach((p) => {
      const s = p.status || 'unknown'
      by[s] = (by[s] || 0) + 1
    })
    return Object.entries(by).map(([name, count]) => ({ name, count }))
  })()

  const blockChartData = scopedBlocks
    .map((b) => ({ name: b.name, risk: Number(b.risk_score) }))
    .sort((a, b) => b.risk - a.risk)

  const trendData = blockChartData.slice().sort((a, b) => a.risk - b.risk).map((d, i) => ({
    seq: `#${i + 1}`,
    probability: d.risk,
  }))

  if (loading) {
    return (
      <AppShell title="Analytics" subtitle={`${API_BASE}/api/blocks`}>
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-navy-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 text-sm">Loading analytics...</p>
        </div>
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell title="Analytics" subtitle={`${API_BASE}/api/blocks`}>
        <div className="bg-white border border-red-200 rounded-lg p-6 max-w-md mx-auto text-center">
          <p className="text-red-600 font-semibold mb-2">Failed to load analytics</p>
          <p className="text-sm text-slate-500">{error}</p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Analytics" subtitle="National infrastructure risk telemetry">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} label={k.label} value={k.value} accent={k.accent} hint={k.hint} />
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="font-bold text-slate-900 mb-1">Block Risk Ranking</h2>
          <p className="label-caps text-slate-400 mb-3">Descending /api/blocks</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={blockChartData} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} stroke="#64748B" fontSize={10} />
              <YAxis type="category" dataKey="name" stroke="#64748B" fontSize={10} width={90} />
              <Tooltip />
              <Bar dataKey="risk" radius={[0, 4, 4, 0]}>
                {blockChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.risk >= 75 ? '#DC2626' : entry.risk >= 50 ? '#D97706' : '#059669'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="font-bold text-slate-900 mb-1">Delay Probability Curve</h2>
          <p className="label-caps text-slate-400 mb-3">Block risk sorted ascending</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="delayProb" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0F2C59" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0F2C59" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="seq" stroke="#64748B" fontSize={10} />
              <YAxis stroke="#64748B" fontSize={10} domain={[0, 100]} />
              <Tooltip />
              <Area type="monotone" dataKey="probability" stroke="#D97706" strokeWidth={2} fill="url(#delayProb)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="font-bold text-slate-900 mb-1">Status Distribution</h2>
          <p className="label-caps text-slate-400 mb-3">In-scope projects</p>
          <ul className="space-y-2">
            {statusData.map((s) => (
              <li key={s.name} className="flex items-center justify-between text-sm">
                <span className="text-slate-600 capitalize">{s.name.replace('_', ' ')}</span>
                <span className="font-mono text-slate-900 font-semibold tabular-nums">{s.count}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="font-bold text-slate-900 mb-1">Projects</h2>
          <p className="label-caps text-slate-400 mb-3">Predictive delay indicators</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left label-caps text-slate-500">
                  <th className="px-4 py-3 font-semibold">Code</th>
                  <th className="px-4 py-3 font-semibold">Project</th>
                  <th className="px-4 py-3 font-semibold text-right">Delay</th>
                  <th className="px-4 py-3 font-semibold text-right">Risk</th>
                  <th className="px-4 py-3 font-semibold text-right">AI</th>
                </tr>
              </thead>
              <tbody>
                {visibleProjects.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-mono text-navy-600">
                      <Link to={`/projects/${p.id}`} className="hover:underline">{p.code}</Link>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-500">{p.delay_days}d</td>
                    <td className="px-4 py-3 text-right"><RiskTag score={p.risk_score} /></td>
                    <td className="px-4 py-3 text-right">
                      {Number(p.risk_score) >= 75 && (
                        <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider rounded bg-red-600 text-white">
                          Alert
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link to="/projects" className="text-xs font-mono text-navy-500 font-semibold hover:underline">← Back to projects</Link>
      </div>
    </AppShell>
  )
}