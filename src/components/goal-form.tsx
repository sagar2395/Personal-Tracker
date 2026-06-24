"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { createGoal } from "@/app/actions";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

interface Area {
  id: number;
  name: string;
  color: string;
}

interface GoalFormProps {
  areas: Area[];
}

interface FormData {
  title: string;
  areaId: number;
  wish: string;
  outcome: string;
  obstacle: string;
  plan: string;
  measurableTarget: string;
  deadline: string;
  status: "active" | "someday";
}

const STEPS = ["What", "Wish & Outcome", "Obstacle & Plan", "Target & Deadline"];

export function GoalForm({ areas }: GoalFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormData>({
    title: "",
    areaId: areas[0]?.id || 0,
    wish: "",
    outcome: "",
    obstacle: "",
    plan: "",
    measurableTarget: "",
    deadline: "",
    status: "active",
  });

  const totalSteps = STEPS.length;
  const isLastStep = step === totalSteps - 1;

  function update(field: keyof FormData, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
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
      const result = await createGoal({
        title: form.title,
        areaId: form.areaId,
        wish: form.wish || undefined,
        outcome: form.outcome || undefined,
        obstacle: form.obstacle || undefined,
        plan: form.plan || undefined,
        measurableTarget: form.measurableTarget || undefined,
        deadline: form.deadline || undefined,
        status: form.status,
      });
      if ("error" in result && result.error) {
        setError(result.error);
      } else {
        router.push("/goals");
      }
    });
  }

  const canProceed = (() => {
    if (step === 0) return form.title.trim().length > 0;
    return true;
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
          <h1 className="text-xl font-bold">New goal</h1>
          <p className="text-xs text-slate-500">
            Step {step + 1} of {totalSteps} — {STEPS[step]}
          </p>
        </div>
      </header>

      <div className="flex gap-1">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= step ? "bg-indigo-500" : "bg-slate-800"
            }`}
          />
        ))}
      </div>

      {error && (
        <div className="rounded-lg bg-amber-950/30 border border-amber-700/50 p-3 text-sm text-amber-300">
          {error}
        </div>
      )}

      <Card>
        <CardContent className="pt-4">
          {step === 0 && (
            <div className="space-y-4">
              <CardTitle className="text-lg">What do you want to achieve?</CardTitle>
              <div className="space-y-2">
                <Label htmlFor="title">Goal title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="e.g. Get marriage certificate"
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
              <div className="space-y-2">
                <Label htmlFor="status">Start as</Label>
                <Select
                  id="status"
                  value={form.status}
                  onChange={(e) => update("status", e.target.value)}
                >
                  <option value="active">Active — working on it now</option>
                  <option value="someday">Someday — save for later</option>
                </Select>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <CardTitle className="text-lg">WOOP: Wish & Outcome</CardTitle>
              <p className="text-sm text-slate-400">
                Mental contrasting — vividly imagine both the desired result and
                the reality. This increases follow-through.
              </p>
              <div className="space-y-2">
                <Label htmlFor="wish">Wish — what do you most wish for?</Label>
                <Textarea
                  id="wish"
                  value={form.wish}
                  onChange={(e) => update("wish", e.target.value)}
                  placeholder="e.g. Having our marriage officially registered and documented"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="outcome">
                  Best outcome — what would achieving this feel like?
                </Label>
                <Textarea
                  id="outcome"
                  value={form.outcome}
                  onChange={(e) => update("outcome", e.target.value)}
                  placeholder="e.g. Peace of mind, legal security, one less admin task hanging over us"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <CardTitle className="text-lg">WOOP: Obstacle & Plan</CardTitle>
              <p className="text-sm text-slate-400">
                Identifying obstacles in advance and making if-then plans dramatically
                improves success rates.
              </p>
              <div className="space-y-2">
                <Label htmlFor="obstacle">
                  Main obstacle — what could get in the way?
                </Label>
                <Textarea
                  id="obstacle"
                  value={form.obstacle}
                  onChange={(e) => update("obstacle", e.target.value)}
                  placeholder="e.g. Bureaucratic process, finding time to visit the office together"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan">
                  If-then plan — when [obstacle], I will...
                </Label>
                <Textarea
                  id="plan"
                  value={form.plan}
                  onChange={(e) => update("plan", e.target.value)}
                  placeholder="e.g. If we can't go together, I'll gather documents first and go alone for the initial visit"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <CardTitle className="text-lg">Make it measurable</CardTitle>
              <div className="space-y-2">
                <Label htmlFor="target">Measurable target (optional)</Label>
                <Input
                  id="target"
                  value={form.measurableTarget}
                  onChange={(e) => update("measurableTarget", e.target.value)}
                  placeholder="e.g. Marriage certificate received"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline (optional)</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={form.deadline}
                  onChange={(e) => update("deadline", e.target.value)}
                />
              </div>

              <Card className="border-slate-700 bg-slate-800/50 p-3">
                <p className="text-sm font-medium">Summary</p>
                <ul className="mt-2 space-y-1 text-xs text-slate-400">
                  <li>Goal: {form.title}</li>
                  {form.wish && <li>Wish: {form.wish}</li>}
                  {form.outcome && <li>Outcome: {form.outcome}</li>}
                  {form.obstacle && <li>Obstacle: {form.obstacle}</li>}
                  {form.plan && <li>Plan: {form.plan}</li>}
                  {form.measurableTarget && <li>Target: {form.measurableTarget}</li>}
                  {form.deadline && <li>Deadline: {form.deadline}</li>}
                  <li>Status: {form.status}</li>
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
              {isPending ? "Creating..." : "Create goal"}
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
