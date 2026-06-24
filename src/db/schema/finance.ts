import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const financeSnapshots = sqliteTable("finance_snapshots", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  month: text("month").notNull(),
  totalIncome: real("total_income").notNull(),
  notes: text("notes"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const financeAllocations = sqliteTable("finance_allocations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  snapshotId: integer("snapshot_id")
    .notNull()
    .references(() => financeSnapshots.id),
  assetClass: text("asset_class").notNull(),
  targetPercent: real("target_percent").notNull(),
  actualAmount: real("actual_amount").notNull(),
  notes: text("notes"),
});
