import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getReviewHistory } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { ReviewHistory } from "@/components/review-history";
import Link from "next/link";
import { Moon, Sun } from "lucide-react";

export default async function ReviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const reviewHistory = await getReviewHistory();

  return (
    <AppShell>
      <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Reviews</h1>

        <div className="grid grid-cols-2 gap-3">
          <Link href="/review/daily">
            <div className="rounded-xl border border-slate-800 p-4 hover:border-indigo-500/50 transition-colors text-center space-y-2">
              <Moon className="h-6 w-6 text-indigo-400 mx-auto" />
              <p className="text-sm font-medium">Daily Check-in</p>
              <p className="text-xs text-slate-500">
                Reflect on your day
              </p>
            </div>
          </Link>
          <Link href="/review/weekly">
            <div className="rounded-xl border border-slate-800 p-4 hover:border-indigo-500/50 transition-colors text-center space-y-2">
              <Sun className="h-6 w-6 text-amber-400 mx-auto" />
              <p className="text-sm font-medium">Weekly Review</p>
              <p className="text-xs text-slate-500">
                Plan the week ahead
              </p>
            </div>
          </Link>
        </div>

        {reviewHistory.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              History
            </h2>
            <ReviewHistory reviews={reviewHistory} />
          </section>
        )}
      </div>
    </AppShell>
  );
}
