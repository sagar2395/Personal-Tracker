# Data Model

All entities include `userId` for multi-user readiness. Relations are enforced via foreign keys. Timestamps are ISO 8601 strings (SQLite text). IDs are auto-increment integers (D1 integer primary key).

## Entity-Relationship Diagram

```
User 1──* LifeArea 1──* Goal 1──* Task
                    │         └──* Habit (optional link)
                    └──* Habit 1──* HabitLog
                    └──* Metric 1──* MetricLog

User 1──* Review
User 1──* Win
User 1──* FinanceSnapshot 1──* FinanceAllocation
User 1──* PushSubscription
```

## Entities

### User

Scaffolded now (single-user), activated when wife joins.

| Field | Type | Notes |
|---|---|---|
| id | integer PK | Auto-increment |
| email | text | Unique, required |
| passwordHash | text | bcrypt/scrypt |
| name | text | Display name |
| timezone | text | e.g. "Asia/Kolkata" |
| createdAt | text | ISO 8601 |

### LifeArea

Top-level life buckets. Seeded with defaults on first run.

| Field | Type | Notes |
|---|---|---|
| id | integer PK | |
| userId | integer FK → User | |
| name | text | e.g. "Work — Valuelabs" |
| icon | text | Lucide icon name |
| color | text | Hex color |
| priorityWeight | integer | 1-10, higher = more important |
| targetWeeklyHours | real | Hours/week budgeted |
| isSeason | integer | 1 = active this season, 0 = off-season |
| sortOrder | integer | Display order |
| createdAt | text | |

### Goal

A desired outcome within an area. Uses WOOP creation flow.

| Field | Type | Notes |
|---|---|---|
| id | integer PK | |
| userId | integer FK → User | |
| areaId | integer FK → LifeArea | |
| title | text | |
| wish | text | WOOP: What do you want? |
| outcome | text | WOOP: Best outcome if achieved |
| obstacle | text | WOOP: Main inner obstacle |
| plan | text | WOOP: If [obstacle], then [action] |
| measurableTarget | text | e.g. "Lose 5 kg", "Get certificate by Aug" |
| deadline | text | ISO date |
| status | text | `active` / `someday` / `done` / `dropped` |
| wipActive | integer | 1 = counts toward WIP limit |
| sortOrder | integer | |
| createdAt | text | |
| completedAt | text | Nullable |

### Task

Discrete to-do item linked to an area and optionally a goal.

| Field | Type | Notes |
|---|---|---|
| id | integer PK | |
| userId | integer FK → User | |
| areaId | integer FK → LifeArea | |
| goalId | integer FK → Goal | Nullable |
| title | text | |
| description | text | Nullable, extra detail |
| isUrgent | integer | 0/1 — Eisenhower |
| isImportant | integer | 0/1 — Eisenhower |
| effortMins | integer | Estimated minutes |
| dueDate | text | ISO date, nullable |
| scheduledFor | text | ISO date, nullable — "do on this date" |
| isMIT | integer | 0/1 — today's Most Important Task |
| status | text | `todo` / `in_progress` / `done` / `cancelled` |
| completedAt | text | Nullable |
| createdAt | text | |

### Habit

Recurring behavior — two types via the `type` field:

- **`build`** (positive habits): things to do (exercise, meditate, read)
- **`limit`** (anti-habits): things to reduce or quit (Instagram scrolling, late sleeping, stress eating)

| Field | Type | Notes |
|---|---|---|
| id | integer PK | |
| userId | integer FK → User | |
| areaId | integer FK → LifeArea | |
| goalId | integer FK → Goal | Nullable — optional link |
| title | text | e.g. "Morning workout" or "Limit Instagram" |
| **type** | **text** | **`build` or `limit`** |
| cadence | text | `daily` / `weekdays` / `x-per-week` / `custom` |
| cadenceDays | text | JSON array for custom, e.g. `["mon","wed","fri"]` |
| cadenceTarget | integer | For x-per-week: how many times per week |
| tinyVersion | text | Build only: minimal version that still counts. Null for limit. |
| anchor | text | "After I [X], I will [this habit]" |
| reminderTime | text | HH:MM for push notification |
| graceDaysAllowed | integer | Default 1. Misses within grace don't break streak. |
| **dailyBudgetMins** | **integer** | **Limit only: allowed minutes/day (0 = quit entirely)** |
| **peakTemptationTime** | **text** | **Limit only: HH:MM for pre-commitment nudge** |
| **substitutionPlan** | **text** | **Limit only: "When I want to X, I will Y instead"** |
| archived | integer | 0/1 |
| sortOrder | integer | |
| createdAt | text | |

### HabitLog

One row per habit per day. Unique constraint on (habitId, date).

| Field | Type | Notes |
|---|---|---|
| id | integer PK | |
| habitId | integer FK → Habit | |
| date | text | ISO date (YYYY-MM-DD) |
| **status** | **text** | **Build: `done` / `partial` / `skipped` / `missed`. Limit: `clean` / `under_budget` / `over_budget` / `slip`** |
| value | real | Nullable — quantity (e.g., minutes scrolled for limit, reps done for build) |
| note | text | Nullable — optional reflection |
| createdAt | text | |

