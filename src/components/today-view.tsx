"use client";

import { useState, useTransition, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HabitCard } from "./habit-card";
import {
  updateTaskStatus,
  captureWin,
  saveWhyStatement,
} from "@/app/actions";
import {
  Star,
  CheckCircle2,
  Circle,
  Trophy,
  Calendar,
  Plus,
  Flame,
  Quote,
  Heart,
  Pencil,
  Award,
  Sparkles,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { StreakResult } from "@/lib/streaks";
import { cn } from "@/lib/utils";
import { getAchievementDef, TIER_COLORS } from "@/lib/achievements";

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

interface AppStreak {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  lastUsedDate: string | null;
}

interface UnlockedAchievement {
  id: number;
  key: string;
  unlockedAt: string;
}

interface TodayViewProps {
  habits: HabitWithContext[];
  mits?: MITTask[];
  deadlines?: Deadline[];
  recentWins?: Win[];
  appStreak?: AppStreak | null;
  whyStatement?: string | null;
  dailyQuote?: string;
  welcomeBack?: string | null;
  unlockedAchievements?: UnlockedAchievement[];
  newlyUnlocked?: string[];
}

export function TodayView({
  habits,
  mits = [],
  deadlines = [],
  recentWins = [],
  appStreak,
  whyStatement,
  dailyQuote,
  welcomeBack,
  unlockedAchievements = [],
  newlyUnlocked = [],
}: TodayViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [winText, setWinText] = useState("");
  const [showWinInput, setShowWinInput] = useState(false);
  const [showWhyEditor, setShowWhyEditor] = useState(false);
  const [whyText, setWhyText] = useState(whyStatement || "");
  const [showNewBadge, setShowNewBadge] = useState(newlyUnlocked.length > 0);

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

  function handleWhySave() {
    if (!whyText.trim()) return;
    startTransition(async () => {
      await saveWhyStatement(whyText.trim());
      setShowWhyEditor(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Welcome back message */}
      {welcomeBack && (
        <Card className="p-4 border-indigo-500/30 bg-indigo-950/20">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-indigo-400 flex-shrink-0" />
            <p className="text-sm text-indigo-300">{welcomeBack}</p>
          </div>
        </Card>
      )}

      {/* New achievement notification */}
      {showNewBadge && newlyUnlocked.length > 0 && (
        <Card className="p-4 border-yellow-500/30 bg-yellow-950/20 relative">
          <button
            onClick={() => setShowNewBadge(false)}
            className="absolute top-2 right-2 text-slate-500 hover:text-slate-400"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3">
            <Award className="h-6 w-6 text-yellow-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-300">
                Achievement unlocked!
              </p>
              {newlyUnlocked.map((key) => {
                const def = getAchievementDef(key);
                return def ? (
                  <p key={key} className="text-xs text-yellow-400/70 mt-0.5">
                    {def.title} — {def.description}
                  </p>
                ) : null;
              })}
            </div>
          </div>
        </Card>
      )}

      {/* App streak + momentum row */}
      <div className="flex gap-3">
        {/* App usage streak */}
        {appStreak && appStreak.totalDays > 0 && (
          <Card className="flex items-center gap-3 p-4 flex-1">
            <div className="flex items-center gap-2">
              <Flame className={cn(
                "h-6 w-6",
                appStreak.currentStreak >= 7 ? "text-orange-400" :
                appStreak.currentStreak >= 3 ? "text-amber-400" :
                "text-slate-500"
              )} />
              <div>
                <p className="text-lg font-bold leading-none">
                  {appStreak.currentStreak}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">day streak</p>
              </div>
            </div>
            {appStreak.longestStreak > appStreak.currentStreak && (
              <p className="text-[10px] text-slate-600 ml-auto">
                best: {appStreak.longestStreak}
              </p>
            )}
          </Card>
        )}

        {/* Momentum ring */}
        {totalItems > 0 && (
          <Card className="flex items-center gap-3 p-4 flex-1">
            <div className="relative h-12 w-12 flex-shrink-0">
              <svg className="h-12 w-12 -rotate-90" viewBox="0 0 36 36">
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
              <p className="text-xs font-medium">Momentum</p>
              <p className="text-[10px] text-slate-500">
                {completedHabits}/{habits.length} habits · {completedMITs}/{mits.length} MITs
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Daily quote */}
      {dailyQuote && (
        <div className="flex items-start gap-2 px-1">
          <Quote className="h-3.5 w-3.5 text-slate-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-500 italic leading-relaxed">{dailyQuote}</p>
        </div>
      )}

      {/* Why statement */}
      {(whyStatement || !whyStatement) && (
        <section>
          {whyStatement && !showWhyEditor ? (
            <Card className="p-4 border-rose-500/20 bg-rose-950/10">
              <div className="flex items-start gap-3">
                <Heart className="h-4 w-4 text-rose-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-slate-500 mb-1">My Why</p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {whyStatement}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setWhyText(whyStatement);
                    setShowWhyEditor(true);
                  }}
                  className="text-slate-600 hover:text-slate-400"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            </Card>
          ) : !whyStatement && !showWhyEditor ? (
            <Card className="p-4 border-dashed border-slate-700">
              <button
                onClick={() => setShowWhyEditor(true)}
                className="flex items-center gap-2 w-full text-left"
              >
                <Heart className="h-4 w-4 text-slate-600" />
                <div>
                  <p className="text-sm text-slate-400">Set your &quot;Why&quot;</p>
                  <p className="text-xs text-slate-600">
                    Why are you tracking? A personal reminder keeps you going.
                  </p>
                </div>
              </button>
            </Card>
          ) : null}
          {showWhyEditor && (
            <Card className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-400" />
                <p className="text-sm font-medium">Your Why</p>
              </div>
              <Input
                value={whyText}
                onChange={(e) => setWhyText(e.target.value)}
                placeholder="I'm doing this because..."
                autoFocus
              />
              <p className="text-[10px] text-slate-600">
                This will show on your home screen as a daily reminder.
              </p>
              <div className="flex gap-2">
                <Button onClick={handleWhySave} disabled={!whyText.trim() || isPending} className="flex-1">
                  Save
                </Button>
                <Button variant="ghost" onClick={() => setShowWhyEditor(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </Card>
          )}
        </section>
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
                  className="touch-manipulation active:scale-90 transition-transform duration-150"
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

      {/* Achievements preview */}
      {unlockedAchievements.length > 0 && (
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Achievements
              </h2>
              <span className="text-xs text-slate-600">{unlockedAchievements.length} unlocked</span>
            </div>
            <a
              href="/achievements"
              className="text-xs text-indigo-400 hover:text-indigo-300"
            >
              View all →
            </a>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {unlockedAchievements.slice(0, 5).map((a) => {
              const def = getAchievementDef(a.key);
              if (!def) return null;
              const colors = TIER_COLORS[def.tier];
              return (
                <div
                  key={a.id}
                  className={cn(
                    "flex-shrink-0 rounded-lg border px-3 py-2 text-center min-w-[80px]",
                    colors.bg,
                    colors.border
                  )}
                >
                  <p className={cn("text-xs font-medium", colors.text)}>
                    {def.title}
                  </p>
                  <p className="text-[9px] text-slate-500 mt-0.5">{def.tier}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

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
