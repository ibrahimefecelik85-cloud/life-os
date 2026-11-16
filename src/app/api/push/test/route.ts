// "Deneme bildirimi gönder" butonu: bu cihaza hemen bir bildirim yollar.
import { sendPush } from "@/lib/push/send";
import { deleteDevice, deviceId, getDevice } from "@/lib/push/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (typeof body?.endpoint !== "string") return Response.json({ error: "Geçersiz veri" }, { status: 400 });
  const id = deviceId(body.endpoint);
  const device = await getDevice(id);
  if (!device) return Response.json({ error: "Bu cihaz kayıtlı değil, bildirimleri yeniden aç." }, { status: 404 });

  const result = await sendPush(device.subscription, {
    title: "Life OS",
    body: "Deneme bildirimi: bildirimler çalışıyor 🎉",
    url: "/",
    tag: "life-os-test",
  });
  if (result === "gone") await deleteDevice(id);
  return Response.json({ result }, { status: result === "ok" ? 200 : 502 });
}
