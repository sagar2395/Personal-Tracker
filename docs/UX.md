# UX — Screens, Flows & Design Principles

## Design principles

### 1. Mobile-first, one-thumb operation
Every primary action (log a habit, mark MIT done, capture a win) is reachable with the thumb in a single-hand grip. Critical tap targets are in the bottom 60% of the screen. No important action requires scrolling first.

### 2. Seconds, not minutes
The most frequent interactions — habit logging, win capture, MIT completion — take under 5 seconds. The Today screen is optimized for "open, tap, close" usage patterns during a busy day.

### 3. Calm and encouraging
No aggressive colors for negative states. The palette uses warm neutrals, soft greens for positive, warm amber for attention, and soft blue for "recovery" states. Never red. Never exclamation marks in warnings.

### 4. Progressive disclosure
Show only what matters now. Details are one tap away, not cluttering the primary view. The Today screen shows habit titles and a single action button — the full streak history is on the detail page.

### 5. Installable PWA
The app installs to the home screen with a custom icon, splash screen, and standalone display mode. It looks and feels like a native app.

## Color palette

| Use | Color | Hex |
|---|---|---|
| Background | Off-white / very light gray | `#FAFAF9` |
| Card background | White | `#FFFFFF` |
| Primary text | Near-black | `#1C1917` |
| Secondary text | Warm gray | `#78716C` |
| Primary action | Teal | `#0D9488` |
| Positive / done | Soft green | `#10B981` |
| Attention / nudge | Warm amber | `#F59E0B` |
| Recovery / neutral alert | Soft blue | `#60A5FA` |
| Streak | Golden | `#D97706` |
| Danger (destructive actions only) | Soft red | `#EF4444` |

Area colors (from seed data) provide additional visual coding throughout.

## Typography

- **Primary font:** System font stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`) for fast load and native feel
- **Headings:** Semi-bold, 1.25–1.5rem
- **Body:** Regular, 1rem (16px base)
- **Small text:** 0.875rem for secondary info (streak counts, dates)

## Navigation

### Bottom tab bar (mobile)

5 tabs, always visible:

```
┌─────────────────────────────────────┐
│  Today  │ Habits │ Goals │ Review │ ⋯ │
│   🏠    │  ✓✓✓  │  🎯  │  📝   │ ≡  │
└─────────────────────────────────────┘
```

- **Today** — home screen (Module 1)
- **Habits** — habit list/grid (Module 2)
- **Goals** — goals & tasks (Module 4)
- **Review** — daily check-in / weekly review (Module 5/6)
- **More (⋯)** — Areas, Finance, Insights, Settings

### Desktop/tablet

Side navigation with the same items, expanded labels, and the "More" items always visible.

## Screen layouts

### Today screen (mobile wireframe)

```
┌──────────────────────────────────┐
│ Good morning, Sagar         ☀️   │
│ Tuesday, June 24                 │
│                                  │
│        ┌──────────┐             │
│        │   78%    │  ↑          │
│        │ Momentum │             │
│        └──────────┘             │
│                                  │
│ ─── Today's Focus ────────────  │
│                                  │
│ ☐ Review PR for Avyka    🟣 15m │
│ ☐ Draft Snowops pitch    🩷 30m │
│                                  │
│ ─── Habits ───────────────────  │
│                                  │
│ 🏃 Morning workout    🔥 12    │
│   tiny: 1 push-up              │
│   [Done] [Tiny] [Skip]         │
│                                  │
│ ⚠ Meditation          🔥 0     │
│   missed yesterday — get back!  │
│   [Done] [Tiny] [Skip]         │
│                                  │
│ 💧 Drink 2L water     🔥 5     │
│   [Done] [Tiny] [Skip]         │
│                                  │
│ ─── Quick Win ────────────────  │
│ ┌────────────────────────────┐  │
│ │ What went well today?      │  │
│ └────────────────────────────┘  │
│                                  │
│ ─── Coming Up ────────────────  │
│ 📋 Marriage cert docs    3 days │
│ 🎂 Anniversary plan     12 days│
│                                  │
│ ┌────────────────────────────┐  │
│ │  ✏️  Daily Check-in        │  │
│ └────────────────────────────┘  │
│                                  │
│ Today │ Habits │ Goals │ Review │⋯│
└──────────────────────────────────┘
```

Key interactions:
- Habit [Done]/[Tiny]/[Skip] buttons are large tap targets (min 44px height)
- MIT checkboxes have a satisfying check animation
- Momentum ring is tappable → Insights
- "Never miss twice" warning uses amber background, not red
- Daily check-in button is prominent at the bottom of content

### Habit creation flow

```
Step 1/4: The Habit
┌──────────────────────────────────┐
│ What habit do you want to build? │
│ ┌────────────────────────────┐   │
│ │ e.g., "30-minute workout"  │   │
│ └────────────────────────────┘   │
│                                  │
│ Life area:  [Health ▼]           │
│                                  │
│                    [Next →]      │
└──────────────────────────────────┘

