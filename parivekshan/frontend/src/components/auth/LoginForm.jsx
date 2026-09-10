import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRole } from '../../lib/roleContext'

const ROLES = [
  { id: 'District Magistrate', label: 'District Magistrate', desc: 'State-scoped command view' },
  { id: 'Admin', label: 'Ministry Admin', desc: 'National view — all states & districts' },
  { id: 'Viewer', label: 'Auditor / Viewer', desc: 'Read-only analytical view' },
]

export default function LoginForm({ onSuccess }) {
  const navigate = useNavigate()
  const { setRole } = useRole()
  const [email, setEmail] = useState('dm@parivekshan.gov.in')
  const [roleLabel, setRoleLabel] = useState('District Magistrate')

  const selectedRole = ROLES.find((r) => r.id === roleLabel)

  const handleSubmit = (e) => {
    e.preventDefault()
    setRole({ email: email.trim() || 'dev@parivekshan.gov.in', role: roleLabel })
    if (onSuccess) onSuccess(roleLabel)
    else navigate('/dashboard')
  }

  const inputCls =
    'w-full px-3.5 py-2.5 rounded-lg border border-border-strong bg-surface-container-low text-[14px] text-text-primary placeholder:text-text-muted transition focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="signin-email" className="block text-[13px] font-medium text-text-secondary mb-1.5">
          Email
        </label>
        <input
          id="signin-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@parivekshan.gov.in"
          className={inputCls}
          autoComplete="username"
        />
      </div>

      <div>
        <label htmlFor="signin-role" className="block text-[13px] font-medium text-text-secondary mb-1.5">
          Role
        </label>
        <div className="space-y-2">
          {ROLES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRoleLabel(r.id)}
              className={`w-full text-left px-3.5 py-2.5 rounded-lg border transition-all ${
                roleLabel === r.id
                  ? 'border-primary bg-primary-container/60 ring-1 ring-primary/20'
                  : 'border-border-strong bg-surface-container-low hover:border-outline'
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className={`text-[13px] font-semibold ${roleLabel === r.id ? 'text-on-primary-container' : 'text-text-primary'}`}>{r.label}</span>
                {roleLabel === r.id && (
                  <span className="material-symbols-outlined text-[15px] text-primary">check_circle</span>
                )}
              </span>
              <span className="block text-[12px] text-text-muted mt-0.5">{r.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-2.5 rounded-lg bg-primary text-white text-[14px] font-semibold hover:bg-accent-cyan-deep active:scale-[0.99] transition-all shadow-card"
      >
        Enter dashboard
      </button>
    </form>
  )
}