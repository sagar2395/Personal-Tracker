"use client";

import { useState } from "react";
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

const TIME_RANGES = [
  { label: "1W", days: 7 },
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
] as const;

function getLastNDays(n: number): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
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
  const [rangeDays, setRangeDays] = useState(30);
  const selectedDays = getLastNDays(rangeDays);
  const buildHabits = habitsWithLogs.filter((h) => h.habit.type === "build");
  const limitHabits = habitsWithLogs.filter((h) => h.habit.type === "limit");

  const overallConsistency = (() => {
    if (habitsWithLogs.length === 0) return 0;
    let totalGood = 0;
    let totalPossible = 0;
    for (const { habit, logs } of habitsWithLogs) {
      totalPossible += selectedDays.length;
      totalGood += computeConsistency(logs, habit.type, selectedDays) * selectedDays.length / 100;
    }
    return totalPossible > 0 ? Math.round((totalGood / totalPossible) * 100) : 0;
  })();

  return (
    <div className="space-y-6">
      {/* Time range selector */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-slate-800/50 rounded-lg p-0.5">
          {TIME_RANGES.map((range) => (
            <button
              key={range.label}
              onClick={() => setRangeDays(range.days)}
              className={cn(
                "px-3 py-1 text-xs rounded-md transition-colors",
                rangeDays === range.days
                  ? "bg-indigo-500 text-white"
                  : "text-slate-400 hover:text-slate-300"
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
        {habitsWithLogs.length > 0 && (
          <span className="text-xs text-slate-500">
            Overall: {overallConsistency}%
          </span>
        )}
      </div>

      {/* Build habit consistency */}
      {buildHabits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Build habits — {rangeDays}-day consistency</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {buildHabits.map(({ habit, logs }) => {
              const pct = computeConsistency(logs, "build", selectedDays);
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
            <CardTitle className="text-sm">Limit habits — {rangeDays}-day view</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {limitHabits.map(({ habit, logs }) => {
              const logMap = new Map(logs.map((l) => [l.date, l]));
              const pct = computeConsistency(logs, "limit", selectedDays);
              const avgUsage = (() => {
                const vals = logs
                  .filter((l) => l.value !== null && selectedDays.includes(l.date))
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
                    {selectedDays.map((day) => {
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
            <CardTitle className="text-sm">Activity heatmap — last {rangeDays} days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-10 gap-1">
              {selectedDays.map((day) => {
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
