// Zamanlayıcı (cron-job.org) bu adresi 15 dakikada bir çağırır.
// Her cihaz için: saati gelmiş + tiklenmemiş rutin varsa TEK bildirim gönderir.
// Güvenlik: CRON_SECRET ortam değişkeni ile korunur
//   - başlık: "Authorization: Bearer <CRON_SECRET>"  veya  adres sonuna ?key=<CRON_SECRET>
import { buildMessage, dueReminders, istanbulNow, markSent } from "@/lib/push/schedule";
import { pushConfigured, sendPush } from "@/lib/push/send";
import { deleteDevice, getDevice, listDeviceIds, saveDevice } from "@/lib/push/store";

export const dynamic = "force-dynamic";

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // şifre ayarlanmadıysa kimse çalıştıramasın
  const header = req.headers.get("authorization");
  const key = new URL(req.url).searchParams.get("key");
  return header === `Bearer ${secret}` || key === secret;
}

async function run(req: Request) {
  if (!authorized(req)) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  if (!pushConfigured) return Response.json({ error: "VAPID anahtarları ayarlanmamış" }, { status: 503 });

  const now = istanbulNow();
  const report: Record<string, string> = {};

  for (const id of await listDeviceIds()) {
    const device = await getDevice(id);
    if (!device) continue;
    const due = dueReminders(device, now);
    if (due.length === 0) {
      report[id] = "bekleyen yok";
      continue;
    }
    const result = await sendPush(device.subscription, { ...buildMessage(due), url: "/", tag: "life-os-rutin" });
    if (result === "gone") {
      await deleteDevice(id);
      report[id] = "abonelik geçersiz, silindi";
    } else if (result === "ok") {
      await saveDevice(id, markSent(device, due, now));
      report[id] = `gönderildi: ${due.map((r) => r.title).join(", ")}`;
    } else {
      report[id] = `gönderilemedi: ${due.map((r) => r.title).join(", ")}`;
    }
  }

  return Response.json({ time: now, report });
}

export const GET = run;
export const POST = run;
