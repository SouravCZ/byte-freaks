import { DISTRICT_OFFICER_DISTRICT } from './scoping'

const ROLE_VIEWER = 'Viewer'
const ROLE_DISTRICT = 'District Magistrate'
const ROLE_ADMIN = 'Admin'

const ACTION_ROLES = {
  view_dashboard: [ROLE_VIEWER, ROLE_DISTRICT, ROLE_ADMIN],
  view_projects: [ROLE_VIEWER, ROLE_DISTRICT, ROLE_ADMIN],
  view_project_detail: [ROLE_VIEWER, ROLE_DISTRICT, ROLE_ADMIN],
  view_analytics: [ROLE_VIEWER, ROLE_DISTRICT, ROLE_ADMIN],
  view_alerts: [ROLE_DISTRICT, ROLE_ADMIN],
  mark_alert_read: [ROLE_DISTRICT, ROLE_ADMIN],
  edit_project: [ROLE_DISTRICT, ROLE_ADMIN],
  delete_project: [ROLE_ADMIN],
  manage_users: [ROLE_ADMIN],
  create_user: [ROLE_ADMIN],
  edit_user: [ROLE_ADMIN],
}

export function can(role, action) {
  const allowed = ACTION_ROLES[action]
  if (!allowed) return false
  return allowed.includes(role)
}

export function canEditProject(role, district) {
  if (!can(role, 'edit_project')) return false
  if (role === ROLE_ADMIN) return true
  return (district || '') === DISTRICT_OFFICER_DISTRICT
}

export function canManageAlert(role, district) {
  if (!can(role, 'mark_alert_read')) return false
  if (role === ROLE_ADMIN) return true
  return (district || '') === DISTRICT_OFFICER_DISTRICT
}

export function scopeAlertsByRole(alerts, role, districtByCode) {
  if (!Array.isArray(alerts)) return []
  if (!can(role, 'view_alerts')) return []
  if (role === ROLE_ADMIN) return alerts
  const assigned = DISTRICT_OFFICER_DISTRICT || ''
  return alerts.filter((a) => (districtByCode?.[a.project_code] || '') === assigned)
}