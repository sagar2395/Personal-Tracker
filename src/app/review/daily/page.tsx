import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getReview } from "@/app/actions";
import { getDb } from "@/db";
import { habitLogs } from "@/db/schema/habits";
import { habits } from "@/db/schema/habits";
import { tasks } from "@/db/schema/tasks";
import { eq, and, gte } from "drizzle-orm";
import { AppShell } from "@/components/app-shell";
import { DailyCheckin } from "@/components/daily-checkin";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function DailyCheckinPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const today = new Date().toISOString().split("T")[0];
  const db = getDb();

  const existingReview = await getReview("daily", today);

  const todayLogs = db
    .select({
      habitId: habitLogs.habitId,
      status: habitLogs.status,
    })
    .from(habitLogs)
    .where(
      and(
        eq(habitLogs.date, today),
      )
    )
    .all();

  const completedHabitIds = todayLogs
    .filter((l) => ["done", "partial", "clean", "under_budget"].includes(l.status))
    .map((l) => l.habitId);

  const completedHabits = completedHabitIds.length > 0
    ? db
        .select({ id: habits.id, title: habits.title })
        .from(habits)
        .where(
          and(
            eq(habits.userId, user.id),
          )
        )
        .all()
        .filter((h) => completedHabitIds.includes(h.id))
    : [];

  const completedTasks = db
    .select({ id: tasks.id, title: tasks.title })
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, user.id),
        eq(tasks.status, "done"),
        gte(tasks.completedAt, today)
      )
    )
    .all();

  const completedItems = [
    ...completedHabits.map((h) => ({
      id: h.id,
      title: h.title,
      type: "habit" as const,
    })),
    ...completedTasks.map((t) => ({
      id: t.id,
      title: t.title,
      type: "task" as const,
    })),
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Link
            href="/review"
            className="text-slate-400 hover:text-slate-300"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Evening Check-in
            </h1>
            <p className="text-sm text-slate-400">
              Take 2 minutes to reflect on your day.
            </p>
          </div>
        </div>

        <DailyCheckin
          completedItems={completedItems}
          existingReview={existingReview}
          date={today}
        />
      </div>
    </AppShell>
  );
}
