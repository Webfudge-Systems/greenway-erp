# Greenways Suite

Turborepo monorepo for the Greenway Mobility platform: **Organization Manager** (platform super-admin), **Accounts** (org admin), **PM** (project management), and **Strapi API**.

## Quick start (development)

```bash
npm install
cp apps/organization-manager/.env.example apps/organization-manager/.env.local
cp apps/accounts/.env.example apps/accounts/.env.local
cp apps/pm/.env.example apps/pm/.env.local
cp apps/api/.env.example apps/api/.env
npm run dev:all
```

| App | URL |
|-----|-----|
| Organization Manager | http://localhost:3000 |
| Accounts | http://localhost:3001 |
| PM | http://localhost:3002 |
| API | http://localhost:1337 |

## Production deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for Docker, Vercel, environment variables, and the production checklist.

```bash
npm run build    # verify all apps build
```
