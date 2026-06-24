"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Target,
  Calendar,
  CheckCircle2,
  Circle,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { updateGoalStatus, updateTaskStatus } from "@/app/actions";
import { cn } from "@/lib/utils";

interface GoalDetailProps {
  goal: {
    id: number;
    title: string;
    wish: string | null;
    outcome: string | null;
    obstacle: string | null;
    plan: string | null;
    measurableTarget: string | null;
    deadline: string | null;
    status: string;
    createdAt: string;
  };
  tasks: {
    id: number;
    title: string;
    status: string;
    isUrgent: boolean;
    isImportant: boolean;
    isMIT: boolean;
    dueDate: string | null;
  }[];
  area: { name: string; color: string } | undefined;
  habits: { id: number; title: string; type: string }[];
}

function statusBadgeVariant(status: string) {
  switch (status) {
    case "active": return "build" as const;
    case "done": return "success" as const;
    case "someday": return "muted" as const;
    case "dropped": return "warn" as const;
    default: return "muted" as const;
  }
}

export function GoalDetail({ goal, tasks, area, habits }: GoalDetailProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  function handleStatusChange(status: "active" | "someday" | "done" | "dropped") {
    startTransition(async () => {
      await updateGoalStatus(goal.id, status);
      router.refresh();
    });
  }

  function handleTaskDone(taskId: number) {
    startTransition(async () => {
      await updateTaskStatus(taskId, "done");
      router.refresh();
    });
  }

  function handleTaskUndo(taskId: number) {
    startTransition(async () => {
      await updateTaskStatus(taskId, "todo");
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
            <h1 className="text-xl font-bold">{goal.title}</h1>
            <Badge variant={statusBadgeVariant(goal.status)} className="text-[10px]">
              {goal.status}
            </Badge>
          </div>
          {area && (
            <p className="text-xs text-slate-500">{area.name}</p>
          )}
        </div>
      </header>

      {/* Progress bar */}
      {totalTasks > 0 && (
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>{doneTasks} of {totalTasks} tasks done</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* WOOP details */}
      {(goal.wish || goal.outcome || goal.obstacle || goal.plan) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">WOOP</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-400">
            {goal.wish && (
              <div>
                <span className="text-slate-500 text-xs uppercase tracking-wider">Wish</span>
                <p className="mt-0.5">{goal.wish}</p>
              </div>
            )}
            {goal.outcome && (
              <div>
                <span className="text-slate-500 text-xs uppercase tracking-wider">Best outcome</span>
                <p className="mt-0.5">{goal.outcome}</p>
              </div>
            )}
            {goal.obstacle && (
              <div>
                <span className="text-slate-500 text-xs uppercase tracking-wider">Obstacle</span>
                <p className="mt-0.5">{goal.obstacle}</p>
              </div>
            )}
            {goal.plan && (
              <div>
                <span className="text-slate-500 text-xs uppercase tracking-wider">If-then plan</span>
                <p className="mt-0.5">{goal.plan}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Target & deadline */}
      <div className="grid grid-cols-2 gap-3">
        {goal.measurableTarget && (
          <Card className="p-3">
            <div className="flex items-center gap-1.5 text-indigo-400 mb-1">
              <Target className="h-3.5 w-3.5" />
              <span className="text-[10px] text-slate-500">Target</span>
            </div>
            <p className="text-sm">{goal.measurableTarget}</p>
          </Card>
        )}
        {goal.deadline && (
          <Card className="p-3">
            <div className="flex items-center gap-1.5 text-amber-400 mb-1">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-[10px] text-slate-500">Deadline</span>
            </div>
            <p className="text-sm">{goal.deadline}</p>
          </Card>
        )}
      </div>

      {/* Tasks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Tasks</CardTitle>
          <Button
            variant="ghost"
            className="text-xs h-7 px-2 text-indigo-400"
            onClick={() => router.push(`/goals/${goal.id}/add-task`)}
          >
            + Add task
          </Button>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <p className="text-sm text-slate-500">No tasks yet. Break this goal into action steps.</p>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <button
                    onClick={() => task.status === "done" ? handleTaskUndo(task.id) : handleTaskDone(task.id)}
                    disabled={isPending}
                    className="flex-shrink-0 touch-manipulation active:scale-90 transition-transform duration-150"
                  >
                    {task.status === "done" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Circle className="h-4 w-4 text-slate-600 hover:text-indigo-400" />
                    )}
                  </button>
                  <span
                    className={cn(
                      "flex-1",
                      task.status === "done" && "line-through text-slate-600"
                    )}
                  >
                    {task.title}
                  </span>
                  <div className="flex items-center gap-1">
                    {task.isMIT && (
                      <Badge variant="streak" className="text-[9px]">MIT</Badge>
                    )}
                    {task.isUrgent && task.isImportant && (
                      <AlertTriangle className="h-3 w-3 text-amber-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Linked habits */}
      {habits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Linked habits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {habits.map((h) => (
                <button
                  key={h.id}
                  onClick={() => router.push(`/habits/${h.id}`)}
                  className="block w-full text-left text-sm text-slate-400 hover:text-slate-200 py-1"
                >
                  {h.title}
                  <Badge
                    variant={h.type === "build" ? "build" : "limit"}
                    className="text-[9px] ml-2"
                  >
                    {h.type}
                  </Badge>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status actions */}
      {goal.status === "active" && (
        <div className="flex gap-2">
          <Button
            variant="success"
            className="flex-1"
            onClick={() => handleStatusChange("done")}
            disabled={isPending}
          >
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Complete
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => handleStatusChange("someday")}
            disabled={isPending}
          >
            Pause
          </Button>
        </div>
      )}
      {goal.status === "someday" && (
        <Button
          className="w-full"
          onClick={() => handleStatusChange("active")}
          disabled={isPending}
        >
          Activate this goal
        </Button>
      )}
    </div>
  );
}
