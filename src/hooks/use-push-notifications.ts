"use client";

import { useState, useEffect, useCallback } from "react";

type PushState = "loading" | "unsupported" | "denied" | "subscribed" | "unsubscribed" | "error";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const [state, setState] = useState<PushState>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }

    const check = async () => {
      const permission = Notification.permission;
      if (permission === "denied") {
        setState("denied");
        return;
      }

      const reg = await navigator.serviceWorker.getRegistration("/sw.js");
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        setState(sub ? "subscribed" : "unsubscribed");
      } else {
        setState("unsubscribed");
      }
    };
    check();
  }, []);

  const subscribe = useCallback(async () => {
    try {
      setState("loading");
      setError(null);

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState("denied");
        return;
      }

      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const res = await fetch("/api/push/vapid-key");
      const data = (await res.json()) as { publicKey?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Failed to get VAPID key");
      }
      const { publicKey } = data;
      if (!publicKey) throw new Error("No VAPID public key returned");

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const subJson = subscription.toJSON();
      const saveRes = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subJson.endpoint,
          keys: subJson.keys,
        }),
      });

      if (!saveRes.ok) throw new Error("Failed to save subscription");
      setState("subscribed");
    } catch (err: any) {
      console.error("[PUSH] Subscribe error:", err);
      setError(err.message || "Failed to subscribe");
      setState("error");
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    try {
      setState("loading");
      const reg = await navigator.serviceWorker.getRegistration("/sw.js");
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await fetch("/api/push/unsubscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: sub.endpoint }),
          });
          await sub.unsubscribe();
        }
      }
      setState("unsubscribed");
    } catch (err: any) {
      console.error("[PUSH] Unsubscribe error:", err);
      setError(err.message || "Failed to unsubscribe");
      setState("error");
    }
  }, []);

  return { state, error, subscribe, unsubscribe };
}
