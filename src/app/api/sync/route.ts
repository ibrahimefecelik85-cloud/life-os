// Bulut senkronizasyonu uç noktası.
// İstek:  POST { since: number, changes: SyncChange[] }   başlık: x-sync-password: <SYNC_PASSWORD>
// Cevap:  { cursor, records }  → `since`ten sonra değişen tüm kayıtlar (bu istekte gönderilenler dahil)
import { createHash, timingSafeEqual } from "node:crypto";
import { isValidKey, type SyncChange } from "@/lib/sync/protocol";
import { applyChanges, recordsSince } from "@/lib/sync/server-store";

export const dynamic = "force-dynamic";

const MAX_CHANGES = 5000;
const MAX_RECORD_BYTES = 50_000;

/** Şifre karşılaştırması (süre farkından şifre tahmin edilemesin diye sabit zamanlı) */
function passwordOk(given: string | null): boolean {
  const expected = process.env.SYNC_PASSWORD;
  if (!expected || !given) return false;
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  if (!process.env.SYNC_PASSWORD) {
    return Response.json({ error: "Sunucuda SYNC_PASSWORD ayarlanmamış." }, { status: 503 });
  }
  if (!passwordOk(req.headers.get("x-sync-password"))) {
    return Response.json({ error: "Şifre yanlış." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const since = Number.isInteger(body?.since) && body.since >= 0 ? (body.since as number) : 0;
  const raw: unknown[] = Array.isArray(body?.changes) ? body.changes : [];
  if (raw.length > MAX_CHANGES) return Response.json({ error: "Çok fazla değişiklik." }, { status: 413 });

  const changes: SyncChange[] = [];
  for (const c of raw) {
    const o = c as { key?: unknown; data?: unknown };
    if (!isValidKey(o?.key)) return Response.json({ error: "Geçersiz kayıt anahtarı." }, { status: 400 });
    const data = o.data === null ? null : typeof o.data === "object" && !Array.isArray(o.data) ? (o.data as Record<string, unknown>) : undefined;
    if (data === undefined) return Response.json({ error: "Geçersiz kayıt." }, { status: 400 });
    if (data && JSON.stringify(data).length > MAX_RECORD_BYTES) return Response.json({ error: "Kayıt çok büyük." }, { status: 413 });
    changes.push({ key: o.key, data });
  }

  await applyChanges(changes);
  return Response.json(await recordsSince(since));
}
