# Personal Tracker

A calm, opinionated life operating system that fights overwhelm and rewards recovery.

Built for a platform engineer juggling two jobs, health goals, personal admin, finances, a startup, and side projects — because no existing tool was built for *all of it* without becoming another source of stress.

## What it is

A **mobile-first PWA** (Progressive Web App) that:

- Tracks habits with **streaks that forgive** — grace days and "never miss twice" recovery so one bad day doesn't collapse months of progress
- Prioritizes across **7 life areas** using Eisenhower matrix, MITs (Most Important Tasks), and weekly time budgets
- Applies **16 psychological principles** (Tiny Habits, WOOP, Self-Determination Theory, etc.) to sustain motivation without guilt
- Runs on **Cloudflare** (Workers + D1) — your data, your infrastructure, generous free tier

## Life areas

| Area | Purpose |
|---|---|
| Work — Valuelabs | Full-time job priorities and tasks |
| Work — Avyka | Contractual work tracking |
| Health | Habits, metrics, and routines for you (and later, your wife) |
| Personal & Home | Marriage certificate, furniture, interior design, anniversary, etc. |
| Finance | Salary allocation, investment tracking, asset-class rebalancing |
| Snowops | Building the compliance + DevOps services company |
| Side Hustle | Optional extra projects when capacity allows |

## Tech stack

- **Next.js** (App Router) + TypeScript + React
- **Tailwind CSS** + shadcn/ui
- **Drizzle ORM** + **Cloudflare D1** (SQLite)
- **OpenNext** (`@opennextjs/cloudflare`) for deployment
- **Web Push** + Cloudflare Cron Triggers for notifications
- PWA with service worker for installability and offline support

## Documentation

| Document | Contents |
|---|---|
| [Product vision](docs/PRODUCT.md) | Why this exists, who it's for, the three pillars |
| [Psychology](docs/PSYCHOLOGY.md) | Every psychological principle and how it maps to a feature |
| [Architecture](docs/ARCHITECTURE.md) | Stack decisions, Cloudflare/OpenNext/D1 design, deployment |
| [Data model](docs/DATA_MODEL.md) | Full entity definitions, relations, Drizzle schema |
| [Features](docs/FEATURES.md) | Module-by-module functional specs and acceptance criteria |
| [UX](docs/UX.md) | Screen-by-screen layouts, flows, design principles |
| [Roadmap](docs/ROADMAP.md) | 5-phase plan with deliverables and definition of done |
| [Setup](docs/SETUP.md) | Local dev, migrations, environment, deployment |

## Quick start (after Phase 1 implementation)

```bash
# Clone and install
git clone https://github.com/sagar2395/Personal-Tracker.git
cd Personal-Tracker
npm install

# Set up local D1 database
npx wrangler d1 create personal-tracker-dev --local
npx drizzle-kit push

# Run locally
npx wrangler dev

# Deploy to Cloudflare
npx opennextjs-cloudflare build
npx wrangler deploy
```

## Phased roadmap (summary)

1. **MVP** — Habits with streaks & grace + Today view + daily check-in
2. **Prioritization** — Goals/Tasks + Eisenhower + MITs + balance dashboard
3. **Rituals & reminders** — Web Push + weekly review
4. **Life-admin & finance** — Project templates + finance module
5. **Household** — Multi-user (wife) + shared accountability

See [docs/ROADMAP.md](docs/ROADMAP.md) for the full breakdown.

## License

Private — personal use.
