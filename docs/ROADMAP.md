# Development Roadmap

## Philosophy

Build in phases, each independently useful. Ship the core loop first (habit tracking + Today view) because it directly addresses the #1 pain: health habits breaking and not recovering, plus bad habits (scrolling, late nights) filling the void.

---

## Phase 1 — MVP: The Core Loop

**Goal:** Fix the broken-habit problem AND the bad-habit problem. A usable app that tracks habits (both build and limit types) with streaks, grace days, and the "never miss twice" system.

### Deliverables

- [x] Project scaffold (Next.js + TypeScript + Tailwind + Cloudflare config)
- [x] Documentation set (all `/docs` files)
- [ ] Drizzle schema for: User, LifeArea, Habit, HabitLog, Streak (cache)
- [ ] DB client factory (`src/db/index.ts`)
- [ ] Seed script: create default user + 7 life areas
- [ ] Auth: simple email/password login, session cookie
- [ ] **Today view**: greeting, habits due today (build + limit), one-tap logging
  - Build habits: done / tiny version / skip
  - Limit habits: clean today / log time (minutes)
  - Substitution plan shown on limit habit cards
- [ ] **Habit CRUD**: create/edit both build + limit habits
  - Build: multi-step form (title, tiny version, anchor, cadence, grace days)
  - Limit: multi-step form (title, budget, substitution plan, peak temptation time, grace days)
- [ ] **Streak engine**: compute streaks with grace days, detect "missed twice" — works for both habit types
- [ ] **Habit calendar view**: color-coded day grid (different status colors for build vs limit)
- [ ] Bottom tab navigation (Today, Habits, placeholder for Goals/Balance/More)
- [ ] PWA manifest + basic service worker (app shell caching)
- [ ] Local dev with `wrangler dev` + D1

### Definition of done

- Create a build habit "Morning workout" with tiny version "1 pushup" and anchor "After brushing teeth"
- Create a limit habit "Instagram scrolling" with 15-min budget, substitution "Read Kindle", peak time 10 PM
- Log the build habit daily for 3 days → streak = 3
- Miss 1 day → grace day preserves streak
- Miss 2nd day → streak breaks, "missed twice" flag set
- Log the limit habit: "Clean today" → streak continues
- Log limit habit with 10 min → "under budget", streak continues
- Log limit habit with 25 min → "over budget", message: "Tomorrow's a fresh start. Remember: Kindle."
- Today view shows both build and limit habits with correct state
- Substitution plan visible on limit habit cards in Today view
- App is installable as PWA on mobile

---

## Phase 2 — Prioritization & Motivation

**Goal:** Add goals, tasks, and the prioritization system so the user knows what matters today.

### Deliverables

- [ ] Drizzle schema for: Goal, Task, Win, Metric, MetricLog
- [ ] **Goal CRUD** with WOOP creation flow
- [ ] **Task CRUD** with Eisenhower flags (urgent + important)
- [ ] **MIT selection**: pick 1-3 most important tasks for today
- [ ] **WIP limits**: cap active goals per area (default 3)
- [ ] **Areas / Balance dashboard**: target vs. actual hours chart, area cards
- [ ] **Capacity warning**: planned load vs. free hours
- [ ] **Momentum score**: composite metric on Today view
- [ ] **Win capture**: quick "what went well?" on Today view
- [ ] **Insights v1**: habit consistency chart (build + limit), momentum trend, limit-habit usage-over-time chart

### Definition of done

- Create a goal via WOOP flow, link both build and limit habits + tasks to it
- Tasks auto-sort by Eisenhower quadrant on the backlog
- Select 3 MITs for today — they appear on Today view
- Attempt to activate 4th goal in an area → WIP limit blocks it
- Balance dashboard shows hours per area with warning when overloaded
- Momentum score updates after completing habits/tasks
- Limit habit insight chart shows daily usage trend vs. budget line

---

## Phase 3 — Rituals & Reminders

**Goal:** Push notifications and structured review rituals to keep the user engaged without manual check-ins.

### Deliverables

- [ ] Drizzle schema for: Review, PushSubscription
- [ ] **Web Push**: VAPID setup, subscription flow, service worker push handler
- [ ] **Cron-triggered reminders**: morning habits, evening check-in, "never miss twice" nudge, deadline alerts
- [ ] **Pre-temptation nudge** for limit habits (30 min before peak time, with substitution plan)
- [ ] **Daily check-in**: mood, energy, wins, challenges, tomorrow's MITs
- [ ] **Weekly review**: guided flow with wins recap, habit summary (build consistency + limit averages), area balance, re-prioritization, next week's focus
- [ ] **Notification settings**: per-type toggles, custom times

### Definition of done

- Push notification fires at reminder time for a build habit
- "Never miss twice" notification fires the evening after a miss (both types)
- Pre-temptation nudge fires 30 min before peak time for limit habits, showing substitution plan
- Daily check-in saves and is viewable in review history
- Weekly review auto-populates wins and habit summaries (including limit habit averages)
- All notifications can be individually toggled off

---

## Phase 4 — Life Admin & Finance

**Goal:** Project templates for common personal tasks and a lightweight finance module.

### Deliverables

- [ ] Drizzle schema for: FinanceSnapshot, FinanceAllocation
- [ ] **Project templates / checklists**: Marriage certificate, furniture shopping, interior design, anniversary planning, Snowops milestones
- [ ] **Finance module**: monthly snapshot, allocation plan vs. actual, asset class management
- [ ] **Finance tasks**: checklist items linked to Finance area
- [ ] Template system: pre-built goal + task sets that can be imported

### Definition of done

- Import "Marriage certificate" template → creates goal + 5-10 tasks
- Create monthly finance snapshot with income + allocations
- See target vs. actual delta per asset class
- Finance tasks appear in global backlog

---

## Phase 5 — Household & Extras

**Goal:** Multi-user support (wife), shared habits/accountability, and polish.

### Deliverables

- [ ] **Multi-user auth**: invite wife, household entity
- [ ] **Shared areas**: Health + Personal & Home visible to both users
- [ ] **Shared habits**: Both build and limit habits can be shared — see partner's streaks, celebrate together
- [ ] **Accountability**: see partner's habit streaks, gentle encouragement
- [ ] **Side Hustle area**: activated with its own goals/tasks
- [ ] **Advanced insights**: correlations (sleep vs. productivity, limit habit reduction trends, etc.)
- [ ] **Data export/import**: full JSON export, import from backup
- [ ] **Offline write sync**: IndexedDB queue for offline habit logs
- [ ] Performance optimization, accessibility audit

### Definition of done

- Wife can log in, see shared Health habits (both build and limit), log her own
- Both users see each other's streaks on shared habits
- Full data export downloads valid JSON with all entities
- Offline habit logging syncs when back online
