import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import SeoShell from './components/SeoShell'
import NotFound from './pages/NotFound'
import AccessDenied from './pages/AccessDenied'
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
import { can } from './lib/permissions'

function Protected({ children }) {
  const { role } = useRole()
  if (!role) return <Navigate to="/login" replace />
  return children
}

function Guarded({ children, action, page }) {
  const { role } = useRole()
  if (role && !can(role, action)) return <Navigate to="/access-denied" replace state={{ accessDenied: page }} />
  return children
}

export default function App() {
  return (
    <HelmetProvider>
      <SeoShell />
      <Routes>
        <Route path="/" element={<Portal />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Protected><Guarded action="view_dashboard" page="Overview"><Overview /></Guarded></Protected>} />
        <Route path="/projects" element={<Protected><Guarded action="view_projects" page="Projects"><Projects /></Guarded></Protected>} />
        <Route path="/projects/:id" element={<Protected><Guarded action="view_project_detail" page="Project detail"><ProjectDetail /></Guarded></Protected>} />
        <Route path="/analytics" element={<Protected><Guarded action="view_analytics" page="Analytics"><Analytics /></Guarded></Protected>} />
        <Route path="/ml-projects" element={<Protected><MLProjects /></Protected>} />
        <Route path="/alerts" element={<Protected><Guarded action="view_alerts" page="Alerts"><Alerts /></Guarded></Protected>} />
        <Route path="/users" element={<Protected><Guarded action="manage_users" page="User management"><Users /></Guarded></Protected>} />
        <Route path="/access-denied" element={<AccessDenied />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HelmetProvider>
  )
}
