# Features — Functional Specifications

Each feature module below includes: purpose, screens, behavior, acceptance criteria, and the phase it belongs to.

---

## Module 1: Today (Home Screen)

**Phase:** 1 (MVP)
**Purpose:** The daily cockpit. Answer "what should I focus on right now?" in under 10 seconds.
**Principles:** MIT/Ivy Lee, Tiny Habits, Progress principle

### Sections (top to bottom, mobile layout)

1. **Greeting + momentum ring**
   - "Good morning, Sagar" with current date
   - Momentum score (0–100) displayed as a circular progress ring
   - Trend arrow (up/down/flat) vs. previous 14-day window
   - Tapping the ring navigates to Insights

2. **MITs (Most Important Tasks)**
   - Shows 1–3 tasks marked as today's MITs
   - Each MIT shows: title, area color dot, effort estimate
   - Tap to complete (with satisfying animation)
   - "Pick today's MITs" button if none selected yet → opens task picker

3. **Habits due today**
   - List of habits scheduled for today (based on cadence/days)
   - Each shows: title, tiny version in smaller text, current streak, area color
   - One-tap actions: [Done] [Tiny] [Skip]
     - Done = full completion
     - Tiny = completed minimum version (counts as done for streak)
     - Skip = intentional skip (uses grace day)
   - "Never miss twice" alert: amber highlight on habits missed yesterday

4. **Quick win capture**
   - Single text input: "What went well today?"
   - Submit adds to wins table with today's date
   - Shows last 1–2 wins from today if already entered

5. **Upcoming deadlines**
   - Tasks/goals with due dates within the next 7 days
   - Sorted by urgency, shows area color and days remaining

### Acceptance criteria

- [ ] Today screen loads in < 1 second from app open
- [ ] Habit logging takes exactly one tap
- [ ] Tiny version counts as "done" for streak purposes
- [ ] Skip uses a grace day correctly
- [ ] Habits missed yesterday show the "never miss twice" highlight
- [ ] MITs are limited to max 3
- [ ] Momentum score updates after each habit log
- [ ] Win capture saves and displays immediately

---

## Module 2: Habits

**Phase:** 1 (MVP)
**Purpose:** Track recurring behaviors with grace-based streaks that survive misses.
**Principles:** Tiny Habits, Don't break the chain + forgiveness, Never miss twice, Implementation intentions

### Screens

#### Habits list
- Grid/list of all active habits grouped by area
- Each habit shows: title, current streak, area color, today's status (done/pending/missed)
- Toggle: show archived habits
- "+ New Habit" button

#### Habit detail
- Full habit info: title, tiny version, anchor, cadence, reminder time, grace days
- Calendar view showing completion history (colored dots per day)
- Streak stats: current streak, longest streak, grace days remaining
- Recovery checkpoint card (if missed twice — see PSYCHOLOGY.md)
- Edit / Archive / Delete actions

#### Create/edit habit form
- Title (required): "What's the habit?"
- Tiny version: "What's the absolute minimum version?" (with examples)
- Anchor: "After I ___" (implementation intention)
- Cadence: daily / X times per week / specific days
- Reminder time (optional)
- Grace days: number input (default 1, max 3)
- Area: select from life areas

### Behavior

- Habits not logged by end of day are automatically marked `missed` (cron job or on next app open)
- Streak computation follows the grace-day algorithm in PSYCHOLOGY.md
- When `missedTwice` is true, show the recovery checkpoint on the habit detail page AND on the Today screen

### Acceptance criteria

- [ ] Create habit with title, tiny version, anchor, cadence
- [ ] Log habit as done/tiny/skip from list and from Today screen
- [ ] Streak increments on done/partial, uses grace on skip/miss
- [ ] Streak survives a single miss (grace day consumed)
- [ ] Streak resets after grace days exhausted + another miss
- [ ] Grace days refill after a completed day
- [ ] Recovery checkpoint appears after two consecutive misses (post-grace)
- [ ] Recovery checkpoint offers: recommit, make smaller, pause
- [ ] Calendar view shows correct color coding per day
- [ ] Archived habits disappear from Today and list (but data preserved)

---

