"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Star,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { updateTaskStatus, toggleMIT } from "@/app/actions";
import { cn } from "@/lib/utils";
import { eisenhowerSort } from "@/lib/priorities";
import Link from "next/link";

interface Task {
  id: number;
  title: string;
  status: string;
  isUrgent: boolean;
  isImportant: boolean;
  isMIT: boolean;
  effortMins: number | null;
  dueDate: string | null;
  scheduledFor: string | null;
  areaId: number;
  goalId: number | null;
}

interface TaskBacklogProps {
  tasks: Task[];
  areas: { id: number; name: string; color: string }[];
  goals: { id: number; title: string }[];
}

function getQuadrantLabel(isImportant: boolean, isUrgent: boolean) {
  if (isImportant && isUrgent) return "Do first";
  if (isImportant) return "Schedule";
  if (isUrgent) return "Delegate";
  return "Eliminate";
}

export function TaskBacklog({ tasks, areas, goals }: TaskBacklogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const areaMap = new Map(areas.map((a) => [a.id, a]));
  const goalMap = new Map(goals.map((g) => [g.id, g]));

  const openTasks = tasks.filter((t) => t.status !== "done" && t.status !== "cancelled");
  const doneTasks = tasks.filter((t) => t.status === "done");
  const sorted = eisenhowerSort(openTasks as never[]) as unknown as Task[];

  function handleComplete(taskId: number) {
    startTransition(async () => {
      await updateTaskStatus(taskId, "done");
      router.refresh();
    });
  }

  function handleToggleMIT(taskId: number) {
    startTransition(async () => {
      await toggleMIT(taskId);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-slate-400 hover:text-slate-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Task backlog</h1>
        </div>
        <Link
          href="/goals/tasks/new"
          className="inline-flex items-center gap-1 rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Task
        </Link>
      </header>

      {sorted.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-slate-400">No open tasks</p>
          <p className="text-sm text-slate-500 mt-1">
            Create tasks from goal detail pages or the button above.
          </p>
        </Card>
      )}

      <div className="space-y-2">
        {sorted.map((task) => {
          const area = areaMap.get(task.areaId);
          const goal = task.goalId ? goalMap.get(task.goalId) : null;
          return (
            <Card key={task.id} className="p-3">
              <div className="flex items-start gap-2">
                <button
                  onClick={() => handleComplete(task.id)}
                  disabled={isPending}
                  className="flex-shrink-0 mt-0.5"
                >
                  <Circle className="h-4 w-4 text-slate-600 hover:text-indigo-400" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{task.title}</p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    {area && (
                      <span
                        className="text-[9px] px-1 py-0.5 rounded"
                        style={{ backgroundColor: area.color + "20", color: area.color }}
                      >
                        {area.name}
                      </span>
                    )}
                    {goal && (
                      <span className="text-[9px] text-slate-500">
                        {goal.title}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className="text-[9px] text-slate-500">
                        Due {task.dueDate}
                      </span>
                    )}
                    {task.effortMins && (
                      <span className="text-[9px] text-slate-600">
                        {task.effortMins}m
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleToggleMIT(task.id)}
                    disabled={isPending}
                    title={task.isMIT ? "Remove MIT" : "Make MIT"}
                  >
                    <Star
                      className={cn(
                        "h-4 w-4",
                        task.isMIT
                          ? "text-indigo-400 fill-indigo-400"
                          : "text-slate-700 hover:text-indigo-400"
                      )}
                    />
                  </button>
                  {task.isUrgent && task.isImportant && (
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                  )}
                  <Badge
                    variant={task.isImportant && task.isUrgent ? "warn" : task.isImportant ? "streak" : "muted"}
                    className="text-[9px]"
                  >
                    {getQuadrantLabel(task.isImportant, task.isUrgent)}
                  </Badge>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {doneTasks.length > 0 && (
        <section>
          <h2 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
            Done ({doneTasks.length})
          </h2>
          <div className="space-y-1">
            {doneTasks.slice(0, 10).map((task) => (
              <div key={task.id} className="flex items-center gap-2 text-sm px-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                <span className="line-through text-slate-600 truncate">{task.title}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
