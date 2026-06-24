import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getTodayHabits } from "./actions";
import { AppShell } from "@/components/app-shell";
import { TodayView } from "@/components/today-view";

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const todayHabits = await getTodayHabits();
  const today = new Date();
  const greeting = today.getHours() < 12
    ? "Good morning"
    : today.getHours() < 17
      ? "Good afternoon"
      : "Good evening";

  return (
    <AppShell>
      <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting}, {user.name}
          </h1>
          <p className="text-sm text-slate-400">
            {today.toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </header>

        <TodayView habits={todayHabits} />
      </div>
    </AppShell>
  );
}
