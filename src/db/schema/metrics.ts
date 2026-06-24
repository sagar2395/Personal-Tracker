import {
  sqliteTable,
  text,
  integer,
  real,
  index,
} from "drizzle-orm/sqlite-core";
import { users } from "./users";
import { lifeAreas } from "./areas";

export const metrics = sqliteTable("metrics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  areaId: integer("area_id").references(() => lifeAreas.id),
  name: text("name").notNull(),
  unit: text("unit").notNull(),
  targetValue: real("target_value"),
  targetDirection: text("target_direction", {
    enum: ["increase", "decrease", "maintain"],
  }),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const metricLogs = sqliteTable(
  "metric_logs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    metricId: integer("metric_id")
      .notNull()
      .references(() => metrics.id),
    date: text("date").notNull(),
    value: real("value").notNull(),
    note: text("note"),
    createdAt: text("created_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [index("metric_logs_metric_date_idx").on(table.metricId, table.date)]
);
