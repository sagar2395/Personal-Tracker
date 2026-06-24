# Data Model

All entities use Drizzle ORM with Cloudflare D1 (SQLite). Every table includes a `userId` column for future multi-user support. IDs use `text` type with CUID2 or nanoid generation.

## Entity relationship diagram

```
User 1──* LifeArea
User 1──* Goal
User 1──* Task
User 1──* Habit
User 1──* Review
User 1──* Win
User 1──* PushSubscription

LifeArea 1──* Goal
LifeArea 1──* Habit
LifeArea 1──* Task
LifeArea 1──* Metric

Goal 1──* Task
Goal 1──* Habit (optional link)

Habit 1──* HabitLog

Metric 1──* MetricLog

FinanceAllocation *──1 FinancePlan
```

## Full schema

### users

Single-user Phase 1, multi-user ready.

```ts
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  weeklyFreeHours: integer('weekly_free_hours').default(25),
  timezone: text('timezone').default('Asia/Kolkata'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});
```

### sessions

Auth sessions for cookie-based login.

```ts
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
});
```

### life_areas

Top-level organizational buckets. Seeded with 7 areas for this user.

```ts
export const lifeAreas = sqliteTable('life_areas', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  icon: text('icon'),                              // emoji or icon name
  color: text('color'),                            // hex color for UI
  priorityWeight: integer('priority_weight').default(1),  // relative importance
  targetWeeklyHours: real('target_weekly_hours').default(0),
  isInSeason: integer('is_in_season', { mode: 'boolean' }).default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});
```

Seed data:

| name | icon | color | targetWeeklyHours |
|---|---|---|---|
| Work — Valuelabs | briefcase | #3B82F6 | 0 (tracked by employer) |
| Work — Avyka | laptop | #8B5CF6 | 0 (tracked by employer) |
| Health | heart | #10B981 | 7 |
| Personal & Home | home | #F59E0B | 3 |
| Finance | banknote | #06B6D4 | 2 |
| Snowops | rocket | #EC4899 | 5 |
| Side Hustle | lightbulb | #F97316 | 0 (off-season by default) |

### goals

Desired outcomes within a life area. Uses WOOP structure.

```ts
export const goals = sqliteTable('goals', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  areaId: text('area_id').notNull().references(() => lifeAreas.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  // WOOP fields
  wish: text('wish'),                   // What do you want?
  outcome: text('outcome'),             // What does success look/feel like?
  obstacle: text('obstacle'),           // What's the main blocker?
  plan: text('plan'),                   // If [obstacle], then I will...
  // Goal structure
  measurableTarget: text('measurable_target'),  // e.g., "Reach 75 kg"
  deadline: text('deadline'),                   // ISO date string
  status: text('status', { enum: ['active', 'someday', 'done', 'dropped'] }).default('active'),
  isWipActive: integer('is_wip_active', { mode: 'boolean' }).default(true),
  sortOrder: integer('sort_order').default(0),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});
```

### tasks

Discrete to-do items, optionally linked to a goal.

```ts
export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  areaId: text('area_id').notNull().references(() => lifeAreas.id, { onDelete: 'cascade' }),
  goalId: text('goal_id').references(() => goals.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description'),
  // Eisenhower flags
  isUrgent: integer('is_urgent', { mode: 'boolean' }).default(false),
  isImportant: integer('is_important', { mode: 'boolean' }).default(false),
  // Planning
  effortMinutes: integer('effort_minutes'),        // estimated effort
  dueDate: text('due_date'),                       // ISO date string
  scheduledFor: text('scheduled_for'),             // ISO date string — "do on this day"
  isMIT: integer('is_mit', { mode: 'boolean' }).default(false),  // Most Important Task for today
  // Status
  status: text('status', { enum: ['todo', 'in_progress', 'done', 'dropped'] }).default('todo'),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});
```

### habits

Recurring behaviors with Tiny Habits structure.

```ts
export const habits = sqliteTable('habits', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  areaId: text('area_id').notNull().references(() => lifeAreas.id, { onDelete: 'cascade' }),
  goalId: text('goal_id').references(() => goals.id, { onDelete: 'set null' }),
  title: text('title').notNull(),                  // "30-minute workout"
  tinyVersion: text('tiny_version'),               // "1 push-up"
  anchor: text('anchor'),                          // "After I brush my teeth"
  // Cadence
  cadence: text('cadence', { enum: ['daily', 'weekly', 'specific_days'] }).default('daily'),
  cadenceTarget: integer('cadence_target'),         // for weekly: X times per week
  cadenceDays: text('cadence_days'),               // for specific_days: JSON array ["mon","wed","fri"]
  // Reminders
  reminderTime: text('reminder_time'),             // "07:00" (HH:MM)
  // Grace
  graceDaysAllowed: integer('grace_days_allowed').default(1),
  // State
  isArchived: integer('is_archived', { mode: 'boolean' }).default(false),
  sortOrder: integer('sort_order').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});
```

### habit_logs

One row per habit per day. Source of truth for streaks.

```ts
export const habitLogs = sqliteTable('habit_logs', {
  id: text('id').primaryKey(),
  habitId: text('habit_id').notNull().references(() => habits.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),                    // ISO date "YYYY-MM-DD"
  status: text('status', { enum: ['done', 'partial', 'skipped', 'missed'] }).notNull(),
  value: real('value'),                            // optional numeric (e.g., minutes, reps)
  note: text('note'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
  uniqueHabitDate: unique().on(table.habitId, table.date),
}));
```

