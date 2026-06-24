import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getHabits, getWorkAnalysis } from "@/app/actions";
import { getDb } from "@/db";
import { habitLogs } from "@/db/schema/habits";
import { eq, desc } from "drizzle-orm";
import { AppShell } from "@/components/app-shell";
import { InsightsView } from "@/components/insights-view";

export default async function InsightsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const allHabits = await getHabits();
  const db = getDb();

  const habitsWithLogs = await Promise.all(
    allHabits.map(async (habit: typeof allHabits[number]) => {
      const logs = await db
        .select()
        .from(habitLogs)
        .where(eq(habitLogs.habitId, habit.id))
        .orderBy(desc(habitLogs.date))
        .limit(90)
        .all();
      return { habit, logs };
    })
  );

  const workAnalysis = await getWorkAnalysis(30);

  return (
    <AppShell>
      <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Insights</h1>
        <InsightsView habitsWithLogs={habitsWithLogs} workAnalysis={workAnalysis} />
      </div>
    </AppShell>
  );
}
