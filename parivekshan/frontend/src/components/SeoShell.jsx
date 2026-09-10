import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'

const BASE_TITLE = 'Parivekshan AI · MoRD GeoRisk Suite'
const BASE_DESCRIPTION = 'National predictive platform for land acquisition delay monitoring. Decision support for District Collectorates and infrastructure authorities.'

const PAGE_META = {
  '/': {
    title: BASE_TITLE,
    description: BASE_DESCRIPTION,
  },
  '/login': {
    title: 'Sign in — Parivekshan AI',
    description: 'Authorised official sign-in for the Parivekshan AI GeoRisk Suite. NIC-verified identity for District Collectorates and ministries.',
  },
  '/dashboard': {
    title: 'Command Dashboard — Parivekshan AI',
    description: 'Live national telemetry for land acquisition, compensation, and statutory delay risk across every active district and corridor.',
  },
  '/projects': {
    title: 'Project Directory — Parivekshan AI',
    description: 'Browse and filter the national land acquisition project pipeline. Search by code, district, type, and status across all active corridors.',
  },
  '/ml-projects': {
    title: 'ML Risk Projects — Parivekshan AI',
    description: 'West Bengal land acquisition projects with XGBoost-predicted delay risk categories, district breakdowns, and SHAP-driven risk drivers.',
  },
  '/analytics': {
    title: 'ML Risk Prediction Dashboard — Parivekshan AI',
    description: 'Model accuracy metrics, feature importance, confusion matrix, and per-project-type delay risk predictions from the XGBoost delay engine.',
  },
  '/alerts': {
    title: 'Project Alerts — Parivekshan AI',
    description: 'Watch-flagged land acquisition projects with high delay probability at statutory bottleneck stages. Filter by district, type, and risk.',
  },
  '/users': {
    title: 'Users & Roles — Parivekshan AI',
    description: 'Identity, role, and scope governance for the Parivekshan AI GeoRisk Suite. District Magistrate, Ministry Admin, and Auditor views.',
  },
  '/access-denied': {
    title: 'Access Denied — Parivekshan AI',
    description: 'You do not have permission to view this page under the role-based access policy.',
  },
  '/404': {
    title: 'Page Not Found — Parivekshan AI',
    description: 'The page you are looking for does not exist.',
  },
}

export default function SeoShell({ title, description }) {
  const location = useLocation()
  // Dynamic routes (e.g. /projects/:id) fall back to their static prefix.
  const segments = location.pathname.split('/').filter(Boolean)
  const staticPath = segments.length > 1 ? `/${segments[0]}` : `/${segments[0] ?? ''}`
  const entry = PAGE_META[location.pathname] || PAGE_META[staticPath] || PAGE_META['/']

  const resolvedTitle = title ?? entry.title
  const resolvedDescription = description ?? entry.description

  return (
    <Helmet>
      <title>{resolvedTitle}</title>
      <meta name="description" content={resolvedDescription} />
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
    </Helmet>
  )
}

export { BASE_TITLE, BASE_DESCRIPTION }
