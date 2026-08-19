import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || "";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushSupported(): boolean {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

export async function getPermissionState(): Promise<NotificationPermission | "unsupported"> {
  if (!isPushSupported()) return "unsupported";
  return Notification.permission;
}

let swRegistration: ServiceWorkerRegistration | null = null;

export async function getSWRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (swRegistration) return swRegistration;
  try {
    swRegistration = await navigator.serviceWorker.register("/sw.js");
    return swRegistration;
  } catch (error) {
    console.error("SW registration failed:", error);
    return null;
  }
}

export async function subscribePush(): Promise<boolean> {
  if (!isPushSupported() || !VAPID_PUBLIC_KEY) return false;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return false;

  const reg = await getSWRegistration();
  if (!reg) return false;

  try {
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
    });

    const sub = subscription.toJSON();
    if (!sub.endpoint || !sub.keys) return false;

    await saveSubscription(sub.endpoint, sub.keys.p256dh || "", sub.keys.auth || "");
    return true;
  } catch (error) {
    console.error("Push subscribe failed:", error);
    return false;
  }
}

export async function unsubscribePush(): Promise<boolean> {
  const reg = await getSWRegistration();
  if (!reg) return false;

  try {
    const subscription = await reg.pushManager.getSubscription();
    if (!subscription) return false;

    await subscription.unsubscribe();

    // Remove from Supabase
    if (isSupabaseConfigured() && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("user_id", user.id)
          .eq("endpoint", subscription.endpoint);
      }
    }

    return true;
  } catch (error) {
    console.error("Push unsubscribe failed:", error);
    return false;
  }
}

export async function isSubscribed(): Promise<boolean> {
  const reg = await getSWRegistration();
  if (!reg) return false;

  const subscription = await reg.pushManager.getSubscription();
  return !!subscription;
}

async function saveSubscription(endpoint: string, p256dh: string, auth: string): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint,
      p256dh,
      auth,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,endpoint" }
  );
}
