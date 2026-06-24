# Setup Guide

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+ (comes with Node.js)
- **Wrangler CLI** (`npm install -g wrangler`) — Cloudflare's development and deployment tool
- A **Cloudflare account** (free tier is sufficient)

## Initial project setup

### 1. Install dependencies

```bash
cd Personal-Tracker
npm install
```

### 2. Cloudflare authentication

```bash
npx wrangler login
```

This opens a browser window to authenticate with your Cloudflare account.

### 3. Create D1 databases

```bash
# Application database
npx wrangler d1 create personal-tracker-db
# Note the database_id from the output

# OpenNext cache database (required by the adapter)
npx wrangler d1 create personal-tracker-cache
# Note this database_id too
```

Update `wrangler.toml` with the database IDs from the output.

### 4. Create KV namespace and R2 bucket (for OpenNext)

```bash
# KV namespace for incremental cache
npx wrangler kv namespace create NEXT_INC_CACHE
# Note the namespace_id

# R2 bucket for static assets
npx wrangler r2 bucket create personal-tracker-assets
```

Update `wrangler.toml` with these IDs.

### 5. Configure wrangler.toml

```toml
name = "personal-tracker"
compatibility_date = "2025-01-01"
main = ".open-next/worker.js"

# Application database
[[d1_databases]]
binding = "DB"
database_name = "personal-tracker-db"
database_id = "<paste-from-step-3>"

# OpenNext tag cache (required — do NOT rename this binding)
[[d1_databases]]
binding = "NEXT_TAG_CACHE_D1"
database_name = "personal-tracker-cache"
database_id = "<paste-from-step-3>"

# OpenNext incremental cache (required — do NOT rename this binding)
[[kv_namespaces]]
binding = "NEXT_INC_CACHE"
id = "<paste-from-step-4>"

# OpenNext asset storage (required — do NOT rename this binding)
[[r2_buckets]]
binding = "NEXT_INC_CACHE_R2_BUCKET"
bucket_name = "personal-tracker-assets"

# Cron triggers for notifications (Phase 3+)
# [triggers]
# crons = ["*/15 * * * *"]
```

**Important:** The binding names `NEXT_TAG_CACHE_D1`, `NEXT_INC_CACHE`, and `NEXT_INC_CACHE_R2_BUCKET` are hardcoded by OpenNext. Do not rename them.

### 6. Run database migrations

```bash
# Apply Drizzle schema to local D1
npx drizzle-kit push

# Seed initial data (life areas)
npx wrangler d1 execute personal-tracker-db --local --file=db/seed.sql
```

### 7. Generate VAPID keys (for Web Push — Phase 3+)

```bash
npx web-push generate-vapid-keys
```

Store the output. You'll add these as secrets later.

## Local development

```bash
# Start the dev server with D1 bindings
npx wrangler dev
```

This starts a local server (typically at `http://localhost:8787`) with:
- Hot module reloading
- Local D1 database (SQLite file in `.wrangler/`)
- All Cloudflare bindings available

### Useful local dev commands

```bash
# Run Drizzle Studio to inspect the database
npx drizzle-kit studio

# Generate a new migration after schema changes
npx drizzle-kit generate

# Apply pending migrations locally
npx drizzle-kit push

# Reset local database (destructive)
rm -rf .wrangler/state
npx drizzle-kit push
npx wrangler d1 execute personal-tracker-db --local --file=db/seed.sql
```

## Environment variables and secrets

### Local (.dev.vars)

Create a `.dev.vars` file in the project root (gitignored):

```env
AUTH_SECRET=your-local-dev-secret-change-in-production
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_EMAIL=mailto:sagarchhabra02@gmail.com
```

### Production (Cloudflare secrets)

```bash
npx wrangler secret put AUTH_SECRET
# Paste a strong random string

npx wrangler secret put VAPID_PUBLIC_KEY
npx wrangler secret put VAPID_PRIVATE_KEY
npx wrangler secret put VAPID_EMAIL
```

## Deployment

### Build

```bash
# Build the Next.js app and transform for Cloudflare Workers
npx opennextjs-cloudflare build
```

This creates the `.open-next/` directory with the Worker-ready output.

### Deploy

```bash
# Deploy to Cloudflare Workers
npx wrangler deploy
```

### Apply migrations to production

```bash
# Apply Drizzle migrations to production D1
npx wrangler d1 migrations apply personal-tracker-db --remote
```

### Seed production data

```bash
# Seed life areas on first deploy
npx wrangler d1 execute personal-tracker-db --remote --file=db/seed.sql
```

## Project configuration files

### drizzle.config.ts

```ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'sqlite',
} satisfies Config;
```

### next.config.ts

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // OpenNext handles the Cloudflare adaptation
};

export default nextConfig;
```

### tsconfig.json paths (relevant entries)

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@/db/*": ["./db/*"],
      "@/lib/*": ["./lib/*"],
      "@/components/*": ["./components/*"]
    }
  }
}
```

## Troubleshooting

### "D1_ERROR: no such table"

Migrations haven't been applied. Run:
```bash
npx drizzle-kit push          # local
npx wrangler d1 migrations apply personal-tracker-db --remote  # production
```

### "TypeError: Cannot read properties of undefined (reading 'prepare')"

You're likely using a global DB client instead of per-request. See ARCHITECTURE.md — always call `getDb(env.DB)` inside the request handler.

### OpenNext build errors

Ensure `@opennextjs/cloudflare` is installed and `wrangler.toml` has the correct binding names (they're hardcoded, not configurable).

### PWA not installable

Check that:
1. `public/manifest.json` exists with correct `start_url`, `display: "standalone"`, and icons
2. Service worker is registered in the root layout
3. The app is served over HTTPS (automatic on Cloudflare)

### Local D1 data lost after restart

Local D1 data persists in `.wrangler/state/`. If you deleted that directory, re-run seed:
```bash
npx drizzle-kit push
npx wrangler d1 execute personal-tracker-db --local --file=db/seed.sql
```
