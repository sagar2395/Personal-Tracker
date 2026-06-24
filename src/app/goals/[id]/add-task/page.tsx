import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getGoalWithTasks, getAreas, getGoals } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { TaskForm } from "@/components/task-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AddTaskToGoalPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const goalId = parseInt(id, 10);
  const data = await getGoalWithTasks(goalId);
  if (!data) notFound();

  const [areas, goals] = await Promise.all([getAreas(), getGoals()]);

  return (
    <AppShell>
      <div className="mx-auto max-w-lg px-4 py-6">
        <TaskForm
          areas={areas}
          defaultAreaId={data.goal.areaId}
          defaultGoalId={goalId}
          goals={goals}
          redirectTo={`/goals/${id}`}
        />
      </div>
    </AppShell>
  );
}
