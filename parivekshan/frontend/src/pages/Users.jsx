import React, { useMemo, useState, useEffect } from 'react'
import AppShell from '../components/layout/AppShell'
import EmptyState from '../components/EmptyState'
import { useRole } from '../lib/roleContext'
import { can } from '../lib/permissions'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const ROLE_LABELS = {
  admin: 'Ministry Admin',
  collector: 'District Authority',
  adm: 'District Authority',
  bdo: 'District Authority',
  lao: 'District Authority',
  viewer: 'Viewer',
}

const ROLE_TIERS = {
  admin: 'Ministry Admin (Tier-1)',
  collector: 'District Collector',
  adm: 'Additional District Magistrate',
  bdo: 'Block Development Officer',
  lao: 'Land Acquisition Officer',
  viewer: 'Viewer (Read-Only)',
}

function roleCls(role) {
  switch (role) {
    case 'admin': return { chip: 'bg-primary-container text-primary border-primary/20', dot: 'bg-primary', icon: 'travel_explore' }
    case 'collector':
    case 'adm':
    case 'bdo':
    case 'lao': return { chip: 'bg-[#eef0fb] text-[#3f4a9e] border-[#d7dcf2]', dot: 'bg-[#5a67c4]', icon: 'share_location' }
    case 'viewer': return { chip: 'bg-surface-container text-text-secondary border-border-strong', dot: 'bg-surface-dim', icon: 'visibility' }
    default: return { chip: 'bg-risk-critical-bg text-error border-error/20', dot: 'bg-error', icon: 'manage_search' }
  }
}

function statusPill(isActive) {
  return isActive
    ? 'bg-risk-success-bg text-risk-success border-risk-success/20'
    : 'bg-risk-critical-bg text-error border-error/20'
}