## Module 3: Life Areas & Balance Dashboard

**Phase:** 2
**Purpose:** Visualize balance across life dimensions, prevent over-commitment.
**Principles:** Energy/capacity management, Seasons/focus themes, Self-Determination Theory

### Screen

- Horizontal bar chart: each area shows target hours vs. this week's logged/estimated hours
- Total capacity bar: sum of area targets vs. declared free hours
- Capacity warning if overcommitted (see PSYCHOLOGY.md for wording)
- Per-area cards showing:
  - Active goals count (with WIP limit indicator)
  - Active habits count and this week's completion rate
  - Season toggle (in-season / off-season)
- Tap an area → filtered view of its goals, habits, tasks

### Acceptance criteria

- [ ] Areas display with correct colors and icons
- [ ] Target vs. actual hours visualized per area
- [ ] Capacity warning appears when sum > available hours * 1.1
- [ ] Season toggle changes area's `isInSeason` status
- [ ] Off-season areas excluded from neglect alerts and capacity calculations
- [ ] WIP limit count shown per area

---

## Module 4: Goals & Tasks

**Phase:** 2
**Purpose:** Manage desired outcomes and discrete to-dos with Eisenhower prioritization.
**Principles:** WOOP, Goal-setting theory, Eisenhower matrix, MIT/Ivy Lee, WIP limits

### Screens

#### Goals list
- Filter by area, status (active/someday/done/dropped)
- Each goal: title, area color, progress indicator (tasks done / total), deadline
- WIP limit indicator per area: "2/3 active" — blocks activating more if at limit
- "+ New Goal" with WOOP guided flow

#### Goal detail
- WOOP fields displayed prominently (wish/outcome/obstacle/plan)
- Linked tasks list with completion status
- Linked habits (if any)
- Progress bar (completed tasks / total)
- Status controls: mark as done/dropped, move to someday

#### Tasks list
- All tasks across areas, default sorted by Eisenhower priority:
  1. Important + Urgent
  2. Important + Not Urgent
  3. Urgent + Not Important
  4. Not Important + Not Urgent (with "consider dropping" hint)
