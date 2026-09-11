export const DISTRICT_OFFICER_DISTRICT = 'Delhi'

export function isDistrictOfficer(role) {
  return role === 'District Magistrate'
}

export function scopeProjects(projects, role) {
  return Array.isArray(projects) ? projects : []
}

export function scopeStats({ stats, projects, role }) {
  const base = stats || {}
  return {
    ...base,
    totalProjects: Array.isArray(projects) ? projects.length : base.totalProjects ?? 0,
    highRiskProjects: Array.isArray(projects) ? projects.filter((p) => Number(p.risk_score) >= 75).length : base.highRiskProjects ?? 0,
    mouzasTracked: Array.isArray(projects) ? projects.reduce((sum, p) => sum + Number(p.mouzas_affected || 0), 0) : base.mouzasTracked ?? 0,
  }
}