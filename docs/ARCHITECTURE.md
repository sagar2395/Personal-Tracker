# Architecture

## Stack overview

```
┌─────────────────────────────────────────────┐
│                  Browser                     │
│  Next.js App (React, App Router, TypeScript) │
│  PWA Shell (Service Worker, Web Manifest)    │
│  Tailwind CSS + shadcn/ui                    │
└──────────────────┬──────────────────────────┘
                   │ HTTPS
┌──────────────────▼──────────────────────────┐
│           Cloudflare Workers                 │
│  OpenNext Adapter (@opennextjs/cloudflare)   │
│  Next.js Server (SSR, Route Handlers,        │
│                   Server Actions)            │
│  Drizzle ORM (per-request D1 client)         │
├──────────────────────────────────────────────┤
│  Bindings:                                   │
│    D1  → personal-tracker-db                 │
│    KV  → NEXT_INC_CACHE (OpenNext cache)     │
│    R2  → NEXT_INC_CACHE_R2_BUCKET (assets)   │
│    D1  → NEXT_TAG_CACHE_D1 (OpenNext tags)   │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│           Cloudflare D1 (SQLite)             │
│  personal-tracker-db                         │
│  All application data                        │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│        Cloudflare Cron Trigger Worker        │
│  Scheduled: habit reminders, deadline alerts,│
│  "never miss twice" nudges, weekly review    │
│  Reads D1, sends Web Push via VAPID          │
└─────────────────────────────────────────────┘
```

## Why each technology

### Next.js (App Router) + TypeScript

- App Router with React Server Components for fast initial loads and data-near rendering
- Server Actions for mutations (habit logging, task updates) — no separate API layer
- TypeScript end-to-end for type safety between schema, server logic, and UI
- Massive ecosystem and documentation — ideal for other models to implement

### Cloudflare Workers + OpenNext

- **OpenNext** (`@opennextjs/cloudflare`) is the current recommended adapter for running Next.js on Cloudflare. It transforms the Next.js build output to run on the Workers runtime with Node.js API compatibility.
- Why not classic Cloudflare Pages + `@cloudflare/next-on-pages`? That route is edge-runtime only (no Node.js APIs) and is being superseded. OpenNext on Workers is more capable and better maintained.
- Cloudflare Workers provide: global edge deployment, generous free tier (100K requests/day free), integrated bindings to D1/KV/R2.

### Cloudflare D1 (SQLite) + Drizzle ORM

- **D1** is Cloudflare's serverless SQLite database. For a personal tracker (1-2 users, moderate write frequency), D1 is the perfect fit — no connection management, no cold starts, and the free tier (5M reads/day, 100K writes/day) is far beyond this app's needs.
- **Drizzle ORM** is lightweight, TypeScript-native, and has excellent D1 support. Drizzle Kit handles migrations. Drizzle's SQL-like API means the generated queries are predictable and debuggable.
- **Critical:** On Workers, you must create a new Drizzle client per request (no global/singleton). The D1 binding comes from the request context.

### Tailwind CSS + shadcn/ui

- Tailwind for utility-first styling, optimal for mobile-first responsive design
- shadcn/ui for accessible, well-designed components (cards, forms, dialogs, tabs) that are copied into the project (not a dependency) — full control, easy customization
- Charts: Recharts or a lighter alternative for insights/trends

### PWA (Progressive Web App)

- **Web manifest** (`manifest.json`) for installability on mobile home screens
- **Service worker** for offline support (at minimum, cache the app shell so the Today screen loads instantly) and Web Push subscription
- Push notifications are essential for habit reminders and "never miss twice" nudges
- No app store submission required

## Key architecture decisions

### 1. Per-request database client

```ts
// lib/db.ts
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export function getDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

// In a Server Action or Route Handler:
export async function logHabit(formData: FormData) {
  const db = getDb(process.env.DB); // D1 binding from env
  // ...
}
```

### 2. Streaks are computed, not stored

Streaks are derived from `habit_logs` rows using the grace-day algorithm (see PSYCHOLOGY.md). A `streak_cache` table may be added for performance, but `habit_logs` is the source of truth. This avoids data inconsistency from dual-write bugs.

```ts
// lib/streaks.ts — pure function, unit-testable
export function computeStreak(
  logs: HabitLog[],       // sorted by date desc
  graceDaysAllowed: number,
  today: string           // YYYY-MM-DD
): StreakResult {
  // Walk backwards from today, counting consecutive done days,
  // allowing graceDaysAllowed missed days without breaking.
  // Return: { current, longest, graceDaysRemaining, missedTwice }
}
```

### 3. Auth: simple now, extensible later

Phase 1 uses a minimal email + password auth with sessions stored in D1. The schema includes a `users` table with `id`, `email`, `passwordHash`, `createdAt`. Every data table has a `userId` foreign key.

When multi-user is needed (Phase 5), we add user registration, household linking, and shared-area permissions — but the data model already supports it.

Recommended approach: **Lucia Auth** (lightweight, D1-compatible) or a simple custom session implementation (hash password with bcrypt/scrypt, store session token in D1 + HTTP-only cookie).

### 4. Server Actions for mutations