export default function Users() {
  const { role } = useRole()
  const allowed = can(role, 'manage_users')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('All Users')
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('ALL')

  useEffect(() => {
    const ctrl = new AbortController()
    fetch(`${API_BASE}/api/users`, { signal: ctrl.signal })
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then((data) => setUsers(data))
      .catch((err) => { if (err.name !== 'AbortError') setError(err.message) })
      .finally(() => setLoading(false))
    return () => ctrl.abort()
  }, [])

  const counts = useMemo(() => {
    return users.reduce((acc, u) => {
      acc.all += 1
      const label = ROLE_LABELS[u.role] || u.role
      acc[label] = (acc[label] || 0) + 1
      return acc
    }, { all: 0 })
  }, [users])

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase()
    return users.filter((u) => {
      const label = ROLE_LABELS[u.role] || u.role
      if (tab !== 'All Users' && label !== tab) return false
      if (status === 'Active' && !u.is_active) return false
      if (status === 'Suspended' && u.is_active) return false
      if (term && !`${u.name} ${u.email} ${u.designation} ${u.department}`.toLowerCase().includes(term)) return false
      return true
    })
  }, [users, tab, q, status])

  const TABS = [
    ['All Users', 'all'], ['Ministry Admin', 'admin'], ['District Authority', 'district'], ['Viewer', 'viewer'],
  ]

  const cardCls = 'bg-surface-card border border-border-crisp shadow-card'

  if (!allowed) {
    return (
      <AppShell title="Users" subtitle="Identity, roles & scope governance">
        <div className="bg-surface-card border border-error/25 rounded-xl p-6 max-w-md mx-auto text-center shadow-card">
          <span className="material-symbols-outlined text-[32px] text-error mb-2">lock</span>
          <p className="font-semibold text-text-primary mb-1">User management is restricted</p>
          <p className="text-sm text-text-muted">Only Ministry Admins can provision or edit user roles and scopes.</p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Users" subtitle="Identity, roles & scope governance">
      <div className="flex flex-col gap-space-lg">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Identity, role &amp; scope governance</h1>
            <p className="text-[14px] text-text-muted mt-1 max-w-2xl">
              Role-based access control across Ministry officials, District Collectors and public auditors, with spatial boundary enforcement.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-base">
          <div className={`${cardCls} p-space-md flex flex-col justify-between border-l-4 border-l-primary`}>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-text-muted tracking-wider uppercase">Registered personnel</span>
              <span className="material-symbols-outlined text-[20px] text-primary">group</span>
            </div>
            <div className="mt-space-md flex items-baseline gap-2">
              <span className="text-2xl font-bold text-text-primary font-mono tabular-nums">{counts.all}</span>
              <span className="text-[12px] text-risk-success font-semibold">total</span>
            </div>
          </div>
          <div className={`${cardCls} p-space-md flex flex-col justify-between border-l-4 border-l-[#3f4a9e]`}>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-text-muted tracking-wider uppercase">District authorities</span>
              <span className="material-symbols-outlined text-[20px] text-[#3f4a9e]">share_location</span>
            </div>
            <div className="mt-space-md flex items-baseline gap-2">
              <span className="text-2xl font-bold text-text-primary font-mono tabular-nums">{counts['District Authority'] || 0}</span>
              <span className="text-[12px] text-text-secondary font-medium">DMs / ADMs / BDOs / LAOs</span>
            </div>
          </div>
          <div className={`${cardCls} p-space-md flex flex-col justify-between border-l-4 border-l-secondary`}>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-text-muted tracking-wider uppercase">Ministry admins</span>
              <span className="material-symbols-outlined text-[20px] text-secondary">security</span>
            </div>
            <div className="mt-space-md flex items-baseline gap-2">
              <span className="text-2xl font-bold text-text-primary font-mono tabular-nums">{counts['Ministry Admin'] || 0}</span>
              <span className="text-[12px] text-primary font-semibold">national scope</span>
            </div>
          </div>
          <div className={`${cardCls} p-space-md flex flex-col justify-between border-l-4 border-l-border-strong`}>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-text-muted tracking-wider uppercase">Viewers</span>
              <span className="material-symbols-outlined text-[20px] text-text-muted">visibility</span>
            </div>
            <div className="mt-space-md flex items-baseline gap-2">
              <span className="text-2xl font-bold text-text-primary font-mono tabular-nums">{counts['Viewer'] || 0}</span>
              <span className="text-[12px] text-text-muted font-medium">read-only</span>
            </div>
          </div>
        </div>

        <div className="px-space-md py-space-sm rounded-xl bg-surface-card border border-border-crisp shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {TABS.map(([label, key]) => {
              const active = tab === label
              return (
                <button
                  key={key}
                  onClick={() => setTab(label)}
                  className={`px-3 py-1.5 rounded-lg text-[13px] shrink-0 transition-all flex items-center gap-1 ${active
                    ? 'bg-primary text-white font-semibold shadow-sm'
                    : 'font-medium text-text-secondary hover:text-text-primary hover:bg-surface-container'
                  }`}
                >
                  {label}
                  <span className={`ml-1 font-mono text-[11px] tabular-nums ${active ? 'opacity-90' : 'text-text-muted'}`}>
                    {key === 'all' ? counts.all : (counts[label] || 0)}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="flex flex-wrap items-center gap-space-sm">
            <div className="relative flex-1 min-w-[240px] sm:min-w-[280px]">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-[18px]">search</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full bg-surface-container border border-border-crisp pl-9 pr-3 py-2 rounded-lg text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary transition-all"
                placeholder="Search official, email, department…"
                type="text"
              />
            </div>
            <div className="flex items-center rounded-lg border border-border-crisp bg-surface-container p-0.5">
              {['ALL', 'Active', 'Suspended'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-2.5 py-1 rounded-md text-[12px] transition-all ${status === s ? 'bg-white text-primary font-semibold shadow-sm border border-border-crisp' : 'text-text-secondary hover:text-text-primary font-medium'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading && (
          <div className="py-24 text-center">
            <div className="w-9 h-9 border-[3px] border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[14px] text-text-muted">Loading users…</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-surface-card border border-error/25 rounded-xl p-6 max-w-md mx-auto text-center shadow-card">
            <span className="material-symbols-outlined text-[32px] text-error mb-2">error_outline</span>
            <p className="font-semibold text-text-primary mb-1">Failed to load users</p>
            <p className="text-sm text-text-muted">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="rounded-xl bg-surface-card border border-border-crisp shadow-card overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-surface-container border-b border-border-crisp text-[11px] uppercase tracking-wider text-text-muted font-semibold">
                    <th className="py-3 px-space-md">Name &amp; designation</th>
                    <th className="py-3 px-space-md">Email</th>
                    <th className="py-3 px-space-md">Role</th>
                    <th className="py-3 px-space-md">Department</th>
                    <th className="py-3 px-space-md text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-crisp text-[13px] text-text-secondary bg-surface-card">
                  {visible.map((u) => {
                    const rc = roleCls(u.role)
                    const label = ROLE_LABELS[u.role] || u.role
                    const initials = u.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
                    return (
                      <tr key={u.id} className="hover:bg-surface-container-low/70 transition-colors">
                        <td className="py-3.5 px-space-md">
                          <div className="flex items-center gap-space-sm">
                            <div className="w-9 h-9 rounded-full bg-surface-container border border-border-crisp font-bold text-xs flex items-center justify-center shrink-0 text-text-primary">
                              {initials}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-text-primary font-bold text-sm truncate">{u.name}</span>
                              <span className="text-text-secondary text-[12px] truncate">{u.designation}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-space-md">
                          <span className="font-mono text-primary font-semibold text-[12px]">{u.email}</span>
                        </td>
                        <td className="py-3.5 px-space-md">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md border border-border-crisp text-[11px] font-semibold ${rc.chip}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${rc.dot}`}></span>
                            {ROLE_TIERS[u.role] || label}
                          </span>
                        </td>
                        <td className="py-3.5 px-space-md">
                          <span className="text-text-primary font-semibold text-[12px]">{u.department || '—'}</span>
                        </td>
                        <td className="py-3.5 px-space-md text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-bold ${statusPill(u.is_active)}`}>
                            {u.is_active ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                  {visible.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-0">
                        <EmptyState
                          icon="person_search"
                          title="No officials match"
                          message="No officials match the current filters. Adjust the role or search term to see more results."
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-space-md py-2 bg-surface-container border-t border-border-crisp flex items-center">
              <p className="font-mono text-[11px] text-text-muted">MoRD / PM GatiShakti role-based provisioning matrix</p>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
