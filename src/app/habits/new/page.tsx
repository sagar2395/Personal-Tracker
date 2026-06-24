import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAreas } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { HabitForm } from "@/components/habit-form";

export default async function NewHabitPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const areas = await getAreas();

  return (
    <AppShell>
      <div className="mx-auto max-w-lg px-4 py-6">
        <HabitForm areas={areas} />
      </div>
    </AppShell>
  );
}
