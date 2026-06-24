# Psychological Principles & UX Rules

This document defines the behavioral science embedded in every feature. Implementors must follow these rules — they are not decorative; they are the product's competitive advantage.

## Principle-to-Feature Mapping

### 1. Tiny Habits / B=MAP (BJ Fogg)

**Principle:** Behavior = Motivation + Ability + Prompt. Make the desired behavior tiny enough that motivation barely matters.

**Feature:** Every `build` habit requires a **minimum/tiny version** field. Example: "Do 1 pushup" instead of "Work out for 45 minutes." Logging the tiny version still counts as `done` — the streak is preserved.

**UX rule:** The tiny version is always shown alongside the full habit, with copy like: *"Not feeling it? Just do the tiny version."*

### 2. Implementation Intentions (Gollwitzer)

**Principle:** "When [situation], I will [behavior]" plans double follow-through rates vs. motivation alone.

**Feature:** Every habit stores an **anchor** field: "After I [existing routine], I will [this habit] at [time/place]."

**UX rule:** During habit creation, the anchor is a required prompt — not optional metadata. Show it on the Today view next to the habit.

### 3. Don't Break the Chain + Forgiveness (Seinfeld / Duolingo)

**Principle:** Streaks are powerful motivators, but rigid streaks cause catastrophic abandonment after a single miss ("what-the-hell effect").

**Feature:** Streaks with **grace days**. Each habit has `graceDaysAllowed` (default: 1). Missing one day within the grace window does not break the streak. The streak display shows grace status clearly.

**UX rule:**
- Streak number is shown with a calm indicator (e.g., a warm amber dot) when within grace, not a scary red.
- Copy: *"Grace day used — your streak is safe. Get back tomorrow."*
- Never: *"You broke your streak!"*

### 4. Never Miss Twice / 2-Day Rule (James Clear)

**Principle:** Missing once is an accident; missing twice is the start of a new (bad) habit. The critical intervention point is *after the first miss*.

**Feature:** After 1 missed day (post-grace), the app:
1. Sends a gentle push notification: *"Hey, [habit] missed yesterday. Today's a great reset point — even the tiny version counts."*
2. Highlights the habit on the Today view with a "get back on" badge (warm, not punitive).
3. The tracked danger metric is `missedTwiceCount` — if the user misses twice consecutively, it increments. The goal is to keep this number low, not to maintain a perfect streak.

**UX rule:** The "never miss twice" nudge is the single most important notification in the system. It fires once, not repeatedly. No nagging.

### 5. Anti-Habits: Stimulus Control & If-Then Substitution

**Principle:** Removing or replacing the cue/response loop is more effective than willpower-based suppression. Trying to "just stop" a bad habit by willpower alone fails because the cue-craving-response loop remains intact. The evidence-based approach is to **substitute** the response with a healthier alternative.

**Feature:** `limit` type habits track behaviors to reduce or quit (e.g., Instagram doom scrolling, staying up past midnight, stress eating). Each stores:
- `dailyBudgetMins`: time/count budget (0 = quit entirely)
- `substitutionPlan`: "When I want to [scroll Instagram], I will [open Kindle] instead"
- `peakTemptationTime`: when to send a pre-commitment nudge

**UX rules:**
- Logging a `limit` habit is about recording time spent or slip-ups, not completions.
- Streak = consecutive days clean / under budget.
- The substitution plan is shown **prominently** when logging: *"Remember your plan: when you want to scroll, open Kindle instead."*
- Pre-temptation nudge fires *before* the peak time: *"Heads up — your scrolling danger zone starts soon. Tonight's plan: [substitution]."*
- Slips are logged neutrally: *"Logged. Tomorrow's a fresh start."*
- Never shame language. "30 min today" is data, not a verdict.

**Examples of limit habits:**
- Instagram doom scrolling → budget 15 min/day, substitute with reading
- Staying up past midnight → budget 0 (quit), substitute: "At 11 PM, I will start my wind-down routine"
- Stress eating junk food → budget 1 item/day, substitute: "When I crave chips, I'll eat an apple first"

### 6. Pre-Commitment & Friction (Thaler)

**Principle:** Committing in advance reduces decision fatigue at temptation time. People make better choices when they decide before the moment of temptation.

**Feature:** Anti-habit reminders fire *before* the typical temptation window (e.g., 30 min before bedtime for scrolling habits, before lunch for stress eating). The reminder includes the substitution plan so the user enters the danger zone with a plan already loaded.

**UX rule:** The pre-temptation nudge is proactive, not reactive. It says *"Heads up"* not *"Don't do it."*

### 7. WOOP / Mental Contrasting (Oettingen)

