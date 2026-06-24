import { getDb } from "@/db";
import { pushSubscriptions } from "@/db/schema/notifications";
import { habits, habitLogs } from "@/db/schema/habits";
import { tasks } from "@/db/schema/tasks";
import { users } from "@/db/schema/users";
import { appUsageLogs } from "@/db/schema/engagement";
import { sendPushNotification } from "@/lib/push";
import { eq, and, sql, ne, desc } from "drizzle-orm";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const allUsers = await db.select().from(users).all();

  for (const user of allUsers) {
    const subs = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, user.id))
      .all();

    if (subs.length === 0) continue;

    const tz = user.timezone || "Asia/Kolkata";
    const now = new Date();
    const localTime = new Date(
      now.toLocaleString("en-US", { timeZone: tz })
    );
    const hour = localTime.getHours();
    const today = localTime.toISOString().split("T")[0];
    const yesterday = new Date(localTime);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const userHabits = await db
      .select()
      .from(habits)
      .where(and(eq(habits.userId, user.id), eq(habits.archived, false)))
      .all();

    const notifications: { title: string; body: string; tag: string; url: string }[] = [];

    if (hour >= 5 && hour <= 8) {
      for (const habit of userHabits) {
        if (habit.type === "build") {
          notifications.push({
            title: `Time for ${habit.title}`,
            body: habit.tinyVersion
              ? `Even the tiny version counts: ${habit.tinyVersion}`
              : "Even the tiny version counts.",
            tag: `morning-${habit.id}`,
            url: "/habits",
          });
        }
      }
    }

    if (hour >= 20 && hour <= 22) {
      const todayLogs = await db
        .select()
        .from(habitLogs)
        .where(eq(habitLogs.date, today))
        .all();
      const loggedHabitIds = new Set(todayLogs.map((l: { habitId: number }) => l.habitId));

      const unlogged = userHabits.filter((h: { id: number }) => !loggedHabitIds.has(h.id));
      if (unlogged.length > 0) {
        notifications.push({
          title: "Evening check-in",
          body: `How was today? ${unlogged.length} habit${unlogged.length > 1 ? "s" : ""} still to log.`,
          tag: "evening-checkin",
          url: "/habits",
        });
      }

      const yesterdayLogs = await db
        .select()
        .from(habitLogs)
        .where(
          and(
            eq(habitLogs.date, yesterdayStr),
            eq(habitLogs.status, "missed")
          )
        )
        .all();
      const missedIds = new Set(yesterdayLogs.map((l: { habitId: number }) => l.habitId));
      for (const habit of userHabits) {
        if (missedIds.has(habit.id)) {
          notifications.push({
            title: `${habit.title} missed yesterday`,
            body: "Tomorrow's a great reset point — even the tiny version counts.",
            tag: `nudge-${habit.id}`,
            url: "/habits",
          });
        }
      }
    }

    // Streak protection nudge (afternoon, if they haven't opened the app today)
    if (hour >= 14 && hour <= 16) {
      const todayUsage = await db
        .select()
        .from(appUsageLogs)
        .where(
          and(eq(appUsageLogs.userId, user.id), eq(appUsageLogs.date, today))
        )
        .get();

      if (!todayUsage) {
        const recentUsage = await db
          .select({ date: appUsageLogs.date })
          .from(appUsageLogs)
          .where(eq(appUsageLogs.userId, user.id))
          .orderBy(desc(appUsageLogs.date))
          .limit(2)
          .all();

        if (recentUsage.length > 0) {
          let streakDays = 0;
          for (let i = 0; i < recentUsage.length; i++) {
            const d = new Date(recentUsage[i].date);
            const expected = new Date(localTime);
            expected.setDate(expected.getDate() - (i + 1));
            if (d.toISOString().split("T")[0] === expected.toISOString().split("T")[0]) {
              streakDays++;
            } else break;
          }
          if (streakDays >= 2) {
            notifications.push({
              title: `Don't break your ${streakDays}-day streak!`,
              body: "Quick check-in takes 30 seconds. Your future self will thank you.",
              tag: "streak-protect",
              url: "/",
            });
          }
        }
      }
    }

    const tomorrow = new Date(localTime);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    const dueTomorrow = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, user.id),
          eq(tasks.dueDate, tomorrowStr),
          ne(tasks.status, "done")
        )
      )
      .all();
    for (const task of dueTomorrow) {
      notifications.push({
        title: `${task.title} is due tomorrow`,
        body: "Add to today's MITs?",
        tag: `deadline-${task.id}`,
        url: "/tasks",
      });
    }

    for (const notif of notifications) {
      for (const sub of subs) {
        const result = await sendPushNotification(sub, notif);
        if (result === "expired") {
          await db
            .delete(pushSubscriptions)
            .where(eq(pushSubscriptions.id, sub.id));
        }
      }
    }
  }

  return Response.json({ ok: true });
}
