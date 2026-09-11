        # Parivekshan AI — Complete Feature Catalog

        > Predictive land acquisition delay monitoring and risk assessment platform for District Collectors and infrastructure ministries.

        ---

        ## 1. Landing Page (Portal)

        | # | Feature | Description |
        |---|---------|-------------|
        | 1.1 | Sticky navigation bar | Fixed top nav with scroll-aware background blur and shadow |
        | 1.2 | Mobile hamburger menu | Responsive slide-down menu with login CTA |
        | 1.3 | Hero section | Full-width hero with background image, gradient overlay, grid pattern, tagline, stats row (delay reduction, active districts, projects monitored, model accuracy) |
        | 1.4 | Animated marquee | Auto-scrolling ticker of national corridor names (Bharatmala, DFC, LWE, NHDP, PMGSY, Sagarmala) |
        | 1.5 | Context & Problem section | Problem statement with "Stuck capital" card (₹1.8 Lakh Cr stat) and 3 corridor risk cards (Bharatmala, DFC, LWE) with risk badges |
        | 1.6 | How It Works — 6 stages | Numbered stage cards: Land → Baseline → Model → Monitor → Alert → Report |
        | 1.7 | Features grid | 9 feature cards with icons: Risk Scoring, Notifications, District Roll-ups, RFCTLARR Mapping, Daily Ingestion, Delay Attribution, Custom Alerting, Export & Report Builder, Consent Ledger |
        | 1.8 | Dashboard preview mockup | Interactive-looking static mockup of the dashboard UI with KPI cards, bar chart, and sidebar panels |
        | 1.9 | Impact metrics | 4 KPI tiles: delay reduction, active districts, compensation pipeline, model accuracy |
        | 1.10 | Use cases | 4 scenario cards: State-wide, District, Corridor, Local — each with metrics and status |
        | 1.11 | FAQ accordion | 5 expandable Q&A items with smooth open/close transitions |
        | 1.12 | Contact form | Full demo request form: name, email, organisation, use case dropdown, message, submit with success toast |
        | 1.13 | Footer | Brand description, Product links (Features, Dashboard, Impact, FAQ), Company links (About, How it Works, Contact), copyright |
        | 1.14 | Print button | Header button to trigger `window.print()` for portal pages |

        ---

        ## 2. Authentication

        | # | Feature | Description |
        |---|---------|-------------|
        | 2.1 | Login page | Full-page login with email/password form |
        | 2.2 | Login form | Validated input fields with focus ring, error state display |
        | 2.3 | Role-based session | Role context provider (`useRole`) with `RoleProvider` wrapping the app |
        | 2.4 | Role scoping | `scopeProjects()` filters data by district for District Officers |
        | 2.5 | Role-based permissions | `can(role, action)` function gating: manage_users, edit_project, mark_alert_read, view_alerts, manage_alerts |
        | 2.6 | Access denied page | Dedicated `/access-denied` page with context about which page was blocked |
        | 2.7 | 404 Not Found page | Custom catch-all route with illustration, back-to-projects and return-to-dashboard CTAs |

        ---

        ## 3. Command Dashboard (Overview)

        | # | Feature | Description |
        |---|---------|-------------|
        | 3.1 | KPI stat cards | Total projects, high-risk count, unread alerts, blocks monitored |
        | 3.2 | Alert escalation queue | Severity-sorted list of critical/high alerts with mark-read actions |
        | 3.3 | Block risk bar chart | Horizontal bar chart of blocks by risk score with color-coded thresholds |
        | 3.4 | Project type distribution | Pie/donut breakdown of projects by type |
        | 3.5 | State filter | Dropdown to filter data by state/UT |
        | 3.6 | Status filter toggle | Active/completed/on-hold filter chips |
        | 3.7 | Re-score projects button | Triggers ML re-scoring of all projects |
        | 3.8 | Loading spinner | Animated spinner with "Loading dashboard…" text |
        | 3.9 | Error state | Card with error icon and retry message |
        | 3.10 | Empty state | When no data matches filters |

        ---

        ## 4. Projects Directory

        | # | Feature | Description |
        |---|---------|-------------|
        | 4.1 | Projects table | Sortable table: code, name, type, block, district, mouzas, status, risk score, delay days |
        | 4.2 | Search | Real-time text search across name, code, district, block |
        | 4.3 | Status filter | Filter by: active, planned, on_hold, completed, cancelled |
        | 4.4 | Risk filter | Filter by risk band: High (≥75), Medium (50–74), Low (<50) |
        | 4.5 | Risk score badges | Color-coded pills (red/amber/green) with numeric score |
        | 4.6 | Status pills | Colored status indicators per project status |
        | 4.7 | Row click navigation | Click row to navigate to project detail page |
        | 4.8 | Corridor count badge | Shows total visible projects |
        | 4.9 | Empty state | "No projects match" with filter adjustment hint |

        ---

        ## 5. Project Detail

        | # | Feature | Description |
        |---|---------|-------------|
        | 5.1 | Project header | Name, code, block, district, project type |
        | 5.2 | Risk score panel | Large risk score display with color-coded band and delay days |
        | 5.3 | Risk drivers (SHAP) | Top risk factors with UP/DOWN impact percentages and bar visualization |
        | 5.4 | Risk history chart | Line chart of risk score over time (from `risk_history` table) |
        | 5.5 | Project map | MapLibre GL map with Esri World Imagery tiles, risk-colored marker, popup with metadata, fly-to on load |
        | 5.6 | Marker interactions | Custom HTML marker with pulse ring, hover scale, click popup |
        | 5.7 | Map fallback | Fallback to Delhi coordinates if lat/lng missing |
        | 5.8 | ML prediction panel | Real-time prediction from ML server with risk category, probability, and explanation |
        | 5.9 | ML recommendations | Actionable recommendations based on risk factors |
        | 5.10 | Alert history | List of alerts for this project with severity, title, message, time |
        | 5.11 | Project metadata | Start date, target date, lead time, mouzas affected, description |
        | 5.12 | Back navigation | Link back to projects list |

        ---

        ## 6. Analytics

        | # | Feature | Description |
        |---|---------|-------------|
        | 6.1 | District risk heat map | Grid visualization of blocks colored by risk score with hover tooltips |
        | 6.2 | State-level aggregation | Bars showing risk distribution across districts |
        | 6.3 | Risk band breakdown | High/Medium/Low counts with percentages |
        | 6.4 | Block filter | Filter analytics by specific block |
        | 6.5 | Risk filter | Filter by risk band |
        | 6.6 | Project type facets | Breakdown of project types across selected scope |
        | 6.7 | Anomaly cluster detection | Visual identification of risk anomaly clusters |
        | 6.8 | ML model metrics | Accuracy, F1 score, confusion matrix display |
        | 6.9 | Per-type predictions | ML predictions shown for each project type (Infrastructure, Highway, Railway, etc.) |
        | 6.10 | Overall risk prediction | Aggregate risk prediction across all types |
        | 6.11 | Model info card | Model version, training date, feature count |
        | 6.12 | ML server status | Online/offline indicator with health check |

        ---

        ## 7. Alerts & Escalation

        | # | Feature | Description |
        |---|---------|-------------|
        | 7.1 | Alerts list | Full alert table with severity, title, project, message, time |
        | 7.2 | Severity badges | Color-coded: critical (red), high (orange), moderate (amber), low (green), info (blue) |
        | 7.3 | Alert search | Text search across alert title, project name, message |
        | 7.4 | Severity filter tabs | Filter by: All, Critical, High, Moderate, Low, Info |
        | 7.5 | Unread/Read filter | Toggle between unread and all alerts |
        | 7.6 | Mark as reviewed | Single alert mark-read with API call |
        | 7.7 | Mark filtered as reviewed | Bulk mark-read for all currently visible alerts |
        | 7.8 | Escalation queue | Priority-sorted list of critical/high alerts with timestamps |
        | 7.9 | Time-ago display | Relative timestamps ("14 mins ago", "2 days ago") |
        | 7.10 | Mean response time | Calculated average hours since alert creation |
        | 7.11 | Alert stats | KPI cards: unacknowledged count, total alerts, mean response time |
        | 7.12 | Empty state | "No alerts match" with filter adjustment hint |

        ---

        ## 8. ML Projects (56 West Bengal Predictions)

        | # | Feature | Description |
        |---|---------|-------------|
        | 8.1 | ML predictions table | 56 projects with ML-predicted risk categories from the CSV dataset |
        | 8.2 | Search | Text search across project name, type, district |
        | 8.3 | Type filter | Filter by project type (Highway, Railway, Urban Development, etc.) |
        | 8.4 | Risk filter | Filter by ML risk category: Critical, High, Medium, Low |
        | 8.5 | Sortable columns | Click column headers to sort ascending/descending |
        | 8.6 | Risk category badges | Color-coded pills for Critical (purple), High (red), Medium (amber), Low (green) |
        | 8.7 | Expanded row details | Click to expand and see: delay probability, compensation details, dispute info, RFCTLARR stage data |
        | 8.8 | Column sorting indicators | Arrow icons showing sort direction |
        | 8.9 | Empty state | "No predictions match" message |
        | 8.10 | ML server connection | Fetches predictions from `/api/ml/predict` via the Node backend proxy |

        ---

        ## 9. Users Management

        | # | Feature | Description |
        |---|---------|-------------|
        | 9.1 | Users table | Real data from PostgreSQL: name, designation, email, role, department, status |
        | 9.2 | Role-based access | Only `admin` role can view the Users page |
        | 9.3 | Role badges | Color-coded: Ministry Admin (primary), District Authority (indigo), Viewer (gray) |
        | 9.4 | Role tier labels | Detailed role descriptions: District Collector, ADM, BDO, LAO, etc. |
        | 9.5 | Status filter | Toggle: All, Active, Suspended |
        | 9.6 | Search | Text search across name, email, designation, department |
        | 9.7 | Tab filters | Filter by role category: All Users, Ministry Admin, District Authority, Viewer |
        | 9.8 | KPI cards | Total registered, district authorities, ministry admins, viewers |
        | 9.9 | Initials avatar | Auto-generated from user name |
        | 9.10 | API-driven | Fetches from `GET /api/users` (real PostgreSQL data) |
        | 9.11 | Loading state | Spinner while fetching |
        | 9.12 | Error state | Error card with message |
        | 9.13 | Access denied | Shown to non-admin users |

        ---

        ## 10. Layout & Navigation

        | # | Feature | Description |
        |---|---------|-------------|
        | 10.1 | AppShell | Shared layout wrapper with sidebar + topbar + content area |
        | 10.2 | Sidebar navigation | Collapsible sidebar with icon + label links |
        | 10.3 | Active route highlight | Current page highlighted in sidebar |
        | 10.4 | Topbar | Page title + subtitle display |
        | 10.5 | Responsive design | Mobile-friendly layout with breakpoints |
        | 10.6 | Logo component | Reusable logo with full/compact variants |

        ---

        ## 11. SEO & Error Handling

        | # | Feature | Description |
        |---|---------|-------------|
        | 11.1 | Per-page titles | Dynamic `<title>` tags via `react-helmet-async` |
        | 11.2 | Meta descriptions | Per-page `<meta name="description">` tags |
        | 11.3 | Open Graph tags | OG title, description, type, site name |
        | 11.4 | Twitter card tags | Twitter card meta tags |
        | 11.5 | Title template | `%s — Parivekshan AI` pattern |
        | 11.6 | 404 page | Custom not-found with illustration and CTAs |
        | 11.7 | 403 page | Access denied with context about blocked page |
        | 11.8 | Empty state component | Reusable component with icon, title, message, CTA button |
        | 11.9 | Horizontal scroll prevention | `overflow-x: hidden` at html/body/root level |

        ---

        ## 12. Backend API

        | # | Endpoint | Description |
        |---|----------|-------------|
        | 12.1 | `GET /api/health` | Database connectivity check |
        | 12.2 | `GET /api/stats` | Aggregate KPIs: total projects, high-risk, blocks, unread alerts, mouzas |
        | 12.3 | `GET /api/projects` | List projects with optional `?status=` and `?block=` filters |
        | 12.4 | `GET /api/projects/:id` | Single project with risk drivers, history, and alerts |
        | 12.5 | `POST /api/projects` | Create a new project |
        | 12.6 | `GET /api/blocks` | List all blocks with risk scores |
        | 12.7 | `GET /api/alerts` | List alerts with optional `?unread=true` filter |
        | 12.8 | `PATCH /api/alerts/:id` | Mark alert read/unread |
        | 12.9 | `GET /api/users` | List all users from PostgreSQL |
        | 12.10 | `GET /api/ml/health` | ML model server health check |
        | 12.11 | `GET /api/ml/info` | Model metrics, feature list, version info |
        | 12.12 | `GET /api/ml/features` | Feature importance rankings |
        | 12.13 | `POST /api/ml/predict` | Single project risk prediction |
        | 12.14 | `POST /api/ml/simulate` | What-if simulation with modified features |
        | 12.15 | `POST /api/ml/batch-predict` | Batch prediction for multiple projects |
        | 12.16 | `POST /api/ml/retrain` | Trigger model retraining |
        | 12.17 | `GET /api/ml/registry` | Model version registry |

        ---

        ## 13. ML Pipeline

        | # | Feature | Description |
        |---|---------|-------------|
        | 13.1 | XGBoost multi-class model | Predicts 4 risk categories: Low, Medium, High, Critical |
        | 13.2 | Feature engineering | 20+ engineered features from project metadata |
        | 13.3 | Risk prediction | Per-project risk category with probability scores |
        | 13.4 | SHAP-style explanations | Top risk factors with UP/DOWN impact attribution |
        | 13.5 | What-if simulation | Modify features and see risk score change |
        | 13.6 | Batch prediction | Predict risk for multiple projects at once |
        | 13.7 | Model training | Stratified train/test split, class weight balancing, cross-validation |
        | 13.8 | Auto-retraining | Scheduled retraining with candidate promotion logic |
        | 13.9 | Model registry | Version tracking with metrics comparison |
        | 13.10 | Synthetic data generation | Generate training datasets from project distributions |
        | 13.11 | CSV data merge | Merge multiple CSV datasets for training |
        | 13.12 | Feature importance | XGBoost gain-based feature importance rankings |
        | 13.13 | Confusion matrix | Multi-class confusion matrix for model evaluation |
        | 13.14 | Model metrics persistence | Accuracy, F1, precision, recall saved to JSON |
        | 13.15 | FastAPI model server | REST API serving predictions on port 8001 |
        | 13.16 | Scheduler | Periodic retraining cron job |

        ---

        ## 14. Database

        | # | Feature | Description |
        |---|---------|-------------|
        | 14.1 | PostgreSQL 18 | Primary data store |
        | 14.2 | PostGIS extension | Geospatial queries with `GEOMETRY(Point, 4326)` |
        | 14.3 | pgcrypto extension | UUID generation via `gen_random_uuid()` |
        | 14.4 | Projects table | Full project lifecycle data with spatial coordinates |
        | 14.5 | Blocks table | District block reference with risk scores |
        | 14.6 | Risk drivers table | SHAP-style factor attribution per project |
        | 14.7 | Risk history table | Time-series risk score snapshots |
        | 14.8 | Alerts table | Alert/notification records with severity levels |
        | 14.9 | Users table | RBAC user roles with department and designation |
        | 14.10 | Seed data | Pre-populated demo projects and blocks |

        ---

        ## 15. Cross-Cutting

        | # | Feature | Description |
        |---|---------|-------------|
        | 15.1 | CORS configuration | Multi-origin CORS with environment variable support |
        | 15.2 | Role-based data scoping | District Officers see only their district's data |
        | 15.3 | Role-based UI gating | Buttons/sections shown/hidden based on role permissions |
        | 15.4 | API proxy | Frontend proxies ML requests through Node backend |
        | 15.5 | Vite dev server | Fast HMR development server |
        | 15.6 | Production build | Optimized Vite build with code splitting |
        | 15.7 | Environment variables | `.env` / `.env.local` for API URLs and config |
        | 15.8 | Error boundaries | Graceful error states on every data-fetching page |
        | 15.9 | Loading states | Spinner + text on every async operation |
        | 15.10 | Responsive design | Mobile-first with sm/md/lg/xl breakpoints |
        | 15.11 | Print support | `portico-no-print` class hides non-essential UI when printing |
        | 15.12 | Keyboard shortcut | ⌘K search hint in projects table |
        | 15.13 | Accessibility | ARIA labels on interactive elements, semantic HTML |
        | 15.14 | Google Material Symbols | Icon library used throughout the UI |
        | 15.15 | Tailwind CSS | Utility-first styling with custom design tokens |

        ---

        **Total: 15 sections, 130+ individual features**
