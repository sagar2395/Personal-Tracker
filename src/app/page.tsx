import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  getTodayHabits,
  getTodayMITs,
  getUpcomingDeadlines,
  getRecentWins,
  recordAppUsage,
  getEngagementData,
  checkAndUnlockAchievements,
} from "./actions";
import { AppShell } from "@/components/app-shell";
import { TodayView } from "@/components/today-view";
import { getDailyQuote, getWelcomeBackMessage } from "@/lib/achievements";

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [todayHabits, mits, deadlinesData, recentWins] = await Promise.all([
    getTodayHabits(),
    getTodayMITs(),
    getUpcomingDeadlines(7),
    getRecentWins(3),
  ]);

  const usageStreak = await recordAppUsage();
  const engagementData = await getEngagementData();
  const newlyUnlocked = await checkAndUnlockAchievements();

  const today = new Date();
  const greeting =
    today.getHours() < 12
      ? "Good morning"
      : today.getHours() < 17
        ? "Good afternoon"
        : "Good evening";

  const deadlines = [
    ...deadlinesData.tasks.map((t: typeof deadlinesData.tasks[number]) => ({
      id: t.id,
      title: t.title,
      dueDate: t.dueDate,
      deadline: null as string | null,
      type: "task" as const,
    })),
    ...deadlinesData.goals.map((g: typeof deadlinesData.goals[number]) => ({
      id: g.id,
      title: g.title,
      dueDate: null as string | null,
      deadline: g.deadline,
      type: "goal" as const,
    })),
  ];

  const dailyQuote = getDailyQuote();
  const welcomeBack = engagementData?.usageStreak.lastUsedDate
    ? getWelcomeBackMessage(
        Math.round(
          (new Date().getTime() - new Date(engagementData.usageStreak.lastUsedDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : null;

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
          appStreak={usageStreak}
          whyStatement={engagementData?.whyStatement ?? null}
          dailyQuote={dailyQuote}
          welcomeBack={welcomeBack}
          unlockedAchievements={engagementData?.unlockedAchievements ?? []}
          newlyUnlocked={newlyUnlocked}
        />
      </div>
    </AppShell>
  );
}
