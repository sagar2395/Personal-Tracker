"use server";

import { getDb } from "@/db";
import { habits, habitLogs, streaks } from "@/db/schema/habits";
import { lifeAreas } from "@/db/schema/areas";
import { goals } from "@/db/schema/goals";
import { tasks } from "@/db/schema/tasks";
import { reviews, wins } from "@/db/schema/reviews";
import { financeSnapshots, financeAllocations } from "@/db/schema/finance";
import { metrics, metricLogs } from "@/db/schema/metrics";
import { appUsageLogs, achievements, userMotivation } from "@/db/schema/engagement";
import { getCurrentUser } from "@/lib/auth";
import { computeStreak } from "@/lib/streaks";
import { classifyTask } from "@/lib/analysis";
import { eq, and, desc, sql, ne, gte, lte, asc, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getAreas() {
  const user = await getCurrentUser();
  if (!user) return [];
  const db = getDb();
  return await db
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
  return await db
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
  const habit = await db
    .select()
    .from(habits)
    .where(and(eq(habits.id, habitId), eq(habits.userId, user.id)))
    .get();
  if (!habit) return null;

  const logs = await db
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
    logs.map((l: typeof logs[number]) => ({ date: l.date, status: l.status as never }))
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

  const allHabits = await db
    .select()
    .from(habits)
    .where(and(eq(habits.userId, user.id), eq(habits.archived, false)))
    .orderBy(habits.type, habits.sortOrder)
    .all();

  const todayHabits = allHabits.filter((h: typeof allHabits[number]) => {
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
    const todayLog = await db
      .select()
      .from(habitLogs)
      .where(and(eq(habitLogs.habitId, habit.id), eq(habitLogs.date, today)))
      .get();

    const recentLogs = await db
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
      recentLogs.map((l: typeof recentLogs[number]) => ({ date: l.date, status: l.status as never }))
    );

    const area = await db
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

  const existing = await db
    .select()
    .from(habitLogs)
    .where(and(eq(habitLogs.habitId, habitId), eq(habitLogs.date, today)))
    .get();

  if (existing) {
    await db.update(habitLogs)
      .set({ status, value: value ?? null, note: note ?? null })
      .where(eq(habitLogs.id, existing.id))
      .run();
  } else {
    await db.insert(habitLogs)
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
  whyItMatters?: string;
  impactLevel?: number;
  milestoneReward?: string;
}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };
  const db = getDb();

  const maxSort = await db
    .select({ max: sql<number>`COALESCE(MAX(sort_order), 0)` })
    .from(habits)
    .where(eq(habits.userId, user.id))
    .get();

  await db.insert(habits)
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
      whyItMatters: data.whyItMatters ?? null,
      impactLevel: data.impactLevel ?? 3,
      milestoneReward: data.milestoneReward ?? null,
      sortOrder: (maxSort?.max ?? 0) + 1,
    })
    .run();

  revalidatePath("/");
  revalidatePath("/habits");
  return { success: true };
}

export async function updateHabit(
  habitId: number,
  data: {
    title?: string;
    areaId?: number;
    tinyVersion?: string | null;
    anchor?: string | null;
    substitutionPlan?: string | null;
    dailyBudgetMins?: number | null;
    whyItMatters?: string | null;
    impactLevel?: number;
    milestoneReward?: string | null;
  }
) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };
  const db = getDb();

  const existing = await db
    .select()
    .from(habits)
    .where(and(eq(habits.id, habitId), eq(habits.userId, user.id)))
    .get();
  if (!existing) return { error: "Habit not found" };

  await db.update(habits)
    .set(data)
    .where(and(eq(habits.id, habitId), eq(habits.userId, user.id)))
    .run();

  revalidatePath("/");
  revalidatePath("/habits");
  revalidatePath(`/habits/${habitId}`);
  return { success: true };
}

