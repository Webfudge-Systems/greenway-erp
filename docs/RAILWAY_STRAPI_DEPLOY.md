# Strapi API on Railway (Greenways)

Same deployment model as **webfudge-platform** `apps/backend`: no custom `nixpacks.toml`, Root Directory = `apps/api`, Postgres via env vars.

## Summary

When **Postgres is online** but **Greenway-Backend is Crashed** with `KnexTimeoutError`, Postgres is usually fine — Strapi is misconfigured (wrong client, missing SSL, pool too large, or `DATABASE_URL` not linked).

## Scope

- Hosting: [Railway](https://railway.app)
- App: `apps/api` (Strapi 5)
- Database: Railway Postgres

## Railway checklist

### 1. Service settings (API)

| Setting | Value |
|--------|--------|
| **Root directory** | `apps/api` |
| **Build** | `npm install` (or `npm ci` if you add a lockfile under `apps/api`) |
| **Start** | `npm run start` → `strapi start` |
| **Watch paths** | `apps/api/**` (optional) |

Do **not** add a custom `nixpacks.toml` with both `providers = ["python"]` and `python3` — that causes Nix profile conflicts (`pyexpat.h`). Webfudge uses Railway’s default Node buildpack only.

### 2. Link Postgres to the API service

In **Greenway-Backend → Variables**, reference Postgres:

```text
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

Prefer the **private** URL when API and Postgres are in the same project:

```text
DATABASE_URL=${{Postgres.DATABASE_PRIVATE_URL}}
```

### 3. Required variables (API service)

Set manually (Railway does not set `DATABASE_CLIENT` for you). See `apps/api/.env.railway.example`.

```bash
NODE_ENV=production
DATABASE_CLIENT=postgres
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=false
DATABASE_POOL_MIN=0
DATABASE_POOL_MAX=5
SEED_DATA=false

HOST=0.0.0.0
# PORT — set by Railway; do not override

APP_KEYS=<two comma-separated keys>
API_TOKEN_SALT=<secret>
ADMIN_JWT_SECRET=<secret>
TRANSFER_TOKEN_SALT=<secret>
JWT_SECRET=<secret>
ENCRYPTION_KEY=<secret>

PUBLIC_URL=https://<your-railway-domain>
STRAPI_ADMIN_BACKEND_URL=https://<your-railway-domain>
CORS_ORIGINS=https://your-frontends...
```

Generate secrets:

```bash
openssl rand -base64 32
```

### 4. Redis (optional)

Link **Redis** → inject `REDIS_URL`. Set `REDIS_ENABLED=true`, `CACHE_API_ENABLED=true`. See [DEPLOY-RAILWAY-VERCEL.md](./DEPLOY-RAILWAY-VERCEL.md).

### 5. Do not copy local `.env` to Railway

Local dev uses SQLite (`DATABASE_CLIENT=sqlite`). Production must use **postgres** and **`SEED_DATA=false`**.

### 6. After fixing variables

1. **Deployments → View logs** — confirm `strapi start` succeeds.
2. Redeploy once (avoid a tight crash loop holding DB connections).
3. Postgres **Metrics** — active connections should drop after API stays up.

## Code (`apps/api/config/database.js`)

- Uses **only** `DATABASE_URL` when present (no conflicting `host: localhost`).
- Enables SSL when `DATABASE_SSL=true` or URL matches Railway / `sslmode=require`.
- Postgres pool defaults: **min 0, max 5** (fits small Railway Postgres limits).

## Common mistakes

| Symptom | Cause |
|--------|--------|
| Build: `pyexpat.h` conflict | Custom `nixpacks.toml` with Python provider + `python3` nixPkg |
| Build: `node-gyp` / Python | Rare on default Node image; match webfudge: no custom nixpacks |
| Crashed on boot, Knex timeout | `DATABASE_CLIENT` still `sqlite` or unset |
| Crashed on boot | `DATABASE_URL` not linked from Postgres |
| Crashed on boot | SSL off while using `*.proxy.rlwy.net` |
| Slow crash loop | `SEED_DATA=true` on every restart |
| Pool full | `DATABASE_POOL_MAX=10` + restart loop or multiple replicas |

## Verify

```bash
curl https://<your-api-domain>/admin
```

Admin: `https://<your-api-domain>/admin`
