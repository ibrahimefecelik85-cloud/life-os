// Telefona bildirim gönderme (Web Push, VAPID anahtarlarıyla).
// Gerekli ortam değişkenleri (Vercel → Settings → Environment Variables):
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (ör. "mailto:adresin@ornek.com")
import "server-only";
import { sendNotification, WebPushError } from "web-push";
import type { DeviceState } from "./schedule";

export const vapidPublicKey = process.env.VAPID_PUBLIC_KEY ?? null;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY ?? null;
const vapidSubject = process.env.VAPID_SUBJECT ?? "mailto:life-os@example.com";

export const pushConfigured = Boolean(vapidPublicKey && vapidPrivateKey);

export type SendResult = "ok" | "gone" | "error";

/**
 * Bildirimi gönderir. "gone": abonelik artık geçersiz (uygulama silinmiş / izin kaldırılmış),
 * çağıran taraf cihaz kaydını silmeli.
 */
export async function sendPush(
  subscription: DeviceState["subscription"],
  payload: { title: string; body: string; url?: string; tag?: string },
): Promise<SendResult> {
  if (!pushConfigured) return "error";
  try {
    await sendNotification(subscription, JSON.stringify(payload), {
      vapidDetails: { subject: vapidSubject, publicKey: vapidPublicKey!, privateKey: vapidPrivateKey! },
      TTL: 60 * 60, // 1 saat içinde iletilemezse boşver (eski hatırlatma anlamsız)
      urgency: "normal",
    });
    return "ok";
  } catch (e) {
    if (e instanceof WebPushError && (e.statusCode === 404 || e.statusCode === 410)) return "gone";
    console.error("Bildirim gönderilemedi:", e instanceof Error ? e.message : e);
    return "error";
  }
}
