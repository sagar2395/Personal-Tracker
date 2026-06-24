"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { logHabit } from "@/app/actions";
import { Check, Minus, Flame, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StreakResult } from "@/lib/streaks";
import Link from "next/link";

interface HabitCardProps {
  data: {
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
  };
}

export function HabitCard({ data }: HabitCardProps) {
  const { habit, todayLog, streak, area } = data;
  const [isPending, startTransition] = useTransition();
  const [showTimeInput, setShowTimeInput] = useState(false);
  const [timeValue, setTimeValue] = useState("");

  const isLogged = !!todayLog;
  const isBuild = habit.type === "build";
  const needsRecovery = streak.missedTwice && !isLogged;
  const isGraceUsed =
    streak.graceDaysRemaining < (1) && streak.currentStreak > 0 && !isLogged;

  function handleLog(status: "done" | "partial" | "skipped" | "missed" | "clean" | "under_budget" | "over_budget" | "slip", value?: number) {
    startTransition(async () => {
      await logHabit(habit.id, status, value);
      setShowTimeInput(false);
      setTimeValue("");
    });
  }

  function handleTimeSubmit() {
    const mins = parseInt(timeValue, 10);
    if (isNaN(mins) || mins < 0) return;
    const budget = habit.dailyBudgetMins ?? 0;
    if (budget === 0) {
      handleLog(mins === 0 ? "clean" : "slip", mins);
    } else {
      handleLog(mins <= budget ? "under_budget" : "over_budget", mins);
    }
  }

  const logStatus = todayLog?.status;
  const isPositiveLog =
    logStatus === "done" ||
    logStatus === "partial" ||
    logStatus === "clean" ||
    logStatus === "under_budget";

  return (
    <Card
      className={cn(
        "relative transition-all",
        isLogged && isPositiveLog && "border-emerald-800/50",
        needsRecovery && !isLogged && "border-amber-700/50 bg-amber-950/10"
      )}
    >
      <Link href={`/habits/${habit.id}`} className="block">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-sm truncate">{habit.title}</h3>
              <Badge variant={isBuild ? "build" : "limit"} className="text-[10px]">
                {isBuild ? "Build" : "Limit"}
              </Badge>
            </div>

            {area && (
              <div className="flex items-center gap-1.5 mb-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: area.color }}
                />
                <span className="text-xs text-slate-500">{area.name}</span>
              </div>
            )}

            {isBuild && habit.anchor && !isLogged && (
              <p className="text-xs text-slate-500 italic">{habit.anchor}</p>
            )}

            {!isBuild && habit.substitutionPlan && !isLogged && (
              <p className="text-xs text-amber-400/80 mt-1">
                {habit.substitutionPlan}
              </p>
            )}

            {!isBuild && habit.dailyBudgetMins !== null && (
              <div className="flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3 text-slate-500" />
                <span className="text-xs text-slate-500">
                  Budget: {habit.dailyBudgetMins === 0
                    ? "Quit entirely"
                    : `${habit.dailyBudgetMins} min/day`}
                  {todayLog?.value !== null && todayLog?.value !== undefined &&
                    ` · Today: ${todayLog.value} min`}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {streak.currentStreak > 0 && (
              <Badge
                variant="streak"
                className={cn(
                  "gap-1",
                  isGraceUsed && "border-amber-700 text-amber-400"
                )}
              >
                <Flame className="h-3 w-3" />
                {streak.currentStreak}
              </Badge>
            )}
          </div>
        </div>
      </Link>

      {needsRecovery && (
        <div className="mt-2 px-2 py-1.5 rounded-md bg-amber-950/30 border border-amber-800/30">
          <p className="text-xs text-amber-300">
            {isBuild
              ? `Get back on — even the tiny version counts${habit.tinyVersion ? `: "${habit.tinyVersion}"` : ""}`
              : `Fresh start today. Remember your plan: ${habit.substitutionPlan || "stay under budget"}`}
          </p>
        </div>
      )}

      {isGraceUsed && !needsRecovery && !isLogged && (
        <p className="mt-2 text-xs text-amber-400/70">
          Grace day used — your streak is safe. Get back tomorrow.
        </p>
      )}

      {isLogged && (
        <div className="mt-3 flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-400" />
          <span className="text-xs text-emerald-400">
            {logStatus === "done" && "Done!"}
            {logStatus === "partial" && "Tiny version — still counts!"}
            {logStatus === "skipped" && "Skipped"}
            {logStatus === "clean" && "Clean day!"}
            {logStatus === "under_budget" && `Under budget (${todayLog?.value} min)`}
            {logStatus === "over_budget" && (
              <span className="text-amber-400">
                Over budget ({todayLog?.value} min) — tomorrow&apos;s a fresh start
              </span>
            )}
            {logStatus === "slip" && (
              <span className="text-slate-400">
                Logged — tomorrow&apos;s a fresh start
              </span>
            )}
          </span>
        </div>
      )}

      {!isLogged && (
        <div className="mt-3 flex flex-wrap gap-2" onClick={(e) => e.preventDefault()}>
          {isBuild ? (
            <>
              <Button
                size="sm"
                variant="success"
                onClick={() => handleLog("done")}
                disabled={isPending}
              >
                <Check className="h-4 w-4 mr-1" />
                Done
              </Button>
              {habit.tinyVersion && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleLog("partial")}
                  disabled={isPending}
                  title={habit.tinyVersion}
                >
                  Tiny: {habit.tinyVersion.length > 15
                    ? habit.tinyVersion.slice(0, 15) + "…"
                    : habit.tinyVersion}
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleLog("skipped")}
                disabled={isPending}
              >
                <Minus className="h-4 w-4 mr-1" />
                Skip
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="success"
                onClick={() => handleLog("clean", 0)}
                disabled={isPending}
              >
                <Check className="h-4 w-4 mr-1" />
                Clean today
              </Button>
              {!showTimeInput ? (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowTimeInput(true)}
                  disabled={isPending}
                >
                  <Clock className="h-4 w-4 mr-1" />
                  Log time
                </Button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Input
                    type="number"
                    min="0"
                    placeholder="min"
                    value={timeValue}
                    onChange={(e) => setTimeValue(e.target.value)}
                    className="w-20 h-8 text-sm"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={handleTimeSubmit}
                    disabled={isPending || !timeValue}
                  >
                    Log
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Card>
  );
}
