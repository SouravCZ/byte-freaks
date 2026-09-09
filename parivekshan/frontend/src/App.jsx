import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Portal from './pages/Portal'
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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Portal />} />
      <Route path="/login" element={<Login />} />
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