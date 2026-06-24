import { getCloudflarEnv } from "@/lib/cloudflare-env";

export async function GET() {
  const env = getCloudflarEnv();
  const key = env?.VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY;
  if (!key) {
    return Response.json({ error: "VAPID keys not configured" }, { status: 500 });
  }
  return Response.json({ publicKey: key });
}
