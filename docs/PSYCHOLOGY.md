# Psychological Principles

Every feature in this app is grounded in at least one evidence-based psychological principle. This document defines each principle, explains exactly how it maps to a feature, and specifies the UX rules that implement it.

## Principles table

| # | Principle | Source | Feature | UX rule |
|---|---|---|---|---|
| 1 | Tiny Habits / B=MAP | BJ Fogg | Habit creation | Every habit requires a "minimum version" (e.g., "1 push-up" instead of "30-minute workout") and an anchor ("After I brush my teeth"). Logging the tiny version counts as done. |
| 2 | Don't break the chain + forgiveness | Seinfeld / Duolingo | Streak system | Streaks include configurable **grace days** (default: 1). A single miss uses a grace day without breaking the streak. This directly fixes the "one miss → months of drift" problem. |
| 3 | Never miss twice (2-day rule) | James Clear | Recovery nudges | After 1 miss, the app sends a gentle "get back on" notification. The tracked metric is *missed-twice events*, not perfection rate. Missing twice triggers a "recovery checkpoint" — not punishment, but a prompt to recommit or adjust the habit. |
| 4 | Implementation intentions | Gollwitzer | Habit/task details | Habits and scheduled tasks store "When [trigger], I will [action] at [place/time]." This is surfaced in the Today view next to each item. |
| 5 | Self-Determination Theory | Deci & Ryan | System design | **Autonomy:** User defines areas, weights, seasons, and priorities — the system suggests, never dictates. **Competence:** Progress views, mastery tracking, momentum score. **Relatedness:** Accountability partner (wife, Phase 5). |
| 6 | WOOP / mental contrasting | Oettingen | Goal creation | Goal creation follows a guided flow: **W**ish (what do you want?) → **O**utcome (how will it feel/look?) → **O**bstacle (what's the main blocker?) → **P**lan (if [obstacle], then I will [action]). All four fields stored. |
| 7 | Goal-setting theory | Locke & Latham | Goal structure | Every goal requires a **specific measurable outcome** and a **deadline**. Goals are broken into concrete tasks and/or habits. Vague goals ("get healthier") are guided toward specifics ("reach 75 kg by March"). |
| 8 | Progress principle / small wins | Amabile | Wins capture, momentum | Daily "what went well?" capture. Momentum score calculated from recent consistency. Milestone celebrations at meaningful thresholds (7-day streak, 30-day streak, goal completion). |
| 9 | Eisenhower matrix | Eisenhower | Task prioritization | Every task has two boolean flags: **urgent** and **important**. The Today view auto-sorts: Important+Urgent first, then Important+Not-Urgent, then Urgent+Not-Important. Not-Important+Not-Urgent items are deprioritized or flagged for deletion. |
| 10 | MIT / Ivy Lee method | Ivy Lee | Daily focus | Each day, the user picks **1–3 Most Important Tasks** from the full backlog. Only MITs appear prominently on the Today screen. The system limits MIT selection to 3 to enforce focus. |
| 11 | WIP limits (Kanban) | Lean/Agile | Goal management | A configurable cap (default: 3) on simultaneously **active** goals per life area. Attempting to activate a 4th goal shows: "You have 3 active goals here. Finish or pause one before adding another." |
| 12 | Energy/capacity management | Time-blocking research | Weekly time budget | Each life area has a **target weekly hours** allocation. The system totals these against the user's declared **available weekly hours** (realistic free time after work/sleep). If total planned > available, it warns: "You're planning X hours of work into Y available hours. Something needs to give." |
| 13 | Seasons / focus themes | Cyclical planning | Area priorities | The user can mark areas as "in season" (active focus) or "off season" (maintenance mode). Off-season areas don't generate urgent notifications or appear in neglect warnings. This prevents guilt about temporarily deprioritized areas. |
| 14 | Weekly review ritual | GTD (David Allen) | Weekly review | A guided weekly flow: (1) Celebrate wins, (2) Review misses *reframed* as learning, (3) Review area balance, (4) Re-prioritize and set next week's focus. Triggered by a Sunday notification. |
| 15 | Self-compassion / reframing | Kristin Neff | Tone & copy | Misses are never shown as failures. Vocabulary: "reset point" not "broken streak," "recovery day" not "missed day," "adjustment" not "failure." No red/aggressive UI elements for negative states. Warm neutral palette (amber, soft blue) for alerts. |
| 16 | Loss aversion (gentle commitment) | Kahneman & Tversky | Optional commitments | Users can optionally set a "commitment" on a goal — a stated consequence of not following through. Framed positively: "If I complete this by [date], I'll [reward]." Not punitive. |

## Detailed UX rules derived from principles

### Grace day logic (Principles 2 + 3)

```
For a habit with graceDaysAllowed = N:
  - Track consecutive days of completion
  - When a day is missed:
    - If grace days remaining > 0: decrement grace days, streak continues
    - If grace days remaining = 0: streak resets to 0, grace days refill to N
  - Grace days refill to N after any completed day
  - "Missed twice" = two consecutive days with status != 'done' AND grace = 0
  - When "missed twice" triggers: show recovery checkpoint, not failure
```

### Recovery checkpoint flow (Principle 3)

When a user has missed a habit twice consecutively (after grace days exhausted):

1. Show a non-judgmental card: "It looks like [habit] has been tough this week. That's okay — it happens to everyone."
2. Offer three options:
   - **"I'm back"** — recommit, streak resets, fresh start
   - **"Make it smaller"** — edit the habit to a tinier version
   - **"Pause for now"** — archive the habit without deleting it; can reactivate anytime
3. Never auto-archive or delete. The user is always in control.

### Tone guidelines (Principle 15)

| Instead of... | Use... |
|---|---|
| "You failed" | "Reset point" |
| "Streak broken" | "Fresh start" |
| "0 days" | "Day 1" |
| "You missed 3 habits" | "3 habits are waiting for you" |
| "Overdue" | "Ready when you are" |
| Red/orange warning colors | Warm amber, soft blue |
| Exclamation marks in warnings | Calm periods |

### Momentum score (Principle 8)

A single number (0–100) representing recent consistency across all active habits:

```
momentum = (completed_habit_days_last_14 / expected_habit_days_last_14) * 100
```

- Displayed as a ring/arc on the Today screen
- 80–100: "Strong momentum" (green)
- 50–79: "Building" (amber)
- Below 50: "Recovery mode — every day counts" (soft blue, never red)
- Trend arrow shows direction (improving/declining) vs. previous 14-day window

### Capacity warning (Principle 12)

On the Areas/Balance dashboard:

```
available_hours = user.declaredWeeklyFreeHours  // e.g., 25 hrs after work+sleep
planned_hours = SUM(area.targetWeeklyHours for all active areas)
if planned_hours > available_hours * 1.1:
  show: "You're planning {planned}h into {available}h of free time.
         Consider putting an area into off-season or reducing targets."
```

### WOOP goal creation flow (Principle 6)

Four-step guided form:

1. **Wish:** "What's the goal?" → free text title
2. **Outcome:** "When you achieve this, what does it look like? How will it feel?" → free text
3. **Obstacle:** "What's the biggest thing that could get in the way?" → free text
4. **Plan:** "If [obstacle] happens, I will..." → free text (implementation intention)

All four fields are stored and visible on the goal detail page. Users can skip Outcome/Obstacle/Plan but are gently encouraged to fill them.

### Weekly review flow (Principle 14)

Guided 5-step ritual, takes ~10 minutes:

1. **Wins** — auto-populated from completed tasks/habits/captured wins this week. User can add more. "You completed X habits, finished Y tasks, and captured Z wins this week."
2. **Misses** — reframed. "These habits had a tough week. Want to adjust, make them smaller, or recommit?" No blame language.
3. **Area balance** — visual of time spent per area vs. targets. "Any areas you want to shift focus to next week?"
4. **Re-prioritize** — drag to reorder goals/areas for next week. Set/change season status.
5. **Next week's focus** — pick 1–3 focus themes for the coming week.

Triggered by a push notification on Sunday evening (configurable day/time).