export async function deleteHabit(habitId: number) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };
  const db = getDb();
  await db.update(habits)
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
  return await db
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
  const goal = await db
    .select()
    .from(goals)
    .where(and(eq(goals.id, goalId), eq(goals.userId, user.id)))
    .get();
  if (!goal) return null;

  const goalTasks = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.goalId, goalId), ne(tasks.status, "cancelled")))
    .orderBy(tasks.createdAt)
    .all();

  const area = await db
    .select()
    .from(lifeAreas)
    .where(eq(lifeAreas.id, goal.areaId))
    .get();

  const goalHabits = await db
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
  whyItMatters?: string;
  impactLevel?: number;
  reward?: string;
}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };
  const db = getDb();

  const activeInArea = await db
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

  const maxSort = await db
    .select({ max: sql<number>`COALESCE(MAX(sort_order), 0)` })
    .from(goals)
    .where(eq(goals.userId, user.id))
    .get();

  await db.insert(goals)
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
      whyItMatters: data.whyItMatters ?? null,
      impactLevel: data.impactLevel ?? 3,
      reward: data.reward ?? null,
      sortOrder: (maxSort?.max ?? 0) + 1,
    })
    .run();

  revalidatePath("/goals");
  revalidatePath("/");
  return { success: true };
}

export async function updateGoalReward(goalId: number, reward: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };
  const db = getDb();
  await db.update(goals)
    .set({ reward: reward || null })
    .where(and(eq(goals.id, goalId), eq(goals.userId, user.id)))
    .run();
  revalidatePath("/goals");
  revalidatePath(`/goals/${goalId}`);
  return { success: true };
}

export async function claimGoalReward(goalId: number) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };
  const db = getDb();
  await db.update(goals)
    .set({ rewardClaimed: true })
    .where(and(eq(goals.id, goalId), eq(goals.userId, user.id)))
    .run();
  revalidatePath("/goals");
  revalidatePath(`/goals/${goalId}`);
  return { success: true };
}

