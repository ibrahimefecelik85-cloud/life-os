"use client";
// Telefon/tarayıcı tarafı bildirim işlemleri: abone ol, kapat, sunucuya güncel durumu gönder.
import { db } from "@/lib/db";
import { todayISO } from "@/lib/dates";
import { DEFAULT_NOTIFY_SETTINGS, type NotifySettings } from "@/lib/push/schedule";

const SETTINGS_KEY = "notify.settings";

export type PushSupport = "ok" | "unsupported" | "needs-install" | "dev";

/** Bu cihaz bildirim alabilir mi? */
export function pushSupport(): PushSupport {
  if (typeof window === "undefined") return "unsupported";
  if (process.env.NODE_ENV !== "production") return "dev"; // service worker sadece yayındaki sürümde
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const standalone = window.matchMedia("(display-mode: standalone)").matches || ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone);
  // iPhone'da bildirim sadece "Ana Ekrana Ekle" ile kurulmuş uygulamada çalışır
  if (isIOS && !standalone) return "needs-install";
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return "unsupported";
  return "ok";
}

async function registration(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  return (await navigator.serviceWorker.getRegistration()) ?? null;
}

export async function currentSubscription(): Promise<PushSubscription | null> {
  const reg = await registration();
  return (await reg?.pushManager.getSubscription()) ?? null;
}

// ---- Ayarlar (varsayılan saat, tekrar aralığı, sessiz saat) ----
export async function getNotifySettings(): Promise<NotifySettings> {
  const row = await db.settings.get(SETTINGS_KEY);
  return { ...DEFAULT_NOTIFY_SETTINGS, ...(row?.value as Partial<NotifySettings> | undefined) };
}

export async function saveNotifySettings(s: NotifySettings) {
  await db.settings.put({ key: SETTINGS_KEY, value: s });
}

// ---- Sunucuya gönderilecek durum ----
async function buildPayload(sub: PushSubscription) {
  const today = todayISO();
  const [habits, logs, settings] = await Promise.all([
    db.habits.orderBy("order").toArray(),
    db.habitLogs.where("date").equals(today).toArray(),
    getNotifySettings(),
  ]);
  return {
    subscription: sub.toJSON(),
    reminders: habits.map((h) => ({ id: h.id, title: h.title, days: h.days, remindAt: h.remindAt })),
    done: { date: today, ids: logs.filter((l) => l.done).map((l) => l.habitId) },
    settings,
  };
}

/** Güncel rutin durumunu sunucuya gönderir (abone değilse hiçbir şey yapmaz) */
export async function syncNow(): Promise<boolean> {
  const sub = await currentSubscription();
  if (!sub) return false;
  const res = await fetch("/api/push/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(await buildPayload(sub)),
  });
  return res.ok;
}

function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(padded);
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

/** Bildirimleri aç: izin iste, abone ol, sunucuya kaydet. Hata olursa Türkçe mesajla fırlatır. */
export async function enablePush(): Promise<void> {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Bildirim izni verilmedi. iPhone Ayarlar → Bildirimler → Life OS'tan açabilirsin.");

  const keyRes = await fetch("/api/push/key");
  const keyData = await keyRes.json().catch(() => ({}));
  if (!keyRes.ok) throw new Error(keyData.error ?? "Sunucu bildirimler için hazır değil.");

  const reg = await registration();
  if (!reg) throw new Error("Service worker bulunamadı. Sayfayı yenileyip tekrar dene.");
  if (!(await reg.pushManager.getSubscription())) {
    try {
      await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64ToBytes(keyData.publicKey) });
    } catch (e) {
      // Tarayıcının hata mesajı İngilizce; Türkçe açıklama + teknik detay
      const detail = e instanceof Error ? ` (${e.message})` : "";
      throw new Error(`Bildirim aboneliği oluşturulamadı. Uygulamayı kapatıp açarak tekrar dene.${detail}`);
    }
  }
  if (!(await syncNow())) throw new Error("Sunucuya kaydedilemedi. İnternet bağlantını kontrol et.");
}

/** Bildirimleri kapat */
export async function disablePush(): Promise<void> {
  const sub = await currentSubscription();
  if (!sub) return;
  await fetch("/api/push/unsubscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint: sub.endpoint }),
  }).catch(() => {});
  await sub.unsubscribe();
}

/** Deneme bildirimi */
export async function sendTestPush(): Promise<void> {
  const sub = await currentSubscription();
  if (!sub) throw new Error("Önce bildirimleri aç.");
  const res = await fetch("/api/push/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint: sub.endpoint }),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Deneme bildirimi gönderilemedi.");
}
