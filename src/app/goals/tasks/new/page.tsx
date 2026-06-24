import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAreas, getGoals } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { TaskForm } from "@/components/task-form";

export default async function NewTaskPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [areas, goals] = await Promise.all([getAreas(), getGoals()]);

  return (
    <AppShell>
      <div className="mx-auto max-w-lg px-4 py-6">
        <TaskForm areas={areas} goals={goals} redirectTo="/goals/tasks" />
      </div>
    </AppShell>
  );
}
