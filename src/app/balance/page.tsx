import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAreaStats } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { BalanceDashboard } from "@/components/balance-dashboard";

export default async function BalancePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const areaStats = await getAreaStats();

  return (
    <AppShell>
      <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Balance</h1>
        <BalanceDashboard areaStats={areaStats} />
      </div>
    </AppShell>
  );
}
