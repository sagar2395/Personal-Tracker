# UX Design Guide

## Design system

### Colors

The app uses a **dark theme** with calming, non-aggressive colors:

| Token | Color | Usage |
|---|---|---|
| `bg-primary` | Slate 950 (`#0f172a`) | Main background |
| `bg-card` | Slate 900 (`#0f1729`) | Card surfaces |
| `bg-input` | Slate 800 (`#1e293b`) | Input fields |
| `text-primary` | Slate 100 (`#f1f5f9`) | Primary text |
| `text-secondary` | Slate 400 (`#94a3b8`) | Secondary/muted text |
| `accent` | Indigo 500 (`#6366f1`) | Primary actions, active states |
| `success` | Emerald 500 (`#10b981`) | Completed, done, clean, under budget |
| `warn` | Amber 400 (`#fbbf24`) | Grace day, partial, over budget (not punitive) |
| `neutral-miss` | Slate 500 (`#64748b`) | Missed/skipped/slip (NOT red) |
| `build-badge` | Emerald 600 | "Build" habit type badge |
| `limit-badge` | Amber 500 | "Limit" habit type badge |
| `area-*` | Per-area color | User-customizable per life area |

**Critical rule:** Red (`#ef4444` or similar danger colors) is **never** used for habit misses, broken streaks, over-budget days, or failures. Red is reserved for destructive actions only (delete confirmation).

### Typography

- **Font**: Geist Sans (already configured)
- **Headings**: `font-bold tracking-tight`
- **Body**: Regular weight, comfortable line height
- **Small/muted**: `text-sm text-slate-400`

### Spacing & layout

- **Mobile-first**: Design at 375px width first
- **Max content width**: 640px (centered on desktop)
- **Card padding**: 16px
- **Section gap**: 24px
- **Touch targets**: Minimum 44x44px for all tappable elements

### Components

Built on **shadcn/ui** (Tailwind-based, copy-paste components):
- Button (primary, secondary, ghost, destructive)
- Card
- Input, Textarea
- Select, Slider (for mood/energy and budget setting)
- Dialog/Sheet (bottom sheet on mobile)
- Badge (for area tags, streak counts, habit type: Build/Limit)

---

## Screen flows

### Flow 1: Morning routine (Today view)

```
Open app
  → See greeting + momentum score
  → See 3 MITs for today
  → See habits due today (build section, then limit section)
  → Tap "Done" on "Morning workout" (build habit)
    → Streak increments, celebratory pulse animation
    → Momentum score updates
  → See "Limit Instagram" card showing:
    → Budget: 15 min | Streak: 5 days clean
    → Substitution: "When you want to scroll → open Kindle"
    → Tap "Clean today" → streak becomes 6, green checkmark
  → Glance at deadlines
  → Close app (~30 seconds total)
```

### Flow 2: Habit creation — build type

```
Habits → "+" button
  → Step 1: "What kind of habit?"
    → [Build something new] / [Limit something]
    → Select "Build"
  → Step 2: "What's the habit?"
    → Title: "Morning workout"
    → Area: Health
  → Step 3: "What's the tiny version?"
    → "The absolute minimum that still counts"
    → Tiny version: "Do 1 pushup"
  → Step 4: "When will you do it?"
    → Anchor: "After I brush my teeth"
    → Cadence: Daily
    → Reminder: 7:00 AM
  → Step 5: "Forgiveness settings"
    → Grace days: 1 (default)
  → Summary card → Confirm
```

### Flow 3: Habit creation — limit type (anti-habit)

```
Habits → "+" button
  → Step 1: Select "Limit something"
  → Step 2: "What do you want to limit?"
    → Title: "Instagram scrolling"
    → Area: Health
  → Step 3: "Set your boundaries"
    → Daily budget: 15 minutes
      → Slider: 0 (quit entirely) to 120 min
      → Or: "Quit entirely" toggle
    → For sleep: "Staying up past midnight"
      → Budget: 0 (quit entirely = be in bed by midnight)
  → Step 4: "What's your substitution plan?"
    → Template shown: "When I want to [scroll Instagram], I will [___] instead"
    → User fills: "read Kindle"
    → Full plan: "When I want to scroll Instagram, I will read Kindle instead"
  → Step 5: "When is temptation strongest?"
    → Peak time: 10:00 PM
    → Info: "We'll send a heads-up 30 min before"
  → Step 6: Grace days: 1
  → Summary → Confirm
```

### Flow 4: Logging a limit habit

```
Today view → "Instagram scrolling" card
  → Shows prominently:
    → Budget: 15 min/day
    → "Remember: When you want to scroll → open Kindle"
    → Streak: 5 days under budget
  → Options:
    [Clean today] — zero scrolling → logs as "clean"
    [Log time: ___ min] — tap to enter minutes
  → User taps "Log time" → enters "10"
  → Result: "Nice! 10 min today, within your 15 min budget. Streak: 6 days."
  → OR enters "30"
  → Result: "30 min today — over your 15 min budget. Tomorrow's a fresh start.
     Remember: Kindle instead."
```

### Flow 5: Logging a quit habit (budget = 0)

```
Today view → "Late night scrolling" card (budget: 0 = quit)
  → Shows: "Goal: zero scrolling after midnight"
  → Substitution: "At 11 PM, start wind-down routine"
  → Options:
    [Clean today] — no scrolling
    [Had a slip] — logs a slip event
  → "Clean today" → "Clean day! Streak: 12 days."
  → "Had a slip" → "Logged. Tomorrow's a fresh start.
     Your longest clean streak is 15 days — you can get there again."
```

### Flow 6: Pre-temptation nudge (push notification)

