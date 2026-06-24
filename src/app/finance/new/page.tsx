import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";
import { FinanceSnapshotForm } from "@/components/finance-snapshot-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function NewFinanceSnapshotPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <AppShell>
      <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Link
            href="/finance"
            className="text-slate-400 hover:text-slate-300"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              New Snapshot
            </h1>
            <p className="text-sm text-slate-400">
              Record this month&apos;s income and allocations.
            </p>
          </div>
        </div>

        <FinanceSnapshotForm />
      </div>
    </AppShell>
  );
}
