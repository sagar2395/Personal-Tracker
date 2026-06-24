"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { createTask } from "@/app/actions";
import { ArrowLeft, Check } from "lucide-react";

interface Area {
  id: number;
  name: string;
}

interface TaskFormProps {
  areas: Area[];
  defaultAreaId?: number;
  defaultGoalId?: number;
  goals?: { id: number; title: string; areaId: number }[];
  redirectTo?: string;
}

export function TaskForm({
  areas,
  defaultAreaId,
  defaultGoalId,
  goals = [],
  redirectTo,
}: TaskFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    title: "",
    description: "",
    areaId: defaultAreaId ?? areas[0]?.id ?? 0,
    goalId: defaultGoalId ?? 0,
    isUrgent: false,
    isImportant: true,
    effortMins: "",
    dueDate: "",
    scheduledFor: "",
  });

  function update(field: string, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function submit() {
    if (!form.title.trim()) return;
    startTransition(async () => {
      await createTask({
        title: form.title,
        areaId: form.areaId,
        goalId: form.goalId || undefined,
        description: form.description || undefined,
        isUrgent: form.isUrgent,
        isImportant: form.isImportant,
        effortMins: form.effortMins ? parseInt(form.effortMins, 10) : undefined,
        dueDate: form.dueDate || undefined,
        scheduledFor: form.scheduledFor || undefined,
      });
      router.push(redirectTo ?? "/goals");
    });
  }

  const quadrant = form.isImportant && form.isUrgent
    ? "Do first"
    : form.isImportant
      ? "Schedule"
      : form.isUrgent
        ? "Delegate"
        : "Eliminate";

  const quadrantColor = form.isImportant && form.isUrgent
    ? "text-amber-400"
    : form.isImportant
      ? "text-indigo-400"
      : form.isUrgent
        ? "text-slate-300"
        : "text-slate-500";

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-slate-400 hover:text-slate-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">New task</h1>
      </header>

      <Card>
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">What needs to be done?</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="e.g. Visit registrar office for documents"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Notes (optional)</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Any additional details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="area">Area</Label>
              <Select
                id="area"
                value={form.areaId}
                onChange={(e) => update("areaId", parseInt(e.target.value, 10))}
              >
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </Select>
            </div>

            {goals.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="goal">Goal (optional)</Label>
                <Select
                  id="goal"
                  value={form.goalId}
                  onChange={(e) => update("goalId", parseInt(e.target.value, 10))}
                >
                  <option value={0}>None</option>
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>{g.title}</option>
                  ))}
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 space-y-4">
          <CardTitle className="text-sm">Eisenhower priority</CardTitle>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => update("isImportant", !form.isImportant)}
              className={`rounded-xl border-2 p-3 text-left transition-colors ${
                form.isImportant
                  ? "border-indigo-500 bg-indigo-950/20"
                  : "border-slate-700 hover:border-slate-600"
              }`}
            >
              <p className="text-sm font-medium">Important</p>
              <p className="text-[10px] text-slate-500">Moves the needle</p>
            </button>
            <button
              onClick={() => update("isUrgent", !form.isUrgent)}
              className={`rounded-xl border-2 p-3 text-left transition-colors ${
                form.isUrgent
                  ? "border-amber-500 bg-amber-950/20"
                  : "border-slate-700 hover:border-slate-600"
              }`}
            >
              <p className="text-sm font-medium">Urgent</p>
              <p className="text-[10px] text-slate-500">Time sensitive</p>
            </button>
          </div>
          <p className={`text-xs font-medium ${quadrantColor}`}>
            Quadrant: {quadrant}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="effort">Effort (min)</Label>
              <Input
                id="effort"
                type="number"
                value={form.effortMins}
                onChange={(e) => update("effortMins", e.target.value)}
                placeholder="30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due">Due date</Label>
              <Input
                id="due"
                type="date"
                value={form.dueDate}
                onChange={(e) => update("dueDate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduled">Do on</Label>
              <Input
                id="scheduled"
                type="date"
                value={form.scheduledFor}
                onChange={(e) => update("scheduledFor", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={submit}
        disabled={!form.title.trim() || isPending}
        className="w-full"
      >
        <Check className="h-4 w-4 mr-1" />
        {isPending ? "Creating..." : "Create task"}
      </Button>
    </div>
  );
}
