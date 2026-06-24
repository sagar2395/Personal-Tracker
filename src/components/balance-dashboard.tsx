"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

interface AreaStat {
  area: {
    id: number;
    name: string;
    color: string;
    targetWeeklyHours: number;
    isSeason: boolean;
    priorityWeight: number;
  };
  activeGoals: number;
  openTasks: number;
  habitCount: number;
  plannedMins: number;
}

interface BalanceDashboardProps {
  areaStats: AreaStat[];
}

export function BalanceDashboard({ areaStats }: BalanceDashboardProps) {
  const totalTargetHours = areaStats.reduce(
    (sum, s) => sum + (s.area.isSeason ? s.area.targetWeeklyHours : 0),
    0
  );

  const WEEKLY_AVAILABLE_HOURS = 112; // 16 waking hours × 7 days
  const isOverloaded = totalTargetHours > WEEKLY_AVAILABLE_HOURS;

  return (
    <div className="space-y-4">
      {/* Total capacity bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">Weekly capacity</p>
          <p className="text-xs text-slate-400">
            {totalTargetHours}h planned / {WEEKLY_AVAILABLE_HOURS}h available
          </p>
        </div>
        <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isOverloaded ? "bg-amber-400" : "bg-indigo-500"
            }`}
            style={{
              width: `${Math.min(
                (totalTargetHours / WEEKLY_AVAILABLE_HOURS) * 100,
                100
              )}%`,
            }}
          />
        </div>
        {isOverloaded && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            Over-committed by {(totalTargetHours - WEEKLY_AVAILABLE_HOURS).toFixed(0)}h.
            Consider pausing a goal or reducing targets.
          </div>
        )}
      </Card>

      {/* Area breakdown */}
      {areaStats.map(({ area, activeGoals, openTasks, habitCount, plannedMins }) => {
        const barPct =
          totalTargetHours > 0
            ? (area.targetWeeklyHours / totalTargetHours) * 100
            : 0;

        return (
          <Card key={area.id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: area.color }}
                />
                <p className="text-sm font-medium">{area.name}</p>
                {!area.isSeason && (
                  <Badge variant="muted" className="text-[9px]">off-season</Badge>
                )}
              </div>
              <span className="text-xs text-slate-400">
                {area.targetWeeklyHours}h/wk
              </span>
            </div>

            {/* Allocation bar */}
            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden mb-3">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${barPct}%`,
                  backgroundColor: area.color,
                }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-bold text-slate-200">{activeGoals}</p>
                <p className="text-[10px] text-slate-500">Goals</p>
              </div>
              <div>
                <p className="text-lg font-bold text-slate-200">{openTasks}</p>
                <p className="text-[10px] text-slate-500">Tasks</p>
              </div>
              <div>
                <p className="text-lg font-bold text-slate-200">{habitCount}</p>
                <p className="text-[10px] text-slate-500">Habits</p>
              </div>
            </div>

            {plannedMins > 0 && (
              <p className="text-[10px] text-slate-500 mt-2">
                {Math.round(plannedMins / 60)}h estimated task effort
              </p>
            )}
          </Card>
        );
      })}
    </div>
  );
}
