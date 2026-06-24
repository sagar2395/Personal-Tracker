import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { users } from "./users";
import { lifeAreas } from "./areas";

export const goals = sqliteTable("goals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  areaId: integer("area_id")
    .notNull()
    .references(() => lifeAreas.id),
  title: text("title").notNull(),
  wish: text("wish"),
  outcome: text("outcome"),
  obstacle: text("obstacle"),
  plan: text("plan"),
  measurableTarget: text("measurable_target"),
  deadline: text("deadline"),
  status: text("status", {
    enum: ["active", "someday", "done", "dropped"],
  })
    .notNull()
    .default("active"),
  wipActive: integer("wip_active", { mode: "boolean" })
    .notNull()
    .default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  completedAt: text("completed_at"),
});
