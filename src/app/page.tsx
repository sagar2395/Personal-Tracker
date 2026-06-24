import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  getTodayHabits,
  getTodayMITs,
  getUpcomingDeadlines,
  getRecentWins,
} from "./actions";
import { AppShell } from "@/components/app-shell";
import { TodayView } from "@/components/today-view";

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [todayHabits, mits, deadlinesData, recentWins] = await Promise.all([
    getTodayHabits(),
    getTodayMITs(),
    getUpcomingDeadlines(7),
    getRecentWins(3),
  ]);

  const today = new Date();
  const greeting =
    today.getHours() < 12
      ? "Good morning"
      : today.getHours() < 17
        ? "Good afternoon"
        : "Good evening";

  const deadlines = [
    ...deadlinesData.tasks.map((t) => ({
      id: t.id,
      title: t.title,
      dueDate: t.dueDate,
      deadline: null as string | null,
      type: "task" as const,
    })),
    ...deadlinesData.goals.map((g) => ({
      id: g.id,
      title: g.title,
      dueDate: null as string | null,
      deadline: g.deadline,
      type: "goal" as const,
    })),
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting}, {user.name}
          </h1>
          <p className="text-sm text-slate-400">
            {today.toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </header>

        <TodayView
          habits={todayHabits}
          mits={mits}
          deadlines={deadlines}
          recentWins={recentWins}
        />
      </div>
    </AppShell>
  );
}
