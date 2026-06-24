import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { users } from "./users";
import { lifeAreas } from "./areas";
import { goals } from "./goals";

export const tasks = sqliteTable(
  "tasks",
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
    description: text("description"),
    isUrgent: integer("is_urgent", { mode: "boolean" })
      .notNull()
      .default(false),
    isImportant: integer("is_important", { mode: "boolean" })
      .notNull()
      .default(true),
    impactLevel: integer("impact_level").notNull().default(2),
    effortMins: integer("effort_mins"),
    dueDate: text("due_date"),
    scheduledFor: text("scheduled_for"),
    isMIT: integer("is_mit", { mode: "boolean" }).notNull().default(false),
    status: text("status", {
      enum: ["todo", "in_progress", "done", "cancelled"],
    })
      .notNull()
      .default("todo"),
    completedAt: text("completed_at"),
    createdAt: text("created_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [
    index("tasks_user_status_scheduled_idx").on(
      table.userId,
      table.status,
      table.scheduledFor
    ),
  ]
);
