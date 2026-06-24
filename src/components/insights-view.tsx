"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface HabitWithLogs {
  habit: {
    id: number;
    title: string;
    type: string;
    dailyBudgetMins: number | null;
  };
  logs: {
    id: number;
    date: string;
    status: string;
    value: number | null;
  }[];
}

interface InsightsViewProps {
  habitsWithLogs: HabitWithLogs[];
}

function getLast30Days(): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function computeConsistency(
  logs: { date: string; status: string }[],
  type: string,
  days: string[]
): number {
  const logMap = new Map(logs.map((l) => [l.date, l.status]));
  const successStatuses =
    type === "build"
      ? ["done", "partial"]
      : ["clean", "under_budget"];
  let successes = 0;
  for (const day of days) {
    const status = logMap.get(day);
    if (status && successStatuses.includes(status)) successes++;
  }
  return days.length > 0 ? Math.round((successes / days.length) * 100) : 0;
}

export function InsightsView({ habitsWithLogs }: InsightsViewProps) {
  const last30 = getLast30Days();
  const buildHabits = habitsWithLogs.filter((h) => h.habit.type === "build");
  const limitHabits = habitsWithLogs.filter((h) => h.habit.type === "limit");

  return (
    <div className="space-y-6">
      {/* Build habit consistency */}
      {buildHabits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Build habits — 30-day consistency</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {buildHabits.map(({ habit, logs }) => {
              const pct = computeConsistency(logs, "build", last30);
              return (
                <div key={habit.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{habit.title}</span>
                    <span className="text-xs text-slate-400">{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        pct >= 80
                          ? "bg-emerald-500"
                          : pct >= 50
                            ? "bg-indigo-500"
                            : "bg-amber-400"
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Limit habit trends */}
      {limitHabits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Limit habits — 30-day view</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {limitHabits.map(({ habit, logs }) => {
              const logMap = new Map(logs.map((l) => [l.date, l]));
              const pct = computeConsistency(logs, "limit", last30);
              const avgUsage = (() => {
                const vals = logs
                  .filter((l) => l.value !== null && last30.includes(l.date))
                  .map((l) => l.value!);
                return vals.length > 0
                  ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
                  : null;
              })();

              return (
                <div key={habit.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{habit.title}</span>
                    <Badge variant="limit" className="text-[9px]">
                      {pct}% clean
                    </Badge>
                  </div>

                  {/* Mini bar chart */}
                  <div className="flex items-end gap-px h-12">
                    {last30.map((day) => {
                      const log = logMap.get(day);
                      const value = log?.value ?? 0;
                      const budget = habit.dailyBudgetMins ?? 30;
                      const heightPct = budget > 0 ? Math.min((value / budget) * 100, 100) : 0;
                      const isOver = value > budget;
                      const isClean = log?.status === "clean";
                      return (
                        <div
                          key={day}
                          className="flex-1 flex flex-col justify-end"
                          title={`${day}: ${value}min`}
                        >
                          <div
                            className={cn(
                              "rounded-t-sm min-h-[2px]",
                              isClean
                                ? "bg-emerald-500"
                                : isOver
                                  ? "bg-amber-400"
                                  : "bg-indigo-500"
                            )}
                            style={{ height: `${Math.max(heightPct, 4)}%` }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  {habit.dailyBudgetMins !== null && (
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Budget: {habit.dailyBudgetMins}min/day</span>
                      {avgUsage !== null && <span>Avg: {avgUsage}min</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Overall heatmap */}
      {habitsWithLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Activity heatmap — last 30 days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-10 gap-1">
              {last30.map((day) => {
                let score = 0;
                for (const { habit, logs } of habitsWithLogs) {
                  const log = logs.find((l) => l.date === day);
                  if (!log) continue;
                  const good =
                    habit.type === "build"
                      ? ["done", "partial"].includes(log.status)
                      : ["clean", "under_budget"].includes(log.status);
                  if (good) score++;
                }
                const intensity = habitsWithLogs.length > 0
                  ? score / habitsWithLogs.length
                  : 0;
                return (
                  <div
                    key={day}
                    className={cn(
                      "aspect-square rounded-sm",
                      intensity === 0
                        ? "bg-slate-800"
                        : intensity < 0.33
                          ? "bg-indigo-900"
                          : intensity < 0.66
                            ? "bg-indigo-700"
                            : "bg-indigo-500"
                    )}
                    title={`${day}: ${score}/${habitsWithLogs.length}`}
                  />
                );
              })}
            </div>
            <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500">
              <span>Less</span>
              <span className="h-2 w-2 rounded-sm bg-slate-800" />
              <span className="h-2 w-2 rounded-sm bg-indigo-900" />
              <span className="h-2 w-2 rounded-sm bg-indigo-700" />
              <span className="h-2 w-2 rounded-sm bg-indigo-500" />
              <span>More</span>
            </div>
          </CardContent>
        </Card>
      )}

      {habitsWithLogs.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-slate-400">No habits tracked yet</p>
          <p className="text-sm text-slate-500 mt-1">
            Start logging habits to see your trends here.
          </p>
        </Card>
      )}
    </div>
  );
}
