"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const moodEmojis: Record<number, string> = {
  1: "😔",
  2: "😐",
  3: "🙂",
  4: "😊",
  5: "🤩",
};

interface ReviewEntry {
  id: number;
  type: string;
  date: string;
  mood: number | null;
  energy: number | null;
  winsText: string | null;
  challengesText: string | null;
  tomorrowMITs: string | null;
  focusAreas: string | null;
  notes: string | null;
}

interface ReviewHistoryProps {
  reviews: ReviewEntry[];
}

export function ReviewHistory({ reviews }: ReviewHistoryProps) {
  if (reviews.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-slate-400 mb-1">No reviews yet</p>
        <p className="text-sm text-slate-500">
          Start with a daily check-in or weekly review to build your reflection
          habit.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <Card key={review.id} className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge
                variant={review.type === "daily" ? "default" : "build"}
              >
                {review.type === "daily" ? "Check-in" : "Weekly"}
              </Badge>
              <span className="text-sm text-slate-400">{review.date}</span>
            </div>
            {review.mood && (
              <span className="text-lg">{moodEmojis[review.mood]}</span>
            )}
          </div>

          {review.mood && review.energy && (
            <div className="flex gap-4 text-xs text-slate-500">
              <span>
                Mood: {review.mood}/5
              </span>
              <span>
                Energy: {review.energy}/5
              </span>
            </div>
          )}

          {review.winsText && (
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Wins</p>
              <p className="text-sm text-slate-300 whitespace-pre-line">
                {review.winsText}
              </p>
            </div>
          )}

          {review.challengesText && (
            <div>
              <p className="text-xs text-slate-500 mb-0.5">
                {review.type === "daily" ? "Challenges" : "Habit summary"}
              </p>
              <p className="text-sm text-slate-400 whitespace-pre-line">
                {review.challengesText}
              </p>
            </div>
          )}

          {review.tomorrowMITs && (
            <div>
              <p className="text-xs text-slate-500 mb-0.5">
                {review.type === "daily" ? "Tomorrow's priorities" : "Monday MITs"}
              </p>
              <p className="text-sm text-slate-400 whitespace-pre-line">
                {review.tomorrowMITs}
              </p>
            </div>
          )}

          {review.focusAreas && (
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Focus areas</p>
              <p className="text-sm text-slate-400 whitespace-pre-line">
                {review.focusAreas}
              </p>
            </div>
          )}

          {review.notes && (
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Notes</p>
              <p className="text-sm text-slate-400 whitespace-pre-line">
                {review.notes}
              </p>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
