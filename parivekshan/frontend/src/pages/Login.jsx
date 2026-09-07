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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Logo className="h-12" />
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <h1 className="text-xl font-bold text-slate-900 text-center mb-1">Sign in (mock — no auth)</h1>
          <p className="text-xs text-slate-400 text-center mb-6">Dev/test gate only. Any email works.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@parivekshan.gov.in"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Role</label>
              <select
                value={role}
                onChange={(e) => setRoleName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
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
              className="w-full py-2.5 rounded-lg bg-navy-500 text-white text-sm font-semibold hover:bg-navy-600 transition shadow-sm"
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
  )
}