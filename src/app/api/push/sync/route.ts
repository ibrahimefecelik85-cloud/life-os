// Telefondan gelen güncel durum: abonelik + rutin listesi + bugün tiklenenler + ayarlar.
// Rutin her tiklendiğinde/değiştiğinde çağrılır.
import { deviceId, getDevice, listDeviceIds, MAX_DEVICES, saveDevice } from "@/lib/push/store";
import { parseDone, parseReminders, parseSettings, parseSubscription } from "@/lib/push/validate";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const subscription = parseSubscription(body?.subscription);
  const reminders = parseReminders(body?.reminders);
  if (!subscription || !reminders) return Response.json({ error: "Geçersiz veri" }, { status: 400 });

  const id = deviceId(subscription.endpoint);
  const existing = await getDevice(id);
  if (!existing && (await listDeviceIds()).length >= MAX_DEVICES) {
    return Response.json({ error: "Cihaz sınırına ulaşıldı" }, { status: 429 });
  }

  await saveDevice(id, {
    subscription,
    reminders,
    settings: parseSettings(body?.settings),
    done: parseDone(body?.done),
    sent: existing?.sent ?? { date: "", last: {} }, // gönderim geçmişini koru
    updatedAt: Date.now(),
  });
  return Response.json({ ok: true });
}
