"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HabitCard } from "./habit-card";
import {
  updateTaskStatus,
  captureWin,
} from "@/app/actions";
import {
  Star,
  CheckCircle2,
  Circle,
  Trophy,
  Calendar,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { StreakResult } from "@/lib/streaks";
import { cn } from "@/lib/utils";

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

interface MITTask {
  id: number;
  title: string;
  status: string;
  isMIT: boolean;
}

interface Deadline {
  id: number;
  title: string;
  dueDate?: string | null;
  deadline?: string | null;
  type: "task" | "goal";
}

interface Win {
  id: number;
  text: string;
  date: string;
}

interface TodayViewProps {
  habits: HabitWithContext[];
  mits?: MITTask[];
  deadlines?: Deadline[];
  recentWins?: Win[];
}

export function TodayView({ habits, mits = [], deadlines = [], recentWins = [] }: TodayViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [winText, setWinText] = useState("");
  const [showWinInput, setShowWinInput] = useState(false);

  const buildHabits = habits.filter((h) => h.habit.type === "build");
  const limitHabits = habits.filter((h) => h.habit.type === "limit");
  const completedHabits = habits.filter((h) => h.todayLog).length;
  const completedMITs = mits.filter((m) => m.status === "done").length;
  const totalItems = habits.length + mits.length;
  const completedItems = completedHabits + completedMITs;
  const momentumPercent = totalItems > 0
    ? Math.round((completedItems / totalItems) * 100)
    : 0;

  function handleMITDone(taskId: number) {
    startTransition(async () => {
      await updateTaskStatus(taskId, "done");
      router.refresh();
    });
  }

  function handleWinSubmit() {
    if (!winText.trim()) return;
    startTransition(async () => {
      await captureWin(winText.trim());
      setWinText("");
      setShowWinInput(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Momentum ring */}
      {totalItems > 0 && (
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
              {completedHabits}/{habits.length} habits · {completedMITs}/{mits.length} MITs
            </p>
          </div>
        </Card>
      )}

      {/* MITs section */}
      {mits.length > 0 && (
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Most important tasks
            </h2>
          </div>
          {mits.map((task) => (
            <Card key={task.id} className="p-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => task.status !== "done" && handleMITDone(task.id)}
                  disabled={isPending || task.status === "done"}
                >
                  {task.status === "done" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-slate-600 hover:text-indigo-400" />
                  )}
                </button>
                <span
                  className={cn(
                    "text-sm flex-1",
                    task.status === "done" && "line-through text-slate-600"
                  )}
                >
                  {task.title}
                </span>
              </div>
            </Card>
          ))}
        </section>
      )}

      {/* Build habits */}
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

      {/* Limit habits */}
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

      {/* Win capture */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Wins
            </h2>
          </div>
          {!showWinInput && (
            <button
              onClick={() => setShowWinInput(true)}
              className="text-xs text-indigo-400 hover:text-indigo-300"
            >
              <Plus className="h-4 w-4 inline mr-0.5" />
              Capture a win
            </button>
          )}
        </div>
        {showWinInput && (
          <Card className="p-3">
            <div className="flex gap-2">
              <Input
                value={winText}
                onChange={(e) => setWinText(e.target.value)}
                placeholder="What went well today?"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleWinSubmit()}
              />
              <Button
                onClick={handleWinSubmit}
                disabled={!winText.trim() || isPending}
                className="flex-shrink-0"
              >
                Save
              </Button>
            </div>
          </Card>
        )}
        {recentWins.length > 0 && (
          <div className="space-y-1">
            {recentWins.slice(0, 3).map((win) => (
              <div key={win.id} className="flex items-start gap-2 text-sm">
                <span className="text-amber-400 mt-0.5">·</span>
                <span className="text-slate-400">{win.text}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Upcoming deadlines */}
      {deadlines.length > 0 && (
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Upcoming
            </h2>
          </div>
          {deadlines.slice(0, 5).map((item) => (
            <div key={`${item.type}-${item.id}`} className="flex items-center justify-between text-sm px-1">
              <span className="text-slate-400 truncate flex-1">{item.title}</span>
              <span className="text-[10px] text-slate-500 flex-shrink-0 ml-2">
                {item.dueDate || item.deadline}
              </span>
            </div>
          ))}
        </section>
      )}

      {/* Empty state */}
      {habits.length === 0 && mits.length === 0 && (
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
