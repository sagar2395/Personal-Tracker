"use server";

import { getDb } from "@/db";
import { habits, habitLogs, streaks } from "@/db/schema/habits";
import { lifeAreas } from "@/db/schema/areas";
import { getCurrentUser } from "@/lib/auth";
import { computeStreak } from "@/lib/streaks";
import { eq, and, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getAreas() {
  const user = await getCurrentUser();
  if (!user) return [];
  const db = getDb();
  return db
    .select()
    .from(lifeAreas)
    .where(eq(lifeAreas.userId, user.id))
    .orderBy(lifeAreas.sortOrder)
    .all();
}

export async function getHabits() {
  const user = await getCurrentUser();
  if (!user) return [];
  const db = getDb();
  return db
    .select()
    .from(habits)
    .where(and(eq(habits.userId, user.id), eq(habits.archived, false)))
    .orderBy(habits.sortOrder)
    .all();
}

export async function getHabitWithLogs(habitId: number) {
  const user = await getCurrentUser();
  if (!user) return null;
  const db = getDb();
  const habit = db
    .select()
    .from(habits)
    .where(and(eq(habits.id, habitId), eq(habits.userId, user.id)))
    .get();
  if (!habit) return null;

  const logs = db
    .select()
    .from(habitLogs)
    .where(eq(habitLogs.habitId, habitId))
    .orderBy(desc(habitLogs.date))
    .all();

  const cadenceDays = habit.cadenceDays
    ? JSON.parse(habit.cadenceDays)
    : null;
  const streak = computeStreak(
    habit.type as "build" | "limit",
    habit.graceDaysAllowed,
    habit.cadence,
    cadenceDays,
    logs.map((l) => ({ date: l.date, status: l.status as never }))
  );

  return { habit, logs, streak };
}

export async function getTodayHabits() {
  const user = await getCurrentUser();
  if (!user) return [];
  const db = getDb();
  const today = new Date().toISOString().split("T")[0];
  const dayOfWeek = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][
    new Date().getDay()
  ];

  const allHabits = db
    .select()
    .from(habits)
    .where(and(eq(habits.userId, user.id), eq(habits.archived, false)))
    .orderBy(habits.type, habits.sortOrder)
    .all();

  const todayHabits = allHabits.filter((h) => {
    if (h.cadence === "daily") return true;
    if (h.cadence === "weekdays") return !["sat", "sun"].includes(dayOfWeek);
    if (h.cadence === "custom" && h.cadenceDays) {
      const days = JSON.parse(h.cadenceDays) as string[];
      return days.includes(dayOfWeek);
    }
    return true;
  });

  const results = [];
  for (const habit of todayHabits) {
    const todayLog = db
      .select()
      .from(habitLogs)
      .where(and(eq(habitLogs.habitId, habit.id), eq(habitLogs.date, today)))
      .get();

    const recentLogs = db
      .select()
      .from(habitLogs)
      .where(eq(habitLogs.habitId, habit.id))
      .orderBy(desc(habitLogs.date))
      .limit(60)
      .all();

    const cadenceDays = habit.cadenceDays
      ? JSON.parse(habit.cadenceDays)
      : null;
    const streak = computeStreak(
      habit.type as "build" | "limit",
      habit.graceDaysAllowed,
      habit.cadence,
      cadenceDays,
      recentLogs.map((l) => ({ date: l.date, status: l.status as never }))
    );

    const area = db
      .select()
      .from(lifeAreas)
      .where(eq(lifeAreas.id, habit.areaId))
      .get();

    results.push({ habit, todayLog, streak, area });
  }

  return results;
}

type HabitLogStatus = "done" | "partial" | "skipped" | "missed" | "clean" | "under_budget" | "over_budget" | "slip";
type HabitCadence = "daily" | "weekdays" | "x-per-week" | "custom";

export async function logHabit(
  habitId: number,
  status: HabitLogStatus,
  value?: number,
  note?: string
) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };
  const db = getDb();
  const today = new Date().toISOString().split("T")[0];

  const existing = db
    .select()
    .from(habitLogs)
    .where(and(eq(habitLogs.habitId, habitId), eq(habitLogs.date, today)))
    .get();

  if (existing) {
    db.update(habitLogs)
      .set({ status, value: value ?? null, note: note ?? null })
      .where(eq(habitLogs.id, existing.id))
      .run();
  } else {
    db.insert(habitLogs)
      .values({ habitId, date: today, status, value: value ?? null, note: note ?? null })
      .run();
  }

  revalidatePath("/");
  revalidatePath("/habits");
  return { success: true };
}

export async function createHabit(data: {
  title: string;
  type: "build" | "limit";
  areaId: number;
  cadence: HabitCadence;
  cadenceDays?: string[];
  cadenceTarget?: number;
  tinyVersion?: string;
  anchor?: string;
  reminderTime?: string;
  graceDaysAllowed: number;
  dailyBudgetMins?: number;
  peakTemptationTime?: string;
  substitutionPlan?: string;
}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };
  const db = getDb();

  const maxSort = db
    .select({ max: sql<number>`COALESCE(MAX(sort_order), 0)` })
    .from(habits)
    .where(eq(habits.userId, user.id))
    .get();

  db.insert(habits)
    .values({
      userId: user.id,
      areaId: data.areaId,
      title: data.title,
      type: data.type,
      cadence: data.cadence,
      cadenceDays: data.cadenceDays ? JSON.stringify(data.cadenceDays) : null,
      cadenceTarget: data.cadenceTarget ?? null,
      tinyVersion: data.tinyVersion ?? null,
      anchor: data.anchor ?? null,
      reminderTime: data.reminderTime ?? null,
      graceDaysAllowed: data.graceDaysAllowed,
      dailyBudgetMins: data.dailyBudgetMins ?? null,
      peakTemptationTime: data.peakTemptationTime ?? null,
      substitutionPlan: data.substitutionPlan ?? null,
      sortOrder: (maxSort?.max ?? 0) + 1,
    })
    .run();

  revalidatePath("/");
  revalidatePath("/habits");
  return { success: true };
}

export async function deleteHabit(habitId: number) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };
  const db = getDb();
  db.update(habits)
    .set({ archived: true })
    .where(and(eq(habits.id, habitId), eq(habits.userId, user.id)))
    .run();
  revalidatePath("/");
  revalidatePath("/habits");
  return { success: true };
}
