export type HabitType = "build" | "limit";

export type BuildStatus = "done" | "partial" | "skipped" | "missed";
export type LimitStatus = "clean" | "under_budget" | "over_budget" | "slip";
export type HabitLogStatus = BuildStatus | LimitStatus;

export interface HabitLogEntry {
  date: string;
  status: HabitLogStatus;
}

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  graceDaysRemaining: number;
  missedTwice: boolean;
  lastCompletedDate: string | null;
}

function isGoodStatus(status: HabitLogStatus, type: HabitType): boolean {
  if (type === "build") {
    return status === "done" || status === "partial";
  }
  return status === "clean" || status === "under_budget";
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return formatDate(d);
}

function getExpectedDates(
  today: string,
  cadence: string,
  cadenceDays: string[] | null,
  limit: number
): string[] {
  const dates: string[] = [];
  let current = today;

  for (let i = 0; i < limit + 30 && dates.length < limit; i++) {
    const d = new Date(current + "T00:00:00Z");
    const dayName = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][
      d.getUTCDay()
    ];

    let include = false;
    if (cadence === "daily") {
      include = true;
    } else if (cadence === "weekdays") {
      include = !["sat", "sun"].includes(dayName);
    } else if (cadence === "custom" && cadenceDays) {
      include = cadenceDays.includes(dayName);
    } else {
      include = true;
    }

    if (include) {
      dates.push(current);
    }

    current = addDays(current, -1);
  }

  return dates;
}

export function computeStreak(
  type: HabitType,
  graceDaysAllowed: number,
  cadence: string,
  cadenceDays: string[] | null,
  logs: HabitLogEntry[],
  today?: string
): StreakResult {
  const todayStr = today || formatDate(new Date());
  const logMap = new Map<string, HabitLogStatus>();
  for (const log of logs) {
    logMap.set(log.date, log.status);
  }

  const expectedDates = getExpectedDates(todayStr, cadence, cadenceDays, 365);

  let currentStreak = 0;
  let longestStreak = 0;
  let graceRemaining = graceDaysAllowed;
  let lastCompletedDate: string | null = null;

  for (const date of expectedDates) {
    const status = logMap.get(date);
    const isGood = status !== undefined && isGoodStatus(status, type);

    if (isGood) {
      currentStreak++;
      graceRemaining = graceDaysAllowed;
      if (!lastCompletedDate) lastCompletedDate = date;
    } else if (graceRemaining > 0) {
      graceRemaining--;
      currentStreak++;
    } else {
      break;
    }
  }

  longestStreak = currentStreak;
  let tempStreak = 0;
  let tempGrace = graceDaysAllowed;
  for (const date of expectedDates) {
    const status = logMap.get(date);
    const isGood = status !== undefined && isGoodStatus(status, type);

    if (isGood) {
      tempStreak++;
      tempGrace = graceDaysAllowed;
    } else if (tempGrace > 0) {
      tempGrace--;
      tempStreak++;
    } else {
      if (tempStreak > longestStreak) longestStreak = tempStreak;
      tempStreak = 0;
      tempGrace = graceDaysAllowed;
    }
  }
  if (tempStreak > longestStreak) longestStreak = tempStreak;

  const last2 = expectedDates.slice(0, 2);
  let missedTwice = false;
  if (last2.length === 2) {
    const s0 = logMap.get(last2[0]);
    const s1 = logMap.get(last2[1]);
    const bad0 = s0 === undefined || !isGoodStatus(s0, type);
    const bad1 = s1 === undefined || !isGoodStatus(s1, type);
    missedTwice = bad0 && bad1;
  }

  return {
    currentStreak,
    longestStreak,
    graceDaysRemaining: graceRemaining,
    missedTwice,
    lastCompletedDate,
  };
}
