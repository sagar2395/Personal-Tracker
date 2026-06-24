import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getHabits, getAreas } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Plus, Flame } from "lucide-react";
import Link from "next/link";

export default async function HabitsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [habits, areas] = await Promise.all([getHabits(), getAreas()]);
  const areaMap = new Map(areas.map((a: typeof areas[number]) => [a.id, a]));

  const buildHabits = habits.filter((h: typeof habits[number]) => h.type === "build");
  const limitHabits = habits.filter((h: typeof habits[number]) => h.type === "limit");

  return (
    <AppShell>
      <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Habits</h1>
          <Link
            href="/habits/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New habit
          </Link>
        </header>

        {habits.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-2">No habits yet</p>
            <p className="text-sm text-slate-500">
              Create your first habit to start tracking.
            </p>
          </div>
        )}

        {buildHabits.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Build ({buildHabits.length})
            </h2>
            {buildHabits.map((habit: typeof buildHabits[number]) => {
              const area = areaMap.get(habit.areaId) as typeof areas[number] | undefined;
              return (
                <Link
                  key={habit.id}
                  href={`/habits/${habit.id}`}
                  className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3 hover:border-slate-700 transition-colors"
                >
                  <div
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: area?.color || "#6366f1" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{habit.title}</p>
                    <p className="text-xs text-slate-500">
                      {habit.cadence} · {area?.name || "No area"}
                    </p>
                  </div>
                  <Badge variant="build" className="text-[10px]">Build</Badge>
                </Link>
              );
            })}
          </section>
        )}

        {limitHabits.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Limit ({limitHabits.length})
            </h2>
            {limitHabits.map((habit: typeof limitHabits[number]) => {
              const area = areaMap.get(habit.areaId) as typeof areas[number] | undefined;
              return (
                <Link
                  key={habit.id}
                  href={`/habits/${habit.id}`}
                  className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3 hover:border-slate-700 transition-colors"
                >
                  <div
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: area?.color || "#6366f1" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{habit.title}</p>
                    <p className="text-xs text-slate-500">
                      {habit.dailyBudgetMins === 0
                        ? "Quit entirely"
                        : `${habit.dailyBudgetMins} min/day`}{" "}
                      · {area?.name || "No area"}
                    </p>
                  </div>
                  <Badge variant="limit" className="text-[10px]">Limit</Badge>
                </Link>
              );
            })}
          </section>
        )}
      </div>
    </AppShell>
  );
}
