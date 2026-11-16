// Bulut verilerinin sunucu tarafı deposu (Upstash Redis).
// Tüm kayıtlar tek bir Redis "hash"inde: alan = kayıt anahtarı, değer = { d: veri|null, v: sürüm }.
// Redis ayarlı değilse (bilgisayarda npm run dev) geçici bellek kullanılır.
import "server-only";
import { Redis } from "@upstash/redis";
import type { SyncChange, SyncRecord } from "./protocol";

const RECORDS = "lifeos:sync:records";
const VERSION = "lifeos:sync:version";

const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

type Stored = { d: Record<string, unknown> | null; v: number };
const memory = { records: new Map<string, Stored>(), version: 0 };

/** Değişiklikleri kaydeder; her birine yeni bir sürüm numarası verir. Gelen her değişiklik kazanır. */
export async function applyChanges(changes: SyncChange[]): Promise<void> {
  if (changes.length === 0) return;
  if (!redis) {
    for (const c of changes) memory.records.set(c.key, { d: c.data, v: ++memory.version });
    return;
  }
  const end = await redis.incrby(VERSION, changes.length);
  let v = end - changes.length;
  // Büyük yüklemeleri parçalara böl (istek boyutu sınırı)
  for (let i = 0; i < changes.length; i += 200) {
    const fields: Record<string, Stored> = {};
    for (const c of changes.slice(i, i + 200)) fields[c.key] = { d: c.data, v: ++v };
    await redis.hset(RECORDS, fields);
  }
}

/** `since` sürümünden sonra değişen kayıtlar + güncel sürüm */
export async function recordsSince(since: number): Promise<{ cursor: number; records: SyncRecord[] }> {
  if (!redis) {
    const records = [...memory.records.entries()].filter(([, s]) => s.v > since).map(([key, s]) => ({ key, data: s.d, v: s.v }));
    return { cursor: memory.version, records };
  }
  // Önce sadece sürüme bak: değişiklik yoksa tüm veriyi indirmeye gerek yok (kotayı ve interneti korur)
  const version = Number((await redis.get<number>(VERSION)) ?? 0);
  if (version <= since) return { cursor: version, records: [] };
  const all = await redis.hgetall<Record<string, Stored>>(RECORDS);
  const records = Object.entries(all ?? {})
    .filter(([, s]) => s && s.v > since)
    .map(([key, s]) => ({ key, data: s.d, v: s.v }));
  return { cursor: Number(version ?? 0), records };
}
