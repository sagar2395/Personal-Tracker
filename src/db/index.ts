import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import BetterSqlite from "better-sqlite3";
import * as schema from "./schema";
import path from "path";

let _db: ReturnType<typeof drizzleSqlite<typeof schema>> | null = null;

export function getDb() {
  if (_db) return _db;
  const dbPath = path.join(process.cwd(), "local.db");
  const sqlite = new BetterSqlite(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  _db = drizzleSqlite(sqlite, { schema });
  return _db;
}

export type Database = ReturnType<typeof getDb>;
