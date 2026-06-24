import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import BetterSqlite from "better-sqlite3";
import * as schema from "./schema";
import path from "path";
import { getD1Database } from "@/lib/cloudflare-env";

let _db: any = null;
let _dbType: "d1" | "sqlite" | null = null;

export function getDb() {
  // Try to get D1 database from Cloudflare context
  const d1Binding = getD1Database();
  if (d1Binding) {
    if (_dbType !== "d1") {
      _db = drizzleD1(d1Binding, { schema });
      _dbType = "d1";
    }
    return _db;
  }

  // Local development environment (fallback)
  if (_dbType !== "sqlite") {
    const dbPath = path.join(process.cwd(), "local.db");
    const sqlite = new BetterSqlite(dbPath);
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");
    _db = drizzleSqlite(sqlite, { schema });
    _dbType = "sqlite";
  }

  return _db;
}

export type Database = ReturnType<typeof getDb>;
