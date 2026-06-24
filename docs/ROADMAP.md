# Roadmap

Five phases, each independently useful. Ship the core loop first — the habit tracker that forgives.

---

## Phase 1 — MVP: The Core Loop

**Goal:** Fix the #1 pain point (health habits collapse after a miss) with the minimum viable product.

**Duration estimate:** 1–2 implementation sessions

### Deliverables

1. **Project scaffold**
   - Next.js App Router + TypeScript project initialization
   - Tailwind CSS + shadcn/ui setup
   - OpenNext Cloudflare adapter configuration
   - `wrangler.toml` with D1 bindings
   - Drizzle ORM configuration and initial migration
   - PWA manifest and basic service worker

2. **Database schema (Phase 1 tables)**
   - `users`, `sessions`
   - `life_areas` (with seed data for 7 areas)
   - `habits`, `habit_logs`, `streak_cache`
   - `reviews` (daily only)
   - `wins`

3. **Auth**
   - Simple email + password login
   - Session management with HTTP-only cookies
   - Protected routes

4. **Today screen (home)**
   - Greeting + date
   - Habits due today with one-tap [Done] / [Tiny] / [Skip]
   - "Never miss twice" amber highlight on yesterday's misses
   - Momentum score (ring)
   - Quick win capture
   - Daily check-in button

5. **Habits module**
   - Create habit (title, tiny version, anchor, cadence, grace days, area)
   - Habit list grouped by area
   - Habit detail with calendar view and streak stats
   - Streak computation with grace-day logic
   - Recovery checkpoint (when missed twice)
   - Archive/unarchive

6. **Daily check-in**
   - Mood + energy (1–5 scale)
   - Today's wins (auto-populated from completions + manual add)
   - Optional reflection
   - Tomorrow's MITs (free text for now — task picker comes in Phase 2)

7. **Basic settings**
   - Name, timezone
   - Weekly free hours
   - Area list (view, reorder)

### Definition of done

- [ ] `npm install` succeeds
- [ ] `wrangler dev` starts and serves the app locally
- [ ] Can create an account and log in
- [ ] Can create a habit with tiny version + anchor + grace days
- [ ] Can log a habit as done/tiny/skip from the Today screen
- [ ] Streak survives a single miss (grace day consumed)
- [ ] Streak resets after grace days exhausted + another miss
- [ ] Recovery checkpoint appears after two consecutive misses
- [ ] Momentum score displays and updates
- [ ] Daily check-in saves and is viewable
- [ ] Win capture works
- [ ] App is installable as PWA on mobile
- [ ] Deploys to Cloudflare Workers via OpenNext

---

## Phase 2 — Prioritization & Motivation

**Goal:** Add goals, tasks, and the prioritization framework so the user knows what to focus on across all life areas.

**Depends on:** Phase 1

### Deliverables

1. **Database schema additions**
   - `goals` (with WOOP fields)
   - `tasks` (with Eisenhower flags, MIT, effort estimate)
   - `metrics`, `metric_logs`

2. **Goals module**
   - WOOP-guided goal creation flow
   - Goal list with progress indicators
   - Goal detail page
   - WIP limit enforcement per area

3. **Tasks module**
   - Task creation with Eisenhower flags
   - Auto-sorted task list (Important+Urgent first)
   - MIT selection (max 3 per day)
   - Task completion from Today screen
   - Link tasks to goals

4. **Today screen enhancements**
   - MITs section (1–3 selected tasks)
   - MIT picker
   - Upcoming deadlines section

5. **Areas / Balance dashboard**
   - Target vs. actual hours visualization
   - Capacity warning
   - Season toggle (in-season / off-season)
   - WIP limit indicators

6. **Insights v1**
   - Habit consistency chart (30-day)
   - Momentum trend chart
   - Metric trend charts (if metrics entered)

7. **Daily check-in enhancement**
   - Tomorrow's MITs picker from actual tasks

### Definition of done

- [ ] Can create goals with WOOP flow
- [ ] Can create tasks with Eisenhower flags
- [ ] Tasks auto-sort by Eisenhower quadrant
- [ ] MIT selection limited to 3, displayed on Today screen
- [ ] WIP limits prevent activating too many goals per area
- [ ] Areas dashboard shows target vs. actual hours
- [ ] Capacity warning appears when overcommitted
- [ ] Season toggle works and affects warnings
- [ ] Insights charts display real data
- [ ] Metrics can be logged and charted

---

## Phase 3 — Rituals & Reminders

**Goal:** Add push notifications and the weekly review ritual for sustained engagement.

**Depends on:** Phase 2

### Deliverables

