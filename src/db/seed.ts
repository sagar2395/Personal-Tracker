import { getDb } from "./index";
import { users } from "./schema/users";
import { lifeAreas } from "./schema/areas";
import crypto from "crypto";

async function seed() {
  const db = getDb();

  const passwordHash = crypto
    .createHash("sha256")
    .update("tracker123")
    .digest("hex");

  const [user] = db
    .insert(users)
    .values({
      email: "sagar@tracker.local",
      passwordHash,
      name: "Sagar",
      timezone: "Asia/Kolkata",
    })
    .returning()
    .all();

  console.log(`Created user: ${user.name} (${user.email})`);

  const areas = [
    { name: "Work — Valuelabs", icon: "briefcase", color: "#3b82f6", priorityWeight: 9, targetWeeklyHours: 40, sortOrder: 1 },
    { name: "Work — Avyka", icon: "laptop", color: "#8b5cf6", priorityWeight: 7, targetWeeklyHours: 10, sortOrder: 2 },
    { name: "Health", icon: "heart", color: "#10b981", priorityWeight: 8, targetWeeklyHours: 7, sortOrder: 3 },
    { name: "Personal & Home", icon: "home", color: "#f59e0b", priorityWeight: 6, targetWeeklyHours: 5, sortOrder: 4 },
    { name: "Finance", icon: "wallet", color: "#06b6d4", priorityWeight: 5, targetWeeklyHours: 2, sortOrder: 5 },
    { name: "Snowops", icon: "rocket", color: "#ec4899", priorityWeight: 4, targetWeeklyHours: 5, sortOrder: 6 },
    { name: "Side Hustle", icon: "zap", color: "#f97316", priorityWeight: 2, targetWeeklyHours: 0, isSeason: false, sortOrder: 7 },
  ];

  for (const area of areas) {
    db.insert(lifeAreas)
      .values({ ...area, userId: user.id })
      .run();
  }

  console.log(`Created ${areas.length} life areas`);
  console.log("\nDefault login: sagar@tracker.local / tracker123");
}

seed().catch(console.error);
