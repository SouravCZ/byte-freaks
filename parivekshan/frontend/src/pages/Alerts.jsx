import React from 'react'
import { Link } from 'react-router-dom'

export default function Alerts() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-xl font-bold text-slate-900 mb-2">Alerts</h1>
        <p className="text-slate-500 text-sm mb-4">Placeholder — alerts module not built yet.</p>
        <Link to="/projects" className="text-sm text-navy-500 font-medium hover:underline">← Back to projects</Link>
      </div>
    </div>
  )
}