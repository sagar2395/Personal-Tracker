// Shared logic for classifying work as "strategic" (deep, goal-aligned, high
// impact) vs "reactive" (instant, temporary, low-impact busywork). Used by both
// the server analysis action and client views so the definition stays in sync.

export interface ClassifiableTask {
  goalId: number | null;
  isImportant: boolean;
  isUrgent: boolean;
  impactLevel: number;
}

export type WorkKind = "strategic" | "reactive";

export function classifyTask(task: ClassifiableTask): WorkKind {
  // Anything tied to a goal is, by definition, moving something that matters.
  if (task.goalId != null) return "strategic";
  // High-impact or genuinely important work counts even without a goal link.
  if (task.isImportant && task.impactLevel >= 3) return "strategic";
  // Everything else is reactive: ad-hoc, urgent-but-not-important, low impact.
  return "reactive";
}

export const IMPACT_LABELS: Record<number, string> = {
  1: "Trivial",
  2: "Minor",
  3: "Solid",
  4: "Major",
  5: "Life-changing",
};

export function impactLabel(level: number): string {
  return IMPACT_LABELS[level] ?? "Solid";
}

// A healthy ratio of deep, goal-aligned work. Below this, the user is mostly
// reacting rather than building toward what they said matters.
export const HEALTHY_DEEP_WORK_RATIO = 0.5;

export function deepWorkVerdict(ratio: number, total: number): string {
  if (total === 0) return "No completed work yet to analyse.";
  if (ratio >= 0.7)
    return "Excellent — most of your effort goes into work that truly matters.";
  if (ratio >= HEALTHY_DEEP_WORK_RATIO)
    return "Balanced — a solid share of your work is goal-aligned.";
  if (ratio >= 0.3)
    return "Reactive-leaning — a lot of effort is going to ad-hoc tasks. Try converting some into goals.";
  return "Mostly firefighting — most effort is reactive busywork. Protect time for what moves the needle.";
}
