# Setup Guide

## Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- **Wrangler CLI** (installed as a dev dependency, or globally via `npm install -g wrangler`)
- A **Cloudflare account** (free tier is sufficient)

## Local development

### 1. Clone and install

```bash
git clone https://github.com/sagar2395/Personal-Tracker.git
cd Personal-Tracker
npm install
```

### 2. Set up local D1 database

```bash
# Create the local D1 database
wrangler d1 create personal-tracker-db --local

# Run migrations (after generating them)
npm run db:generate
wrangler d1 execute DB --local --file=./drizzle/migrations/0000_init.sql
```

### 3. Environment variables

Create a `.dev.vars` file in the project root (gitignored):

```
VAPID_PUBLIC_KEY=your_key_here
VAPID_PRIVATE_KEY=your_key_here
SESSION_SECRET=your_secret_here
```

### 4. Start the dev server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

For local Cloudflare Workers runtime (closer to production):

```bash
wrangler dev
```

### 5. Seed data (first run)

A seed script creates the default user and life areas:

```bash
npx tsx src/db/seed.ts
```

## Database management

### Generate migrations

After changing the Drizzle schema files in `src/db/schema/`:

```bash
npm run db:generate
```

This creates SQL migration files in `drizzle/migrations/`.

### Apply migrations locally

```bash
wrangler d1 execute DB --local --file=./drizzle/migrations/<migration-file>.sql
```

### Explore data (Drizzle Studio)

```bash
npm run db:studio
```

Opens a browser UI to inspect and edit data.

## Cloudflare deployment

### 1. Create D1 databases

```bash
# Primary database
wrangler d1 create personal-tracker-db
# Copy the database_id into wrangler.toml

# Tag cache database (required by OpenNext)
wrangler d1 create personal-tracker-tag-cache
# Copy the database_id into wrangler.toml
```

### 2. Create KV namespace and R2 bucket

```bash
# KV for incremental cache
wrangler kv namespace create NEXT_INC_CACHE_KV
# Copy the id into wrangler.toml

# R2 bucket for asset cache
wrangler r2 bucket create personal-tracker-cache
```

### 3. Set secrets

```bash
# Generate VAPID keys for Web Push
npx web-push generate-vapid-keys

wrangler secret put VAPID_PUBLIC_KEY
wrangler secret put VAPID_PRIVATE_KEY
wrangler secret put SESSION_SECRET
```

### 4. Run migrations on production D1

```bash
wrangler d1 execute personal-tracker-db --file=./drizzle/migrations/0000_init.sql
```

### 5. Deploy

```bash
npm run deploy
```

This runs `@opennextjs/cloudflare build` and then `wrangler deploy`.

## Project scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run build` | Next.js production build |
| `npm run build:cf` | OpenNext Cloudflare build |
| `npm run deploy` | Build + deploy to Cloudflare |
| `npm run lint` | ESLint check |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Run Drizzle migrations |
| `npm run db:studio` | Open Drizzle Studio |