Status meanings:
- `done` — completed (full or tiny version)
- `partial` — started but didn't finish (still counts for streak)
- `skipped` — intentionally skipped (uses grace day)
- `missed` — day passed without logging (auto-set by system)

### streak_cache

Performance cache for computed streaks. Rebuilt from `habit_logs`.

```ts
export const streakCache = sqliteTable('streak_cache', {
  habitId: text('habit_id').primaryKey().references(() => habits.id, { onDelete: 'cascade' }),
  currentStreak: integer('current_streak').default(0),
  longestStreak: integer('longest_streak').default(0),
  graceDaysRemaining: integer('grace_days_remaining').default(1),
  lastCompletedDate: text('last_completed_date'),
  missedTwice: integer('missed_twice', { mode: 'boolean' }).default(false),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});
```

### metrics

Named numeric values to track over time (health, fitness, etc.).

```ts
export const metrics = sqliteTable('metrics', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  areaId: text('area_id').references(() => lifeAreas.id, { onDelete: 'set null' }),
  name: text('name').notNull(),                    // "Weight", "Sleep hours", "Water (L)"
  unit: text('unit'),                              // "kg", "hours", "L"
  targetValue: real('target_value'),               // goal value
  targetDirection: text('target_direction', { enum: ['increase', 'decrease', 'maintain'] }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});
```

### metric_logs

Daily metric values.

```ts
export const metricLogs = sqliteTable('metric_logs', {
  id: text('id').primaryKey(),
  metricId: text('metric_id').notNull().references(() => metrics.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),                    // "YYYY-MM-DD"
  value: real('value').notNull(),
  note: text('note'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
  uniqueMetricDate: unique().on(table.metricId, table.date),
}));
```

### reviews

Daily check-ins and weekly reviews.

```ts
export const reviews = sqliteTable('reviews', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['daily', 'weekly'] }).notNull(),
  date: text('date').notNull(),                    // "YYYY-MM-DD"
  // Daily fields
  mood: integer('mood'),                           // 1-5 scale
  energy: integer('energy'),                       // 1-5 scale
  todayWins: text('today_wins'),                   // JSON array of strings
  tomorrowMITs: text('tomorrow_mits'),             // JSON array of task IDs or free text
  reflection: text('reflection'),                  // free text
  // Weekly fields
  weeklyWins: text('weekly_wins'),                 // JSON array
  weeklyMisses: text('weekly_misses'),             // JSON array (reframed)
  focusAreasNextWeek: text('focus_areas_next_week'), // JSON array of area IDs
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
  uniqueReviewTypeDate: unique().on(table.userId, table.type, table.date),
}));
```

### wins

Quick captured wins for the progress principle.

```ts
export const wins = sqliteTable('wins', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  areaId: text('area_id').references(() => lifeAreas.id, { onDelete: 'set null' }),
  text: text('text').notNull(),
  date: text('date').notNull(),                    // "YYYY-MM-DD"
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});
```

### finance_plans

Monthly allocation plans.

```ts
export const financePlans = sqliteTable('finance_plans', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  month: text('month').notNull(),                  // "YYYY-MM"
  totalIncome: real('total_income'),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
  uniqueUserMonth: unique().on(table.userId, table.month),
}));
```

### finance_allocations

Per-asset-class allocations within a monthly plan.

```ts
export const financeAllocations = sqliteTable('finance_allocations', {
  id: text('id').primaryKey(),
  planId: text('plan_id').notNull().references(() => financePlans.id, { onDelete: 'cascade' }),
  assetClass: text('asset_class').notNull(),       // "Equity", "Debt", "Gold", "Cash", "Real Estate"
  targetPercent: real('target_percent'),
  targetAmount: real('target_amount'),
  actualAmount: real('actual_amount'),
  notes: text('notes'),
});
```

### push_subscriptions

Web Push subscription endpoints for notifications.

```ts
export const pushSubscriptions = sqliteTable('push_subscriptions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  endpoint: text('endpoint').notNull(),
  p256dh: text('p256dh').notNull(),               // encryption key
  auth: text('auth').notNull(),                   // auth secret
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});
```

## Indexes

Add these for query performance:

```ts
// Habit logs: frequent lookups by habit + date range
habitLogsHabitIdx: index('idx_habit_logs_habit').on(habitLogs.habitId)
habitLogsDateIdx: index('idx_habit_logs_date').on(habitLogs.date)

// Tasks: filter by area, status, scheduled date
tasksAreaIdx: index('idx_tasks_area').on(tasks.areaId)
tasksScheduledIdx: index('idx_tasks_scheduled').on(tasks.scheduledFor)
tasksMITIdx: index('idx_tasks_mit').on(tasks.isMIT)

// Goals: filter by area, status
goalsAreaIdx: index('idx_goals_area').on(goals.areaId)
goalsStatusIdx: index('idx_goals_status').on(goals.status)

// Wins: lookup by date
winsDateIdx: index('idx_wins_date').on(wins.date)

// Reviews: lookup by type + date
reviewsDateIdx: index('idx_reviews_date').on(reviews.date)
```

## Migration strategy

Drizzle Kit generates SQL migrations from schema changes:

```bash
# Generate migration after schema change
npx drizzle-kit generate

# Apply to local D1
npx drizzle-kit push

# Apply to production
npx wrangler d1 migrations apply personal-tracker-prod
```

All schema changes are forward-only (no destructive migrations in production without a manual review step).
