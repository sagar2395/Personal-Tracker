export interface AchievementDef {
  key: string;
  title: string;
  description: string;
  icon: string;
  tier: "bronze" | "silver" | "gold" | "diamond";
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // App usage streaks
  {
    key: "app_streak_3",
    title: "Getting Started",
    description: "Used the app 3 days in a row",
    icon: "Flame",
    tier: "bronze",
  },
  {
    key: "app_streak_7",
    title: "One Week Strong",
    description: "Used the app 7 days in a row",
    icon: "Flame",
    tier: "bronze",
  },
  {
    key: "app_streak_14",
    title: "Two Week Warrior",
    description: "Used the app 14 days in a row",
    icon: "Flame",
    tier: "silver",
  },
  {
    key: "app_streak_30",
    title: "Monthly Master",
    description: "Used the app 30 days in a row",
    icon: "Flame",
    tier: "gold",
  },
  {
    key: "app_streak_100",
    title: "Centurion",
    description: "Used the app 100 days in a row",
    icon: "Flame",
    tier: "diamond",
  },

  // Habit milestones
  {
    key: "first_habit",
    title: "First Step",
    description: "Created your first habit",
    icon: "Sprout",
    tier: "bronze",
  },
  {
    key: "first_log",
    title: "Day One",
    description: "Logged your first habit",
    icon: "CheckCircle2",
    tier: "bronze",
  },
  {
    key: "habit_streak_7",
    title: "Consistent",
    description: "Achieved a 7-day streak on any habit",
    icon: "Zap",
    tier: "bronze",
  },
  {
    key: "habit_streak_30",
    title: "Unstoppable",
    description: "Achieved a 30-day streak on any habit",
    icon: "Zap",
    tier: "silver",
  },
  {
    key: "habit_streak_100",
    title: "Legendary Streak",
    description: "Achieved a 100-day streak on any habit",
    icon: "Zap",
    tier: "gold",
  },
  {
    key: "five_habits",
    title: "Habit Builder",
    description: "Created 5 habits",
    icon: "Layers",
    tier: "silver",
  },
  {
    key: "perfect_day",
    title: "Perfect Day",
    description: "Completed all habits in a single day",
    icon: "Star",
    tier: "silver",
  },
  {
    key: "perfect_week",
    title: "Perfect Week",
    description: "Completed all habits every day for a week",
    icon: "Crown",
    tier: "gold",
  },

  // Goals & tasks
  {
    key: "first_goal",
    title: "Dreamer",
    description: "Created your first goal",
    icon: "Target",
    tier: "bronze",
  },
  {
    key: "goal_complete",
    title: "Goal Crusher",
    description: "Completed your first goal",
    icon: "Target",
    tier: "silver",
  },
  {
    key: "ten_tasks",
    title: "Productive",
    description: "Completed 10 tasks",
    icon: "ListChecks",
    tier: "bronze",
  },
  {
    key: "fifty_tasks",
    title: "Task Machine",
    description: "Completed 50 tasks",
    icon: "ListChecks",
    tier: "silver",
  },

  // Reviews & reflection
  {
    key: "first_review",
    title: "Reflective",
    description: "Completed your first daily review",
    icon: "BookOpen",
    tier: "bronze",
  },
  {
    key: "weekly_review",
    title: "Weekly Thinker",
    description: "Completed your first weekly review",
    icon: "BookOpen",
    tier: "bronze",
  },
  {
    key: "review_streak_7",
    title: "Mindful Week",
    description: "Did daily reviews 7 days in a row",
    icon: "Brain",
    tier: "silver",
  },

  // Wins
  {
    key: "ten_wins",
    title: "Winner",
    description: "Captured 10 wins",
    icon: "Trophy",
    tier: "bronze",
  },
  {
    key: "fifty_wins",
    title: "Winning Mindset",
    description: "Captured 50 wins",
    icon: "Trophy",
    tier: "silver",
  },

  // Recovery
  {
    key: "comeback",
    title: "Comeback Kid",
    description: "Returned after 3+ days away and logged a habit",
    icon: "RotateCcw",
    tier: "silver",
  },

  // Commitment
  {
    key: "set_why",
    title: "Purpose Driven",
    description: "Set your personal 'Why' statement",
    icon: "Heart",
    tier: "bronze",
  },
];

export function getAchievementDef(key: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.key === key);
}

export const TIER_COLORS = {
  bronze: { bg: "bg-amber-950/40", border: "border-amber-700/50", text: "text-amber-400" },
  silver: { bg: "bg-slate-800/60", border: "border-slate-500/50", text: "text-slate-300" },
  gold: { bg: "bg-yellow-950/40", border: "border-yellow-600/50", text: "text-yellow-400" },
  diamond: { bg: "bg-cyan-950/40", border: "border-cyan-500/50", text: "text-cyan-300" },
};

export const MOTIVATIONAL_QUOTES = [
  "The secret of getting ahead is getting started.",
  "Small daily improvements over time lead to stunning results.",
  "You don't have to be great to start, but you have to start to be great.",
  "Discipline is choosing between what you want now and what you want most.",
  "Success is the sum of small efforts repeated day in and day out.",
  "The only way to do great work is to love what you do.",
  "Progress, not perfection.",
  "Every day is a fresh start.",
  "Your future self will thank you.",
  "Consistency beats intensity.",
  "The best time to start was yesterday. The next best time is now.",
  "What gets measured gets managed.",
  "Be patient with yourself. Growth takes time.",
  "One day or day one. You decide.",
  "Show up for yourself today.",
  "Tiny changes, remarkable results.",
  "Fall seven times, stand up eight.",
  "You are what you repeatedly do.",
  "Trust the process.",
  "Done is better than perfect.",
  "The person who moves a mountain begins by carrying away small stones.",
  "Energy flows where attention goes.",
  "If it's important to you, you'll find a way.",
  "Make each day your masterpiece.",
  "Believe you can and you're halfway there.",
  "The harder you work, the luckier you get.",
  "Start where you are. Use what you have. Do what you can.",
  "Your only limit is you.",
  "Champions keep going when they have nothing left.",
  "Dream big. Start small. Act now.",
  "It always seems impossible until it's done.",
];

export function getDailyQuote(): string {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
}

export function getWelcomeBackMessage(daysAway: number): string | null {
  if (daysAway <= 1) return null;
  if (daysAway <= 3) return "Welcome back! Every return is a win.";
  if (daysAway <= 7) return "You're back! That takes courage. Let's pick up where you left off.";
  if (daysAway <= 14) return "Welcome back! No judgment here — showing up is what matters most.";
  return "So glad you're here again! Fresh start, clean slate. Let's go.";
}
