import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getHabitWithLogs } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { HabitDetail } from "@/components/habit-detail";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function HabitDetailPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const data = await getHabitWithLogs(parseInt(id, 10));
  if (!data) notFound();

  return (
    <AppShell>
      <div className="mx-auto max-w-lg px-4 py-6">
        <HabitDetail habit={data.habit} logs={data.logs} streak={data.streak} />
      </div>
    </AppShell>
  );
}
