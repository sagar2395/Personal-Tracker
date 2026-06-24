"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { saveReview, toggleAreaSeason } from "@/app/actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Trophy, Target, Timer, BarChart3 } from "lucide-react";

interface Win {
  id: number;
  text: string;
  date: string;
}

interface CompletedTask {
  id: number;
  title: string;
}

interface HabitSummary {
  habit: { id: number; title: string; dailyBudgetMins: number | null };
  area: { name: string; color: string } | null | undefined;
  type: "build" | "limit";
  summary: string;
  goodDays?: number;
  cleanDays?: number;
  avgUsage?: number;
  budget?: number;
}

interface Area {
  id: number;
  name: string;
  color: string;
  isSeason: boolean;
  targetWeeklyHours: number;
}

interface ExistingReview {
  focusAreas: string | null;
  tomorrowMITs: string | null;
  notes: string | null;
}

interface WeeklyReviewProps {
  weekWins: Win[];
  completedTasks: CompletedTask[];
  habitSummaries: HabitSummary[];
  areas: Area[];
  existingReview?: ExistingReview | null;
  date: string;
}

export function WeeklyReview({
  weekWins,
  completedTasks,
  habitSummaries,
  areas,
  existingReview,
  date,
}: WeeklyReviewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(0);
  const [focusAreas, setFocusAreas] = useState(
    existingReview?.focusAreas ?? ""
  );
  const [mondayMITs, setMondayMITs] = useState(
    existingReview?.tomorrowMITs ?? ""
  );
  const [notes, setNotes] = useState(existingReview?.notes ?? "");
  const [saved, setSaved] = useState(false);

  const buildHabits = habitSummaries.filter((h) => h.type === "build");
  const limitHabits = habitSummaries.filter((h) => h.type === "limit");
  const totalHabitDays = buildHabits.reduce(
    (sum, h) => sum + (h.goodDays ?? 0),
    0
  );
  const totalPossible = buildHabits.length * 7;
  const consistencyPercent =
    totalPossible > 0 ? Math.round((totalHabitDays / totalPossible) * 100) : 0;

  function handleToggleSeason(areaId: number) {
    startTransition(async () => {
      await toggleAreaSeason(areaId);
      router.refresh();
    });
  }

  function handleSubmit() {
    startTransition(async () => {
      const winsRecap = [
        ...weekWins.map((w) => w.text),
        ...completedTasks.map((t) => `Completed: ${t.title}`),
      ].join("\n");

      const habitRecap = habitSummaries
        .map((h) => `${h.habit.title}: ${h.summary}`)
        .join("\n");

      const result = await saveReview({
        type: "weekly",
        date,
        winsText: winsRecap || undefined,
        challengesText: habitRecap || undefined,
        focusAreas: focusAreas || undefined,
        tomorrowMITs: mondayMITs || undefined,
        notes: notes || undefined,
      });
      if (result.success) {
        setSaved(true);
      }
    });
  }

  if (saved) {
    return (
      <Card className="p-6 text-center">
        <p className="text-lg font-medium mb-1">Review complete</p>
        <p className="text-sm text-slate-400">Have a great week ahead.</p>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => router.push("/")}
        >
          Back to Today
        </Button>
      </Card>
    );
  }

  const steps = [
    {
      title: "Your wins this week",
      icon: Trophy,
      content: (
        <div className="space-y-4">
          {consistencyPercent > 0 && (
            <Card className="p-4 bg-emerald-500/10 border-emerald-500/20">
              <p className="text-sm font-medium text-emerald-400">
                You completed {consistencyPercent}% of planned habits —
                {consistencyPercent >= 80
                  ? " strong week!"
                  : consistencyPercent >= 50
                    ? " solid effort!"
                    : " every bit counts!"}
              </p>
            </Card>
          )}

          {weekWins.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs text-slate-500 uppercase">Captured wins</p>
              {weekWins.map((win) => (
                <div key={win.id} className="flex items-start gap-2 text-sm">
                  <span className="text-amber-400 mt-0.5">·</span>
                  <span className="text-slate-300">{win.text}</span>
                </div>
              ))}
            </div>
          )}

          {completedTasks.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs text-slate-500 uppercase">
                Tasks completed ({completedTasks.length})
              </p>
              {completedTasks.slice(0, 10).map((task) => (
                <div key={task.id} className="flex items-center gap-2 text-sm">
                  <span className="text-emerald-500">✓</span>
                  <span className="text-slate-400">{task.title}</span>
                </div>
              ))}
              {completedTasks.length > 10 && (
                <p className="text-xs text-slate-600">
                  +{completedTasks.length - 10} more
                </p>
              )}
            </div>
          )}

          {weekWins.length === 0 && completedTasks.length === 0 && (
            <p className="text-sm text-slate-500">
              No wins or completed tasks captured this week. That&apos;s okay —
              some weeks are about laying groundwork.
            </p>
          )}
        </div>
      ),
    },
    {
      title: "Habit consistency",
      icon: Target,
      content: (
        <div className="space-y-4">
          {buildHabits.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 uppercase">Build habits</p>
              {buildHabits.map((h) => {
                const pct =
                  h.goodDays !== undefined
                    ? Math.round((h.goodDays / 7) * 100)
                    : 0;
                return (
                  <Card key={h.habit.id} className="p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium">
                        {h.habit.title}
                      </span>
                      <span className="text-xs text-slate-400">
                        {h.summary}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          pct >= 80
                            ? "bg-emerald-500"
                            : pct >= 50
                              ? "bg-amber-400"
                              : "bg-slate-500"
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {(h.goodDays ?? 0) < 4 && (
                      <p className="text-xs text-slate-500 mt-1.5">
                        This had a tough week — what got in the way?
                      </p>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          {limitHabits.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 uppercase">Limit habits</p>
              {limitHabits.map((h) => {
                const underBudget =
                  h.budget && h.avgUsage !== undefined
                    ? h.avgUsage <= h.budget
                    : true;
                return (
                  <Card key={h.habit.id} className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">
                        {h.habit.title}
                      </span>
                      <Badge variant={underBudget ? "build" : "limit"}>
                        {underBudget ? "Under budget" : "Over budget"}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400">{h.summary}</p>
                  </Card>
                );
              })}
            </div>
          )}

          {habitSummaries.length === 0 && (
            <p className="text-sm text-slate-500">
              No active habits to review.
            </p>
          )}
        </div>
      ),
    },
    {
      title: "Area balance",
      icon: BarChart3,
      content: (
        <div className="space-y-2">
          {areas.map((area) => (
            <Card key={area.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: area.color }}
                  />
                  <span
                    className={cn(
                      "text-sm font-medium",
                      !area.isSeason && "text-slate-500"
                    )}
                  >
                    {area.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {area.targetWeeklyHours > 0 && (
                    <span className="text-xs text-slate-500">
                      {area.targetWeeklyHours}h/wk
                    </span>
                  )}
                  <button
                    onClick={() => handleToggleSeason(area.id)}
                    disabled={isPending}
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full transition-colors",
                      area.isSeason
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-slate-800 text-slate-500 hover:text-slate-400"
                    )}
                  >
                    {area.isSeason ? "Active" : "Off-season"}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ),
    },
    {
      title: "Next week's focus",
      icon: Timer,
      content: (
        <div className="space-y-4">
          <section className="space-y-2">
            <p className="text-sm text-slate-300">
              Pick 1-2 focus areas for the coming week
            </p>
            <Textarea
              value={focusAreas}
              onChange={(e) => setFocusAreas(e.target.value)}
              placeholder="e.g., Health — get back to morning workouts, Snowops — finish MVP..."
              rows={3}
            />
          </section>

          <section className="space-y-2">
            <p className="text-sm text-slate-300">MITs for Monday</p>
            <Textarea
              value={mondayMITs}
              onChange={(e) => setMondayMITs(e.target.value)}
              placeholder="What are the top priorities to kick off the week?"
              rows={3}
            />
          </section>

          <section className="space-y-2">
            <p className="text-sm text-slate-300">Any other notes?</p>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reflections, adjustments, gratitude..."
              rows={3}
            />
          </section>
        </div>
      ),
    },
  ];

  const currentStep = steps[step];
  const StepIcon = currentStep.icon;

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex gap-1">
        {steps.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i <= step ? "bg-indigo-500" : "bg-slate-800"
            )}
          />
        ))}
      </div>

      {/* Step header */}
      <div className="flex items-center gap-2">
        <StepIcon className="h-5 w-5 text-indigo-400" />
        <h2 className="text-lg font-semibold">{currentStep.title}</h2>
        <span className="text-xs text-slate-500 ml-auto">
          {step + 1} of {steps.length}
        </span>
      </div>

      {/* Step content */}
      {currentStep.content}

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 0 && (
          <Button
            variant="ghost"
            onClick={() => setStep(step - 1)}
            className="flex-1"
          >
            Back
          </Button>
        )}
        {step < steps.length - 1 ? (
          <Button onClick={() => setStep(step + 1)} className="flex-1">
            Continue
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="flex-1"
          >
            {isPending ? "Saving..." : "Complete review"}
          </Button>
        )}
      </div>
    </div>
  );
}
