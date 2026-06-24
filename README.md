# Personal Tracker

A calm, opinionated life operating system that fights overwhelm and rewards recovery.

## What is this?

A mobile-first PWA for managing every area of life — work, health, personal admin, finance, and side ventures — from a single app. Built for a platform engineer juggling two jobs, health goals, personal projects, and a startup.

**This is not a generic to-do app.** Every feature is grounded in behavioral psychology:

- **Streaks with grace days** so one miss doesn't kill a habit
- **"Never miss twice" recovery system** that catches you after the first slip
- **Build AND limit habits** — build good ones (exercise, reading) AND limit bad ones (doom scrolling, late nights) with substitution plans
- **WOOP goal creation** (Wish, Outcome, Obstacle, Plan) for goals that actually stick
- **Eisenhower + MITs** to surface the 1-3 things that matter today
- **WIP limits** to prevent over-commitment
- **Weekly time budgets** per life area with capacity warnings
- **Self-compassionate tone** — no red "failure" states, no guilt, just calm data and encouragement

## Tech stack

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Database:** Cloudflare D1 (SQLite) + Drizzle ORM
- **Deploy:** Cloudflare Workers via OpenNext adapter
- **PWA:** Installable, push notifications, offline-friendly

## Quick start

```bash
npm install
npm run dev
```

See [docs/SETUP.md](docs/SETUP.md) for full setup including Cloudflare D1 and deployment.

## Documentation

| Doc | Contents |
|---|---|
| [PRODUCT.md](docs/PRODUCT.md) | Vision, persona, problems, design principles |
| [PSYCHOLOGY.md](docs/PSYCHOLOGY.md) | Behavioral science principles and UX rules |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Stack, Cloudflare/OpenNext/D1 design, deployment |
| [DATA_MODEL.md](docs/DATA_MODEL.md) | Full entity definitions, relations, Drizzle schema |
| [FEATURES.md](docs/FEATURES.md) | Per-module functional specs and acceptance criteria |
| [UX.md](docs/UX.md) | Screen layouts, user flows, design system |
| [ROADMAP.md](docs/ROADMAP.md) | Phased development plan with definitions of done |
| [SETUP.md](docs/SETUP.md) | Local dev, migrations, environment, deployment |

## Life areas tracked

- Work — Valuelabs (full-time)
- Work — Avyka (contractual)
- Health (build habits like exercise + limit habits like doom scrolling)
- Personal & Home (marriage certificate, furniture, anniversary)
- Finance (salary allocation, investment tracking)
- Snowops (compliance + DevOps company)
- Side Hustle (optional, capacity-permitting)

## Development phases

1. **MVP** — Habit tracking (build + limit) with streaks, grace days, never-miss-twice, Today view
2. **Prioritization** — Goals (WOOP), tasks (Eisenhower), MITs, balance dashboard
3. **Rituals** — Push notifications, daily check-in, weekly review
4. **Life admin** — Project templates, finance module
5. **Household** — Multi-user (wife), shared habits, accountability

##
