# Deploy Greenways Suite — Railway (API + Postgres) + Vercel (Frontends)

Step-by-step for your current Railway setup: **Greenway-Backend** + **Postgres** (+ Redis is optional; Strapi does not require it).

---

## Overview

| Layer | Platform | What |
|-------|----------|------|
| API | Railway | Strapi 5 (`apps/api`) |
| Database | Railway | PostgreSQL (linked to backend) |
| Organization Manager | Vercel | `apps/organization-manager` |
| Accounts | Vercel | `apps/accounts` |
| PM | Vercel | `apps/pm` |

---

## Part A — Railway (backend + database)

### Step 1 — Postgres

1. In your Railway project, open **Postgres** (already **Online**).
2. **Variables** tab → note `DATABASE_URL` (you will reference this, not copy into git).

### Step 2 — Configure Greenway-Backend service

1. Open **Greenway-Backend** → **Settings**.
2. **Root Directory:** set to `apps/api` (recommended).
3. **Build:** Nixpacks will use `apps/api/nixpacks.toml` (Node 20, `npm run build`).
4. **Start:** `npm run start` (from `apps/api/railway.toml`).

If you keep the repo root as Root Directory instead, Railway uses root `nixpacks.toml` / `railway.toml`.

### Step 3 — Link Postgres to backend

1. Greenway-Backend → **Variables** → **Add variable reference**.
2. Select **Postgres** → `DATABASE_URL`.
3. Railway injects the connection string automatically.

### Step 4 — Set backend environment variables

Use `apps/api/.env.railway.example` as the checklist. Minimum set:

| Variable | Value |
|----------|--------|
| `NODE_ENV` | `production` |
| `HOST` | `0.0.0.0` |
| `DATABASE_CLIENT` | `postgres` |
| `DATABASE_URL` | Reference → Postgres |
| `DATABASE_SSL` | `true` |
| `DATABASE_SSL_REJECT_UNAUTHORIZED` | `false` |
| `APP_KEYS` | Two keys, comma-separated (`openssl rand -base64 32` × 2) |
| `API_TOKEN_SALT` | `openssl rand -base64 32` |
| `ADMIN_JWT_SECRET` | `openssl rand -base64 32` |
| `TRANSFER_TOKEN_SALT` | `openssl rand -base64 32` |
| `JWT_SECRET` | `openssl rand -base64 32` |
| `ENCRYPTION_KEY` | `openssl rand -base64 32` |
| `PUBLIC_URL` | `https://<your-railway-domain>.up.railway.app` |
| `STRAPI_ADMIN_BACKEND_URL` | Same as `PUBLIC_URL` |
| `CORS_ORIGINS` | Your Vercel + custom domains (comma-separated) |
| `PLATFORM_ADMIN_EMAIL` | Your super-admin email |
| `PLATFORM_ADMIN_PASSWORD` | Strong password (first deploy only) |

Do **not** set `PORT` — Railway assigns it.

### Step 5 — Networking & domain

1. Greenway-Backend → **Settings** → **Networking** → **Generate domain**.
2. Copy the public URL (e.g. `https://greenway-backend-production.up.railway.app`).
3. Update `PUBLIC_URL` and `STRAPI_ADMIN_BACKEND_URL` to that URL.
4. (Later) Add custom domain `api.greenwaymobility.in` and point DNS to Railway.

### Step 6 — Deploy backend

1. Connect GitHub repo (already done).
2. Push to the branch Railway watches, or click **Deploy**.
3. Watch **Deploy logs** until build finishes (`strapi build` then `strapi start`).
4. Open `https://<railway-domain>/admin` — Strapi admin should load.

### Step 7 — Uploads (important)

Strapi file uploads live in `public/uploads`. On Railway, add a **volume** mounted at `/app/public/uploads` (or redeploys will wipe uploads). For production, plan S3/R2 later.

### Step 8 — Redis (optional)

Redis is now used for API response caching (ERP read-heavy endpoints).

1. Keep your Redis service running.
2. In **Greenway-Backend → Variables**, add a reference for `REDIS_URL` from Redis.
3. Set (or verify):
   - `REDIS_ENABLED=true`
   - `CACHE_API_ENABLED=true`
   - `CACHE_TTL_SECONDS=300` (adjust between `120`-`600` based on freshness needs)
4. Redeploy backend.

Behavior:
- GET `/api/*` responses are cached per `user + organization + role + route+query`.
- Mutations (`POST/PUT/PATCH/DELETE`) invalidate org cache to avoid stale ERP data.
- Response headers: `X-Cache: HIT|MISS`, `X-Cache-Invalidate`.

---

## Part B — Vercel (three separate projects)

Deploy **three independent Vercel projects** from the same GitHub repo.  
Do **not** create one Vercel project at the repo root — each app gets its own project and **Root Directory**.

| Vercel project name (example) | Root Directory | `vercel.json` |
|------------------------------|----------------|---------------|
| `greenways-org-manager` | `apps/organization-manager` | in that folder |
| `greenways-accounts` | `apps/accounts` | in that folder |
| `greenways-pm` | `apps/pm` | in that folder |

