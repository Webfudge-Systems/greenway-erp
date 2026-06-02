# Greenways Suite — Deployment Guide

Monorepo apps:

| App | Package | Default port | Production URL (example) |
|-----|---------|--------------|---------------------------|
| Organization Manager | `@greenways/organization-manager` | 3000 | https://greenwaymobility.in |
| Accounts | `@greenways/accounts` | 3001 | https://accounts.greenwaymobility.in |
| PM | `@greenways/pm` | 3002 | https://pm.greenwaymobility.in |
| API (Strapi 5) | `@greenways/api` | 1337 | https://api.greenwaymobility.in |

**Requirements:** Node.js 20+, npm 9+. Production API must use **PostgreSQL** (not SQLite).

---

## 1. Build verification (CI / pre-deploy)

```bash
npm ci
npm run build
```

Builds all apps via Turborepo. Next.js apps emit **standalone** output for Docker.

---

## 2. Docker (full stack)

1. Copy env template and set secrets:

   ```bash
   cp .env.production.example .env
   # Edit .env — APP_KEYS, JWT secrets, DATABASE_PASSWORD, public URLs
   ```

2. Build and run:

   ```bash
   docker compose build
   docker compose up -d
   ```

3. Open services:

   - Organization Manager: http://localhost:3000  
   - Accounts: http://localhost:3001  
   - PM: http://localhost:3002  
   - API: http://localhost:1337  

**Note:** `NEXT_PUBLIC_*` variables are embedded at **image build** time. After changing them, rebuild the affected frontend images:

```bash
docker compose build organization-manager accounts pm
```

### Single-app images

```bash
# Organization Manager
docker build -f docker/Dockerfile.next \
  --build-arg APP_FILTER=@greenways/organization-manager \
  --build-arg APP_PATH=apps/organization-manager \
  --build-arg PORT=3000 \
  -t greenways-organization-manager .

# API
docker build -f docker/Dockerfile.api -t greenways-api .
```

---

## 3. Vercel (Next.js apps)

Create one Vercel project per frontend app.

| Setting | Organization Manager | Accounts | PM |
|---------|----------------------|----------|-----|
| Root Directory | `apps/organization-manager` | `apps/accounts` | `apps/pm` |
| Include source files outside Root Directory | **On** | **On** | **On** |
| Build Command | `cd ../.. && npx turbo run build --filter=@greenways/organization-manager` | `...filter=@greenways/accounts` | `...filter=@greenways/pm` |
| Install Command | `cd ../.. && npm ci` | same | same |

Set environment variables from each app’s `.env.example` (production URLs). Redeploy after changing `NEXT_PUBLIC_*`.

Deploy the API separately (Railway, Render, Fly.io, VPS + Docker, or Strapi Cloud) with PostgreSQL.

---

## 4. API (Strapi) — production checklist

1. Set `DATABASE_CLIENT=postgres` and connection vars (see `apps/api/.env.example`).
2. Set all secrets: `APP_KEYS`, `JWT_SECRET`, `ADMIN_JWT_SECRET`, `API_TOKEN_SALT`, `TRANSFER_TOKEN_SALT`, `ENCRYPTION_KEY`.
3. Set `NODE_ENV=production`.
4. Configure `CORS_ORIGINS` for any staging/preview domains not covered by defaults in `apps/api/config/middlewares.js`.
5. Persist `public/uploads` (volume or object storage).
6. Run `npm run build --workspace=@greenways/api` then `npm run start --workspace=@greenways/api`.

---

## 5. Per-app environment files

| App | Template |
|-----|----------|
| Organization Manager | `apps/organization-manager/.env.example` |
| Accounts | `apps/accounts/.env.example` |
| PM | `apps/pm/.env.example` |
| API | `apps/api/.env.example` |
| Docker stack | `.env.production.example` |

Never commit `.env`, `.env.local`, or production secrets.

---

## 6. Scripts reference

```bash
npm run build                 # all apps
npm run build:org-manager     # organization manager only
npm run build:accounts
npm run build:pm
npm run build:api
npm run docker:build          # compose build
npm run docker:up             # compose up -d
```

`dev:landing` and `build:landing` remain as aliases for `dev:org-manager` / `build:org-manager`.
