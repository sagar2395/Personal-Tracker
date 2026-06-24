"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateArea, exportAllData, saveWhyStatement } from "@/app/actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Download, Bell, BellOff, Heart } from "lucide-react";
import { usePushNotifications } from "@/hooks/use-push-notifications";

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
  whyStatement?: string | null;
}

export function SettingsView({ areas, user, whyStatement }: SettingsViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingArea, setEditingArea] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editHours, setEditHours] = useState("");
  const [editingWhy, setEditingWhy] = useState(false);
  const [whyText, setWhyText] = useState(whyStatement || "");

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

      {/* My Why */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-rose-400" />
            My Why
          </div>
        </h2>
        <Card className="p-4 space-y-3">
          {editingWhy ? (
            <>
              <Textarea
                value={whyText}
                onChange={(e) => setWhyText(e.target.value)}
                placeholder="Why are you tracking your habits and goals? What drives you?"
                rows={3}
              />
              <p className="text-[10px] text-slate-600">
                This shows on your home screen as a daily reminder of your purpose.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    startTransition(async () => {
                      await saveWhyStatement(whyText.trim());
                      setEditingWhy(false);
                      router.refresh();
                    });
                  }}
                  disabled={!whyText.trim() || isPending}
                  className="flex-1"
                >
                  Save
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setWhyText(whyStatement || "");
                    setEditingWhy(false);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {whyStatement ? (
                  <p className="text-sm text-slate-300">{whyStatement}</p>
                ) : (
                  <p className="text-sm text-slate-500 italic">
                    No &quot;Why&quot; statement set yet. Tap edit to add one.
                  </p>
                )}
              </div>
              <button
                onClick={() => setEditingWhy(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 ml-2 flex-shrink-0"
              >
                Edit
              </button>
            </div>
          )}
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
      <NotificationSection />

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

function NotificationSection() {
  const { state, error, subscribe, unsubscribe } = usePushNotifications();

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
        Notifications
      </h2>
      <Card className="p-4 space-y-3">
        {state === "unsupported" && (
          <p className="text-sm text-slate-500">
            Push notifications are not supported in this browser. Try using
            Chrome or Edge on desktop/Android, or add the app to your home
            screen on iOS.
          </p>
        )}

        {state === "denied" && (
          <p className="text-sm text-red-400">
            Notification permission was denied. Please enable notifications in
            your browser settings and reload the page.
          </p>
        )}

        {state === "loading" && (
          <p className="text-sm text-slate-500">Checking notification status...</p>
        )}

        {state === "error" && (
          <div className="space-y-2">
            <p className="text-sm text-red-400">
              {error || "Something went wrong with notifications."}
            </p>
            <Button variant="secondary" size="sm" onClick={subscribe}>
              Try again
            </Button>
          </div>
        )}

        {state === "unsubscribed" && (
          <div className="space-y-2">
            <p className="text-sm text-slate-400">
              Get reminders for your habits, deadlines, and evening check-ins.
            </p>
            <Button onClick={subscribe} className="gap-2">
              <Bell className="h-4 w-4" />
              Enable push notifications
            </Button>
          </div>
        )}

        {state === "subscribed" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-green-400" />
              <span className="text-sm text-green-400">
                Push notifications are enabled
              </span>
            </div>
            <p className="text-xs text-slate-500">
              You&apos;ll receive morning habit reminders, evening check-ins,
              never-miss-twice nudges, and deadline alerts.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={unsubscribe}
              className="text-slate-500 gap-2"
            >
              <BellOff className="h-3 w-3" />
              Disable notifications
            </Button>
          </div>
        )}
      </Card>
    </section>
  );
}
