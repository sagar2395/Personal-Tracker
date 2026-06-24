"use server";

import { getDb } from "@/db";
import { habits, habitLogs, streaks } from "@/db/schema/habits";
import { lifeAreas } from "@/db/schema/areas";
import { goals } from "@/db/schema/goals";
import { tasks } from "@/db/schema/tasks";
import { reviews, wins } from "@/db/schema/reviews";
import { getCurrentUser } from "@/lib/auth";
import { computeStreak } from "@/lib/streaks";
import { eq, and, desc, sql, ne, gte, lte, asc } from "drizzle-orm";
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

// ── Goal actions ──

type GoalStatus = "active" | "someday" | "done" | "dropped";

export async function getGoals(status?: GoalStatus) {
  const user = await getCurrentUser();
  if (!user) return [];
  const db = getDb();
  const conditions = [eq(goals.userId, user.id)];
  if (status) conditions.push(eq(goals.status, status));
  return db
    .select()
    .from(goals)
    .where(and(...conditions))
    .orderBy(goals.sortOrder)
    .all();
}

export async function getGoalWithTasks(goalId: number) {
  const user = await getCurrentUser();
  if (!user) return null;
  const db = getDb();
  const goal = db
    .select()
    .from(goals)
    .where(and(eq(goals.id, goalId), eq(goals.userId, user.id)))
    .get();
  if (!goal) return null;

  const goalTasks = db
    .select()
    .from(tasks)
    .where(and(eq(tasks.goalId, goalId), ne(tasks.status, "cancelled")))
    .orderBy(tasks.createdAt)
    .all();

  const area = db
    .select()
    .from(lifeAreas)
    .where(eq(lifeAreas.id, goal.areaId))
    .get();

  const goalHabits = db
    .select()
    .from(habits)
    .where(and(eq(habits.goalId, goalId), eq(habits.archived, false)))
    .all();

  return { goal, tasks: goalTasks, area, habits: goalHabits };
}

const WIP_LIMIT = 3;

export async function createGoal(data: {
  title: string;
  areaId: number;
  wish?: string;
  outcome?: string;
  obstacle?: string;
  plan?: string;
  measurableTarget?: string;
  deadline?: string;
  status?: GoalStatus;
}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };
  const db = getDb();

  const activeInArea = db
    .select({ count: sql<number>`COUNT(*)` })
    .from(goals)
    .where(
      and(
        eq(goals.userId, user.id),
        eq(goals.areaId, data.areaId),
        eq(goals.status, "active"),
        eq(goals.wipActive, true)
      )
    )
    .get();

  if ((activeInArea?.count ?? 0) >= WIP_LIMIT && (data.status ?? "active") === "active") {
    return {
      error: `WIP limit reached: you already have ${WIP_LIMIT} active goals in this area. Complete or pause one first.`,
    };
  }

  const maxSort = db
    .select({ max: sql<number>`COALESCE(MAX(sort_order), 0)` })
    .from(goals)
    .where(eq(goals.userId, user.id))
    .get();

  db.insert(goals)
    .values({
      userId: user.id,
      areaId: data.areaId,
      title: data.title,
      wish: data.wish ?? null,
      outcome: data.outcome ?? null,
      obstacle: data.obstacle ?? null,
      plan: data.plan ?? null,
      measurableTarget: data.measurableTarget ?? null,
      deadline: data.deadline ?? null,
      status: data.status ?? "active",
      sortOrder: (maxSort?.max ?? 0) + 1,
    })
    .run();

  revalidatePath("/goals");
  revalidatePath("/");
  return { success: true };
}

export async function updateGoalStatus(goalId: number, status: GoalStatus) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };
  const db = getDb();
  db.update(goals)
    .set({
      status,
      completedAt: status === "done" ? new Date().toISOString() : null,
    })
    .where(and(eq(goals.id, goalId), eq(goals.userId, user.id)))
    .run();
  revalidatePath("/goals");
  revalidatePath("/");
  return { success: true };
}

// ── Task actions ──

type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";

