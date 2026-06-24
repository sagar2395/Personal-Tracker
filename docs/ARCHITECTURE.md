# Architecture

## Stack overview

```
┌─────────────────────────────────────────────┐
│              Mobile / Desktop               │
│           (PWA — installable app)           │
├─────────────────────────────────────────────┤
│         Next.js (App Router, RSC)           │
│         TypeScript + Tailwind CSS           │
│         shadcn/ui + Lucide icons            │
├─────────────────────────────────────────────┤
│       Cloudflare Workers (via OpenNext)     │
│       Server Actions / Route Handlers       │
├─────────────────────────────────────────────┤
│        Drizzle ORM → Cloudflare D1          │
│            (SQLite at the edge)             │
├─────────────────────────────────────────────┤
│     Cloudflare Platform Services:           │
│     • D1 — primary database                │
│     • KV — incremental cache               │
│     • R2 — static asset cache              │
│     • Cron Triggers — scheduled jobs        │
│     • Web Push — notifications              │
└─────────────────────────────────────────────┘
```

## Key decisions

### Why Next.js on Cloudflare Workers (not Pages)?

The **OpenNext adapter** (`@opennextjs/cloudflare`) deploys a full Next.js app (App Router, Server Components, Server Actions) to Cloudflare Workers. This is the current recommended path — it supports the Node.js runtime and is more capable than the older `@cloudflare/next-on-pages` (edge-runtime only, being superseded).

The app uses:
- **Server Components** for data-heavy pages (Today, Habits, Goals)
- **Server Actions** for mutations (log habit, create task, update goal)
- **Route Handlers** for API endpoints (push subscription, cron webhook)

### Why D1 + Drizzle?

- **D1** is Cloudflare's serverless SQLite. It's co-located with Workers (zero network hop), has generous free limits (10 GB, 25M reads/day, 100K writes/day), and stores data within Cloudflare's infrastructure (data ownership).
- **Drizzle ORM** is type-safe, lightweight, and has first-class D1 support. It generates SQL migrations via `drizzle-kit`.

**Important D1 constraint:** Create a new Drizzle client **per request**, not globally. Workers are stateless; a global DB client would fail across requests.

```ts
// src/db/index.ts — per-request client factory
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb(d1: D1Database) {
  return drizzle(d1, { schema });
}
```

### Why PWA (not native)?

- Single codebase for phone + desktop.
- Installable, home-screen icon, full-screen mode.
- Web Push notifications for reminders (requires VAPID keys).
- Offline-capable via service worker (cache shell + recent reads).
- No app store review, instant deploys.

### Auth strategy

Phase 1 is single-user. The simplest viable auth:
- Email + password (hashed with bcrypt or scrypt).
- Session token stored in an HttpOnly cookie.
- The schema carries `userId` on every table so adding a second user (wife) later is a migration, not a rewrite.
- Consider upgrading to Auth.js with a D1 adapter in Phase 5 for OAuth support.

### Notification architecture

```
Cloudflare Cron Trigger (e.g. 0 6 * * *)
  → invokes a Worker route (/api/cron/reminders)
  → queries D1 for:
     - habits due today (morning reminder)
     - habits missed yesterday (never-miss-twice nudge)
     - limit habits approaching peak temptation time
     - tasks with approaching deadlines
  → sends Web Push via VAPID to subscribed devices
```

Push subscriptions are stored in D1 (`push_subscriptions` table). The service worker listens for push events and shows native notifications.

### Caching / performance

- OpenNext uses **KV** (`NEXT_INC_CACHE_KV`) and **R2** (`NEXT_INC_CACHE_R2_BUCKET`) for incremental static regeneration cache, and **D1** (`NEXT_TAG_CACHE_D1`) for tag-based cache invalidation. These bindings are hardcoded by OpenNext — do not rename them.
- Habit logging uses optimistic UI updates (update the UI immediately, sync to D1 via Server Action).
- The Today view is a Server Component that fetches fresh data on each load.

## Directory structure

```
/
├── docs/                      # Product, architecture, and spec docs
├── drizzle/
│   └── migrations/            # Generated SQL migrations
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker (Phase 3)
│   └── icons/                 # PWA icons
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout (metadata, PWA, theme)
│   │   ├── page.tsx           # Today (home) view
│   │   ├── habits/            # Habits module (build + limit)
│   │   ├── goals/             # Goals & tasks module
│   │   ├── areas/             # Life areas / balance dashboard
│   │   ├── finance/           # Finance module (Phase 4)
│   │   ├── review/            # Daily check-in + weekly review
│   │   ├── insights/          # Trends and analytics
│   │   ├── settings/          # User settings
│   │   └── api/
│   │       ├── cron/          # Cron-triggered endpoints
│   │       └── push/          # Push subscription management
│   ├── components/
│   │   └── ui/                # Shared UI components (shadcn/ui)
│   ├── db/
│   │   ├── index.ts           # DB client factory
│   │   └── schema/            # Drizzle schema files
│   │       ├── index.ts       # Re-exports all tables
│   │       ├── users.ts
│   │       ├── areas.ts
│   │       ├── goals.ts
│   │       ├── tasks.ts
│   │       ├── habits.ts
│   │       ├── metrics.ts
│   │       ├── reviews.ts
│   │       └── notifications.ts
│   └── lib/
│       ├── utils.ts           # cn() and shared utilities
│       ├── streaks.ts         # Streak computation (with grace logic)
│       └── priorities.ts      # MIT selection, Eisenhower sorting
├── workers/
│   └── cron/                  # Scheduled notification worker
├── wrangler.toml              # Cloudflare bindings & cron config
├── drizzle.config.ts          # Drizzle Kit config
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Deployment

```bash
# Local development
npm run dev                    # Next.js dev server
wrangler d1 execute DB --local --file=./drizzle/migrations/0000_init.sql

# Generate migrations after schema changes
npm run db:generate

# Deploy to Cloudflare
npm run deploy                 # build:cf + wrangler deploy
```

### Environment variables / secrets

| Variable | Where | Purpose |
|---|---|---|
| `DB` | wrangler.toml binding | D1 database |
| `VAPID_PUBLIC_KEY` | wrangler secret | Web Push public key |
| `VAPID_PRIVATE_KEY` | wrangler secret | Web Push private key |
| `SESSION_SECRET` | wrangler secret | Cookie signing |