All write operations (log habit, create task, complete task, save review) use Next.js Server Actions. Benefits:
- No separate API routes to maintain
- TypeScript type safety from form to database
- Progressive enhancement (forms work without JS)
- Optimistic updates on the client via `useOptimistic` for instant feedback (especially habit logging)

### 5. Cron Worker for notifications

A separate Cloudflare Worker, triggered by Cron Triggers, handles scheduled notifications:

```
workers/cron/
  index.ts        # Cron handler
  notifications.ts # Push-sending logic
```

Cron schedules:
- **Every 15 minutes:** Check for habit reminders due, deadline alerts
- **Daily at configured time:** "Never miss twice" nudge check
- **Weekly (Sunday):** Weekly review prompt

The cron worker reads from D1 (habits, reminder preferences, push subscriptions) and sends Web Push notifications via the VAPID protocol.

### 6. Offline strategy

**Offline-first reads, online writes:**
- Service worker caches the app shell and recent data responses
- The Today screen loads from cache if offline, showing last-known state
- Writes (habit logs, task completions) require connectivity (D1 is server-side)
- Future enhancement: queue offline writes in IndexedDB and sync on reconnect

## Project structure

```
Personal-Tracker/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout, providers
│   ├── page.tsx                  # Today (home) screen
│   ├── habits/
│   │   ├── page.tsx              # Habits list/grid
│   │   └── [id]/page.tsx         # Habit detail
│   ├── goals/
│   │   ├── page.tsx              # Goals & Tasks
│   │   └── [id]/page.tsx         # Goal detail
│   ├── areas/page.tsx            # Areas / Balance dashboard
│   ├── finance/page.tsx          # Finance module
│   ├── review/
│   │   ├── daily/page.tsx        # Daily check-in
│   │   └── weekly/page.tsx       # Weekly review
│   ├── insights/page.tsx         # Insights & trends
│   ├── settings/page.tsx         # Settings
│   ├── login/page.tsx            # Auth
│   └── api/                      # Route Handlers (if needed beyond Server Actions)
│       └── push/subscribe/route.ts
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── habits/                   # Habit-specific components
│   ├── tasks/                    # Task-specific components
│   ├── reviews/                  # Review components
│   └── shared/                   # Layout, nav, momentum ring, etc.
├── lib/
│   ├── db.ts                     # getDb() — per-request Drizzle client
│   ├── streaks.ts                # Streak computation (pure functions)
│   ├── momentum.ts               # Momentum score computation
│   ├── eisenhower.ts             # Task prioritization logic
│   ├── capacity.ts               # Weekly capacity calculations
│   ├── actions/                  # Server Actions grouped by domain
│   │   ├── habits.ts
│   │   ├── tasks.ts
│   │   ├── goals.ts
│   │   ├── reviews.ts
│   │   └── areas.ts
│   └── utils.ts                  # Date helpers, formatters
├── db/
│   ├── schema.ts                 # Drizzle schema (all tables)
│   ├── seed.ts                   # Seed data (life areas, demo habits)
│   └── migrations/               # Drizzle Kit migrations
├── workers/
│   └── cron/
│       ├── index.ts              # Cron Trigger handler
│       └── notifications.ts     # Web Push sending
├── public/
│   ├── manifest.json             # PWA manifest
│   ├── sw.js                     # Service worker
│   └── icons/                    # PWA icons
├── docs/                         # This documentation set
├── wrangler.toml                 # Cloudflare Workers config
├── drizzle.config.ts             # Drizzle Kit config
├── next.config.ts                # Next.js config
├── tailwind.config.ts            # Tailwind config
├── tsconfig.json
├── package.json
└── README.md
```

## Deployment

### Local development

```bash
npm install
npx wrangler d1 create personal-tracker-dev --local
npx drizzle-kit push          # apply schema to local D1
npx wrangler dev               # start dev server with D1 binding
```

### Production deployment

```bash
# One-time: create production D1 database
npx wrangler d1 create personal-tracker-prod

# Build and deploy
npx opennextjs-cloudflare build
npx wrangler deploy

# Run migrations on production D1
npx wrangler d1 migrations apply personal-tracker-prod
```

### Environment / secrets

```bash
# VAPID keys for Web Push (generate once)
npx wrangler secret put VAPID_PUBLIC_KEY
npx wrangler secret put VAPID_PRIVATE_KEY
npx wrangler secret put VAPID_EMAIL

# Auth secret
npx wrangler secret put AUTH_SECRET
```

### wrangler.toml (representative)

```toml
name = "personal-tracker"
compatibility_date = "2025-01-01"
main = ".open-next/worker.js"

[[d1_databases]]
binding = "DB"
database_name = "personal-tracker-prod"
database_id = "<your-database-id>"

# OpenNext required bindings
[[d1_databases]]
binding = "NEXT_TAG_CACHE_D1"
database_name = "personal-tracker-cache"
database_id = "<cache-database-id>"

[[kv_namespaces]]
binding = "NEXT_INC_CACHE"
id = "<kv-namespace-id>"

[[r2_buckets]]
binding = "NEXT_INC_CACHE_R2_BUCKET"
bucket_name = "personal-tracker-assets"

[triggers]
crons = ["*/15 * * * *"]   # Every 15 minutes for notifications
```