export async function getTasks(filters?: {
  status?: TaskStatus;
  goalId?: number;
  scheduledFor?: string;
  isMIT?: boolean;
}) {
  const user = await getCurrentUser();
  if (!user) return [];
  const db = getDb();
  const conditions = [eq(tasks.userId, user.id)];
  if (filters?.status) conditions.push(eq(tasks.status, filters.status));
  if (filters?.goalId) conditions.push(eq(tasks.goalId, filters.goalId));
  if (filters?.scheduledFor) conditions.push(eq(tasks.scheduledFor, filters.scheduledFor));
  if (filters?.isMIT) conditions.push(eq(tasks.isMIT, true));
  return db
    .select()
    .from(tasks)
    .where(and(...conditions))
    .orderBy(tasks.createdAt)
    .all();
}

export async function createTask(data: {
  title: string;
  areaId: number;
  goalId?: number;
  description?: string;
  isUrgent?: boolean;
  isImportant?: boolean;
  effortMins?: number;
  dueDate?: string;
  scheduledFor?: string;
}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };
  const db = getDb();

  db.insert(tasks)
    .values({
      userId: user.id,
      areaId: data.areaId,
      goalId: data.goalId ?? null,
      title: data.title,
      description: data.description ?? null,
      isUrgent: data.isUrgent ?? false,
      isImportant: data.isImportant ?? true,
      effortMins: data.effortMins ?? null,
      dueDate: data.dueDate ?? null,
      scheduledFor: data.scheduledFor ?? null,
    })
    .run();

  revalidatePath("/goals");
  revalidatePath("/");
  return { success: true };
}

export async function updateTaskStatus(taskId: number, status: TaskStatus) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };
  const db = getDb();
  db.update(tasks)
    .set({
      status,
      completedAt: status === "done" ? new Date().toISOString() : null,
    })
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)))
    .run();
  revalidatePath("/goals");
  revalidatePath("/");
  return { success: true };
}

export async function toggleMIT(taskId: number) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };
  const db = getDb();
  const task = db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)))
    .get();
  if (!task) return { error: "Task not found" };

  if (!task.isMIT) {
    const today = new Date().toISOString().split("T")[0];
    const currentMITs = db
      .select({ count: sql<number>`COUNT(*)` })
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, user.id),
          eq(tasks.isMIT, true),
          eq(tasks.status, "todo")
        )
      )
      .get();
    if ((currentMITs?.count ?? 0) >= 3) {
      return { error: "You can only have 3 MITs. Complete or remove one first." };
    }
  }

  db.update(tasks)
    .set({ isMIT: !task.isMIT })
    .where(eq(tasks.id, taskId))
    .run();
  revalidatePath("/");
  revalidatePath("/goals");
  return { success: true };
}

// ── Win actions ──

export async function captureWin(text: string, areaId?: number) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };
  const db = getDb();
  const today = new Date().toISOString().split("T")[0];
  db.insert(wins)
    .values({
      userId: user.id,
      areaId: areaId ?? null,
      text,
      date: today,
    })
    .run();
  revalidatePath("/");
  return { success: true };
}

export async function getRecentWins(days: number = 7) {
  const user = await getCurrentUser();
  if (!user) return [];
  const db = getDb();
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().split("T")[0];
  return db
    .select()
    .from(wins)
    .where(and(eq(wins.userId, user.id), gte(wins.date, sinceStr)))
    .orderBy(desc(wins.date))
    .all();
}

// ── Today MITs ──

export async function getTodayMITs() {
  const user = await getCurrentUser();
  if (!user) return [];
  const db = getDb();
  return db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, user.id),
        eq(tasks.isMIT, true),
        ne(tasks.status, "done"),
        ne(tasks.status, "cancelled")
      )
    )
    .orderBy(tasks.createdAt)
    .all();
}

// ── Balance / area stats ──

