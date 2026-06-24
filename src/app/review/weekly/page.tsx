import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getReview, getWeeklyReviewData } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { WeeklyReview } from "@/components/weekly-review";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function WeeklyReviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const today = new Date();
  const sundayDate = new Date(today);
  sundayDate.setDate(today.getDate() - today.getDay());
  const dateStr = sundayDate.toISOString().split("T")[0];

  const [existingReview, reviewData] = await Promise.all([
    getReview("weekly", dateStr),
    getWeeklyReviewData(),
  ]);

  if (!reviewData) redirect("/login");

  return (
    <AppShell>
      <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Link
            href="/review"
            className="text-slate-400 hover:text-slate-300"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Weekly Review
            </h1>
            <p className="text-sm text-slate-400">
              Review your week and set focus for the next one.
            </p>
          </div>
        </div>

        <WeeklyReview
          weekWins={reviewData.weekWins}
          completedTasks={reviewData.completedTasks}
          habitSummaries={reviewData.habitSummaries}
          areas={reviewData.areas}
          existingReview={existingReview}
          date={dateStr}
        />
      </div>
    </AppShell>
  );
}
