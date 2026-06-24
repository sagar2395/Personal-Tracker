"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HabitCard } from "./habit-card";
import type { StreakResult } from "@/lib/streaks";

interface HabitWithContext {
  habit: {
    id: number;
    title: string;
    type: string;
    tinyVersion: string | null;
    anchor: string | null;
    substitutionPlan: string | null;
    dailyBudgetMins: number | null;
  };
  todayLog: {
    id: number;
    status: string;
    value: number | null;
  } | null | undefined;
  streak: StreakResult;
  area: {
    name: string;
    color: string;
  } | null | undefined;
}

interface TodayViewProps {
  habits: HabitWithContext[];
}

export function TodayView({ habits }: TodayViewProps) {
  const buildHabits = habits.filter((h) => h.habit.type === "build");
  const limitHabits = habits.filter((h) => h.habit.type === "limit");
  const completedCount = habits.filter((h) => h.todayLog).length;
  const totalCount = habits.length;
  const momentumPercent = totalCount > 0
    ? Math.round((completedCount / totalCount) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {totalCount > 0 && (
        <Card className="flex items-center gap-4 p-4">
          <div className="relative h-14 w-14 flex-shrink-0">
            <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="text-slate-800"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeDasharray={`${momentumPercent}, 100`}
                className="text-indigo-500 transition-all duration-500"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
              {momentumPercent}%
            </span>
          </div>
          <div>
            <p className="text-sm font-medium">Today&apos;s momentum</p>
            <p className="text-xs text-slate-400">
              {completedCount} of {totalCount} habits logged
            </p>
          </div>
        </Card>
      )}

      {buildHabits.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Build
            </h2>
            <Badge variant="build">
              {buildHabits.filter((h) => h.todayLog).length}/{buildHabits.length}
            </Badge>
          </div>
          {buildHabits.map((h) => (
            <HabitCard key={h.habit.id} data={h} />
          ))}
        </section>
      )}

      {limitHabits.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Limit
            </h2>
            <Badge variant="limit">
              {limitHabits.filter((h) => h.todayLog).length}/{limitHabits.length}
            </Badge>
          </div>
          {limitHabits.map((h) => (
            <HabitCard key={h.habit.id} data={h} />
          ))}
        </section>
      )}

      {totalCount === 0 && (
        <Card className="p-6 text-center">
          <p className="text-slate-400 mb-2">No habits yet</p>
          <p className="text-sm text-slate-500">
            Start by creating your first habit — build a good one or limit a bad one.
          </p>
          <a
            href="/habits/new"
            className="mt-4 inline-block text-indigo-400 hover:text-indigo-300 text-sm font-medium"
          >
            Create a habit →
          </a>
        </Card>
      )}
    </div>
  );
}
