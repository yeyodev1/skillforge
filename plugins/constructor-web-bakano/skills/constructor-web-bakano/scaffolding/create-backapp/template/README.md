# __TITLE__ API

Express 5 + Mongoose + TypeScript. Se despliega en Vercel como función serverless.

## Setup local

```bash
__PM_INSTALL__
cp .env.example .env         # rellenar DB_URI, JWT_SECRET, ADMIN_PASSWORD
__PM_RUN__ dev                     # http://localhost:__PORT__
```

Smoke:

```bash
curl http://localhost:__PORT__/
curl http://localhost:__PORT__/api/health
curl -X POST http://localhost:__PORT__/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@__DOMAIN__","password":"..."}'
```

## Scripts

| Script | Qué hace |
|---|---|
| `__PM_RUN__ dev` | ts-node-dev con recarga |
| `__PM_RUN__ build` | `tsc` → `dist/` |
| `__PM_RUN__ start` | `node dist/index.js` |
| `__PM_RUN__ seed:admin` | crea/actualiza la cuenta admin desde `.env` |
| `__PM_RUN__ format` | prettier |

## Endpoints

Todo cuelga de `/api` (`src/routes/index.ts`).

- `GET /` → alive
- `GET /api/health` → `{ ok, db, uptime }`
- `POST /api/auth/login` → `{ token, user }`
- `GET /api/auth/me` → `{ user }` (Bearer)
- `PUT /api/auth/password` → `{ user }` (Bearer) body `{ current, next }`

## Deploy a Vercel

- `api/index.ts` — entrada serverless: conecta Mongo, siembra admin y delega en la app Express.
- `vercel.json` — todo el tráfico se reescribe a `/api`.

Variables de entorno (Vercel → Project → Settings → Environment Variables): las mismas de `.env.example`.

```bash
vercel --prod
```
