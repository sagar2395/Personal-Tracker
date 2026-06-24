import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getFinanceSnapshots, getFinanceSnapshot } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { FinanceList } from "@/components/finance-list";
import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";

export default async function FinancePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const snapshots = await getFinanceSnapshots();

  const snapshotsWithAllocations = await Promise.all(
    snapshots.map(async (snapshot: typeof snapshots[number]) => {
      const data = await getFinanceSnapshot(snapshot.id);
      return {
        snapshot,
        allocations: data?.allocations ?? [],
      };
    })
  );

  return (
    <AppShell>
      <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href="/more"
              className="text-slate-400 hover:text-slate-300"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Finance</h1>
          </div>
          <Link
            href="/finance/new"
            className="inline-flex items-center gap-1 rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New snapshot
          </Link>
        </div>

        <FinanceList snapshots={snapshotsWithAllocations} />
      </div>
    </AppShell>
  );
}
