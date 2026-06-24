import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import {
  ClipboardCheck,
  BarChart3,
  Settings,
  LogOut,
  Award,
} from "lucide-react";
import Link from "next/link";

const menuItems = [
  {
    href: "/insights",
    label: "Insights",
    description: "Trends, consistency, and analytics",
    icon: BarChart3,
    phase: "",
  },
  {
    href: "/achievements",
    label: "Achievements",
    description: "Badges, streaks, and milestones",
    icon: Award,
    phase: "",
  },
  {
    href: "/review",
    label: "Reviews",
    description: "Daily check-in & weekly review",
    icon: ClipboardCheck,
    phase: "",
  },
  {
    href: "/settings",
    label: "Settings",
    description: "Areas, notifications, data",
    icon: Settings,
    phase: "",
  },
];

export default async function MorePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <AppShell>
      <div className="mx-auto max-w-lg px-4 py-6 space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">More</h1>

        <div className="space-y-2">
          {menuItems.map((item) => {
            const content = (
              <Card key={item.label} className="p-3 hover:border-slate-600 transition-colors">
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-slate-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.description}</p>
                  </div>
                  {item.phase && (
                    <span className="text-[10px] text-slate-600">{item.phase}</span>
                  )}
                </div>
              </Card>
            );
            return item.href === "#" ? (
              <div key={item.label}>{content}</div>
            ) : (
              <Link key={item.label} href={item.href}>{content}</Link>
            );
          })}
        </div>

        <div className="pt-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-indigo-900 flex items-center justify-center text-sm font-bold">
              {user.name[0]}
            </div>
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
          </div>
          <form
            action={async () => {
              "use server";
              await logout();
              redirect("/login");
            }}
          >
            <button
              type="submit"
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