export async function updateGoalStatus(goalId: number, status: GoalStatus) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };
  const db = getDb();
  await db.update(goals)
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
  return await db
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
  impactLevel?: number;
  effortMins?: number;
  dueDate?: string;
  scheduledFor?: string;
}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };
  const db = getDb();

  await db.insert(tasks)
    .values({
      userId: user.id,
      areaId: data.areaId,
      goalId: data.goalId ?? null,
      title: data.title,
      description: data.description ?? null,
      isUrgent: data.isUrgent ?? false,
      isImportant: data.isImportant ?? true,
      impactLevel: data.impactLevel ?? 2,
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
  await db.update(tasks)
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
  const task = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)))
    .get();
  if (!task) return { error: "Task not found" };

  if (!task.isMIT) {
    const today = new Date().toISOString().split("T")[0];
    const currentMITs = await db
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

  await db.update(tasks)
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
  await db.insert(wins)
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
  return await db
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
  return await db
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
  const areas = await db
    .select()
    .from(lifeAreas)
    .where(eq(lifeAreas.userId, user.id))
    .orderBy(lifeAreas.sortOrder)
    .all();

  const result = [];
  for (const area of areas) {
    const activeGoals = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(goals)
      .where(
        and(
          eq(goals.areaId, area.id),
          eq(goals.status, "active")
        )
      )
      .get();

    const openTasks = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(tasks)
      .where(
        and(
          eq(tasks.areaId, area.id),
          eq(tasks.status, "todo")
        )
      )
      .get();

    const areaHabits = await db
      .select()
      .from(habits)
      .where(and(eq(habits.areaId, area.id), eq(habits.archived, false)))
      .all();

    const totalEffort = await db
      .select({ total: sql<number>`COALESCE(SUM(effort_mins), 0)` })
      .from(tasks)
      .where(
        and(
          eq(tasks.areaId, area.id),
          eq(tasks.status, "todo")
        )
      )
      .get();

    let lastActivityDate: string | null = null;
    for (const habit of areaHabits) {
      const lastLog = await db
        .select({ date: habitLogs.date })
        .from(habitLogs)
        .where(eq(habitLogs.habitId, habit.id))
        .orderBy(desc(habitLogs.date))
        .limit(1)
        .get();
      if (lastLog && (!lastActivityDate || lastLog.date > lastActivityDate)) {
        lastActivityDate = lastLog.date;
      }
    }
    const lastTaskCompletion = await db
      .select({ completedAt: tasks.completedAt })
      .from(tasks)
      .where(
        and(
          eq(tasks.areaId, area.id),
          eq(tasks.status, "done"),
        )
      )
      .orderBy(desc(tasks.completedAt))
      .limit(1)
      .get();
    if (lastTaskCompletion?.completedAt) {
      const taskDate = lastTaskCompletion.completedAt.split("T")[0];
      if (!lastActivityDate || taskDate > lastActivityDate) {
        lastActivityDate = taskDate;
      }
    }

    result.push({
      area,
      activeGoals: activeGoals?.count ?? 0,
      openTasks: openTasks?.count ?? 0,
      habitCount: areaHabits.length,
      plannedMins: totalEffort?.total ?? 0,
      lastActivityDate,
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

  const deadlineTasks = await db
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

  const deadlineGoals = await db
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

  const existing = await db
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
    await db.update(reviews)
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
    await db.insert(reviews)
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
  return await db
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
  return await db
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

  const weekWins = await db
    .select()
    .from(wins)
    .where(and(eq(wins.userId, user.id), gte(wins.date, weekAgoStr)))
    .orderBy(desc(wins.date))
    .all();

  const completedTasks = await db
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

  const allHabits = await db
    .select()
    .from(habits)
    .where(and(eq(habits.userId, user.id), eq(habits.archived, false)))
    .all();

  const habitSummaries = [];
  for (const habit of allHabits) {
    const weekLogs = await db
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

    const area = await db
      .select()
      .from(lifeAreas)
      .where(eq(lifeAreas.id, habit.areaId))
      .get();

    if (habit.type === "build") {
      const goodDays = weekLogs.filter(
        (l: typeof weekLogs[number]) => l.status === "done" || l.status === "partial"
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
        (l: typeof weekLogs[number]) => l.status === "clean" || l.status === "under_budget" || l.status === "over_budget" || l.status === "slip"
      );
      const avgUsage =
        loggedDays.length > 0
          ? loggedDays.reduce((sum: number, l: typeof loggedDays[number]) => sum + (l.value ?? 0), 0) /
            loggedDays.length
          : 0;
      const cleanDays = weekLogs.filter(
        (l: typeof weekLogs[number]) => l.status === "clean" || l.status === "under_budget"
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

  const areas = await db
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
  await db.update(lifeAreas)
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
  const area = await db
    .select()
    .from(lifeAreas)
    .where(and(eq(lifeAreas.id, areaId), eq(lifeAreas.userId, user.id)))
    .get();
  if (!area) return { error: "Area not found" };
  await db.update(lifeAreas)
    .set({ isSeason: !area.isSeason })
    .where(eq(lifeAreas.id, areaId))
    .run();
  revalidatePath("/balance");
  revalidatePath("/review");
  revalidatePath("/settings");
  return { success: true };
}

// ── Finance actions ──

export async function getFinanceSnapshots() {
  const user = await getCurrentUser();
  if (!user) return [];
  const db = getDb();
  return await db
    .select()
    .from(financeSnapshots)
    .where(eq(financeSnapshots.userId, user.id))
    .orderBy(desc(financeSnapshots.month))
    .all();
}

export async function getFinanceSnapshot(snapshotId: number) {
  const user = await getCurrentUser();
  if (!user) return null;
  const db = getDb();
  const snapshot = await db
    .select()
    .from(financeSnapshots)
    .where(
      and(
        eq(financeSnapshots.id, snapshotId),
        eq(financeSnapshots.userId, user.id)
      )
    )
    .get();
  if (!snapshot) return null;

  const allocations = await db
    .select()
    .from(financeAllocations)
    .where(eq(financeAllocations.snapshotId, snapshotId))
    .all();

  return { snapshot, allocations };
}

export async function createFinanceSnapshot(data: {
  month: string;
  totalIncome: number;
  notes?: string;
  allocations: {
    assetClass: string;
    targetPercent: number;
    actualAmount: number;
    notes?: string;
  }[];
}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };
  const db = getDb();

  const result = await db
    .insert(financeSnapshots)
    .values({
      userId: user.id,
      month: data.month,
      totalIncome: data.totalIncome,
      notes: data.notes ?? null,
    })
    .returning({ id: financeSnapshots.id })
    .get();

  for (const alloc of data.allocations) {
    await db.insert(financeAllocations)
      .values({
        snapshotId: result.id,
        assetClass: alloc.assetClass,
        targetPercent: alloc.targetPercent,
        actualAmount: alloc.actualAmount,
        notes: alloc.notes ?? null,
      })
      .run();
  }

  revalidatePath("/finance");
  return { success: true };
}

export async function deleteFinanceSnapshot(snapshotId: number) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };
  const db = getDb();

  const snapshot = await db
    .select()
    .from(financeSnapshots)
    .where(
      and(
        eq(financeSnapshots.id, snapshotId),
        eq(financeSnapshots.userId, user.id)
      )
    )
    .get();
  if (!snapshot) return { error: "Not found" };

  await db.delete(financeAllocations)
    .where(eq(financeAllocations.snapshotId, snapshotId))
    .run();
  await db.delete(financeSnapshots)
    .where(eq(financeSnapshots.id, snapshotId))
    .run();

  revalidatePath("/finance");
  return { success: true };
}

// ── Engagement actions ──

export async function recordAppUsage() {
  const user = await getCurrentUser();
  if (!user) return null;
  try {
    const db = getDb();
    const today = new Date().toISOString().split("T")[0];

    const existing = await db
      .select()
      .from(appUsageLogs)
      .where(and(eq(appUsageLogs.userId, user.id), eq(appUsageLogs.date, today)))
      .get();

    if (!existing) {
      await db.insert(appUsageLogs)
        .values({ userId: user.id, date: today })
        .run();
    }

    return await getAppUsageStreak();
  } catch {
    return { currentStreak: 0, longestStreak: 0, totalDays: 0, lastUsedDate: null };
  }
}

export async function getAppUsageStreak() {
  const user = await getCurrentUser();
  const defaultStreak = { currentStreak: 0, longestStreak: 0, totalDays: 0, lastUsedDate: null as string | null };
  if (!user) return defaultStreak;
  try {
    const db = getDb();

    const logs = await db
      .select({ date: appUsageLogs.date })
      .from(appUsageLogs)
      .where(eq(appUsageLogs.userId, user.id))
      .orderBy(desc(appUsageLogs.date))
      .all();

    if (logs.length === 0) {
      return defaultStreak;
    }

    const dates = logs.map((l: { date: string }) => l.date);
    const lastUsedDate = dates[0];

    let currentStreak = 1;
    const today = new Date().toISOString().split("T")[0];

    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);
      const diffDays = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }

    if (dates[0] !== today) {
      const lastDate = new Date(dates[0]);
      const todayDate = new Date(today);
      const gapDays = Math.round((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (gapDays > 1) {
        currentStreak = 0;
      }
    }

    let longestStreak = 1;
    let tempStreak = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);
      const diffDays = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, currentStreak);

    return { currentStreak, longestStreak, totalDays: dates.length, lastUsedDate };
  } catch {
    return defaultStreak;
  }
}

export async function checkAndUnlockAchievements(): Promise<string[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  try {
  const db = getDb();
  const newlyUnlocked: string[] = [];

  const existingAchievements = await db
    .select({ key: achievements.key })
    .from(achievements)
    .where(eq(achievements.userId, user.id))
    .all();
  const unlockedKeys = new Set(existingAchievements.map((a: { key: string }) => a.key));

  async function unlock(key: string) {
    if (unlockedKeys.has(key)) return;
    await db.insert(achievements).values({ userId: user.id, key }).run();
    unlockedKeys.add(key);
    newlyUnlocked.push(key);
  }

  const usageStreak = await getAppUsageStreak();
  if (usageStreak.currentStreak >= 3) await unlock("app_streak_3");
  if (usageStreak.currentStreak >= 7) await unlock("app_streak_7");
  if (usageStreak.currentStreak >= 14) await unlock("app_streak_14");
  if (usageStreak.currentStreak >= 30) await unlock("app_streak_30");
  if (usageStreak.currentStreak >= 100) await unlock("app_streak_100");

  const habitCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(habits)
    .where(and(eq(habits.userId, user.id), eq(habits.archived, false)))
    .get();
  if ((habitCount?.count ?? 0) >= 1) await unlock("first_habit");
  if ((habitCount?.count ?? 0) >= 5) await unlock("five_habits");

  const logCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(habitLogs)
    .innerJoin(habits, eq(habitLogs.habitId, habits.id))
    .where(eq(habits.userId, user.id))
    .get();
  if ((logCount?.count ?? 0) >= 1) await unlock("first_log");

  const goalCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(goals)
    .where(eq(goals.userId, user.id))
    .get();
  if ((goalCount?.count ?? 0) >= 1) await unlock("first_goal");

  const completedGoals = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(goals)
    .where(and(eq(goals.userId, user.id), eq(goals.status, "done")))
    .get();
  if ((completedGoals?.count ?? 0) >= 1) await unlock("goal_complete");

  const completedTasks = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(tasks)
    .where(and(eq(tasks.userId, user.id), eq(tasks.status, "done")))
    .get();
  if ((completedTasks?.count ?? 0) >= 10) await unlock("ten_tasks");
  if ((completedTasks?.count ?? 0) >= 50) await unlock("fifty_tasks");

  const dailyReviewCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(reviews)
    .where(and(eq(reviews.userId, user.id), eq(reviews.type, "daily")))
    .get();
  if ((dailyReviewCount?.count ?? 0) >= 1) await unlock("first_review");

  const weeklyReviewCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(reviews)
    .where(and(eq(reviews.userId, user.id), eq(reviews.type, "weekly")))
    .get();
  if ((weeklyReviewCount?.count ?? 0) >= 1) await unlock("weekly_review");

  const winCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(wins)
    .where(eq(wins.userId, user.id))
    .get();
  if ((winCount?.count ?? 0) >= 10) await unlock("ten_wins");
  if ((winCount?.count ?? 0) >= 50) await unlock("fifty_wins");

  const motivation = await db
    .select()
    .from(userMotivation)
    .where(eq(userMotivation.userId, user.id))
    .get();
  if (motivation?.whyStatement) await unlock("set_why");

  const allHabits = await db
    .select()
    .from(habits)
    .where(and(eq(habits.userId, user.id), eq(habits.archived, false)))
    .all();

  for (const habit of allHabits) {
    const recentLogs = await db
      .select()
      .from(habitLogs)
      .where(eq(habitLogs.habitId, habit.id))
      .orderBy(desc(habitLogs.date))
      .limit(100)
      .all();
    const cadenceDays = habit.cadenceDays ? JSON.parse(habit.cadenceDays) : null;
    const streak = computeStreak(
      habit.type as "build" | "limit",
      habit.graceDaysAllowed,
      habit.cadence,
      cadenceDays,
      recentLogs.map((l: typeof recentLogs[number]) => ({
        date: l.date,
        status: l.status as never,
      }))
    );
    if (streak.currentStreak >= 7) await unlock("habit_streak_7");
    if (streak.currentStreak >= 30) await unlock("habit_streak_30");
    if (streak.currentStreak >= 100) await unlock("habit_streak_100");
  }

  const today = new Date().toISOString().split("T")[0];
  const dayOfWeek = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][new Date().getDay()];
  const todayHabits = allHabits.filter((h: typeof allHabits[number]) => {
    if (h.cadence === "daily") return true;
    if (h.cadence === "weekdays") return !["sat", "sun"].includes(dayOfWeek);
    if (h.cadence === "custom" && h.cadenceDays) {
      const days = JSON.parse(h.cadenceDays) as string[];
      return days.includes(dayOfWeek);
    }
    return true;
  });

  if (todayHabits.length > 0) {
    let allDone = true;
    for (const h of todayHabits) {
      const log = await db
        .select()
        .from(habitLogs)
        .where(and(eq(habitLogs.habitId, h.id), eq(habitLogs.date, today)))
        .get();
      if (!log) {
        allDone = false;
        break;
      }
    }
    if (allDone) await unlock("perfect_day");
  }

  if (usageStreak.lastUsedDate) {
    const lastDate = new Date(usageStreak.lastUsedDate);
    const todayDate = new Date(today);
    const gap = Math.round((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (gap >= 3) {
      const todayLogs = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(habitLogs)
        .innerJoin(habits, eq(habitLogs.habitId, habits.id))
        .where(and(eq(habits.userId, user.id), eq(habitLogs.date, today)))
        .get();
      if ((todayLogs?.count ?? 0) >= 1) await unlock("comeback");
    }
  }

  const recentDailyReviews = await db
    .select({ date: reviews.date })
    .from(reviews)
    .where(and(eq(reviews.userId, user.id), eq(reviews.type, "daily")))
    .orderBy(desc(reviews.date))
    .limit(10)
    .all();
  if (recentDailyReviews.length >= 7) {
    let streak = 1;
    for (let i = 1; i < recentDailyReviews.length; i++) {
      const prev = new Date(recentDailyReviews[i - 1].date);
      const curr = new Date(recentDailyReviews[i].date);
      const diff = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === 1) {
        streak++;
        if (streak >= 7) { await unlock("review_streak_7"); break; }
      } else {
        break;
      }
    }
  }

  return newlyUnlocked;
  } catch {
    return [];
  }
}

export async function getUnlockedAchievements() {
  const user = await getCurrentUser();
  if (!user) return [];
  try {
    const db = getDb();
    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, user.id))
      .orderBy(desc(achievements.unlockedAt))
      .all();
  } catch {
    return [];
  }
}

