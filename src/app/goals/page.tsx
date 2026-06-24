import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getGoals, getAreas } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flag, Plus } from "lucide-react";
import Link from "next/link";

export default async function GoalsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [activeGoals, somedayGoals, doneGoals, areas] = await Promise.all([
    getGoals("active"),
    getGoals("someday"),
    getGoals("done"),
    getAreas(),
  ]);

  const areaMap = new Map(areas.map((a) => [a.id, a]));

  return (
    <AppShell>
      <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Goals & Tasks</h1>
          <Link
            href="/goals/new"
            className="inline-flex items-center gap-1 rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Goal
          </Link>
        </div>

        {activeGoals.length === 0 && somedayGoals.length === 0 && doneGoals.length === 0 && (
          <Card className="p-8 text-center">
            <Flag className="h-8 w-8 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No goals yet</p>
            <p className="text-sm text-slate-500 mt-1">
              Create your first goal using the WOOP method to get started.
            </p>
          </Card>
        )}

        {activeGoals.length > 0 && (
          <section>
            <h2 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
              Active ({activeGoals.length})
            </h2>
            <div className="space-y-2">
              {activeGoals.map((goal) => {
                const area = areaMap.get(goal.areaId);
                return (
                  <Link key={goal.id} href={`/goals/${goal.id}`}>
                    <Card className="p-3 hover:border-slate-600 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{goal.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {area && (
                              <span
                                className="text-[10px] px-1.5 py-0.5 rounded"
                                style={{ backgroundColor: area.color + "20", color: area.color }}
                              >
                                {area.name}
                              </span>
                            )}
                            {goal.deadline && (
                              <span className="text-[10px] text-slate-500">
                                Due {goal.deadline}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge variant="build" className="text-[10px] ml-2">
                          active
                        </Badge>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {somedayGoals.length > 0 && (
          <section>
            <h2 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
              Someday ({somedayGoals.length})
            </h2>
            <div className="space-y-2">
              {somedayGoals.map((goal) => {
                const area = areaMap.get(goal.areaId);
                return (
                  <Link key={goal.id} href={`/goals/${goal.id}`}>
                    <Card className="p-3 hover:border-slate-600 transition-colors opacity-60">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{goal.title}</p>
                          {area && (
                            <span className="text-[10px] text-slate-500">
                              {area.name}
                            </span>
                          )}
                        </div>
                        <Badge variant="muted" className="text-[10px] ml-2">
                          someday
                        </Badge>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {doneGoals.length > 0 && (
          <section>
            <h2 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
              Completed ({doneGoals.length})
            </h2>
            <div className="space-y-2">
              {doneGoals.slice(0, 5).map((goal) => (
                <Link key={goal.id} href={`/goals/${goal.id}`}>
                  <Card className="p-3 opacity-40">
                    <p className="text-sm line-through">{goal.title}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="pt-2">
          <Link
            href="/goals/tasks"
            className="block text-center text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            View all tasks (backlog)
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
