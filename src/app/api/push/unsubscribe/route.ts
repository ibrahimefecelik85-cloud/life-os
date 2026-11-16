// Bildirimleri kapat: cihaz kaydını sil.
import { deleteDevice, deviceId } from "@/lib/push/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (typeof body?.endpoint !== "string") return Response.json({ error: "Geçersiz veri" }, { status: 400 });
  await deleteDevice(deviceId(body.endpoint));
  return Response.json({ ok: true });
}
