"use client";

import { Card } from "@/components/ui/card";
import {
  ACHIEVEMENTS,
  TIER_COLORS,
  type AchievementDef,
} from "@/lib/achievements";
import { cn } from "@/lib/utils";
import {
  Flame,
  Sprout,
  CheckCircle2,
  Zap,
  Layers,
  Star,
  Crown,
  Target,
  ListChecks,
  BookOpen,
  Brain,
  Trophy,
  RotateCcw,
  Heart,
  Lock,
  Award,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Flame,
  Sprout,
  CheckCircle2,
  Zap,
  Layers,
  Star,
  Crown,
  Target,
  ListChecks,
  BookOpen,
  Brain,
  Trophy,
  RotateCcw,
  Heart,
};

interface UnlockedAchievement {
  id: number;
  key: string;
  unlockedAt: string;
}

interface AppStreak {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  lastUsedDate: string | null;
}

interface AchievementsViewProps {
  unlocked: UnlockedAchievement[];
  streak: AppStreak;
}

export function AchievementsView({ unlocked, streak }: AchievementsViewProps) {
  const unlockedKeys = new Set(unlocked.map((a) => a.key));
  const unlockedCount = unlocked.length;
  const totalCount = ACHIEVEMENTS.length;
  const percent = Math.round((unlockedCount / totalCount) * 100);

  const tiers: Array<AchievementDef["tier"]> = ["bronze", "silver", "gold", "diamond"];

  return (
    <div className="space-y-6">
      {/* Stats header */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Award className="h-8 w-8 text-indigo-400" />
            <div>
              <p className="text-2xl font-bold">{unlockedCount}/{totalCount}</p>
              <p className="text-xs text-slate-500">achievements unlocked</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <Flame className={cn(
                "h-5 w-5",
                streak.currentStreak >= 7 ? "text-orange-400" : "text-amber-400"
              )} />
              <p className="text-xl font-bold">{streak.currentStreak}</p>
            </div>
            <p className="text-xs text-slate-500">day app streak</p>
          </div>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-1.5">{percent}% complete</p>
        {streak.totalDays > 0 && (
          <p className="text-xs text-slate-600 mt-1">
            {streak.totalDays} total days tracked · best streak: {streak.longestStreak} days
          </p>
        )}
      </Card>

      {/* Achievements by tier */}
      {tiers.map((tier) => {
        const tierAchievements = ACHIEVEMENTS.filter((a) => a.tier === tier);
        const colors = TIER_COLORS[tier];
        return (
          <section key={tier} className="space-y-2">
            <h2 className={cn(
              "text-sm font-semibold uppercase tracking-wider",
              colors.text
            )}>
              {tier}
            </h2>
            <div className="grid grid-cols-1 gap-2">
              {tierAchievements.map((achievement) => {
                const isUnlocked = unlockedKeys.has(achievement.key);
                const IconComponent = ICON_MAP[achievement.icon] || Star;
                const unlockedData = unlocked.find((u) => u.key === achievement.key);
                return (
                  <Card
                    key={achievement.key}
                    className={cn(
                      "p-3 border transition-all",
                      isUnlocked
                        ? `${colors.bg} ${colors.border}`
                        : "opacity-40 border-slate-800"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                        isUnlocked ? colors.bg : "bg-slate-800/50"
                      )}>
                        {isUnlocked ? (
                          <IconComponent className={cn("h-4 w-4", colors.text)} />
                        ) : (
                          <Lock className="h-4 w-4 text-slate-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm font-medium",
                          isUnlocked ? "text-slate-200" : "text-slate-500"
                        )}>
                          {achievement.title}
                        </p>
                        <p className={cn(
                          "text-xs",
                          isUnlocked ? "text-slate-400" : "text-slate-600"
                        )}>
                          {achievement.description}
                        </p>
                      </div>
                      {isUnlocked && unlockedData && (
                        <p className="text-[9px] text-slate-600 flex-shrink-0">
                          {new Date(unlockedData.unlockedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
