import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { useRole } from '../lib/roleContext'
import { scopeProjects, scopeStats, isDistrictOfficer, DISTRICT_OFFICER_DISTRICT } from '../lib/scoping'
import AppShell from '../components/layout/AppShell'
import StatCard from '../components/dashboard/StatCard'
import RiskTag from '../components/ui/RiskTag'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function statusCls(status) {
  switch (status) {
    case 'completed': return 'bg-emerald-100 text-emerald-800'
    case 'active': return 'bg-navy-500/10 text-navy-700'
    case 'on_hold': return 'bg-amber-100 text-amber-800'
    case 'planned': return 'bg-slate-100 text-slate-700'
    case 'cancelled': return 'bg-red-100 text-red-800'
    default: return 'bg-slate-100 text-slate-700'
  }
}

const RISK_COLORS = { high: '#DC2626', mod: '#D97706', low: '#059669' }

export default function Overview() {
  const { email, role } = useRole()
  const [stats, setStats] = useState(null)
  const [projects, setProjects] = useState([])
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
  const displayStats = scopeStats({ stats, projects, role })

  const riskBuckets = visibleProjects.reduce(
    (acc, p) => {
      acc[Number(p.risk_score) >= 75 ? 'high' : Number(p.risk_score) >= 50 ? 'mod' : 'low'] += 1
      return acc
    },
    { high: 0, mod: 0, low: 0 }
  )

  const riskPieData = [['high', 'High'], ['mod', 'Moderate'], ['low', 'Low']].map(([key, label]) => ({
    name: label,
    value: riskBuckets[key],
    color: RISK_COLORS[key],
  }))

  const blockChartData = blocks
    .filter((b) => !scoped || (b.district || '') === DISTRICT_OFFICER_DISTRICT)
    .map((b) => ({ name: b.name, risk: Number(b.risk_score) }))
    .sort((a, b) => b.risk - a.risk)
    .slice(0, 8)

  const kpis = [
    { label: 'Projects', value: displayStats?.totalProjects ?? '—' },
    { label: 'High Risk', value: displayStats?.highRiskProjects ?? '—', accent: Number(displayStats?.highRiskProjects) > 0 ? 'text-red-600' : 'text-emerald-600' },
    { label: 'Unread Alerts', value: displayStats?.unreadAlerts ?? '—' },
    { label: 'Mouzas Tracked', value: displayStats?.mouzasTracked ?? '—' },
  ]

  return (
    <AppShell title="Command Dashboard" subtitle={role ? `Signed in as ${role}${email ? ` · ${email}` : ''}` : 'Not signed in'}>
      {scoped && (
        <div className="mb-6 flex items-center gap-2 bg-navy-500/5 border border-navy-500/20 rounded-lg px-4 py-3">
          <span className="label-caps text-navy-700">Scope:</span>
          <span className="text-xs font-mono font-semibold text-navy-700">{DISTRICT_OFFICER_DISTRICT}</span>
          <span className="text-xs text-slate-500">District Magistrate — projects filtered client-side</span>
        </div>
      )}

      {loading && (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-navy-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 text-sm">Loading dashboard...</p>
        </div>
      )}

      {!loading && error && (
        <div className="bg-white border border-red-200 rounded-lg p-6 max-w-md mx-auto text-center">
          <p className="text-red-600 font-semibold mb-2">Failed to load dashboard</p>
          <p className="text-sm text-slate-500">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {kpis.map((k) => (
              <StatCard key={k.label} label={k.label} value={k.value} accent={k.accent} />
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <h2 className="font-bold text-slate-900 mb-1">Risk Distribution</h2>
              <p className="label-caps text-slate-400 mb-3">In-scope projects</p>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="55%" height={150}>
                  <PieChart>
                    <Pie data={riskPieData} cx="50%" cy="50%" innerRadius={38} outerRadius={68} dataKey="value">
                      {riskPieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 flex-1">
                  {riskPieData.map((d) => (
                    <div key={d.name} className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: d.color }}></span>
                      <span className="text-slate-600 capitalize">{d.name}: <strong className="text-slate-900 tabular-nums">{d.value}</strong></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5">
              <h2 className="font-bold text-slate-900 mb-1">Block Risk Profile</h2>
              <p className="label-caps text-slate-400 mb-3">Live /api/blocks telemetry</p>
              <ResponsiveContainer width="100%" height={170}>
                <BarChart data={blockChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={10} interval={0} angle={-20} textAnchor="end" height={40} />
                  <YAxis stroke="#64748B" fontSize={10} domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="risk" radius={[4, 4, 0, 0]}>
                    {blockChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.risk >= 75 ? '#DC2626' : entry.risk >= 50 ? '#D97706' : '#059669'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-slate-900">Projects</h2>
            <span className="text-xs font-mono text-slate-400 tabular-nums">{visibleProjects.length} / {projects.length} records</span>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left label-caps text-slate-500">
                  <th className="px-4 py-3 font-semibold">Code</th>
                  <th className="px-4 py-3 font-semibold">Project</th>
                  <th className="px-4 py-3 font-semibold">District</th>
                  <th className="px-4 py-3 font-semibold">Block</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Risk</th>
                  <th className="px-4 py-3 font-semibold text-right">Delay</th>
                </tr>
              </thead>
              <tbody>
                {visibleProjects.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-mono text-navy-600">
                      <Link to={`/projects/${p.id}`} className="hover:underline">{p.code}</Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/projects/${p.id}`} className="font-medium text-slate-900 hover:text-navy-600 hover:underline">
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{p.district || '—'}</td>
                    <td className="px-4 py-3 text-slate-500">{p.block || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold capitalize rounded font-mono uppercase tracking-wider ${statusCls(p.status)}`}>{p.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <RiskTag score={p.risk_score} />
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-500">{p.delay_days}d</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {visibleProjects.length === 0 && (
              <p className="p-8 text-center text-slate-400">No projects in scope.</p>
            )}
          </div>
        </>
      )}
    </AppShell>
  )
}