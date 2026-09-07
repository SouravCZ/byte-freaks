import React from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import DistrictLanding from './pages/DistrictLanding'
import NationalLanding from './pages/NationalLanding'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Overview from './pages/Overview'
import Login from './pages/Login'
import Analytics from './pages/Analytics'
import Alerts from './pages/Alerts'
import { useRole } from './lib/roleContext'

function Protected({ children }) {
  const { role } = useRole()
  if (!role) return <Navigate to="/login" replace />
  return children
}

function Home() {
  const { role, clearRole } = useRole()
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center space-y-8 p-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Parivekshan AI</h1>
          <p className="text-slate-500">Select a landing page to preview</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
          <Link to="/district" className="px-8 py-4 bg-navy-500 text-white font-semibold rounded-xl hover:bg-navy-600 transition shadow-lg shadow-navy-500/20">
            District Command Portal
            <span className="block text-xs text-navy-200 font-normal mt-1">North 24 Parganas</span>
          </Link>
          <Link to="/national" className="px-8 py-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/20">
            National Platform
            <span className="block text-xs text-emerald-200 font-normal mt-1">Pan-India Infrastructure</span>
          </Link>
          <Link to="/projects" className="px-8 py-4 bg-white text-navy-500 font-semibold rounded-xl border-2 border-navy-500 hover:bg-navy-50 transition">
            Projects Dashboard
            <span className="block text-xs text-slate-400 font-normal mt-1">Live API data</span>
          </Link>
          {role ? (
            <Link to="/dashboard" className="px-8 py-4 bg-slate-900 text-emerald-400 font-semibold rounded-xl hover:bg-slate-800 transition">
              Dashboard
              <span className="block text-xs text-slate-400 font-normal mt-1">Logged in as {role}</span>
            </Link>
            ) : (
            <Link to="/login" className="px-8 py-4 bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-600 transition">
              Login
              <span className="block text-xs text-slate-300 font-normal mt-1">Mock role gate</span>
            </Link>
          )}
        </div>
        {role && (
          <button onClick={clearRole} className="text-xs font-mono text-slate-400 hover:text-red-500 underline">
            Logout ({role})
          </button>
        )}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/district" element={<DistrictLanding />} />
      <Route path="/national" element={<NationalLanding />} />
      <Route path="/dashboard" element={<Protected><Overview /></Protected>} />
      <Route path="/projects" element={<Protected><Projects /></Protected>} />
      <Route path="/projects/:id" element={<Protected><ProjectDetail /></Protected>} />
      <Route path="/analytics" element={<Protected><Analytics /></Protected>} />
      <Route path="/alerts" element={<Protected><Alerts /></Protected>} />
    </Routes>
  )
}