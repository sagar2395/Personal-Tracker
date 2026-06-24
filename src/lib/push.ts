import { getCloudflarEnv } from "@/lib/cloudflare-env";

interface PushPayload {
  title: string;
  body: string;
  tag?: string;
  url?: string;
}

interface Subscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export async function sendPushNotification(
  subscription: Subscription,
  payload: PushPayload
) {
  const env = getCloudflarEnv();
  const vapidPublicKey = env?.VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY;
  const vapidPrivateKey = env?.VAPID_PRIVATE_KEY || process.env.VAPID_PRIVATE_KEY;

  if (!vapidPublicKey || !vapidPrivateKey) {
    console.error("[PUSH] VAPID keys not configured");
    return false;
  }

  const webpush = await import("web-push");
  webpush.setVapidDetails(
    "mailto:sagarchhabra02@gmail.com",
    vapidPublicKey,
    vapidPrivateKey
  );

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify(payload)
    );
    return true;
  } catch (err: any) {
    if (err.statusCode === 410 || err.statusCode === 404) {
      return "expired";
    }
    console.error("[PUSH] Failed to send:", err);
    return false;
  }
}
