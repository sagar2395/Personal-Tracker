"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { createHabit } from "@/app/actions";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

interface Area {
  id: number;
  name: string;
  color: string;
}

interface HabitFormProps {
  areas: Area[];
}

type HabitType = "build" | "limit";

interface FormData {
  type: HabitType;
  title: string;
  areaId: number;
  tinyVersion: string;
  anchor: string;
  cadence: "daily" | "weekdays" | "x-per-week" | "custom";
  cadenceDays: string[];
  reminderTime: string;
  graceDaysAllowed: number;
  dailyBudgetMins: number;
  substitutionPlan: string;
  peakTemptationTime: string;
}

const STEPS_BUILD = ["Type", "What", "Tiny version", "When", "Grace"];
const STEPS_LIMIT = ["Type", "What", "Boundaries", "Substitution", "Temptation", "Grace"];

export function HabitForm({ areas }: HabitFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>({
    type: "build",
    title: "",
    areaId: areas[0]?.id || 0,
    tinyVersion: "",
    anchor: "",
    cadence: "daily",
    cadenceDays: [],
    reminderTime: "07:00",
    graceDaysAllowed: 1,
    dailyBudgetMins: 15,
    substitutionPlan: "",
    peakTemptationTime: "22:00",
  });

  const steps = form.type === "build" ? STEPS_BUILD : STEPS_LIMIT;
  const totalSteps = steps.length;
  const isLastStep = step === totalSteps - 1;

  function update(field: keyof FormData, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function next() {
    if (isLastStep) {
      submit();
    } else {
      setStep((s) => Math.min(s + 1, totalSteps - 1));
    }
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function submit() {
    startTransition(async () => {
      await createHabit({
        title: form.title,
        type: form.type,
        areaId: form.areaId,
        cadence: form.cadence,
        cadenceDays: form.cadence === "custom" ? form.cadenceDays : undefined,
        tinyVersion: form.type === "build" ? form.tinyVersion : undefined,
        anchor: form.anchor || undefined,
        reminderTime: form.reminderTime || undefined,
        graceDaysAllowed: form.graceDaysAllowed,
        dailyBudgetMins: form.type === "limit" ? form.dailyBudgetMins : undefined,
        peakTemptationTime: form.type === "limit" ? form.peakTemptationTime : undefined,
        substitutionPlan: form.type === "limit" ? form.substitutionPlan : undefined,
      });
      router.push("/habits");
    });
  }

  const canProceed = (() => {
    if (step === 0) return true;
    if (step === 1) return form.title.trim().length > 0;
    if (form.type === "build") {
      if (step === 2) return form.tinyVersion.trim().length > 0;
      return true;
    } else {
      if (step === 2) return true;
      if (step === 3) return form.substitutionPlan.trim().length > 0;
      return true;
    }
  })();

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <button
          onClick={() => (step === 0 ? router.back() : back())}
          className="text-slate-400 hover:text-slate-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">New habit</h1>
          <p className="text-xs text-slate-500">
            Step {step + 1} of {totalSteps} — {steps[step]}
          </p>
        </div>
      </header>

      <div className="flex gap-1">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= step ? "bg-indigo-500" : "bg-slate-800"
            }`}
          />
        ))}
      </div>

      <Card>
        <CardContent className="pt-4">
          {/* Step 0: Type */}
          {step === 0 && (
            <div className="space-y-4">
              <CardTitle className="text-lg">What kind of habit?</CardTitle>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { update("type", "build"); setStep(0); }}
                  className={`rounded-xl border-2 p-4 text-left transition-colors ${
                    form.type === "build"
                      ? "border-emerald-500 bg-emerald-950/20"
                      : "border-slate-700 hover:border-slate-600"
                  }`}
                >
                  <p className="font-semibold text-emerald-400">Build</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Something you want to do regularly
                  </p>
                </button>
                <button
                  onClick={() => { update("type", "limit"); setStep(0); }}
                  className={`rounded-xl border-2 p-4 text-left transition-colors ${
                    form.type === "limit"
                      ? "border-amber-500 bg-amber-950/20"
                      : "border-slate-700 hover:border-slate-600"
                  }`}
                >
                  <p className="font-semibold text-amber-400">Limit</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Something you want to reduce or quit
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Title + Area */}
          {step === 1 && (
            <div className="space-y-4">
              <CardTitle className="text-lg">
                {form.type === "build"
                  ? "What habit do you want to build?"
                  : "What do you want to limit?"}
              </CardTitle>
              <div className="space-y-2">
                <Label htmlFor="title">Habit name</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder={
                    form.type === "build"
                      ? "e.g. Morning workout"
                      : "e.g. Instagram scrolling"
                  }
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">Life area</Label>
                <Select
                  id="area"
                  value={form.areaId}
                  onChange={(e) => update("areaId", parseInt(e.target.value, 10))}
                >
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          )}

          {/* Build Step 2: Tiny version */}
          {form.type === "build" && step === 2 && (
            <div className="space-y-4">
              <CardTitle className="text-lg">
                What&apos;s the tiny version?
              </CardTitle>
              <p className="text-sm text-slate-400">
                The absolute minimum that still counts. On tough days, doing just
                this keeps your streak alive.
              </p>
              <div className="space-y-2">
                <Label htmlFor="tiny">Tiny version</Label>
                <Input
                  id="tiny"
                  value={form.tinyVersion}
                  onChange={(e) => update("tinyVersion", e.target.value)}
                  placeholder="e.g. Do 1 pushup"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="anchor">Anchor (optional)</Label>
                <Input
                  id="anchor"
                  value={form.anchor}
                  onChange={(e) => update("anchor", e.target.value)}
                  placeholder="e.g. After I brush my teeth"
                />
                <p className="text-xs text-slate-500">
                  &quot;After I [existing routine], I will [this habit]&quot;
                </p>
              </div>
            </div>
          )}

          {/* Build Step 3: Cadence + reminder */}
          {form.type === "build" && step === 3 && (
            <div className="space-y-4">
              <CardTitle className="text-lg">When will you do it?</CardTitle>
              <div className="space-y-2">
                <Label htmlFor="cadence">Frequency</Label>
                <Select
                  id="cadence"
                  value={form.cadence}
                  onChange={(e) => update("cadence", e.target.value)}
                >
                  <option value="daily">Every day</option>
                  <option value="weekdays">Weekdays only</option>
                  <option value="custom">Specific days</option>
                </Select>
              </div>
              {form.cadence === "custom" && (
                <div className="flex flex-wrap gap-2">
                  {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map(
                    (day) => (
                      <button
                        key={day}
                        onClick={() => {
                          const days = form.cadenceDays.includes(day)
                            ? form.cadenceDays.filter((d) => d !== day)
                            : [...form.cadenceDays, day];
                          update("cadenceDays", days);
                        }}
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                          form.cadenceDays.includes(day)
                            ? "bg-indigo-500 text-white"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </button>
                    )
                  )}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="reminder">Reminder time</Label>
                <Input
                  id="reminder"
                  type="time"
                  value={form.reminderTime}
                  onChange={(e) => update("reminderTime", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Build Step 4 / Grace */}
          {form.type === "build" && step === 4 && (
            <div className="space-y-4">
              <CardTitle className="text-lg">Forgiveness settings</CardTitle>
              <p className="text-sm text-slate-400">
                Grace days let you miss without breaking your streak. Missing once
                is normal — the goal is to never miss twice.
              </p>
              <div className="space-y-2">
                <Label htmlFor="grace">Grace days allowed</Label>
                <Select
                  id="grace"
                  value={form.graceDaysAllowed}
                  onChange={(e) =>
                    update("graceDaysAllowed", parseInt(e.target.value, 10))
                  }
                >
                  <option value={0}>0 (strict)</option>
                  <option value={1}>1 day (recommended)</option>
                  <option value={2}>2 days</option>
                </Select>
              </div>

              <Card className="border-slate-700 bg-slate-800/50 p-3">
                <p className="text-sm font-medium">Summary</p>
                <ul className="mt-2 space-y-1 text-xs text-slate-400">
                  <li>Habit: {form.title}</li>
                  <li>Tiny version: {form.tinyVersion}</li>
                  {form.anchor && <li>Anchor: {form.anchor}</li>}
                  <li>Cadence: {form.cadence}</li>
                  <li>Grace: {form.graceDaysAllowed} day(s)</li>
                </ul>
              </Card>
            </div>
          )}

          {/* Limit Step 2: Boundaries */}
          {form.type === "limit" && step === 2 && (
            <div className="space-y-4">
              <CardTitle className="text-lg">Set your boundaries</CardTitle>
              <p className="text-sm text-slate-400">
                How much is acceptable per day? Set to 0 to quit entirely.
              </p>
              <div className="space-y-2">
                <Label htmlFor="budget">
                  Daily budget (minutes): {form.dailyBudgetMins}
                </Label>
                <input
                  id="budget"
                  type="range"
                  min={0}
                  max={120}
                  step={5}
                  value={form.dailyBudgetMins}
                  onChange={(e) =>
                    update("dailyBudgetMins", parseInt(e.target.value, 10))
                  }
                  className="w-full accent-amber-500"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Quit entirely</span>
                  <span>120 min</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cadence">Tracking frequency</Label>
                <Select
                  id="cadence"
                  value={form.cadence}
                  onChange={(e) => update("cadence", e.target.value)}
                >
                  <option value="daily">Every day</option>
                  <option value="weekdays">Weekdays only</option>
                  <option value="custom">Specific days</option>
                </Select>
              </div>
            </div>
          )}

          {/* Limit Step 3: Substitution */}
          {form.type === "limit" && step === 3 && (
            <div className="space-y-4">
              <CardTitle className="text-lg">
                What&apos;s your substitution plan?
              </CardTitle>
              <p className="text-sm text-slate-400">
                When the urge hits, having a pre-decided alternative reduces
                reliance on willpower.
              </p>
              <div className="space-y-2">
                <Label htmlFor="substitution">
                  When I want to {form.title.toLowerCase() || "..."}, I will...
                </Label>
                <Textarea
                  id="substitution"
                  value={form.substitutionPlan}
                  onChange={(e) => update("substitutionPlan", e.target.value)}
                  placeholder="e.g. open Kindle and read for 10 minutes instead"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Limit Step 4: Peak temptation */}
          {form.type === "limit" && step === 4 && (
            <div className="space-y-4">
              <CardTitle className="text-lg">
                When is temptation strongest?
              </CardTitle>
              <p className="text-sm text-slate-400">
                We&apos;ll send a nudge 30 minutes before with your substitution
                plan, so you enter the danger zone prepared.
              </p>
              <div className="space-y-2">
                <Label htmlFor="peak">Peak temptation time</Label>
                <Input
                  id="peak"
                  type="time"
                  value={form.peakTemptationTime}
                  onChange={(e) => update("peakTemptationTime", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Limit Step 5: Grace */}
          {form.type === "limit" && step === 5 && (
            <div className="space-y-4">
              <CardTitle className="text-lg">Forgiveness settings</CardTitle>
              <p className="text-sm text-slate-400">
                Grace days let you go over budget without breaking your streak.
                Everyone slips — the goal is recovery.
              </p>
              <div className="space-y-2">
                <Label htmlFor="grace">Grace days allowed</Label>
                <Select
                  id="grace"
                  value={form.graceDaysAllowed}
                  onChange={(e) =>
                    update("graceDaysAllowed", parseInt(e.target.value, 10))
                  }
                >
                  <option value={0}>0 (strict)</option>
                  <option value={1}>1 day (recommended)</option>
                  <option value={2}>2 days</option>
                </Select>
              </div>

              <Card className="border-slate-700 bg-slate-800/50 p-3">
                <p className="text-sm font-medium">Summary</p>
                <ul className="mt-2 space-y-1 text-xs text-slate-400">
                  <li>Limit: {form.title}</li>
                  <li>
                    Budget:{" "}
                    {form.dailyBudgetMins === 0
                      ? "Quit entirely"
                      : `${form.dailyBudgetMins} min/day`}
                  </li>
                  <li>Plan: {form.substitutionPlan}</li>
                  <li>Peak time: {form.peakTemptationTime}</li>
                  <li>Grace: {form.graceDaysAllowed} day(s)</li>
                </ul>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        {step > 0 && (
          <Button variant="secondary" onClick={back} className="flex-1">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        )}
        <Button
          onClick={next}
          disabled={!canProceed || isPending}
          className="flex-1"
        >
          {isLastStep ? (
            <>
              <Check className="h-4 w-4 mr-1" />
              {isPending ? "Creating..." : "Create habit"}
            </>
          ) : (
            <>
              Next
              <ArrowRight className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
