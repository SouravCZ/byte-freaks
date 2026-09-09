import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRole } from '../../lib/roleContext'

const ROLES = ['District Magistrate', 'Admin', 'Viewer']

export default function LoginForm({ onSuccess }) {
  const navigate = useNavigate()
  const { setRole } = useRole()
  const [email, setEmail] = useState('dm@parivekshan.gov.in')
  const [role, setRoleName] = useState('District Magistrate')

  const handleSubmit = (e) => {
    e.preventDefault()
    setRole({ email: email.trim() || 'dev@parivekshan.gov.in', role })
    if (onSuccess) onSuccess(role)
    else navigate('/dashboard')
  }

  return (
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
          <p className="text-xs text-slate-400 mt-1.5">National command view: tracked states.</p>
        )}
        {role === 'Admin' && (
          <p className="text-xs text-slate-400 mt-1.5">Unrestricted view: all states & districts.</p>
        )}
      </div>

      <button
        type="submit"
        className="w-full py-2.5 rounded bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition shadow-sm"
      >
        Enter dashboard
      </button>
    </form>
  )
}
