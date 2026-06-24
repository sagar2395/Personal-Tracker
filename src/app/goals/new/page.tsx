import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAreas } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { GoalForm } from "@/components/goal-form";

export default async function NewGoalPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const areas = await getAreas();

  return (
    <AppShell>
      <div className="mx-auto max-w-lg px-4 py-6">
        <GoalForm areas={areas} />
      </div>
    </AppShell>
  );
}