export async function getWhyStatement() {
  const user = await getCurrentUser();
  if (!user) return null;
  try {
    const db = getDb();
    const motivation = await db
      .select()
      .from(userMotivation)
      .where(eq(userMotivation.userId, user.id))
      .get();
    return motivation?.whyStatement ?? null;
  } catch {
    return null;
  }
}

export async function saveWhyStatement(statement: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };
  try {
    const db = getDb();

    const existing = await db
      .select()
      .from(userMotivation)
      .where(eq(userMotivation.userId, user.id))
      .get();

    if (existing) {
      await db.update(userMotivation)
        .set({ whyStatement: statement, updatedAt: new Date().toISOString() })
        .where(eq(userMotivation.userId, user.id))
        .run();
    } else {
      await db.insert(userMotivation)
        .values({ userId: user.id, whyStatement: statement })
        .run();
    }

    revalidatePath("/");
    revalidatePath("/settings");
    return { success: true };
  } catch {
    return { error: "Tables not yet migrated. Please run the database migration." };
  }
}

export async function getEngagementData() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [usageStreak, whyStatement, unlockedAchievements] = await Promise.all([
    getAppUsageStreak(),
    getWhyStatement(),
    getUnlockedAchievements(),
  ]);

  return { usageStreak, whyStatement, unlockedAchievements };
}

