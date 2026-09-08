import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Logo from '../components/Logo'
import { useRole } from '../lib/roleContext'

const ROLES = ['District Magistrate', 'Admin', 'Viewer']

export default function Login() {
  const navigate = useNavigate()
  const { setRole } = useRole()
  const [email, setEmail] = useState('dm@parivekshan.gov.in')
  const [role, setRoleName] = useState('District Magistrate')

  const handleSubmit = (e) => {
    e.preventDefault()
    setRole({ email: email.trim() || 'dev@parivekshan.gov.in', role })
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <div className="hidden lg:flex lg:w-1/2 bg-navy-500 relative items-center justify-center p-12">
        <div className="max-w-md w-full text-white">
          <Logo className="h-12 mb-8 brightness-0 invert" />
          <p className="text-[10px] font-mono text-navy-300 uppercase tracking-widest mb-3">District Command Portal</p>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight mb-4">
            Predict Land Acquisition Delays <span className="text-emerald-400">Before They Happen</span>
          </h1>
          <p className="text-navy-200 text-sm leading-relaxed mb-8">
            AI-powered decision support for the District Collector's Office. Forecast delays, identify risk drivers, and prioritize interventions.
          </p>
          <div className="flex flex-wrap gap-4 text-xs font-mono text-navy-200 uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> LARR Act 2013</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> NIC-GIS Interoperable</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Ministry of Rural Development</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-6">
            <Logo className="h-12" />
          </div>
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8">
            <h1 className="text-xl font-bold text-slate-900 mb-1">Sign in (mock — no auth)</h1>
            <p className="text-xs text-slate-400 mb-6">Dev/test gate only. Any email works.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label-caps text-slate-500 mb-1.5 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@parivekshan.gov.in"
                  className="w-full px-3 py-2.5 rounded border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500"
                />
              </div>

              <div>
                <label className="label-caps text-slate-500 mb-1.5 block">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                {role === 'District Magistrate' && (
                  <p className="text-xs text-slate-400 mt-1.5">Scoped view: North 24 Parganas projects only.</p>
                )}
                {role === 'Admin' && (
                  <p className="text-xs text-slate-400 mt-1.5">Unrestricted view: all districts.</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition shadow-sm"
              >
                Enter dashboard
              </button>
            </form>

            <p className="text-xs text-slate-300 text-center mt-6">No password, no backend call, no security.</p>
          </div>
          <p className="text-center mt-4">
            <Link to="/" className="text-xs text-navy-500 font-medium hover:underline">← Back to landing pages</Link>
          </p>
        </div>
      </div>
    </div>
  )
}