export async function getAreaStats() {
  const user = await getCurrentUser();
  if (!user) return [];
  const db = getDb();
  const areas = db
    .select()
    .from(lifeAreas)
    .where(eq(lifeAreas.userId, user.id))
    .orderBy(lifeAreas.sortOrder)
    .all();

  const result = [];
  for (const area of areas) {
    const activeGoals = db
      .select({ count: sql<number>`COUNT(*)` })
      .from(goals)
      .where(
        and(
          eq(goals.areaId, area.id),
          eq(goals.status, "active")
        )
      )
      .get();

    const openTasks = db
      .select({ count: sql<number>`COUNT(*)` })
      .from(tasks)
      .where(
        and(
          eq(tasks.areaId, area.id),
          eq(tasks.status, "todo")
        )
      )
      .get();

    const areaHabits = db
      .select()
      .from(habits)
      .where(and(eq(habits.areaId, area.id), eq(habits.archived, false)))
      .all();

    const totalEffort = db
      .select({ total: sql<number>`COALESCE(SUM(effort_mins), 0)` })
      .from(tasks)
      .where(
        and(
          eq(tasks.areaId, area.id),
          eq(tasks.status, "todo")
        )
      )
      .get();

    result.push({
      area,
      activeGoals: activeGoals?.count ?? 0,
      openTasks: openTasks?.count ?? 0,
      habitCount: areaHabits.length,
      plannedMins: totalEffort?.total ?? 0,
    });
  }
  return result;
}

// ── Upcoming deadlines ──

export async function getUpcomingDeadlines(days: number = 7) {
  const user = await getCurrentUser();
  if (!user) return { tasks: [] as typeof tasks.$inferSelect[], goals: [] as typeof goals.$inferSelect[] };
  const db = getDb();
  const today = new Date().toISOString().split("T")[0];
  const future = new Date();
  future.setDate(future.getDate() + days);
  const futureStr = future.toISOString().split("T")[0];

  const deadlineTasks = db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, user.id),
        ne(tasks.status, "done"),
        ne(tasks.status, "cancelled"),
        gte(tasks.dueDate, today),
        lte(tasks.dueDate, futureStr)
      )
    )
    .orderBy(asc(tasks.dueDate))
    .all();

  const deadlineGoals = db
    .select()
    .from(goals)
    .where(
      and(
        eq(goals.userId, user.id),
        eq(goals.status, "active"),
        gte(goals.deadline, today),
        lte(goals.deadline, futureStr)
      )
    )
    .orderBy(asc(goals.deadline))
    .all();

  return { tasks: deadlineTasks, goals: deadlineGoals };
}

// ── Review actions ──

type ReviewType = "daily" | "weekly";

export async function saveReview(data: {
  type: ReviewType;
  date: string;
  mood?: number;
  energy?: number;
  winsText?: string;
  challengesText?: string;
  tomorrowMITs?: string;
  focusAreas?: string;
  notes?: string;
}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };
  const db = getDb();

  const existing = db
    .select()
    .from(reviews)
    .where(
      and(
        eq(reviews.userId, user.id),
        eq(reviews.type, data.type),
        eq(reviews.date, data.date)
      )
    )
    .get();

  if (existing) {
    db.update(reviews)
      .set({
        mood: data.mood ?? null,
        energy: data.energy ?? null,
        winsText: data.winsText ?? null,
        challengesText: data.challengesText ?? null,
        tomorrowMITs: data.tomorrowMITs ?? null,
        focusAreas: data.focusAreas ?? null,
        notes: data.notes ?? null,
      })
      .where(eq(reviews.id, existing.id))
      .run();
  } else {
    db.insert(reviews)
      .values({
        userId: user.id,
        type: data.type,
        date: data.date,
        mood: data.mood ?? null,
        energy: data.energy ?? null,
        winsText: data.winsText ?? null,
        challengesText: data.challengesText ?? null,
        tomorrowMITs: data.tomorrowMITs ?? null,
        focusAreas: data.focusAreas ?? null,
        notes: data.notes ?? null,
      })
      .run();
  }

  revalidatePath("/review");
  revalidatePath("/");
  return { success: true };
}

export async function getReview(type: ReviewType, date: string) {
  const user = await getCurrentUser();
  if (!user) return null;
  const db = getDb();
  return db
    .select()
    .from(reviews)
    .where(
      and(
        eq(reviews.userId, user.id),
        eq(reviews.type, type),
        eq(reviews.date, date)
      )
    )
    .get() ?? null;
}

