import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getTasks, getAreas, getGoals } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { TaskBacklog } from "@/components/task-backlog";

export default async function TasksBacklogPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [allTasks, areas, goals] = await Promise.all([
    getTasks(),
    getAreas(),
    getGoals(),
  ]);

  return (
    <AppShell>
      <div className="mx-auto max-w-lg px-4 py-6">
        <TaskBacklog tasks={allTasks} areas={areas} goals={goals} />
      </div>
    </AppShell>
  );
}