### Shared Vercel settings (every frontend project)

When importing the repo, click **Edit** next to Root Directory and set the path above.

1. **Framework Preset:** Next.js  
2. **Root Directory:** `apps/<app-name>` (not the repo root)  
3. **Include source files outside of the Root Directory:** **Enabled** (required — apps use `packages/*` from the monorepo)  
4. **Build & Development Settings** (also in each app’s `vercel.json`):
   - **Install Command:** `cd ../.. && npm ci` — installs the workspace from the repo root  
   - **Build Command:** `npm run build` — builds **only** this app  
   - **Output Directory:** leave default (Next.js)  
5. **Environment variables:** see `docs/env.vercel.example` (same values on all three projects, except PM/Accounts optional vars)

You do **not** need Turborepo on Vercel. Each project builds itself after a root-level `npm ci`.

### Step 9 — Organization Manager

1. Vercel → **Add New** → **Project** → import repo.  
2. **Root Directory:** `apps/organization-manager` → Continue.  
3. Confirm install/build commands match `apps/organization-manager/vercel.json`.  
4. Add env vars (Production + Preview):

   ```
   NEXT_PUBLIC_API_URL=https://<your-railway-api-domain>
   NEXT_PUBLIC_ORG_MANAGER_URL=https://<this-project-vercel-url>
   NEXT_PUBLIC_SITE_URL=https://<this-project-vercel-url>
   NEXT_PUBLIC_ACCOUNTS_APP_URL=https://<accounts-project-url>
   NEXT_PUBLIC_PM_APP_URL=https://<pm-project-url>
   NEXT_IGNORE_INCORRECT_LOCKFILE=1
   ```

5. Deploy → copy this project’s `.vercel.app` URL.

### Step 10 — Accounts

1. **Add New** → **Project** → **same repo** (second project).  
2. **Root Directory:** `apps/accounts`.  
3. Enable **Include source files outside Root Directory**.  
4. Same `NEXT_PUBLIC_*` URLs as Step 9 (use each app’s real Vercel URL or custom domain).  
5. Deploy.

### Step 11 — PM

1. **Add New** → **Project** → **same repo** (third project).  
2. **Root Directory:** `apps/pm`.  
3. Same settings and env vars as Accounts.  
4. Deploy.

### Step 12 — Custom domains (when ready)

| Vercel project | Example domain |
|----------------|----------------|
| Organization Manager | `greenwaymobility.in` |
| Accounts | `accounts.greenwaymobility.in` |
| PM | `pm.greenwaymobility.in` |

After adding domains, update **all** `NEXT_PUBLIC_*` values to production URLs and **Redeploy** all three Vercel projects.

---

## Part C — Wire everything together

### Step 13 — Update Railway CORS

Add to Railway `CORS_ORIGINS` (comma-separated):

- All three Vercel production URLs
- Custom domains when live
- `https://greenwaymobility.in`, `https://accounts.greenwaymobility.in`, `https://pm.greenwaymobility.in`

`*.vercel.app` preview URLs are already allowed by code.

Redeploy Railway after changing CORS.

### Step 14 — Smoke test

1. `GET https://<railway-api>/api` or open `/admin`.
2. Organization Manager → `/login` → platform super-admin login.
3. Create/open an organization.
4. Open Accounts and PM → login as org user (if seeded).
5. Check browser Network tab: API calls go to Railway URL, no CORS errors.

---

## Quick reference — env files in repo

| File | Use |
|------|-----|
| `apps/api/.env.railway.example` | Railway backend variables |
| `docs/env.vercel.example` | Vercel variables (all frontends) |
| `apps/organization-manager/.env.example` | Local dev |
| `apps/accounts/.env.example` | Local dev |
| `apps/pm/.env.example` | Local dev |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails on Railway | Root Directory = `apps/api`; Node 20; check deploy logs |
| DB connection error | Link `DATABASE_URL` from Postgres; `DATABASE_SSL=true`, `DATABASE_SSL_REJECT_UNAUTHORIZED=false` |
| CORS blocked | Add frontend origin to `CORS_ORIGINS`; redeploy API |
| Admin panel wrong URL | Set `PUBLIC_URL` + `STRAPI_ADMIN_BACKEND_URL` to Railway public URL |
| Vercel build can’t find `@greenways/*` packages | Root Directory = `apps/<app>`; enable **Include source files outside Root Directory**; Install = `cd ../.. && npm ci` |
| Wrong app built | Do not set Root Directory to repo root; use `npm run build` (not turbo from root) |
| `NEXT_PUBLIC_*` wrong after deploy | Redeploy Vercel (vars are baked in at build time) |
| Redis connected but no cache hits | Ensure requests are repeated with same user/org/query and `CACHE_API_ENABLED=true` |
| Stale data after writes | Confirm mutation routes send `X-Organization-Id` and check `X-Cache-Invalidate` header |

---

## Generate secrets (local terminal)

```bash
openssl rand -base64 32
```

Run twice for `APP_KEYS` (two values, one comma between them).
