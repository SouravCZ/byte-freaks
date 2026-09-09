import React from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import DistrictLanding from './pages/DistrictLanding'
import NationalLanding from './pages/NationalLanding'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Overview from './pages/Overview'
import Login from './pages/Login'
import Analytics from './pages/Analytics'
import MLProjects from './pages/MLProjects'
import Alerts from './pages/Alerts'
import Users from './pages/Users'
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
          <h1 className="text-4xl font-extrabold text-black tracking-tight">Parivekshan AI</h1>
          <p className="text-black">Select a landing page to preview</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
          <Link to="/district" className="px-8 py-4 bg-slate-200 text-black font-semibold rounded-xl hover:bg-slate-300 transition shadow-sm">
            District Command Portal
            <span className="block text-xs text-black font-normal mt-1">North 24 Parganas</span>
          </Link>
          <Link to="/national" className="px-8 py-4 bg-slate-200 text-black font-semibold rounded-xl hover:bg-slate-300 transition shadow-sm">
            National Platform
            <span className="block text-xs text-black font-normal mt-1">Pan-India Infrastructure</span>
          </Link>
          <Link to="/projects" className="px-8 py-4 bg-white text-black font-semibold rounded-xl border-2 border-slate-800 hover:bg-slate-100 transition">
            Projects Dashboard
            <span className="block text-xs text-black font-normal mt-1">Live API data</span>
          </Link>
          {role ? (
            <Link to="/dashboard" className="px-8 py-4 bg-slate-200 text-black font-semibold rounded-xl hover:bg-slate-300 transition">
              Dashboard
              <span className="block text-xs text-black font-normal mt-1">Logged in as {role}</span>
            </Link>
            ) : (
            <Link to="/login" className="px-8 py-4 bg-slate-200 text-black font-semibold rounded-xl hover:bg-slate-300 transition">
              Login
              <span className="block text-xs text-black font-normal mt-1">Mock role gate</span>
            </Link>
          )}
        </div>
        {role && (
          <button onClick={clearRole} className="text-xs font-mono text-black hover:text-black underline">
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
      <Route path="/ml-projects" element={<Protected><MLProjects /></Protected>} />
      <Route path="/alerts" element={<Protected><Alerts /></Protected>} />
      <Route path="/users" element={<Protected><Users /></Protected>} />
    </Routes>
  )
}