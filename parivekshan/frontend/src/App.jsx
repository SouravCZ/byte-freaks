import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import DistrictLanding from './pages/DistrictLanding'
import NationalLanding from './pages/NationalLanding'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'

function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center space-y-8 p-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Parivekshan AI</h1>
          <p className="text-slate-500">Select a landing page to preview</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/district" element={<DistrictLanding />} />
      <Route path="/national" element={<NationalLanding />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/projects/:id" element={<ProjectDetail />} />
    </Routes>
  )
}
