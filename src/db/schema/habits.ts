import {
  sqliteTable,
  text,
  integer,
  real,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { users } from "./users";
import { lifeAreas } from "./areas";
import { goals } from "./goals";

export const habits = sqliteTable(
  "habits",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    areaId: integer("area_id")
      .notNull()
      .references(() => lifeAreas.id),
    goalId: integer("goal_id").references(() => goals.id),
    title: text("title").notNull(),
    type: text("type", { enum: ["build", "limit"] }).notNull().default("build"),
    cadence: text("cadence", {
      enum: ["daily", "weekdays", "x-per-week", "custom"],
    })
      .notNull()
      .default("daily"),
    cadenceDays: text("cadence_days"),
    cadenceTarget: integer("cadence_target"),
    tinyVersion: text("tiny_version"),
    anchor: text("anchor"),
    whyItMatters: text("why_it_matters"),
    impactLevel: integer("impact_level").notNull().default(3),
    milestoneReward: text("milestone_reward"),
    reminderTime: text("reminder_time"),
    graceDaysAllowed: integer("grace_days_allowed").notNull().default(1),
    dailyBudgetMins: integer("daily_budget_mins"),
    peakTemptationTime: text("peak_temptation_time"),
    substitutionPlan: text("substitution_plan"),
    archived: integer("archived", { mode: "boolean" }).notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: text("created_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [
    index("habits_user_archived_idx").on(table.userId, table.archived),
  ]
);

export const habitLogs = sqliteTable(
  "habit_logs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    habitId: integer("habit_id")
      .notNull()
      .references(() => habits.id),
    date: text("date").notNull(),
    status: text("status", {
      enum: [
        "done",
        "partial",
        "skipped",
        "missed",
        "clean",
        "under_budget",
        "over_budget",
        "slip",
      ],
    }).notNull(),
    value: real("value"),
    note: text("note"),
    createdAt: text("created_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [
    uniqueIndex("habit_logs_habit_date_idx").on(table.habitId, table.date),
  ]
);

export const streaks = sqliteTable("streaks", {
  habitId: integer("habit_id")
    .primaryKey()
    .references(() => habits.id),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  graceDaysRemaining: integer("grace_days_remaining").notNull().default(1),
  lastCompletedDate: text("last_completed_date"),
  missedTwiceCount: integer("missed_twice_count").notNull().default(0),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});
