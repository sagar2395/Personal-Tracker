import { getDb } from "@/db";
import { pushSubscriptions } from "@/db/schema/notifications";
import { getCurrentUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { endpoint } = (await request.json()) as { endpoint: string };
  if (!endpoint) {
    return Response.json({ error: "Missing endpoint" }, { status: 400 });
  }

  const db = getDb();
  await db
    .delete(pushSubscriptions)
    .where(
      and(
        eq(pushSubscriptions.userId, user.id),
        eq(pushSubscriptions.endpoint, endpoint)
      )
    );

  return Response.json({ ok: true });
}
