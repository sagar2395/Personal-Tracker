"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Flame, Clock, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteHabit } from "@/app/actions";
import { cn } from "@/lib/utils";
import type { StreakResult } from "@/lib/streaks";

interface HabitDetailProps {
  habit: {
    id: number;
    title: string;
    type: string;
    tinyVersion: string | null;
    anchor: string | null;
    cadence: string;
    graceDaysAllowed: number;
    substitutionPlan: string | null;
    dailyBudgetMins: number | null;
    peakTemptationTime: string | null;
    createdAt: string;
  };
  logs: {
    id: number;
    date: string;
    status: string;
    value: number | null;
    note: string | null;
  }[];
  streak: StreakResult;
}

function getStatusColor(status: string, type: string): string {
  if (type === "build") {
    switch (status) {
      case "done": return "bg-emerald-500";
      case "partial": return "bg-amber-400";
      case "skipped": return "bg-slate-600";
      case "missed": return "bg-slate-700";
      default: return "bg-slate-800";
    }
  }
  switch (status) {
    case "clean": return "bg-emerald-500";
    case "under_budget": return "bg-emerald-400";
    case "over_budget": return "bg-amber-400";
    case "slip": return "bg-slate-600";
    default: return "bg-slate-800";
  }
}

function generateCalendarDays(logs: { date: string; status: string }[]) {
  const logMap = new Map(logs.map((l) => [l.date, l.status]));
  const today = new Date();
  const days: { date: string; status: string | null; isToday: boolean }[] = [];

  for (let i = 41; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    days.push({
      date: dateStr,
      status: logMap.get(dateStr) || null,
      isToday: i === 0,
    });
  }

  return days;
}

export function HabitDetail({ habit, logs, streak }: HabitDetailProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isBuild = habit.type === "build";
  const calendarDays = generateCalendarDays(logs);

  function handleDelete() {
    if (!confirm("Archive this habit? It won't appear on Today anymore.")) return;
    startTransition(async () => {
      await deleteHabit(habit.id);
      router.push("/habits");
    });
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-slate-400 hover:text-slate-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">{habit.title}</h1>
            <Badge variant={isBuild ? "build" : "limit"} className="text-[10px]">
              {isBuild ? "Build" : "Limit"}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 capitalize">{habit.cadence}</p>
        </div>
      </header>

      {/* Streak stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center p-3">
          <div className="flex items-center justify-center gap-1 text-indigo-400">
            <Flame className="h-4 w-4" />
            <span className="text-2xl font-bold">{streak.currentStreak}</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Current</p>
        </Card>
        <Card className="text-center p-3">
          <span className="text-2xl font-bold text-slate-300">
            {streak.longestStreak}
          </span>
          <p className="text-[10px] text-slate-500 mt-1">Longest</p>
        </Card>
        <Card className="text-center p-3">
          <span
            className={cn(
              "text-2xl font-bold",
              streak.graceDaysRemaining > 0
                ? "text-emerald-400"
                : "text-amber-400"
            )}
          >
            {streak.graceDaysRemaining}
          </span>
          <p className="text-[10px] text-slate-500 mt-1">Grace left</p>
        </Card>
      </div>

      {/* Calendar grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Last 42 days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <div
                key={i}
                className="text-center text-[10px] text-slate-600 pb-1"
              >
                {d}
              </div>
            ))}
            {calendarDays.map((day) => (
              <div
                key={day.date}
                className={cn(
                  "aspect-square rounded-sm transition-colors",
                  day.status
                    ? getStatusColor(day.status, habit.type)
                    : "bg-slate-800",
                  day.isToday && "ring-1 ring-indigo-500"
                )}
                title={`${day.date}: ${day.status || "no log"}`}
              />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-slate-500">
            {isBuild ? (
              <>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-sm bg-emerald-500" /> Done
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-sm bg-amber-400" /> Tiny
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-sm bg-slate-600" /> Skipped
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-sm bg-slate-800" /> No log
                </span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-sm bg-emerald-500" /> Clean
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-sm bg-emerald-400" /> Under budget
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-sm bg-amber-400" /> Over budget
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-sm bg-slate-800" /> No log
                </span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Habit details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-400">
          {isBuild && habit.tinyVersion && (
            <p>
              <span className="text-slate-500">Tiny version:</span>{" "}
              {habit.tinyVersion}
            </p>
          )}
          {habit.anchor && (
            <p>
              <span className="text-slate-500">Anchor:</span> {habit.anchor}
            </p>
          )}
          {!isBuild && habit.substitutionPlan && (
            <p>
              <span className="text-slate-500">Plan:</span>{" "}
              {habit.substitutionPlan}
            </p>
          )}
          {!isBuild && habit.dailyBudgetMins !== null && (
            <p className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span className="text-slate-500">Budget:</span>{" "}
              {habit.dailyBudgetMins === 0
                ? "Quit entirely"
                : `${habit.dailyBudgetMins} min/day`}
            </p>
          )}
          {!isBuild && habit.peakTemptationTime && (
            <p>
              <span className="text-slate-500">Peak time:</span>{" "}
              {habit.peakTemptationTime}
            </p>
          )}
          <p>
            <span className="text-slate-500">Grace days:</span>{" "}
            {habit.graceDaysAllowed}
          </p>
        </CardContent>
      </Card>

      {/* Recent logs */}
      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {logs.slice(0, 10).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-slate-400">{log.date}</span>
                  <div className="flex items-center gap-2">
                    {log.value !== null && (
                      <span className="text-xs text-slate-500">
                        {log.value} min
                      </span>
                    )}
                    <Badge
                      variant={
                        ["done", "partial", "clean", "under_budget"].includes(
                          log.status
                        )
                          ? "success"
                          : ["over_budget"].includes(log.status)
                            ? "warn"
                            : "muted"
                      }
                      className="text-[10px]"
                    >
                      {log.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Archive */}
      <Button
        variant="ghost"
        className="w-full text-slate-500 hover:text-red-400"
        onClick={handleDelete}
        disabled={isPending}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Archive habit
      </Button>
    </div>
  );
}
