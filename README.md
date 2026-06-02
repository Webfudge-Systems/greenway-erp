# Greenways Suite

Turborepo for Greenway Mobility: **Organization Manager**, **Accounts**, **PM**, and **Strapi API**.

## Local development

```bash
npm install
cp apps/organization-manager/.env.example apps/organization-manager/.env.local
cp apps/accounts/.env.example apps/accounts/.env.local
cp apps/pm/.env.example apps/pm/.env.local
cp apps/api/.env.example apps/api/.env
npm run dev:all
```

| App | URL | Script |
|-----|-----|--------|
| Organization Manager | http://localhost:3000 | `npm run dev:org-manager` |
| Accounts | http://localhost:3001 | `npm run dev:accounts` |
| PM | http://localhost:3002 | `npm run dev:pm` |
| API | http://localhost:1337 | `npm run dev:api` |

```bash
npm run build   # production build check
```

## Deploy (Railway + Vercel)

| Guide | Path |
|-------|------|
| Full step-by-step | [docs/DEPLOY-RAILWAY-VERCEL.md](./docs/DEPLOY-RAILWAY-VERCEL.md) |
| Railway API env | [apps/api/.env.railway.example](./apps/api/.env.railway.example) |
| Vercel frontend env | [docs/env.vercel.example](./docs/env.vercel.example) |

- **API + Postgres:** Railway, root directory `apps/api`
- **Frontends:** three separate Vercel projects (`apps/organization-manager`, `apps/accounts`, `apps/pm`)
