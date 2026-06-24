# Feature Specifications

Each feature module is described with its purpose, screens, acceptance criteria, and which psychological principles it implements.

---

## Module 1: Today (Home View)

**Purpose:** The daily cockpit. Optimized for < 10 seconds to know your priorities and < 3 seconds to log a habit.

**Psychology:** MITs (Ivy Lee), Progress Principle (small wins), Never Miss Twice, Anti-Habit Substitution.

### Elements (top to bottom on mobile)

1. **Greeting + momentum score**
   - "Good morning, Sagar" + date
   - Momentum score: a 0-100 composite of habit consistency (70%) + tasks completed this week (30%). Displayed as a progress ring.

2. **MITs for today** (max 3)
   - Auto-suggested from Important tasks (Eisenhower) or manually set.
   - Each shows: title, area badge, effort estimate.
   - Tap to mark done — celebratory micro-animation.
   - If no MITs set: prompt "Pick your top 1-3 tasks for today."

3. **Habits due today**
   - Cards for each habit due today, grouped: `build` first, then `limit`.
   - **Build habits**: one-tap `Done` button, `Tiny version` button, `Skip` button. Shows tiny version and anchor text.
   - **Limit habits**: "Clean today" one-tap button, or "Log time" quick entry (minutes spent). Shows substitution plan prominently: *"Remember: when you want to scroll, open Kindle instead."*
   - Streak badge on each (with grace indicator if applicable).
   - **"Never miss twice" alert**: If a habit was missed yesterday (post-grace), it shows a warm highlight: *"Get back on — even the tiny version counts."* (build) or *"Fresh start today. Remember your plan: [substitution]."* (limit)

4. **Quick win capture**
   - Expandable text input: "What went well today?"
   - Saves to Win entity.

5. **Upcoming deadlines**
   - Tasks/goals with deadlines in the next 7 days, sorted by urgency.

### Acceptance criteria
- [ ] Page loads in < 1 second on 3G
- [ ] Build habit can be logged with a single tap (done/tiny/skip)
- [ ] Limit habit can be logged with a single tap (clean) or quick number entry (minutes)
- [ ] Substitution plan shown on limit habit cards
- [ ] MITs can be reordered via drag
- [ ] Momentum score updates after each habit log / task completion
- [ ] "Never miss twice" alert appears for habits missed 1 day after grace expires

---

## Module 2: Habits

**Purpose:** Create, manage, and review all habits — both building good ones and limiting bad ones.

**Psychology:** Tiny Habits, Implementation Intentions, Streaks with Grace, Anti-Habit Substitution, Pre-Commitment.

### Screens

#### Habit list
- Toggle: Active / Archived
- Filter by area, filter by type (Build / Limit / All)
- Each card: title, **type badge** (build = green "Build", limit = amber "Limit"), streak, cadence, area
- Tap to view detail

#### Habit detail / calendar
- Calendar grid: days colored by status
  - Build: done = green, partial = amber, skipped = muted, missed = gray
  - Limit: clean = green, under_budget = green, over_budget = amber, slip = gray
- Streak display: current streak, longest streak, grace status
- **For `limit` habits**: daily budget bar showing today's usage vs. budget, weekly average time, substitution plan card
- Log history list below calendar

#### Create build habit (multi-step form)
- **Step 1:** Title + area selection
- **Step 2:** Tiny version — *"What's the absolute minimum that still counts?"* (required)
- **Step 3:** Anchor — *"After I ___, I will do this habit"* (required)
- **Step 4:** Cadence (daily / weekdays / X per week / specific days) + reminder time
- **Step 5:** Grace days (default 1) + confirmation summary

#### Create limit habit (multi-step form)
- **Step 1:** Title + area selection — *"What habit do you want to reduce or quit?"*
  - Examples: "Instagram scrolling", "Staying up past midnight", "Stress eating"
- **Step 2:** Daily budget — *"How much is acceptable per day?"*
  - Slider: 0 min (quit entirely) to 120 min
  - Or count-based: 0 to N times/day
