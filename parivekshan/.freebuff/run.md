# Parivekshan — Run Guide (this workspace)

## Services (all detached, logs in `.freebuff/`)

| Service | Port | Start command (from repo root) | Log |
|---|---|---|---|
| Vite frontend | 4173 | `powershell -NoProfile -Command "(Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','dev','--','--port','4173','--host','127.0.0.1' -WorkingDirectory '<root>\frontend' -RedirectStandardOutput '<root>\.freebuff\preview-vite.log' -RedirectStandardError '<root>\.freebuff\preview-vite.log.err' -WindowStyle Hidden -PassThru).Id"` | `.freebuff/preview-vite.log` |
| Node API (Express) | 5000 | same pattern, `node.exe` + `src/server.js`, WorkingDirectory `<root>\backend`; set `$env:CLIENT_ORIGIN='http://localhost:5173,http://127.0.0.1:4173,http://localhost:4173'` first | `.freebuff/backend.log` |
| ML model server (FastAPI/uvicorn) | 8000 | same pattern, `python.exe` + `-m uvicorn model_server:app --host 0.0.0.0 --port 8000`, WorkingDirectory `<root>\ml\src` | `.freebuff/ml-server.log` |

## Prerequisites
- PostgreSQL 18 running on 5432 (service `postgresql-x64-18`). DB `parivekshan`, role `parivekshan`/`parivekshan`, password for `postgres` superuser: ask the user (it is NOT stored here).
- Schema/seed: `psql -U parivekshan -h localhost -d parivekshan -f database/schema.sql`, then `ml_schema.sql`, then `seed.sql`.
- Python deps: `pip install -r ml/requirements.txt`. Model artifacts in `models/` (train via `cd ml/src && python train.py <csv>`).

## Frontend env
- `frontend/.env.local` (this worktree): `VITE_API_URL=http://127.0.0.1:5000`, `VITE_ML_URL=http://127.0.0.1:8000`. Vite picks this up on restart.

## Gotchas learned the hard way
- The Node backend **exits on boot** if PG auth fails — check `.freebuff/backend.log` first.
- CORS: backend whitelist must include the actual browser origin (preview uses `127.0.0.1:4173`, not `localhost:5173`).
- The ML server takes ~10–15 s to load the XGBoost model; `/health` answers 200 only after "Model loaded" appears in its log.
- Port 8000 vs 8001: older docs/README mention 8001; this workspace standardizes on **8000** via `.env.local`.
