import React from 'react'

export function riskLevel(score) {
  const n = Number(score)
  if (n >= 75) return { label: 'HIGH', cls: 'bg-red-50 text-red-700 border-red-200' }
  if (n >= 50) return { label: 'MOD', cls: 'bg-amber-50 text-amber-700 border-amber-200' }
  return { label: 'LOW', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
}

export default function RiskTag({ score, className = '' }) {
  const lvl = riskLevel(score)
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider border ${lvl.cls} ${className}`}>
      {Number(score).toFixed(0)}% {lvl.label}
    </span>
  )
}