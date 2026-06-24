# Product Vision

## What is Personal Tracker?

Personal Tracker is a **calm, opinionated life operating system** built for one person (and eventually their household) to manage every area of life — work, health, personal admin, finance, and side ventures — from a single mobile-first app.

It is **not** a generic to-do app. Its identity is built on three pillars:

1. **You can do anything but not everything (at once).** The tool enforces focus and realistic capacity rather than growing infinite lists.
2. **Recovery beats perfection.** Missing a day is normal. The system is designed to get you back on track, never to shame you.
3. **Small visible wins compound.** Progress is made visible and celebrated to counter the frustration of big dreams vs. slow movement.

## Who is this for?

The primary user ("Sagar") is a platform engineer working two jobs — one full-time at Valuelabs, one contractual at Avyka. He juggles:

- **Health**: Building routines for himself and his wife. The habit always breaks after a while and they drift for months. This is the #1 pain point. He also struggles with **bad habits** like Instagram doom scrolling and poor sleep patterns that undermine health goals.
- **Personal & Home**: Marriage certificate, furniture for a new flat, interior design decisions, anniversary planning.
- **Finance**: Placing salary intelligently across asset classes (equity, debt, gold, etc.).
- **Snowops**: A company he is co-building that will provide compliance and DevOps services.
- **Side Hustle**: Optional, only if capacity allows.

## The core problems

### 1. Health habits collapse after a single miss

He and his wife start healthy routines — exercise, diet, sleep schedules. They stick for a while. Then one day breaks. Then another. Within a week, the routine is abandoned for months. The existing tools show a broken streak and a wall of zeros, which feels punishing rather than motivating.

**This is the #1 pain point and the reason this tool exists.**

### 2. Bad habits fill the void

When good habits break, bad habits rush in — Instagram doom scrolling, staying up late, skipping meals. These aren't tracked or confronted. The tool must handle **both sides**: building good habits AND limiting/quitting bad ones.

### 3. Too many ambitions, not enough hours

Two jobs already consume most waking hours. Add health, personal admin, finance management, building Snowops, and optional side hustles — and there's a permanent feeling of "I should be doing more." No tool helps him see that he's *already at capacity* and that neglecting some areas temporarily is okay.

### 4. Big dreams vs. slow progress → frustration

He dreams big across many areas. Progress in any single area is necessarily slow (limited hours). Without reframing, this creates chronic frustration. The tool must make small progress feel meaningful.

## Design principles

- **Mobile-first, one-thumb operation.** Logging a habit must take < 3 seconds.
- **Calm, encouraging tone.** No aggressive red "failure" states. Misses are neutral ("reset point"), never punishing.
- **Two-sided habit tracking.** Build good habits AND limit bad ones. Both are first-class citizens with their own psychology (tiny versions for build, substitution plans for limit).
- **Opinionated defaults, flexible overrides.** The app ships with sensible structure but the user can customize areas, weights, and cadences.
- **Offline-friendly reads.** PWA service worker caches the shell and recent data for subway/flight use.
- **Data ownership.** Self-hosted on Cloudflare — no third-party SaaS dependency, full export available.

## Life areas (seeded defaults)

| Area | Type | Shared with wife? |
|---|---|---|
| Work — Valuelabs | Professional | No |
| Work — Avyka | Professional | No |
| Health | Personal / Household | Yes (later) |
| Personal & Home | Personal / Household | Yes (later) |
| Finance | Personal | No |
| Snowops | Venture | No |
| Side Hustle | Optional | No |

Each area has a **priority weight** and a **target weekly hours** budget. The balance dashboard shows how actual time maps to the plan and highlights neglected areas (without guilt-tripping if they're deliberately set to "off-season").

## What this is NOT

- **Not a generic to-do list.** Every feature is justified by a psychological principle.
- **Not a social platform.** Multi-user is limited to household (wife) for shared accountability.
- **Not a full budgeting app.** Finance is a lightweight allocation planner, not Mint or YNAB.
- **Not a willpower app.** It uses behavioral science (substitution plans, implementation intentions, pre-commitment) to reduce reliance on willpower.

## Success metrics

The tool succeeds if:

1. After a missed health habit day, the user gets back on track within 1 day (not months).
2. Bad habits (scrolling, late nights) show measurable reduction over weeks via the limit-habit tracking.
3. The user knows their top 1-3 priorities each morning in < 10 seconds of app interaction.
4. No area of life is invisibly neglected — the balance dashboard makes every area's status explicit.
5. The user feels *less* overwhelmed after checking the app, not more.
