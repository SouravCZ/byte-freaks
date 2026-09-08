import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function severityCls(sev) {
  switch (sev) {
    case 'critical': return { chip: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' }
    case 'high': return { chip: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500' }
    case 'moderate': return { chip: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' }
    case 'low': return { chip: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' }
    default: return { chip: 'bg-slate-50 text-slate-700 border-slate-200', dot: 'bg-slate-400' }
  }
}

const FILTERS = [{ id: 'all', label: 'All' }, { id: 'critical', label: 'Critical' }, { id: 'high', label: 'High' }, { id: 'moderate', label: 'Moderate' }, { id: 'low', label: 'Low' }]

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(() => {
    const ctrl = new AbortController()
    fetch(`${API_BASE}/api/alerts`, { signal: ctrl.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data) => setAlerts(Array.isArray(data) ? data : []))
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message)
      })
      .finally(() => setLoading(false))
    return () => ctrl.abort()
  }, [])

  useEffect(() => load(), [load])

  const markRead = (id, is_read) => {
    fetch(`${API_BASE}/api/alerts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_read }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(() => setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, is_read } : a))))
      .catch(() => {})
  }

  const visible = filter === 'all' ? alerts : alerts.filter((a) => a.severity === filter)
  const unreadCount = alerts.filter((a) => !a.is_read).length

  const counts = alerts.reduce((acc, a) => {
    acc[a.severity] = (acc[a.severity] || 0) + 1
    acc._total += 1
    return acc
  }, { _total: 0 })

  if (loading) {
    return (
      <AppShell title="Alerts" subtitle={`${API_BASE}/api/alerts`}>
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-navy-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 text-sm">Loading alerts...</p>
        </div>
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell title="Alerts" subtitle={`${API_BASE}/api/alerts`}>
        <div className="bg-white border border-red-200 rounded-lg p-6 max-w-md mx-auto text-center">
          <p className="text-red-600 font-semibold mb-2">Failed to load alerts</p>
          <p className="text-sm text-slate-500">{error}</p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Alerts" subtitle={`${unreadCount} unread of ${alerts.length} total`}>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded text-xs font-mono font-semibold uppercase tracking-wider border transition ${
              filter === f.id
                ? 'bg-navy-500 text-white border-navy-500'
                : 'bg-white text-slate-600 border-slate-200 hover:border-navy-500/40'
            }`}
          >
            {f.label}
            <span className="ml-1.5 tabular-nums opacity-70">{f.id === 'all' ? (counts._total ?? 0) : (counts[f.id] ?? 0)}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visible.map((a) => {
          const cls = severityCls(a.severity)
          return (
            <div
              key={a.id}
              className={`bg-white border rounded-lg p-4 flex items-start gap-4 ${
                a.is_read ? 'border-slate-200 opacity-70' : 'border-slate-300 shadow-sm'
              }`}
            >
              <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${cls.dot}`}></span>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider rounded border ${cls.chip}`}>
                    {a.severity}
                  </span>
                  {!a.is_read && (
                    <span className="px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider rounded bg-navy-500/10 text-navy-700">
                      Unread
                    </span>
                  )}
                  <span className="font-semibold text-slate-900 text-sm">{a.title}</span>
                </div>
                {a.message && <p className="text-sm text-slate-600 mb-1">{a.message}</p>}
                <p className="text-xs text-slate-400">
                  {a.project_name && <>Project: <span className="text-navy-600 font-semibold">{a.project_name}</span>{a.project_code ? ` (${a.project_code})` : ''} · </>}
                  {new Date(a.created_at).toLocaleString()}
                </p>
              </div>
              <div className="shrink-0">
                {a.is_read ? (
                  <button
                    onClick={() => markRead(a.id, false)}
                    className="text-[11px] font-mono text-slate-400 hover:text-navy-600 border border-slate-200 rounded px-2.5 py-1.5 transition"
                  >
                    Mark unread
                  </button>
                ) : (
                  <button
                    onClick={() => markRead(a.id, true)}
                    className="text-[11px] font-mono text-emerald-700 hover:text-white hover:bg-emerald-600 border border-emerald-200 rounded px-2.5 py-1.5 transition"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          )
        })}
        {visible.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
            <p className="text-slate-400">No {filter === 'all' ? '' : `${filter} `}alerts.</p>
          </div>
        )}
      </div>

      <div className="text-center mt-6">
        <Link to="/projects" className="text-xs font-mono text-navy-500 font-semibold hover:underline">← Back to projects</Link>
      </div>
    </AppShell>
  )
}