export async function getReviewHistory(type?: ReviewType, limit: number = 30) {
  const user = await getCurrentUser();
  if (!user) return [];
  const db = getDb();
  const conditions = [eq(reviews.userId, user.id)];
  if (type) conditions.push(eq(reviews.type, type));
  return db
    .select()
    .from(reviews)
    .where(and(...conditions))
    .orderBy(desc(reviews.date))
    .limit(limit)
    .all();
}

export async function getWeeklyReviewData() {
  const user = await getCurrentUser();
  if (!user) return null;
  const db = getDb();
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString().split("T")[0];
  const todayStr = today.toISOString().split("T")[0];

  const weekWins = db
    .select()
    .from(wins)
    .where(and(eq(wins.userId, user.id), gte(wins.date, weekAgoStr)))
    .orderBy(desc(wins.date))
    .all();

  const completedTasks = db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, user.id),
        eq(tasks.status, "done"),
        gte(tasks.completedAt, weekAgoStr)
      )
    )
    .all();

  const allHabits = db
    .select()
    .from(habits)
    .where(and(eq(habits.userId, user.id), eq(habits.archived, false)))
    .all();

  const habitSummaries = [];
  for (const habit of allHabits) {
    const weekLogs = db
      .select()
      .from(habitLogs)
      .where(
        and(
          eq(habitLogs.habitId, habit.id),
          gte(habitLogs.date, weekAgoStr),
          lte(habitLogs.date, todayStr)
        )
      )
      .all();

    const area = db
      .select()
      .from(lifeAreas)
      .where(eq(lifeAreas.id, habit.areaId))
      .get();

    if (habit.type === "build") {
      const goodDays = weekLogs.filter(
        (l) => l.status === "done" || l.status === "partial"
      ).length;
      habitSummaries.push({
        habit,
        area,
        type: "build" as const,
        goodDays,
        totalDays: 7,
        summary: `${goodDays} of 7 days`,
      });
    } else {
      const loggedDays = weekLogs.filter(
        (l) => l.status === "clean" || l.status === "under_budget" || l.status === "over_budget" || l.status === "slip"
      );
      const avgUsage =
        loggedDays.length > 0
          ? loggedDays.reduce((sum, l) => sum + (l.value ?? 0), 0) /
            loggedDays.length
          : 0;
      const cleanDays = weekLogs.filter(
        (l) => l.status === "clean" || l.status === "under_budget"
      ).length;
      habitSummaries.push({
        habit,
        area,
        type: "limit" as const,
        cleanDays,
        avgUsage: Math.round(avgUsage),
        budget: habit.dailyBudgetMins ?? 0,
        summary:
          habit.dailyBudgetMins && habit.dailyBudgetMins > 0
            ? `averaged ${Math.round(avgUsage)} min/day (budget: ${habit.dailyBudgetMins})`
            : `${cleanDays} of 7 days clean`,
      });
    }
  }

  const areas = db
    .select()
    .from(lifeAreas)
    .where(eq(lifeAreas.userId, user.id))
    .orderBy(lifeAreas.sortOrder)
    .all();

  return {
    weekWins,
    completedTasks,
    habitSummaries,
    areas,
  };
}

// ── Area management ──

export async function updateArea(
  areaId: number,
  data: {
    name?: string;
    color?: string;
    targetWeeklyHours?: number;
    isSeason?: boolean;
    priorityWeight?: number;
  }
) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };
  const db = getDb();
  db.update(lifeAreas)
    .set(data)
    .where(and(eq(lifeAreas.id, areaId), eq(lifeAreas.userId, user.id)))
    .run();
  revalidatePath("/balance");
  revalidatePath("/review");
  revalidatePath("/settings");
  return { success: true };
}

export async function toggleAreaSeason(areaId: number) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };
  const db = getDb();
  const area = db
    .select()
    .from(lifeAreas)
    .where(and(eq(lifeAreas.id, areaId), eq(lifeAreas.userId, user.id)))
    .get();
  if (!area) return { error: "Area not found" };
  db.update(lifeAreas)
    .set({ isSeason: !area.isSeason })
    .where(eq(lifeAreas.id, areaId))
    .run();
  revalidatePath("/balance");
  revalidatePath("/review");
  revalidatePath("/settings");
  return { success: true };
}