- **Step 3:** Substitution plan — *"When you feel the urge, what will you do instead?"*
  - Template: "When I want to [habit], I will [alternative] instead"
  - Required field — this is the core of anti-habit psychology
- **Step 4:** Peak temptation time — *"When does the urge usually hit hardest?"*
  - Time picker (e.g., 10:00 PM for bedtime scrolling)
  - The app will send a nudge 30 min before this time
- **Step 5:** Cadence + grace days + confirmation

### Acceptance criteria
- [ ] Create a build habit with tiny version + anchor — all fields required
- [ ] Create a limit habit with budget + substitution plan + peak time — all fields required
- [ ] Log a build habit: done / tiny / skip
- [ ] Log a limit habit: clean / minutes-or-count spent
- [ ] Limit habit shows "under budget" or "over budget" based on logged value vs. dailyBudgetMins
- [ ] Substitution plan displayed when logging a limit habit
- [ ] Streak survives 1 missed day when graceDaysAllowed >= 1
- [ ] Streak breaks on miss when grace exhausted
- [ ] "Never miss twice" flag triggers after 2 consecutive misses (both build and limit)
- [ ] Calendar view shows correct color coding per type
- [ ] Archived habits don't appear on Today

---

## Module 3: Goals & Tasks

**Purpose:** Track outcomes (goals) and discrete actions (tasks) with prioritization.

**Psychology:** WOOP, Eisenhower, WIP Limits, Capacity Management.

### Screens

#### Goals list (per area)
- Grouped by area or flat list with area badges
- Status filters: Active / Someday / Done / Dropped
- WIP indicator: "2 of 3 active" per area
- Tap to view detail

#### Goal detail
- WOOP fields displayed
- Progress indicator (% tasks done, or measurable target progress)
- Linked tasks list
- Linked habits — both build and limit (e.g., a "Lose weight" goal might link both "Morning workout" build habit and "Limit junk food" limit habit)

#### Goal creation (WOOP flow)
- Step-by-step guided flow:
  1. **Wish**: "What do you want to achieve?" (with area-specific examples)
  2. **Outcome**: "Imagine the best outcome. What does it look like?"
  3. **Obstacle**: "What's the main thing that could get in the way?"
  4. **Plan**: "If [obstacle] happens, I will ___"
  5. Measurable target + deadline
  6. Area assignment + review

#### Task backlog
- Default sort: Eisenhower quadrant (Important+Urgent → Important → Urgent → Neither)
- Filter by area, goal, status
- Quick-add: title + area (defaults to Important, not Urgent)
- Bulk actions: mark MIT, reschedule, reassign area

#### WIP limit enforcement
- When trying to activate a 4th goal in an area: modal with *"You already have 3 active goals in [area]. Finish or pause one first."*

### Acceptance criteria
- [ ] Create goal with full WOOP flow
- [ ] Link both build and limit habits to a goal
- [ ] Tasks auto-sort by Eisenhower quadrant
- [ ] Max 3 MITs selectable per day
- [ ] WIP limit blocks 4th active goal per area (configurable)
- [ ] Goal completion triggers celebratory moment
- [ ] Tasks can be linked to goals or standalone

---

## Module 4: Areas & Balance Dashboard

**Purpose:** Visual overview of time/attention balance across all life areas.

**Psychology:** Capacity Management, Seasons.

### Screen

- **Balance chart**: Bar or radar chart showing target vs. actual hours per area this week.
- **Area cards**: Each area shows: active goals count, pending tasks, habit consistency % (build + limit combined), season status.
- **Neglect warning**: If an in-season area has 0 activity for 7+ days, a gentle nudge appears: *"[Area] hasn't seen action in a week. Is it intentionally on pause?"* — with a button to mark it off-season.
- **Capacity summary**: Total planned hours vs. estimated free hours. Warning if overloaded.

### Acceptance criteria
- [ ] Balance chart renders with correct data
- [ ] Off-season areas are visually distinct (muted)
- [ ] Neglect warning appears for 7-day idle in-season areas
- [ ] Capacity warning appears when planned > available hours
- [ ] Tap area card to navigate to area detail (goals + tasks + habits filtered)

