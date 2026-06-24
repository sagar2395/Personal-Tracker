import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { PieChart } from "lucide-react";

export default async function BalancePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <AppShell>
      <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Balance</h1>
        <Card className="p-8 text-center">
          <PieChart className="h-8 w-8 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Coming in Phase 2</p>
          <p className="text-sm text-slate-500 mt-1">
            Life area balance dashboard with time budgets and capacity warnings.
          </p>
        </Card>
      </div>
    </AppShell>
  );
}
