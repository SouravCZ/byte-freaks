import React from 'react'
import { useRole } from '../../lib/roleContext'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AppShell({ icon, title, subtitle, children }) {
  const { role } = useRole()

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar title={title} subtitle={subtitle} />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Parivekshan AI · NSDSS</p>
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Session: {role || 'anonymous'}</p>
          </div>
        </footer>
      </div>
    </div>
  )
}