import { cookies } from "next/headers";
import { getDb } from "@/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const SESSION_COOKIE = "pt_session";
const SESSION_SECRET = process.env.SESSION_SECRET || "dev-secret-change-in-prod";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function createSessionToken(userId: number): string {
  const payload = `${userId}:${Date.now()}`;
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payload)
    .digest("hex");
  return Buffer.from(`${payload}:${signature}`).toString("base64");
}

function parseSessionToken(token: string): number | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length !== 3) return null;
    const [userId, timestamp, signature] = parts;
    const expected = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(`${userId}:${timestamp}`)
      .digest("hex");
    if (signature !== expected) return null;
    return parseInt(userId, 10);
  } catch {
    return null;
  }
}

export async function login(email: string, password: string): Promise<boolean> {
  try {
    const db = getDb();
    const user = db.select().from(users).where(eq(users.email, email)).get();
    console.log("[AUTH] Login attempt:", { email, found: !!user });

    if (!user) {
      console.log("[AUTH] User not found:", email);
      return false;
    }

    const passwordHash = hashPassword(password);
    const isValid = user.passwordHash === passwordHash;
    console.log("[AUTH] Password check:", {
      provided: passwordHash.substring(0, 8) + "...",
      stored: user.passwordHash.substring(0, 8) + "...",
      valid: isValid
    });

    if (!isValid) {
      console.log("[AUTH] Invalid password");
      return false;
    }

    const token = createSessionToken(user.id);
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    console.log("[AUTH] Login successful");
    return true;
  } catch (e) {
    console.error("[AUTH] Login error:", e);
    return false;
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const userId = parseSessionToken(token);
  if (!userId) return null;

  const db = getDb();
  const user = db.select().from(users).where(eq(users.id, userId)).get();
  return user || null;
}
