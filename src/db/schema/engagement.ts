import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const appUsageLogs = sqliteTable(
  "app_usage_logs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    date: text("date").notNull(),
    createdAt: text("created_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [
    uniqueIndex("app_usage_user_date_idx").on(table.userId, table.date),
  ]
);

export const achievements = sqliteTable(
  "achievements",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    key: text("key").notNull(),
    unlockedAt: text("unlocked_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [
    uniqueIndex("achievements_user_key_idx").on(table.userId, table.key),
  ]
);

export const userMotivation = sqliteTable("user_motivation", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id),
  whyStatement: text("why_statement"),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});