- Filter by area, status, scheduled date
- Mark as MIT (today's focus) — limited to 3

#### Task detail / create form
- Title, description, area, goal (optional)
- Eisenhower flags: "Is this urgent?" "Is this important?"
- Effort estimate (minutes)
- Due date, scheduled-for date
- MIT toggle

### Behavior

- WIP limit enforcement: attempting to set a 4th goal as active in an area shows a dialog: "You have 3 active goals in [area]. Finish or pause one first." (configurable per area, default 3)
- MIT enforcement: selecting a 4th MIT shows "You already have 3 MITs for today. Replace one?"
- Tasks without area inherit from their goal's area
- Completing all tasks in a goal doesn't auto-complete the goal (user must confirm)

### Acceptance criteria

- [ ] WOOP goal creation flow works (4 guided steps)
- [ ] Goals show progress (tasks completed / total)
- [ ] WIP limit prevents activating too many goals per area
- [ ] Tasks auto-sort by Eisenhower quadrant
- [ ] MIT selection limited to 3 per day
- [ ] Tasks filterable by area, status, date
- [ ] Completing a task updates goal progress

---

## Module 5: Daily Check-in

**Phase:** 1 (MVP)
**Purpose:** End-of-day reflection to capture wins and set tomorrow's intention.
**Principles:** Progress principle, Self-compassion

### Screen

A simple guided form (swipeable cards or scrollable):

1. **Mood** — 5-point scale (emoji: exhausted → energized)
2. **Energy** — 5-point scale
3. **Today's wins** — free text list (pre-populated from completed tasks/habits)
4. **Reflection** — "Anything on your mind?" (optional free text)
5. **Tomorrow's MITs** — pick 1–3 tasks for tomorrow

### Acceptance criteria

- [ ] Check-in saves mood, energy, wins, reflection, tomorrow MITs
- [ ] Completed tasks/habits auto-suggested as wins
- [ ] Tomorrow's MITs are applied when tomorrow arrives
- [ ] Only one daily check-in per day (edit existing if re-opened)
- [ ] Check-in accessible from Today screen via a prominent button

---

## Module 6: Weekly Review

**Phase:** 3
**Purpose:** Guided weekly reflection and re-prioritization.
**Principles:** Weekly review ritual (GTD), Self-compassion, Seasons

### Screen

5-step guided flow (see PSYCHOLOGY.md for full flow):

1. Wins summary (auto-populated + manual add)
2. Misses reframed (non-judgmental, with adjustment options)
3. Area balance review (visual)
4. Re-prioritize goals/areas
5. Set next week's focus themes

### Acceptance criteria

- [ ] Auto-populates wins from completed tasks, habits, captured wins
- [ ] Misses shown with compassionate language
- [ ] Area balance chart shows this week's data
- [ ] User can adjust area seasons and goal priorities
- [ ] Focus themes saved and reflected in next week's Today view
- [ ] Triggered by push notification (configurable day/time)

---

## Module 7: Finance

**Phase:** 4
**Purpose:** Lightweight salary allocation and investment tracking.
**Principles:** Goal-setting theory

### Screens

#### Monthly plan
- Total income input
- Allocation by asset class: table with target %, target amount, actual amount
- Default asset classes: Equity, Debt, Gold, Cash/Savings, Real Estate, Emergency Fund
- Difference column (target vs. actual) with visual indicator
- Notes per allocation

#### Finance tasks
- Task list filtered to Finance area
- Checklist style for monthly money review: "max PPF", "SIP rebalance", etc.

### Acceptance criteria

- [ ] Create/edit monthly finance plan
- [ ] Add allocations by asset class
- [ ] See target vs. actual per class
- [ ] Copy previous month's plan as template
- [ ] Finance tasks filterable from general task list

---

## Module 8: Insights

**Phase:** 2 (v1), expanded in later phases
**Purpose:** Show trends that prove progress is happening.
**Principles:** Progress principle, Self-compassion

### Screens

- **Habit consistency:** per-habit completion rate over time (line chart, 30/90 day)
- **Momentum trend:** momentum score over time
- **Metric charts:** weight, sleep, etc. (line charts with trend lines)
- **Area balance history:** stacked area chart over weeks
- **Streak records:** best streaks, current streaks, recovery count (framed positively: "You've recovered X times — that's resilience")

### Acceptance criteria

- [ ] Charts load with real data
- [ ] Time range selectable (7d, 30d, 90d)
- [ ] Positive framing on all metrics
- [ ] Recovery count shown as a positive metric

---

## Module 9: Notifications & Reminders

**Phase:** 3
**Purpose:** Timely nudges that keep the user engaged without being annoying.
**Principles:** Never miss twice, Implementation intentions, Weekly review

### Notification types

| Type | Trigger | Content |
|---|---|---|
| Habit reminder | Configured time per habit | "Time for [habit]. Even [tiny version] counts." |
| Never miss twice | Morning after a missed day | "[Habit] is waiting for you. You've got this." |
| Deadline approaching | 3 days and 1 day before due | "[Task] is due in [N] days." |
| Weekly review | Configured day/time (default Sunday 7pm) | "Time for your weekly review. Let's see how the week went." |
| Daily check-in | Evening (configurable) | "How was your day? Capture a quick win." |

### Acceptance criteria

- [ ] Web Push notifications work on mobile (PWA installed)
- [ ] User can configure reminder times per habit
- [ ] "Never miss twice" notification only fires after exactly 1 missed day
- [ ] User can mute specific notification types
- [ ] Notifications respect timezone setting

---

## Module 10: Settings

**Phase:** 1 (basic), expanded with each phase
**Purpose:** User configuration.

### Settings

- **Profile:** Name, email, timezone
- **Capacity:** Weekly free hours declaration
- **Areas:** Create, edit, reorder, set colors/icons, season toggle
- **WIP limits:** Per-area goal limit
- **Notifications:** Enable/disable types, configure times
- **Data:** Export all data as JSON, manual backup trigger
- **Account:** Change password, logout

### Acceptance criteria

- [ ] All settings persist to D1
- [ ] Weekly free hours affects capacity calculations
- [ ] Area customization reflects across all screens
- [ ] Data export produces valid JSON of all user data
