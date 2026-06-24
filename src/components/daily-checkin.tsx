"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { saveReview } from "@/app/actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const moodEmojis = [
  { value: 1, emoji: "😔", label: "Rough" },
  { value: 2, emoji: "😐", label: "Low" },
  { value: 3, emoji: "🙂", label: "Okay" },
  { value: 4, emoji: "😊", label: "Good" },
  { value: 5, emoji: "🤩", label: "Great" },
];

const energyLevels = [
  { value: 1, label: "Drained" },
  { value: 2, label: "Low" },
  { value: 3, label: "Moderate" },
  { value: 4, label: "Energized" },
  { value: 5, label: "Peak" },
];

interface CompletedItem {
  id: number;
  title: string;
  type: "habit" | "task";
}

interface ExistingReview {
  mood: number | null;
  energy: number | null;
  winsText: string | null;
  challengesText: string | null;
  tomorrowMITs: string | null;
  notes: string | null;
}

interface DailyCheckinProps {
  completedItems: CompletedItem[];
  existingReview?: ExistingReview | null;
  date: string;
}

export function DailyCheckin({
  completedItems,
  existingReview,
  date,
}: DailyCheckinProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mood, setMood] = useState(existingReview?.mood ?? 0);
  const [energy, setEnergy] = useState(existingReview?.energy ?? 0);
  const [winsText, setWinsText] = useState(existingReview?.winsText ?? "");
  const [challengesText, setChallengesText] = useState(
    existingReview?.challengesText ?? ""
  );
  const [tomorrowMITs, setTomorrowMITs] = useState(
    existingReview?.tomorrowMITs ?? ""
  );
  const [saved, setSaved] = useState(false);

  function handleSubmit() {
    if (mood === 0 || energy === 0) return;
    startTransition(async () => {
      const result = await saveReview({
        type: "daily",
        date,
        mood,
        energy,
        winsText: winsText || undefined,
        challengesText: challengesText || undefined,
        tomorrowMITs: tomorrowMITs || undefined,
      });
      if (result.success) {
        setSaved(true);
        router.refresh();
      }
    });
  }

  if (saved) {
    return (
      <Card className="p-6 text-center">
        <p className="text-lg font-medium mb-1">Check-in saved</p>
        <p className="text-sm text-slate-400">
          Rest up. Tomorrow&apos;s a fresh start.
        </p>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => router.push("/")}
        >
          Back to Today
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mood */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          How are you feeling?
        </h2>
        <div className="flex justify-between gap-2">
          {moodEmojis.map((m) => (
            <button
              key={m.value}
              onClick={() => setMood(m.value)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl p-3 flex-1 transition-all",
                mood === m.value
                  ? "bg-indigo-500/20 ring-1 ring-indigo-500"
                  : "bg-slate-800/50 hover:bg-slate-800"
              )}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-[10px] text-slate-400">{m.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Energy */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Energy level
        </h2>
        <div className="flex gap-2">
          {energyLevels.map((e) => (
            <button
              key={e.value}
              onClick={() => setEnergy(e.value)}
              className={cn(
                "flex-1 rounded-xl p-3 text-center transition-all",
                energy === e.value
                  ? "bg-indigo-500/20 ring-1 ring-indigo-500"
                  : "bg-slate-800/50 hover:bg-slate-800"
              )}
            >
              <div className="flex justify-center gap-0.5 mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      i < e.value ? "bg-emerald-500" : "bg-slate-700"
                    )}
                  />
                ))}
              </div>
              <span className="text-[10px] text-slate-400">{e.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Auto-populated wins */}
      {completedItems.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Today&apos;s accomplishments
          </h2>
          <Card className="p-3 space-y-1.5">
            {completedItems.map((item) => (
              <div key={`${item.type}-${item.id}`} className="flex items-center gap-2 text-sm">
                <span className="text-emerald-500">✓</span>
                <span className="text-slate-300">{item.title}</span>
                <span className="text-[10px] text-slate-600 ml-auto">
                  {item.type}
                </span>
              </div>
            ))}
          </Card>
        </section>
      )}

      {/* What went well */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          What went well today?
        </h2>
        <Textarea
          value={winsText}
          onChange={(e) => setWinsText(e.target.value)}
          placeholder="Anything you're proud of, big or small..."
          rows={3}
        />
      </section>

      {/* Challenges */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          What was challenging?
        </h2>
        <p className="text-xs text-slate-500">
          Every challenge is a learning. What got in the way?
        </p>
        <Textarea
          value={challengesText}
          onChange={(e) => setChallengesText(e.target.value)}
          placeholder="What slowed you down or didn't go as planned..."
          rows={3}
        />
      </section>

      {/* Tomorrow's priorities */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Top 1-3 priorities for tomorrow
        </h2>
        <Textarea
          value={tomorrowMITs}
          onChange={(e) => setTomorrowMITs(e.target.value)}
          placeholder="What are the most important things to tackle tomorrow?"
          rows={3}
        />
      </section>

      <Button
        onClick={handleSubmit}
        disabled={mood === 0 || energy === 0 || isPending}
        className="w-full"
      >
        {isPending ? "Saving..." : existingReview ? "Update check-in" : "Save check-in"}
      </Button>
    </div>
  );
}
