import React, { createContext, useContext, useState } from 'react'

const RoleContext = createContext(null)
const STORAGE_KEY = 'parivekshan.session'

const ROLES = ['District Magistrate', 'Admin', 'Viewer']

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed.email === 'string' && ROLES.includes(parsed.role)) {
      return parsed
    }
  } catch (err) {
    console.error('Failed to parse session:', err)
  }
  return null
}

export function RoleProvider({ children }) {
  const [session, setSession] = useState(loadSession)

  const setRole = (next) => {
    setSession(next)
    try {
      if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      else localStorage.removeItem(STORAGE_KEY)
    } catch (err) {
      console.error('Failed to persist session:', err)
    }
  }

  const clearRole = () => {
    setSession(null)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (err) {
      console.error('Failed to clear session:', err)
    }
  }

  return (
    <RoleContext.Provider value={{ email: session?.email ?? '', role: session?.role ?? null, setRole, clearRole }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  return useContext(RoleContext)
}