// ── Inbox actions ──

export async function getOrCreateInboxArea() {
  const user = await getCurrentUser();
  if (!user) return null;
  const db = getDb();

  const existing = await db
    .select()
    .from(lifeAreas)
    .where(and(eq(lifeAreas.userId, user.id), eq(lifeAreas.name, "Inbox")))
    .get();

  if (existing) return existing;

  const maxSort = await db
    .select({ max: sql<number>`COALESCE(MAX(sort_order), 0)` })
    .from(lifeAreas)
    .where(eq(lifeAreas.userId, user.id))
    .get();

  const result = await db
    .insert(lifeAreas)
    .values({
      userId: user.id,
      name: "Inbox",
      icon: "inbox",
      color: "#64748b",
      priorityWeight: 1,
      targetWeeklyHours: 0,
      isSeason: false,
      sortOrder: (maxSort?.max ?? 0) + 1,
    })
    .returning()
    .get();

  return result;
}

export async function quickAddInboxTask(title: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const inbox = await getOrCreateInboxArea();
  if (!inbox) return { error: "Could not create inbox area" };

  const db = getDb();
  await db.insert(tasks)
    .values({
      userId: user.id,
      areaId: inbox.id,
      title,
      isUrgent: true,
      isImportant: false,
      impactLevel: 1,
    })
    .run();

  revalidatePath("/");
  revalidatePath("/goals");
  return { success: true };
}

