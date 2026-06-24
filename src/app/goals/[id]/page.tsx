import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getGoalWithTasks } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { GoalDetail } from "@/components/goal-detail";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function GoalDetailPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const data = await getGoalWithTasks(parseInt(id, 10));
  if (!data) notFound();

  return (
    <AppShell>
      <div className="mx-auto max-w-lg px-4 py-6">
        <GoalDetail
          goal={data.goal}
          tasks={data.tasks}
          area={data.area}
          habits={data.habits}
        />
      </div>
    </AppShell>
  );
}
