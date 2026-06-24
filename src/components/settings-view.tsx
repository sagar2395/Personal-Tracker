"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateArea, exportAllData } from "@/app/actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Download } from "lucide-react";

interface Area {
  id: number;
  name: string;
  icon: string;
  color: string;
  priorityWeight: number;
  targetWeeklyHours: number;
  isSeason: boolean;
  sortOrder: number;
}

interface SettingsViewProps {
  areas: Area[];
  user: { name: string; email: string; timezone: string | null };
}

export function SettingsView({ areas, user }: SettingsViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingArea, setEditingArea] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editHours, setEditHours] = useState("");

  function startEdit(area: Area) {
    setEditingArea(area.id);
    setEditName(area.name);
    setEditColor(area.color);
    setEditHours(area.targetWeeklyHours.toString());
  }

  function handleSaveArea(areaId: number) {
    startTransition(async () => {
      await updateArea(areaId, {
        name: editName,
        color: editColor,
        targetWeeklyHours: parseFloat(editHours) || 0,
      });
      setEditingArea(null);
      router.refresh();
    });
  }

  const areaColors = [
    "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
    "#f97316", "#eab308", "#22c55e", "#14b8a6",
    "#06b6d4", "#3b82f6",
  ];

  return (
    <div className="space-y-8">
      {/* Account */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Account
        </h2>
        <Card className="p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Name</span>
            <span>{user.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Email</span>
            <span>{user.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Timezone</span>
            <span>{user.timezone || "Not set"}</span>
          </div>
        </Card>
      </section>

      {/* Life Areas */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Life areas
        </h2>
        <div className="space-y-2">
          {areas.map((area) => (
            <Card key={area.id} className="p-3">
              {editingArea === area.id ? (
                <div className="space-y-3">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Area name"
                  />
                  <div className="space-y-1.5">
                    <p className="text-xs text-slate-500">Color</p>
                    <div className="flex gap-2 flex-wrap">
                      {areaColors.map((c) => (
                        <button
                          key={c}
                          onClick={() => setEditColor(c)}
                          className={cn(
                            "h-6 w-6 rounded-full transition-all",
                            editColor === c && "ring-2 ring-white ring-offset-2 ring-offset-slate-900"
                          )}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">
                      Target weekly hours
                    </p>
                    <Input
                      type="number"
                      value={editHours}
                      onChange={(e) => setEditHours(e.target.value)}
                      min={0}
                      step={0.5}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSaveArea(area.id)}
                      disabled={isPending}
                      className="flex-1"
                    >
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setEditingArea(null)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: area.color }}
                    />
                    <span className="text-sm font-medium">{area.name}</span>
                    {!area.isSeason && (
                      <span className="text-[10px] text-slate-600">
                        Off-season
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {area.targetWeeklyHours > 0 && (
                      <span className="text-xs text-slate-500">
                        {area.targetWeeklyHours}h/wk
                      </span>
                    )}
                    <button
                      onClick={() => startEdit(area)}
                      className="text-xs text-indigo-400 hover:text-indigo-300"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* Notification Preferences */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Notifications
        </h2>
        <Card className="p-4">
          <p className="text-sm text-slate-500">
            Push notifications require a deployed environment with VAPID keys
            configured. Notification preferences will be available once the app
            is deployed.
          </p>
          <div className="mt-3 space-y-2">
            <NotifToggle label="Morning habit reminders" />
            <NotifToggle label="Evening check-in prompt" />
            <NotifToggle label="Never-miss-twice nudge" />
            <NotifToggle label="Pre-temptation alert" />
            <NotifToggle label="Deadline approaching" />
            <NotifToggle label="Weekly review prompt" />
          </div>
        </Card>
      </section>

      {/* Data */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Data
        </h2>
        <Card className="p-4 space-y-3">
          <p className="text-sm text-slate-400">
            Download all your data as a JSON file.
          </p>
          <Button
            variant="secondary"
            onClick={() => {
              startTransition(async () => {
                const data = await exportAllData();
                if (!data) return;
                const blob = new Blob([JSON.stringify(data, null, 2)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `personal-tracker-export-${new Date().toISOString().split("T")[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
              });
            }}
            disabled={isPending}
          >
            <Download className="h-4 w-4 mr-2" />
            {isPending ? "Exporting..." : "Export all data"}
          </Button>
        </Card>
      </section>
    </div>
  );
}

function NotifToggle({ label }: { label: string }) {
  const [enabled, setEnabled] = useState(true);

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-300">{label}</span>
      <button
        onClick={() => setEnabled(!enabled)}
        className={cn(
          "relative h-5 w-9 rounded-full transition-colors",
          enabled ? "bg-indigo-500" : "bg-slate-700"
        )}
      >
        <div
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform",
            enabled ? "left-[18px]" : "left-0.5"
          )}
        />
      </button>
    </div>
  );
}
