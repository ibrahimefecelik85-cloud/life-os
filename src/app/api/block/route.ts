// iPhone Kestirmesi bu adresi Instagram/YouTube açılırken çağırır.
// Cevap düz metin: "OK" → serbest; başka bir şey → engel mesajı (Kestirme bunu gösterip ana ekrana döner).
// Veriler bulut senkronundan okunur (rutinler + tikler + ayar). Koruma: ?key=<SYNC_PASSWORD>
import { createHash, timingSafeEqual } from "node:crypto";
import { BLOCK_CONFIG_KEY, blockMessage, computeBlock, DEFAULT_BLOCK_CONFIG, type BlockConfig, type HabitLite } from "@/lib/block/rule";
import { istanbulNow } from "@/lib/push/schedule";
import { recordsSince } from "@/lib/sync/server-store";

export const dynamic = "force-dynamic";

const clean = (s: string) => s.trim().replace(/^["']|["']$/g, "").trim();

function keyOk(given: string | null): boolean {
  const expected = process.env.SYNC_PASSWORD ? clean(process.env.SYNC_PASSWORD) : "";
  if (!expected || !given) return false;
  const a = createHash("sha256").update(clean(given)).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

const text = (body: string, status = 200) =>
  new Response(body, { status, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });

export async function GET(req: Request) {
  if (!keyOk(new URL(req.url).searchParams.get("key"))) return text("Yetkisiz: adresin sonundaki şifre yanlış.", 401);

  const { records } = await recordsSince(0);
  const habits: HabitLite[] = [];
  const done = new Set<string>(); // "<habitId>_<tarih>"
  let config: BlockConfig = DEFAULT_BLOCK_CONFIG;

  for (const r of records) {
    if (!r.data) continue;
    if (r.key.startsWith("habits:")) {
      const h = r.data as { id: string; title: string; days?: number[] };
      habits.push({ id: h.id, title: h.title, days: h.days ?? [] });
    } else if (r.key.startsWith("habitLogs:")) {
      const l = r.data as { habitId: string; date: string; done: boolean };
      if (l.done) done.add(`${l.habitId}_${l.date}`);
    } else if (r.key === `settings:${BLOCK_CONFIG_KEY}`) {
      config = { ...DEFAULT_BLOCK_CONFIG, ...((r.data as { value?: Partial<BlockConfig> }).value ?? {}) };
    }
  }

  const result = computeBlock(config, habits, (id, date) => done.has(`${id}_${date}`), istanbulNow().date);
  return text(blockMessage(result));
}
