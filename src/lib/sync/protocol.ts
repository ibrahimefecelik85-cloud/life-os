// Bulut senkronizasyonu: cihaz ↔ sunucu arasındaki ortak tanımlar.
//
// Her kayıt bir "anahtar" ile tanınır: "<tablo>:<id>"  (ör. "todos:3f2a...", "settings:budget.monthlyLimit")
// Sunucu her kaydın son halini ve bir sürüm numarası (v) tutar. Silinen kayıtlar "deleted" olarak kalır
// ki diğer cihaz da silsin.
//
// Akış (cihaz tarafı):
//   1) Son senkrondan beri değişen kayıtları bul (her kaydın özetini/hash'ini saklıyoruz)
//   2) Değişiklikleri gönder + "şu sürümden sonrakileri ver" (cursor)
//   3) Sunucudan gelenleri cihaza uygula, yeni cursor'ı sakla

/** Buluta senkronlanan tablolar (db.ts'teki ALL_TABLES ile aynı olmalı) */
export const SYNC_TABLES = [
  "courses",
  "classSessions",
  "assessments",
  "todos",
  "habits",
  "habitLogs",
  "events",
  "expenses",
  "expenseCategories",
  "settings",
  "clubEvents",
  "clubNotes",
] as const;

export type SyncTable = (typeof SYNC_TABLES)[number];

/** Cihazdan sunucuya giden değişiklik. data=null → silindi */
export interface SyncChange {
  key: string;
  data: Record<string, unknown> | null;
}

/** Sunucudaki kayıt */
export interface SyncRecord {
  key: string;
  data: Record<string, unknown> | null;
  v: number; // sunucu sürüm numarası (artan)
}

export interface SyncResponse {
  cursor: number;
  records: SyncRecord[];
}

const KEY_RE = new RegExp(`^(${SYNC_TABLES.join("|")}):[A-Za-z0-9_.\\-]{1,100}$`);
export const isValidKey = (k: unknown): k is string => typeof k === "string" && KEY_RE.test(k);

export const makeKey = (table: string, id: string) => `${table}:${id}`;
export function splitKey(key: string): { table: SyncTable; id: string } {
  const i = key.indexOf(":");
  return { table: key.slice(0, i) as SyncTable, id: key.slice(i + 1) };
}

/** Sıralı JSON (aynı içerik → aynı metin), değişiklik tespiti için */
export function stableStringify(v: unknown): string {
  if (v === null || typeof v !== "object") return JSON.stringify(v) ?? "null";
  if (Array.isArray(v)) return `[${v.map(stableStringify).join(",")}]`;
  const o = v as Record<string, unknown>;
  return `{${Object.keys(o)
    .filter((k) => o[k] !== undefined)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${stableStringify(o[k])}`)
    .join(",")}}`;
}

/** Hızlı 53-bit özet (cyrb53) — kaydın değişip değişmediğini anlamak için */
export function hashOf(v: unknown): number {
  const str = stableStringify(v);
  let h1 = 0xdeadbeef,
    h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}