Step 2/4: Make It Tiny
┌──────────────────────────────────┐
│ What's the absolute minimum      │
│ version of this habit?           │
│                                  │
│ Even on your worst day, you      │
│ could do this in under 2 min.    │
│                                  │
│ ┌────────────────────────────┐   │
│ │ e.g., "1 push-up"          │   │
│ └────────────────────────────┘   │
│                                  │
│ This counts as "done" for your   │
│ streak. No guilt, just showing   │
│ up.                              │
│                                  │
│          [← Back] [Next →]       │
└──────────────────────────────────┘

Step 3/4: Anchor It
┌──────────────────────────────────┐
│ When will you do this?           │
│                                  │
│ After I ________________________ │
│         e.g., "brush my teeth"   │
│                                  │
│ At: [07:00 ▼] (reminder time)   │
│                                  │
│ How often?                       │
│ ○ Every day                      │
│ ○ X times per week: [___]        │
│ ○ Specific days: [M T W T F S S] │
│                                  │
│          [← Back] [Next →]       │
└──────────────────────────────────┘

Step 4/4: Safety Net
┌──────────────────────────────────┐
│ Life happens. How many grace     │
│ days do you want?                │
│                                  │
│ Grace days let you miss without  │
│ breaking your streak.            │
│                                  │
│       [  1  ]  (recommended)     │
│                                  │
│ Summary:                         │
│ ✓ "30-minute workout"            │
│ ✓ Tiny: "1 push-up"             │
│ ✓ After: "brush my teeth" @7am   │
│ ✓ Daily, 1 grace day            │
│                                  │
│          [← Back] [Create ✓]     │
└──────────────────────────────────┘
```

### WOOP goal creation flow

```
Step 1/4: Wish
┌──────────────────────────────────┐
│ What's the goal?                 │
│ ┌────────────────────────────┐   │
│ │ e.g., "Reach 75 kg"        │   │
│ └────────────────────────────┘   │
│ Area: [Health ▼]                 │
│ Deadline: [____________]         │
│                    [Next →]      │
└──────────────────────────────────┘

Step 2/4: Outcome
┌──────────────────────────────────┐
│ When you achieve this, what does │
│ it look like? How will it feel?  │
│ ┌────────────────────────────┐   │
│ │                            │   │
│ │                            │   │
│ └────────────────────────────┘   │
│        [← Back] [Next →]        │
└──────────────────────────────────┘

Step 3/4: Obstacle
┌──────────────────────────────────┐
│ What's the biggest thing that    │
│ could get in the way?            │
│ ┌────────────────────────────┐   │
│ │                            │   │
│ └────────────────────────────┘   │
│        [← Back] [Next →]        │
└──────────────────────────────────┘

Step 4/4: Plan
┌──────────────────────────────────┐
│ If that obstacle comes up,       │
│ I will...                        │
│ ┌────────────────────────────┐   │
│ │                            │   │
│ └────────────────────────────┘   │
│                                  │
│ Summary:                         │
│ 🎯 Reach 75 kg                  │
│ 📅 By: March 2027               │
│ ⭐ "I'll feel confident & fit"  │
│ ⚡ "Late night snacking"        │
│ 🛡 "I'll prep healthy snacks"   │
│                                  │
│        [← Back] [Create ✓]      │
└──────────────────────────────────┘
```

### Areas / Balance dashboard

```
┌──────────────────────────────────┐
│ Life Balance          This Week  │
│                                  │
│ Available: 25h                   │
│ Planned:   17h                   │
│ ████████████████░░░░░░░░ 68%    │
│                                  │
│ ─── Areas ────────────────────  │
│                                  │
│ 💚 Health          7h target    │
│ ████████░░░░░░░░   4.5h actual  │
│ 3 habits (86% this week)         │
│ 1/3 goals active                 │
│                                  │
│ 🩷 Snowops         5h target    │
│ ██████░░░░░░░░░░   3h actual    │
│ 0 habits, 2/3 goals active       │
│                                  │
│ 🟡 Personal        3h target    │
│ ████████████████   4h actual    │
│ 3/3 goals active ⚠ WIP limit    │
│                                  │
│ 💙 Finance         2h target    │
│ ░░░░░░░░░░░░░░░░   0h actual   │
│ ← "Ready when you are"          │
│                                  │
│ 💡 Side Hustle     Off-season   │
│ 🌙 Hibernating — not counted    │
│                                  │
│ Today │ Habits │ Goals │ Review │⋯│
└──────────────────────────────────┘
```

### Recovery checkpoint (habit missed twice)

```
┌──────────────────────────────────┐
│                                  │
│   It looks like "Morning workout"│
│   has been tough this week.      │
│                                  │
│   That's okay — it happens to    │
│   everyone. What would help?     │
│                                  │
│   ┌────────────────────────────┐ │
│   │  💪  I'm back              │ │
│   │  Recommit — fresh start    │ │
│   └────────────────────────────┘ │
│                                  │
│   ┌────────────────────────────┐ │
│   │  🔬  Make it smaller       │ │
│   │  Edit to a tinier version  │ │
│   └────────────────────────────┘ │
│                                  │
│   ┌────────────────────────────┐ │
│   │  ⏸️  Pause for now         │ │
│   │  Archive — reactivate later│ │
│   └────────────────────────────┘ │
│                                  │
└──────────────────────────────────┘
```

### Daily check-in flow

```
┌──────────────────────────────────┐
│ Daily Check-in     June 24       │
│                                  │
│ How's your mood?                 │
│ 😫  😕  😐  🙂  😄              │
│                                  │
│ Energy level?                    │
│ 🔋  🔋  🔋  🔋  🔋              │
│ Low ←──────────────→ High        │
│                                  │
│ Today's wins:                    │
│ ✓ Completed morning workout      │
│ ✓ Finished Avyka code review     │
│ + [Add another win]              │
│                                  │
│ Anything on your mind?           │
│ ┌────────────────────────────┐   │
│ │ (optional reflection)       │   │
│ └────────────────────────────┘   │
│                                  │
│ Tomorrow's focus (pick 1–3):     │
│ ☐ Draft Snowops proposal         │
│ ☐ Schedule furniture delivery    │
│ ☐ Research index funds           │
│                                  │
│             [Save Check-in ✓]    │
└──────────────────────────────────┘
```

### Weekly review flow

```
Step 1/5: Celebrate Wins
┌──────────────────────────────────┐
│ 🎉 This week's wins              │
│                                  │
│ ✓ Completed 18/21 habit days     │
│ ✓ Finished "Avyka sprint tasks"  │
│ ✓ Called about marriage cert     │
│ ✓ "Nailed the Snowops pitch"    │
│                                  │
│ + [Add a win I missed]           │
│                                  │
│ That's a solid week.             │
│                                  │
│                    [Next →]      │
└──────────────────────────────────┘

