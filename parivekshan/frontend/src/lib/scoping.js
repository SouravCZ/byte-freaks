export const DISTRICT_OFFICER_DISTRICT = 'North 24 Parganas'

export function isDistrictOfficer(role) {
  return role === 'District Officer'
}

export function scopeProjects(projects, role) {
  const list = Array.isArray(projects) ? projects : []
  if (!isDistrictOfficer(role)) return list
  return list.filter((p) => (p.district || '') === DISTRICT_OFFICER_DISTRICT)
}

export function scopeStats({ stats, projects, role }) {
  const scopedProjects = scopeProjects(projects, role)
  const base = stats || {}
  if (!isDistrictOfficer(role)) {
    return {
      ...base,
      totalProjects: Array.isArray(projects) ? projects.length : base.totalProjects ?? 0,
      highRiskProjects: Array.isArray(projects) ? projects.filter((p) => Number(p.risk_score) >= 75).length : base.highRiskProjects ?? 0,
      mouzasTracked: Array.isArray(projects) ? projects.reduce((sum, p) => sum + Number(p.mouzas_affected || 0), 0) : base.mouzasTracked ?? 0,
    }
  }
  return {
    ...base,
    totalProjects: scopedProjects.length,
    highRiskProjects: scopedProjects.filter((p) => Number(p.risk_score) >= 75).length,
    mouzasTracked: scopedProjects.reduce((sum, p) => sum + Number(p.mouzas_affected || 0), 0),
  }
}