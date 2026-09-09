import React from 'react'
import { Link } from 'react-router-dom'

export default function Alerts() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-xl font-bold text-black mb-2">Alerts</h1>
        <p className="text-black text-sm mb-4">Placeholder — alerts module not built yet.</p>
        <Link to="/projects" className="text-sm text-black font-medium hover:underline">← Back to projects</Link>
      </div>
    </div>
  )
}