**Principle:** Goals with only positive fantasies fail. Mentally contrasting the wish with realistic obstacles increases follow-through.

**Feature:** Goal creation uses a WOOP flow:
- **W**ish: What do you want?
- **O**utcome: What's the best outcome?
- **O**bstacle: What's the main inner obstacle?
- **P**lan: If [obstacle], then I will [action].

**UX rule:** The WOOP fields are guided, not a blank form. Show examples relevant to each life area.

### 8. Self-Determination Theory (Deci & Ryan)

**Principle:** Intrinsic motivation requires autonomy, competence, and relatedness.

**Feature mapping:**
- **Autonomy**: User defines their own areas, weights, and what counts as "done."
- **Competence**: Progress views, mastery indicators, momentum score.
- **Relatedness**: Household mode (wife as accountability partner, later).

### 9. Eisenhower Matrix + MITs (Ivy Lee Method)

**Principle:** Urgent ≠ important. Doing 1-3 vital tasks beats touching 20 shallow ones.

**Feature:** Tasks carry `urgent` + `important` flags. The Today view auto-surfaces **max 3 Most Important Tasks (MITs)** from the Important+Urgent and Important+Not-Urgent quadrants.

**UX rule:** The app never shows a flat list of 50 tasks. The default view is today's MITs. The full backlog is one tap away but not the default.

### 10. WIP Limits (Kanban / Lean)

**Principle:** Work-in-progress limits prevent context-switching and half-finished goals.

**Feature:** Each life area has a cap on simultaneously `active` goals (default: 3). Trying to activate a 4th shows: *"You already have 3 active goals in [area]. Finish or pause one first."*

### 11. Energy / Capacity Management

**Principle:** Time is finite. A 2-job schedule is already near capacity — the system must prevent over-commitment, not enable it.

**Feature:** Weekly **time budget per area** (target hours). When planned tasks + habits exceed realistic free hours, the app warns: *"Your planned load this week is ~52 hours but you have ~20 hours of free time. Consider deferring [lowest-priority items]."*

### 12. Seasons / Focus Themes

**Principle:** Not everything needs attention every month. Explicitly deprioritizing an area removes guilt.

**Feature:** Areas can be set to "off-season" (e.g., Side Hustle might be off-season while furnishing the flat). Off-season areas don't generate tasks on Today or count toward balance warnings.

### 13. Progress Principle / Small Wins (Amabile)

**Principle:** The single biggest motivator at work is making progress on meaningful work, even small progress.

**Feature:**
- **Daily wins capture**: "What went well today?" — quick free-text logged at check-in.
- **Momentum score**: A composite metric shown on Today (habit consistency + tasks completed this week).
- **Milestone celebrations**: When a goal completes or a streak hits a milestone (7, 30, 100 days), a celebratory moment appears.

**UX rule:** Wins are framed as the *user's* achievement, not the app's. Copy: *"You've been consistent for 14 days — that's rare and real."*

### 14. Weekly Review Ritual (GTD)

**Principle:** Regular reflection prevents drift and enables course-correction.

**Feature:** Guided weekly review:
1. Wins recap (auto-populated from the week's wins + completed tasks).
2. Misses reframed: *"These habits had a tough week — what got in the way?"* (not "you failed at these").
3. Re-prioritize: adjust MITs, toggle area seasons, update goals.
4. Set next week's focus areas.

**UX rule:** The review is prompted via push notification (Sunday morning by default). It takes 5-10 minutes. It is the most important ritual in the system.

### 15. Self-Compassion / Reframing (Kristin Neff)

**Principle:** Self-criticism after failure reduces motivation. Self-compassion maintains it.

**UX rules (global — apply everywhere):**
- Never use "failed", "broke", or "lost" in UI copy.
- Use: "reset point", "fresh start", "off day", "tough week."
- Red is never used for habit misses. Use neutral gray or warm amber.
- Missed streaks: *"Streak paused at 12 days. Your longest is 23 — you know how to build it back."*
- Always anchor to the user's best, not their worst.

## Tone of voice guide

| Do | Don't |
|---|---|
| "Great reset point" | "You failed" |
| "Even the tiny version counts" | "You didn't do enough" |
| "Tomorrow's a fresh start" | "Don't let this happen again" |
| "You've been consistent for 14 days" | "Only 14 days" |
| "Your streak is safe (grace day)" | "Warning: streak at risk!" |
| "What got in the way?" | "Why did you miss this?" |
| "Logged. Tomorrow's a fresh start." | "You slipped up again." |
| "Danger zone ahead — remember your plan" | "You better not scroll tonight" |
| Warm amber / soft gray for misses | Red / danger colors for misses |
