"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Flame, Clock, Trash2, Pencil, Heart, Gift, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteHabit, updateHabit } from "@/app/actions";
import { cn } from "@/lib/utils";
import { impactLabel } from "@/lib/analysis";
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
    whyItMatters: string | null;
    impactLevel: number;
    milestoneReward: string | null;
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

const STREAK_MILESTONES = [7, 14, 30, 60, 100];

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

  const [isEditing, setIsEditing] = useState(false);
  const [edit, setEdit] = useState({
    title: habit.title,
    whyItMatters: habit.whyItMatters ?? "",
    impactLevel: habit.impactLevel ?? 3,
    milestoneReward: habit.milestoneReward ?? "",
    tinyVersion: habit.tinyVersion ?? "",
    substitutionPlan: habit.substitutionPlan ?? "",
  });

  const nextMilestone = STREAK_MILESTONES.find((m) => m > streak.currentStreak);
  const daysToMilestone = nextMilestone ? nextMilestone - streak.currentStreak : null;

  function handleDelete() {
    if (!confirm("Archive this habit? It won't appear on Today anymore.")) return;
    startTransition(async () => {
      await deleteHabit(habit.id);
      router.push("/habits");
    });
  }

  function handleSaveEdit() {
    if (!edit.title.trim()) return;
    startTransition(async () => {
      await updateHabit(habit.id, {
        title: edit.title.trim(),
        whyItMatters: edit.whyItMatters.trim() || null,
        impactLevel: edit.impactLevel,
        milestoneReward: edit.milestoneReward.trim() || null,
        tinyVersion: isBuild ? edit.tinyVersion.trim() || null : undefined,
        substitutionPlan: !isBuild ? edit.substitutionPlan.trim() || null : undefined,
      });
      setIsEditing(false);
      router.refresh();
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
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-slate-500 hover:text-slate-300 touch-manipulation"
            title="Edit habit"
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}
      </header>

      {/* Inline editor */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Edit habit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Name</Label>
              <Input
                id="edit-title"
                value={edit.title}
                onChange={(e) => setEdit({ ...edit, title: e.target.value })}
                autoFocus
              />
            </div>
            {isBuild && (
              <div className="space-y-2">
                <Label htmlFor="edit-tiny">Tiny version</Label>
                <Input
                  id="edit-tiny"
                  value={edit.tinyVersion}
                  onChange={(e) => setEdit({ ...edit, tinyVersion: e.target.value })}
                  placeholder="The minimum that still counts"
                />
              </div>
            )}
            {!isBuild && (
              <div className="space-y-2">
                <Label htmlFor="edit-sub">Substitution plan</Label>
                <Textarea
                  id="edit-sub"
                  value={edit.substitutionPlan}
                  onChange={(e) => setEdit({ ...edit, substitutionPlan: e.target.value })}
                  placeholder="When the urge hits, I will..."
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-why">Why it matters</Label>
              <Textarea
                id="edit-why"
                value={edit.whyItMatters}
                onChange={(e) => setEdit({ ...edit, whyItMatters: e.target.value })}
                placeholder="Your deeper reason for this habit"
              />
            </div>
            <div className="space-y-2">
              <Label>Impact on your life</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setEdit({ ...edit, impactLevel: lvl })}
                    className={cn(
                      "flex-1 rounded-lg border-2 py-2 text-xs font-medium transition-colors",
                      edit.impactLevel === lvl
                        ? "border-indigo-500 bg-indigo-950/30 text-indigo-300"
                        : "border-slate-700 text-slate-500 hover:border-slate-600"
                    )}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500">{impactLabel(edit.impactLevel)}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-reward">Milestone reward</Label>
              <Input
                id="edit-reward"
                value={edit.milestoneReward}
                onChange={(e) => setEdit({ ...edit, milestoneReward: e.target.value })}
                placeholder="e.g. New gear at a 30-day streak"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveEdit} disabled={!edit.title.trim() || isPending} className="flex-1">
                Save
              </Button>
              <Button variant="ghost" onClick={() => setIsEditing(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Milestone reward progress */}
      {!isEditing && habit.milestoneReward && nextMilestone && (
        <Card className="border-rose-500/20 bg-rose-950/10">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Gift className="h-5 w-5 text-rose-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-rose-300">
                  {habit.milestoneReward}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {daysToMilestone === 0
                    ? `You've hit ${nextMilestone} days — claim your reward!`
                    : `${daysToMilestone} day${daysToMilestone === 1 ? "" : "s"} of streak to go until your ${nextMilestone}-day reward.`}
                </p>
                <div className="mt-2 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-rose-500 transition-all"
                    style={{
                      width: `${Math.min((streak.currentStreak / nextMilestone) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
          {habit.whyItMatters && (
            <p className="flex items-start gap-1.5">
              <Heart className="h-3.5 w-3.5 text-rose-400 mt-0.5 flex-shrink-0" />
              <span>
                <span className="text-slate-500">Why:</span> {habit.whyItMatters}
              </span>
            </p>
          )}
          <p className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-slate-500">Impact:</span>{" "}
            {impactLabel(habit.impactLevel)}
          </p>
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