export async function getInboxTasks() {
  const user = await getCurrentUser();
  if (!user) return [];
  const db = getDb();

  const inbox = await db
    .select()
    .from(lifeAreas)
    .where(and(eq(lifeAreas.userId, user.id), eq(lifeAreas.name, "Inbox")))
    .get();

  if (!inbox) return [];

  return await db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, user.id),
        eq(tasks.areaId, inbox.id),
        ne(tasks.status, "done"),
        ne(tasks.status, "cancelled")
      )
    )
    .orderBy(desc(tasks.createdAt))
    .all();
}

export async function getInboxStats() {
  const user = await getCurrentUser();
  if (!user) return { openCount: 0, thisWeekAdded: 0, thisWeekCompleted: 0 };
  const db = getDb();

  const inbox = await db
    .select()
    .from(lifeAreas)
    .where(and(eq(lifeAreas.userId, user.id), eq(lifeAreas.name, "Inbox")))
    .get();

  if (!inbox) return { openCount: 0, thisWeekAdded: 0, thisWeekCompleted: 0 };

  const openCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(tasks)
    .where(
      and(
        eq(tasks.areaId, inbox.id),
        ne(tasks.status, "done"),
        ne(tasks.status, "cancelled")
      )
    )
    .get();

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString();

  const thisWeekAdded = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(tasks)
    .where(
      and(
        eq(tasks.areaId, inbox.id),
        gte(tasks.createdAt, weekAgoStr)
      )
    )
    .get();

  const thisWeekCompleted = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(tasks)
    .where(
      and(
        eq(tasks.areaId, inbox.id),
        eq(tasks.status, "done"),
        gte(tasks.completedAt, weekAgoStr)
      )
    )
    .get();

  return {
    openCount: openCount?.count ?? 0,
    thisWeekAdded: thisWeekAdded?.count ?? 0,
    thisWeekCompleted: thisWeekCompleted?.count ?? 0,
  };
}