**Status values explained:**

For `build` habits:
- `done` — fully completed (or tiny version completed)
- `partial` — partially done
- `skipped` — deliberately skipped (doesn't use grace)
- `missed` — not done (auto-set by system at end of day)

For `limit` habits:
- `clean` — zero engagement with the bad habit
- `under_budget` — used less than daily budget
- `over_budget` — exceeded daily budget
- `slip` — for quit habits (budget=0), any engagement

### Streak (computed, cached)

Not a source-of-truth table. Materialized from HabitLog for performance.

| Field | Type | Notes |
|---|---|---|
| habitId | integer PK, FK → Habit | |
| currentStreak | integer | |
| longestStreak | integer | |
| graceDaysRemaining | integer | |
| lastCompletedDate | text | |
| missedTwiceCount | integer | Lifetime count of "missed twice" events |
| updatedAt | text | |

**Streak meaning by habit type:**
- Build habits: streak = consecutive days of doing the habit (done/partial)
- Limit habits: streak = consecutive days clean or under budget

### Metric

Numeric health/life metrics for trend tracking (weight, sleep, water, etc.).

| Field | Type | Notes |
|---|---|---|
| id | integer PK | |
| userId | integer FK → User | |
| areaId | integer FK → LifeArea | Nullable |
| name | text | e.g. "Weight (kg)", "Sleep (hrs)" |
| unit | text | e.g. "kg", "hrs", "glasses" |
| targetValue | real | Nullable — goal target |
| targetDirection | text | `increase` / `decrease` / `maintain` |
| sortOrder | integer | |
| createdAt | text | |

### MetricLog

| Field | Type | Notes |
|---|---|---|
| id | integer PK | |
| metricId | integer FK → Metric | |
| date | text | ISO date |
| value | real | |
| note | text | Nullable |
| createdAt | text | |

### Review

Daily check-in and weekly review entries.

| Field | Type | Notes |
|---|---|---|
| id | integer PK | |
| userId | integer FK → User | |
| type | text | `daily` / `weekly` |
| date | text | ISO date |
| mood | integer | 1-5 scale |
| energy | integer | 1-5 scale |
| winsText | text | Free-text: what went well |
| challengesText | text | Free-text: what was hard (reframed) |
| tomorrowMITs | text | JSON array of task titles/IDs for next day |
| focusAreas | text | Weekly only: JSON array of area IDs for next week |
| notes | text | Nullable |
| createdAt | text | |

### Win

Small captured wins feeding momentum views.

| Field | Type | Notes |
|---|---|---|
| id | integer PK | |
| userId | integer FK → User | |
| areaId | integer FK → LifeArea | Nullable |
| text | text | What was the win? |
| date | text | ISO date |
| createdAt | text | |

### FinanceSnapshot

Monthly finance overview — manual entry.

| Field | Type | Notes |
|---|---|---|
| id | integer PK | |
| userId | integer FK → User | |
| month | text | YYYY-MM |
| totalIncome | real | |
| notes | text | Nullable |
| createdAt | text | |

### FinanceAllocation

Per-asset-class allocation within a snapshot.

| Field | Type | Notes |
|---|---|---|
| id | integer PK | |
| snapshotId | integer FK → FinanceSnapshot | |
| assetClass | text | e.g. "Equity", "Debt", "Gold", "Cash", "Real Estate" |
| targetPercent | real | Planned allocation % |
| actualAmount | real | What was actually invested/held |
| notes | text | Nullable |

### PushSubscription

Web Push subscription endpoints for notifications.

| Field | Type | Notes |
|---|---|---|
| id | integer PK | |
| userId | integer FK → User | |
| endpoint | text | Push API endpoint URL |
| p256dh | text | Client public key |
| auth | text | Auth secret |
| createdAt | text | |

## Indexes

- `habit_logs`: unique index on `(habitId, date)` — one log per habit per day
- `tasks`: index on `(userId, status, scheduledFor)` — Today view query
- `habits`: index on `(userId, archived)` — active habits list
- `metric_logs`: index on `(metricId, date)` — trend queries
- `reviews`: unique index on `(userId, type, date)` — one review per type per day

## Streak computation logic

```
function computeStreak(habit, logs):
  sort logs by date descending
  streak = 0
  graceRemaining = habit.graceDaysAllowed
  missedTwice = false

  for each expected date (today backwards, respecting cadence):
    log = find log for this date

    if habit.type == 'build':
      isGood = log exists and log.status in [done, partial]
    else: // limit
      isGood = log exists and log.status in [clean, under_budget]

    if isGood:
      streak++
      graceRemaining = habit.graceDaysAllowed  // reset grace
    else if graceRemaining > 0:
      graceRemaining--
      streak++  // grace day — streak preserved
    else:
      break  // streak broken

  // Check "missed twice" — last 2 expected dates both missed/over-budget
  last2 = get logs for last 2 expected dates
  if both are missing or have bad status:
    missedTwice = true

  return { currentStreak: streak, graceRemaining, missedTwice }
```

This is computed on read and cached in the `streaks` table. The cache is invalidated when a HabitLog is created/updated.