1. **Web Push notifications**
   - VAPID key generation and storage
   - Push subscription flow in the app
   - `push_subscriptions` table
   - Notification permission request UI

2. **Cron Worker**
   - Cloudflare Cron Trigger setup
   - Habit reminder notifications (per-habit configured time)
   - "Never miss twice" morning nudge
   - Deadline approach alerts (3 days, 1 day)
   - Weekly review prompt (configurable day/time)
   - Daily check-in prompt (evening)

3. **Weekly review**
   - 5-step guided flow (wins → misses reframed → balance → re-prioritize → focus)
   - Auto-populated data from the week's activity
   - Area season adjustment during review
   - Next-week focus themes

4. **Settings enhancements**
   - Per-habit reminder time configuration
   - Notification type enable/disable
   - Weekly review day/time configuration

### Definition of done

- [ ] Push notifications deliver on mobile PWA
- [ ] Habit reminders fire at configured times
- [ ] "Never miss twice" nudge fires morning after a miss
- [ ] Deadline alerts fire 3 days and 1 day before
- [ ] Weekly review flow works end-to-end
- [ ] Weekly review auto-populates wins and misses
- [ ] User can configure notification preferences
- [ ] Cron Worker deploys and runs on schedule

---

## Phase 4 — Life-Admin & Finance

**Goal:** Support project-style goals (marriage certificate, furniture, anniversary) and basic finance tracking.

**Depends on:** Phase 2

### Deliverables

1. **Project templates / checklists**
   - Pre-built task checklists for common projects:
     - Marriage certificate application
     - New flat furnishing
     - Interior design planning
     - Anniversary planning
     - Snowops company setup
   - "Use template" creates a goal with pre-populated tasks
   - Templates stored as JSON, user-customizable

2. **Finance module**
   - `finance_plans`, `finance_allocations` tables
   - Monthly plan creation (income, allocations by asset class)
   - Target vs. actual per asset class
   - Copy previous month's plan
   - Finance tasks (filtered from general tasks)
   - Monthly money-review checklist template

3. **Insights expansion**
   - Area balance history over time (weekly snapshots)
   - Goal completion rate
   - Recovery count as a positive metric

### Definition of done

- [ ] Can create goals from project templates
- [ ] Templates generate correct tasks
- [ ] Monthly finance plan captures income and allocations
- [ ] Target vs. actual displayed per asset class
- [ ] Previous month's plan copyable as template
- [ ] Finance tasks integrate with task list
- [ ] Insights show expanded metrics

---

## Phase 5 — Household & Extras

**Goal:** Add multi-user support for wife, shared accountability, and nice-to-haves.

**Depends on:** Phases 1–3

### Deliverables

1. **Multi-user support**
   - User registration (invite-based, not public)
   - Household concept: link two users
   - Shared areas (Health, Personal & Home) visible to both users
   - Private areas (Work, Finance) visible only to owner
   - Per-area privacy controls

2. **Shared accountability**
   - See partner's habit streaks for shared areas
   - Gentle mutual encouragement notifications
   - Shared weekly review option

3. **Side Hustle area activation**
   - In-season toggle for side hustle
   - Idea capture board
   - Time tracking against available capacity

4. **Advanced features**
   - Dark mode
   - Offline write queue (IndexedDB → sync on reconnect)
   - Data import/export improvements
   - Recurrence patterns for tasks
   - Habit "streaks" visualization improvements
   - Optional integrations (calendar sync, etc.)

### Definition of done

- [ ] Wife can create an account and join household
- [ ] Shared areas visible to both users
- [ ] Private areas visible only to owner
- [ ] Partner's streaks visible on shared habits
- [ ] Side Hustle area configurable
- [ ] Dark mode toggle works
- [ ] Offline writes queue and sync

---

## Implementation notes for AI models

When picking up any phase:

1. **Read the docs first.** Every file in `/docs` is part of the spec. Start with `PRODUCT.md` for context, then the phase-relevant sections of `FEATURES.md`, `DATA_MODEL.md`, and `UX.md`.

2. **Follow the psychology.** The tone guidelines in `PSYCHOLOGY.md` are not optional. Every user-facing string should pass the "instead of / use" table.

3. **Test the streak logic.** The grace-day algorithm is the heart of the product. Unit test it extensively with edge cases: multiple consecutive misses, grace day refill, partial completions, weekly cadence habits.

4. **Mobile-first.** Build the mobile layout first, then enhance for tablet/desktop. Test on a phone-sized viewport throughout.

5. **D1 per-request client.** Never create a global Drizzle client. See `ARCHITECTURE.md` for the pattern.

6. **Phase boundaries.** Each phase should be independently deployable. Don't introduce Phase 2 schema in Phase 1 code.