```
9:30 PM (30 min before peak time of 10 PM):
  Push notification:
    Title: "Heads up"
    Body: "Your scrolling danger zone starts soon.
           Tonight's plan: read Kindle instead."
  → Tap notification → opens Today view with the habit highlighted
```

### Flow 7: "Never miss twice" recovery

```
Day 1: User misses "Morning workout" (build habit)
  → Grace day used. Streak preserved.
  → Card shows amber dot: "Grace day — streak is safe."

Day 2: User misses again (grace exhausted)
  → Streak paused.
  → Push notification (evening):
    "Morning workout missed yesterday.
     Tomorrow's a great reset point — even 1 pushup counts."
  → Next morning, Today view shows habit with warm highlight badge:
     "Get back on — your tiny version: 1 pushup"

Day 3: User does 1 pushup (tiny version)
  → Logged as "done" → new streak starts at 1
  → Message: "Back on track. That's what matters."

--- Same flow for limit habits: ---

Day 1: User goes over budget on Instagram (limit habit)
  → Grace day used. Streak preserved.
  → Card: "Grace day — streak is safe. Tomorrow, remember: Kindle."

Day 2: Over budget again
  → Streak paused.
  → Notification: "Instagram was over budget 2 days in a row.
     Fresh start tomorrow. Plan: swap to Kindle at 10 PM."

Day 3: User stays clean or under budget
  → New streak starts at 1
  → "Back on track. Your plan is working."
```

### Flow 8: Goal creation (WOOP)

```
Goals → "+" button → Select area
  → Step 1 (Wish): "What do you want to achieve?"
    → "Get marriage certificate"
  → Step 2 (Outcome): "Imagine it's done. What's the best outcome?"
    → "Legal documentation complete, peace of mind"
  → Step 3 (Obstacle): "What's the main thing that could get in the way?"
    → "Paperwork confusion, government office visits"
  → Step 4 (Plan): "If [obstacle], then I will ___"
    → "If paperwork is confusing, I will call the helpline first"
  → Step 5: Measurable target + deadline
    → Target: "Certificate in hand"
    → Deadline: 2026-08-31
  → Confirm → Goal created
  → Prompt: "Add tasks to break this down?" → Yes
    → Quick-add tasks: "Research required documents", "Book appointment", etc.
  → Prompt: "Link any habits?" → Yes
    → Can link both build AND limit habits
```

### Flow 9: Weekly review

```
Push notification (Sunday 10 AM): "Time for your weekly review"
  → Open app → Review screen

  Section 1: "Your wins this week"
    → Auto-populated: 5 habits done, 3 tasks completed, "Started workout routine"
    → Celebration: "You completed 82% of planned habits — strong week!"

  Section 2: "Habit consistency"
    → Build habits:
      "Morning workout: 5 of 7 days"
      "Meditation: 2 of 7 days — what got in the way?"
    → Limit habits:
      "Instagram: averaged 12 min/day (budget: 15) — under budget!"
      "Late nights: 5 of 7 days clean"

  Section 3: "Area balance"
    → Chart: Health 8h (target 7h), Work-VL 42h, Snowops 0h
    → "Snowops hasn't seen action. Set to off-season?" → [Yes] / [Keep active]

  Section 4: "Next week's focus"
    → Pick 1-2 focus areas
    → Set MITs for Monday

  → Submit → "Review complete. Have a great week."
```

---

## Navigation

### Bottom tab bar (mobile)

5 tabs:

| Icon | Label | Screen |
|---|---|---|
| Home | Today | Today/home view |
| Target | Habits | Habit list + calendar |
| Flag | Goals | Goals & tasks |
| PieChart | Balance | Areas & balance dashboard |
| Menu | More | Reviews, Insights, Finance, Settings |

The "More" tab opens a menu with: Reviews, Insights, Finance, Settings.

### Desktop

Side navigation with the same items, expanded.

---

## Animations & micro-interactions

- **Habit completion**: Quick pulse/scale animation on the card + streak increment.
- **Streak milestone** (7, 30, 100): Subtle confetti or glow effect.
- **Goal completion**: Larger celebration — checkmark animation with area color.
- **Over-budget logging**: No negative animation. Just the neutral message and substitution plan reminder.
- **Page transitions**: Subtle fade/slide.
- **Pull to refresh**: Standard pull-down on mobile.

All animations are subtle and fast (< 300ms). No full-screen takeovers. The user should never wait for an animation to finish before tapping the next thing.

---

## Offline behavior

- **Read**: Service worker caches the app shell + last-fetched data. Today view, habit list, and recent logs are available offline.
- **Write**: Habit logs and task completions are queued in IndexedDB and synced when back online.
- **Indicator**: A small "offline" badge in the header. No blocking modal.

---

## Notification UX

| Notification | When | Copy style |
|---|---|---|
| Morning habit reminder | User's set time | "Time for [habit]. Even the tiny version counts." |
| **Pre-temptation (limit)** | **30 min before peak** | **"Heads up — [peak time] is your [habit] danger zone. Tonight's plan: [substitution]."** |
| Never miss twice (build) | Evening after first miss | "[Habit] missed today. Tomorrow's a reset point — [tiny version]." |
| **Never miss twice (limit)** | **Evening after over-budget** | **"[Habit] was over budget today. Fresh start tomorrow. Plan: [substitution]."** |
| Deadline approaching | 3 days, 1 day before | "[Task] is due in [X days]." |
| Weekly review prompt | Sunday AM | "Time for your weekly review. See your wins and set next week's focus." |
| Evening check-in | User's set time | "How was today? Take 2 minutes to reflect." |

All notifications are actionable (tap to go to relevant screen). All can be individually disabled in settings.
