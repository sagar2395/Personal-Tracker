import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import BetterSqlite from "better-sqlite3";
import * as schema from "./schema";
import path from "path";

let _db: any = null;

export function getDb() {
  if (_db) return _db;

  // Try to get D1 database from Cloudflare context
  try {
    const cfContext = (globalThis as any)[Symbol.for("__cloudflare-context__")];
    if (cfContext?.env?.personal_tracker_db) {
      _db = drizzleD1(cfContext.env.personal_tracker_db, { schema });
      return _db;
    }
  } catch (e) {
    // Fall through to local database
  }

  // Local development environment
  const dbPath = path.join(process.cwd(), "local.db");
  const sqlite = new BetterSqlite(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  _db = drizzleSqlite(sqlite, { schema });
  return _db;
}

export type Database = ReturnType<typeof getDb>;