---

## Module 5: Reviews (Daily Check-in & Weekly Review)

**Purpose:** Structured reflection rituals that prevent drift and sustain motivation.

**Psychology:** Weekly Review (GTD), Progress Principle, Self-Compassion.

### Daily check-in (evening)

1. Mood (1-5 emoji scale)
2. Energy (1-5 scale)
3. "What went well today?" (auto-populated with completed tasks/habits + free text)
4. "What was challenging?" (free text, reframed as learning)
5. "Top 1-3 priorities for tomorrow" (pick from task backlog or type new)

### Weekly review (Sunday)

1. **Wins recap**: Auto-populated from the week's wins, completed tasks, streaks.
2. **Habit consistency**: Per-habit weekly summary, both build AND limit types. Misses reframed: *"These had a tough week — what got in the way?"*
   - Build habits: "Morning workout: 5 of 7 days"
   - Limit habits: "Instagram: averaged 12 min/day (budget: 15) — under budget!"
3. **Area balance check**: How did actual time compare to planned?
4. **Re-prioritize**: Toggle area seasons, adjust MITs, update goal statuses.
5. **Next week's focus**: Pick 1-2 focus areas for the coming week.

### Acceptance criteria
- [ ] Daily check-in saves mood, energy, wins, challenges, tomorrow's MITs
- [ ] Weekly review auto-populates wins and habit summaries (both types)
- [ ] Limit habits shown with average daily usage vs. budget in weekly summary
- [ ] Weekly review allows area season toggles
- [ ] Reviews are date-unique (one daily per day, one weekly per week)
- [ ] Push notification prompts for check-in (evening) and review (Sunday)

---

## Module 6: Finance (Phase 4)

**Purpose:** Lightweight finance management — allocation planning and investment tracking.

**Psychology:** Goal-setting (specific targets per asset class).

### Screens

#### Monthly snapshot
- Income input
- Allocation table: asset class, target %, actual amount, delta
- Default asset classes: Equity, Debt, Gold, Cash, Real Estate, Crypto (configurable)
- Monthly notes

#### Finance tasks
- Checklist of finance-related actions: "Rebalance portfolio", "Max out PPF", "Review insurance", etc.
- These are regular Tasks linked to the Finance area, displayed in a focused view.

### Acceptance criteria
- [ ] Create monthly snapshot with income + allocations
- [ ] Target vs. actual delta shown per asset class
- [ ] Finance tasks appear in both Finance module and global task backlog
- [ ] Historical snapshots viewable for trend

---

## Module 7: Insights (Phase 2+)

**Purpose:** Trends and analytics framed around progress and recovery.

**Psychology:** Progress Principle, Competence (SDT).

### Charts

- **Habit consistency over time**: Line chart per habit (% days completed per week) — separate views for build and limit habits
- **Limit habit trends**: Daily usage over time vs. budget line (shows reduction progress)
- **Momentum score trend**: Weekly momentum over months
- **Metric trends**: Weight, sleep, etc. as line charts
- **Area balance history**: Stacked area chart of hours per area over weeks
- **Streak milestones**: Timeline of streak achievements

### Acceptance criteria
- [ ] Charts render with real data from D1
- [ ] Limit habit usage-over-time chart shows clear trend with budget line overlay
- [ ] Time range selector (1W / 1M / 3M / 6M / 1Y)
- [ ] Charts are responsive on mobile

---

## Module 8: Settings

**Purpose:** Customize areas, weights, seasons, reminders, and data.

### Settings

- **Life areas**: Add/edit/reorder areas, set priority weight + target hours + season
- **Notification preferences**: Reminder times, which notifications are enabled (including pre-temptation nudges for limit habits)
- **Data export**: Download all data as JSON
- **Account**: Email, password, timezone
- **About**: Version, links to docs

### Acceptance criteria
- [ ] Areas can be CRUD'd with all fields
- [ ] Notification toggles work per notification type (including limit habit nudges)
- [ ] JSON export downloads all user data
