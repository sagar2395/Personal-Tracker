import { getDb } from "@/db";
import { pushSubscriptions } from "@/db/schema/notifications";
import { getCurrentUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { endpoint, keys } = (await request.json()) as {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  };
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return Response.json({ error: "Invalid subscription" }, { status: 400 });
  }

  const db = getDb();

  const existing = await db
    .select()
    .from(pushSubscriptions)
    .where(
      and(
        eq(pushSubscriptions.userId, user.id),
        eq(pushSubscriptions.endpoint, endpoint)
      )
    )
    .get();

  if (!existing) {
    await db.insert(pushSubscriptions).values({
      userId: user.id,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    });
  }

  return Response.json({ ok: true });
}