// ── Work analysis (strategic vs reactive) ──

export async function getWorkAnalysis(days: number = 30) {
  const user = await getCurrentUser();
  const empty = {
    strategicDone: 0,
    reactiveDone: 0,
    strategicMins: 0,
    reactiveMins: 0,
    openStrategic: 0,
    openReactive: 0,
    goalLinkedRatio: 0,
    topImpactDone: [] as { title: string; impactLevel: number; completedAt: string | null }[],
    habitImpact: [] as { title: string; impactLevel: number; type: string }[],
  };
  if (!user) return empty;
  try {
    const db = getDb();
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString();

    const allTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, user.id))
      .all();

    let strategicDone = 0;
    let reactiveDone = 0;
    let strategicMins = 0;
    let reactiveMins = 0;
    let openStrategic = 0;
    let openReactive = 0;
    let goalLinked = 0;
    const doneInWindow: typeof allTasks = [];

    for (const t of allTasks as typeof tasks.$inferSelect[]) {
      const kind = classifyTask({
        goalId: t.goalId,
        isImportant: t.isImportant,
        isUrgent: t.isUrgent,
        impactLevel: t.impactLevel ?? 2,
      });
      const isDone = t.status === "done";
      const inWindow = isDone && t.completedAt != null && t.completedAt >= sinceStr;
      const isOpen = t.status === "todo" || t.status === "in_progress";

      if (inWindow) {
        doneInWindow.push(t);
        if (t.goalId != null) goalLinked++;
        if (kind === "strategic") {
          strategicDone++;
          strategicMins += t.effortMins ?? 0;
        } else {
          reactiveDone++;
          reactiveMins += t.effortMins ?? 0;
        }
      }
      if (isOpen) {
        if (kind === "strategic") openStrategic++;
        else openReactive++;
      }
    }

    const topImpactDone = [...doneInWindow]
      .sort((a, b) => (b.impactLevel ?? 0) - (a.impactLevel ?? 0))
      .slice(0, 5)
      .map((t) => ({
        title: t.title,
        impactLevel: t.impactLevel ?? 2,
        completedAt: t.completedAt,
      }));

    const allHabits = await db
      .select()
      .from(habits)
      .where(and(eq(habits.userId, user.id), eq(habits.archived, false)))
      .all();

    const habitImpact = (allHabits as typeof habits.$inferSelect[])
      .map((h) => ({
        title: h.title,
        impactLevel: h.impactLevel ?? 3,
        type: h.type,
      }))
      .sort((a, b) => b.impactLevel - a.impactLevel);

    const totalDone = strategicDone + reactiveDone;
    const goalLinkedRatio = totalDone > 0 ? goalLinked / totalDone : 0;

    return {
      strategicDone,
      reactiveDone,
      strategicMins,
      reactiveMins,
      openStrategic,
      openReactive,
      goalLinkedRatio,
      topImpactDone,
      habitImpact,
    };
  } catch {
    return empty;
  }
}