Step 2/5: Reset Points
┌──────────────────────────────────┐
│ These habits had a tough week.   │
│ No judgment — let's adjust.      │
│                                  │
│ Meditation (2/7 days)            │
│ [Recommit] [Make smaller] [Pause]│
│                                  │
│ Read 30 min (1/7 days)           │
│ [Recommit] [Make smaller] [Pause]│
│                                  │
│          [← Back] [Next →]       │
└──────────────────────────────────┘

Step 3/5: Balance Check
┌──────────────────────────────────┐
│ How your time balanced out:      │
│                                  │
│ [Area balance chart - this week] │
│                                  │
│ Health was below target.         │
│ Finance didn't get attention.    │
│ Both are okay if intentional.    │
│                                  │
│          [← Back] [Next →]       │
└──────────────────────────────────┘

Step 4/5: Re-prioritize
┌──────────────────────────────────┐
│ Drag to reorder your focus:      │
│                                  │
│ ≡ Health          [In Season ✓]  │
│ ≡ Snowops         [In Season ✓]  │
│ ≡ Personal & Home [In Season ✓]  │
│ ≡ Finance         [In Season ✓]  │
│ ≡ Side Hustle     [Off Season]   │
│                                  │
│          [← Back] [Next →]       │
└──────────────────────────────────┘

Step 5/5: Next Week
┌──────────────────────────────────┐
│ Pick 1–3 focus themes for next   │
│ week:                            │
│                                  │
│ ☐ Get back on health routine     │
│ ☐ Close out marriage cert        │
│ ☐ Snowops client outreach        │
│ ☐ Monthly finance review         │
│ + [Custom theme]                 │
│                                  │
│          [← Back] [Finish ✓]     │
└──────────────────────────────────┘
```

## Animations & micro-interactions

- **Habit done:** Checkmark appears with a quick scale-up + green pulse
- **Streak milestone (7, 30, 100):** Brief confetti/sparkle effect
- **MIT completed:** Satisfying strikethrough animation
- **Momentum ring:** Smooth animation when score updates
- **Recovery checkpoint:** Slides up gently from bottom (no jarring popup)
- **Tab switching:** Quick crossfade, no page reload feeling

## Responsive behavior

| Viewport | Layout |
|---|---|
| < 640px (phone) | Single column, bottom tab nav, stacked cards |
| 640–1024px (tablet) | Two-column where useful (habits grid), bottom tab nav |
| > 1024px (desktop) | Side nav, multi-column dashboard, wider cards |

## Accessibility

- All interactive elements have minimum 44×44px touch targets
- Color is never the only indicator (always paired with icons or text)
- Focus indicators for keyboard navigation
- Semantic HTML (headings, lists, landmarks)
- aria-labels on icon-only buttons
- Respects `prefers-reduced-motion` for animations
- Respects `prefers-color-scheme` (light default, dark mode as a future enhancement)
