import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { users } from "./users";
import { lifeAreas } from "./areas";

export const reviews = sqliteTable(
  "reviews",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    type: text("type", { enum: ["daily", "weekly"] }).notNull(),
    date: text("date").notNull(),
    mood: integer("mood"),
    energy: integer("energy"),
    winsText: text("wins_text"),
    challengesText: text("challenges_text"),
    tomorrowMITs: text("tomorrow_mits"),
    focusAreas: text("focus_areas"),
    notes: text("notes"),
    createdAt: text("created_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [
    uniqueIndex("reviews_user_type_date_idx").on(
      table.userId,
      table.type,
      table.date
    ),
  ]
);

export const wins = sqliteTable("wins", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  areaId: integer("area_id").references(() => lifeAreas.id),
  text: text("text").notNull(),
  date: text("date").notNull(),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});