// ── Data export ──

export async function exportAllData() {
  const user = await getCurrentUser();
  if (!user) return null;
  const db = getDb();

  const allAreas = await db.select().from(lifeAreas).where(eq(lifeAreas.userId, user.id)).all();
  const allHabits = await db.select().from(habits).where(eq(habits.userId, user.id)).all();
  const allHabitLogs = [];
  for (const habit of allHabits) {
    const logs = await db.select().from(habitLogs).where(eq(habitLogs.habitId, habit.id)).all();
    allHabitLogs.push(...logs);
  }
  const allGoals = await db.select().from(goals).where(eq(goals.userId, user.id)).all();
  const allTasks = await db.select().from(tasks).where(eq(tasks.userId, user.id)).all();
  const allWins = await db.select().from(wins).where(eq(wins.userId, user.id)).all();
  const allReviews = await db.select().from(reviews).where(eq(reviews.userId, user.id)).all();
  const allSnapshots = await db.select().from(financeSnapshots).where(eq(financeSnapshots.userId, user.id)).all();
  const allAllocations = [];
  for (const snap of allSnapshots) {
    const allocs = await db.select().from(financeAllocations).where(eq(financeAllocations.snapshotId, snap.id)).all();
    allAllocations.push(...allocs);
  }
  const allMetrics = await db.select().from(metrics).where(eq(metrics.userId, user.id)).all();
  const allMetricLogs = [];
  for (const metric of allMetrics) {
    const logs = await db.select().from(metricLogs).where(eq(metricLogs.metricId, metric.id)).all();
    allMetricLogs.push(...logs);
  }

  return {
    exportedAt: new Date().toISOString(),
    user: { name: user.name, email: user.email, timezone: user.timezone },
    areas: allAreas,
    habits: allHabits,
    habitLogs: allHabitLogs,
    goals: allGoals,
    tasks: allTasks,
    wins: allWins,
    reviews: allReviews,
    financeSnapshots: allSnapshots,
    financeAllocations: allAllocations,
    metrics: allMetrics,
    metricLogs: allMetricLogs,
  };
}
