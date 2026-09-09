import React from 'react'

export default function StatCard({ label, value, hint, accent }) {
  const accentCls = accent || 'text-slate-900'
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <p className="label-caps text-slate-400 mb-1">{label}</p>
      <p className={`text-3xl font-bold tabular-nums tracking-tight ${accentCls}`}>{value}</p>
      {hint && <p className="mt-1 text-[11px] font-mono text-slate-400">{hint}</p>}
    </div>
  )
}