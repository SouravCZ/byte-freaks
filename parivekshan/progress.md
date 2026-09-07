# Parivekshan AI — Progress Log

## Session: Frontend wiring to live backend API

### What was done

1. **Checkpoint commit** — captured the pre-existing state (landing pages + working backend/db) before any dashboard work.
   - Commit: `f4920de` "checkpoint: landing pages + working backend/db before dashboard build"

2. **Added Projects list page** (`/projects`)
   - `src/pages/Projects.jsx` — fetches `GET /api/projects`, renders a table of live Postgres rows (code, name, type, block, status, risk %, delay). Has loading + error states.

3. **Added Project Detail page** (`/projects/:id`)
   - `src/pages/ProjectDetail.jsx` — fetches `GET /api/projects/:id`, renders real risk_score, SHAP-style risk drivers, and project alerts. Has loading + 404/error handling.

4. **Registered routes** in `src/App.jsx`
   - Added `/projects` and `/projects/:id` alongside existing `/`, `/district`, `/national`.
   - Added a "Projects Dashboard" link on the homepage picker.

5. **Wired landing-page dashboards to the API**
   - DistrictLanding "Live Dashboard" + NationalLanding "Command Center" now fetch `GET /api/stats` and `GET /api/blocks` via `useEffect` + `fetch`, with loading states. Hardcoded numbers replaced with live data.

6. **Frontend API config**
   - Created `frontend/.env` with `VITE_API_URL=http://localhost:5000` (fallback baked into components).

7. **Verified**
   - `npm run build` passes clean (zero errors; one chunk-size warning).
   - Dev server on `localhost:5173` returns 200 for `/`, `/district`, `/national`, `/projects`.
   - Backend `localhost:5000/api` confirmed live: `/api/stats`, `/api/blocks`, `/api/projects`, `/api/projects/:id` all return real Postgres data.

### API usage in frontend

| Page | Endpoint(s) |
|------|-------------|
| `/projects` | `GET /api/projects` |
| `/projects/:id` | `GET /api/projects/:id` |
| `/district` dashboard | `GET /api/stats`, `GET /api/blocks` |
| `/national` dashboard | `GET /api/stats`, `GET /api/blocks` |

### Next steps / open items
- Role-based access (RBAC) is **not** implemented yet — no auth system, no role gating.
- Empty stub files remain (Overview.jsx, Users.jsx, Analytics.jsx, Alerts.jsx, and several components) — unused, unrouted, 0 bytes.
- `dist/` build artifacts are currently tracked in git.
