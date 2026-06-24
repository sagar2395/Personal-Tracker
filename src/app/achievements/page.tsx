import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUnlockedAchievements, getAppUsageStreak } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { AchievementsView } from "@/components/achievements-view";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function AchievementsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [unlocked, streak] = await Promise.all([
    getUnlockedAchievements(),
    getAppUsageStreak(),
  ]);

  return (
    <AppShell>
      <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Link
            href="/more"
            className="text-slate-400 hover:text-slate-300"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Achievements</h1>
        </div>

        <AchievementsView unlocked={unlocked} streak={streak} />
      </div>
    </AppShell>
  );
}
