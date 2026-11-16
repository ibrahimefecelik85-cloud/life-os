"use client";
// Bulut senkronizasyon motoru (cihaz tarafı).
//
// Değişiklik tespiti: her kaydın son senkrondaki özetini (hash) "base" içinde saklıyoruz.
//   - özet farklıysa → kayıt değişmiş/yeni → gönder
//   - base'de olup cihazda yoksa → silinmiş → "silindi" olarak gönder
// Böylece uygulamanın geri kalanında hiçbir şeyi değiştirmeden tüm düzenlemeler yakalanır
// (yedek yükleme dahil).
import { db } from "@/lib/db";
import { hashOf, makeKey, splitKey, SYNC_TABLES, type SyncChange, type SyncRecord, type SyncResponse } from "@/lib/sync/protocol";

// ---- Cihazda saklanan senkron durumu (bulut verisi değil, sadece bu cihaza ait) ----
const LS_KEY = "life-os:sync";

interface LocalSyncState {
  password: string;
  cursor: number; // sunucudan en son alınan sürüm
  base: Record<string, number>; // kayıt anahtarı → son senkrondaki özet
  lastSyncAt?: number;
}

function loadState(): LocalSyncState | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as LocalSyncState) : null;
  } catch {
    return null;
  }
}

function saveState(s: LocalSyncState | null) {
  try {
    if (s) localStorage.setItem(LS_KEY, JSON.stringify(s));
    else localStorage.removeItem(LS_KEY);
  } catch {
    /* depolama kapalıysa senkron bu oturumla sınırlı kalır */
  }
}

export const isSyncConfigured = () => loadState() !== null;
/** Kestirme adresi için (sadece bu cihazda saklanır) */
export const getSyncPassword = () => loadState()?.password ?? null;
export const lastSyncAt = () => loadState()?.lastSyncAt ?? null;

// ---- Durum (arayüz için): kapalı / hazır / senkronize ediliyor / hata ----
export type SyncStatus = { state: "off" | "idle" | "syncing" | "error"; lastSyncAt: number | null; error?: string };
let status: SyncStatus = { state: "off", lastSyncAt: null };
const listeners = new Set<() => void>();
function setStatus(s: SyncStatus) {
  status = s;
  listeners.forEach((l) => l());
}
export const getStatus = () => status;
export function subscribeStatus(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}
export function refreshStatus() {
  const st = loadState();
  setStatus(st ? { state: "idle", lastSyncAt: st.lastSyncAt ?? null } : { state: "off", lastSyncAt: null });
}

// Sunucudan gelenler uygulanırken veritabanı "değişti" sinyali vermesin (sonsuz döngü olmasın)
let applying = false;
export const isApplying = () => applying;

// ---- Yardımcılar ----
const primKey = (table: string) => (db.table(table).schema.primKey.keyPath as string) ?? "id";

/** Cihazdaki tüm kayıtlar: anahtar → { veri, özet } */
async function readLocal(): Promise<Map<string, { data: Record<string, unknown>; hash: number }>> {
  const out = new Map<string, { data: Record<string, unknown>; hash: number }>();
  for (const table of SYNC_TABLES) {
    const pk = primKey(table);
    for (const row of (await db.table(table).toArray()) as Record<string, unknown>[]) {
      out.set(makeKey(table, String(row[pk])), { data: row, hash: hashOf(row) });
    }
  }
  return out;
}

async function request(password: string, since: number, changes: SyncChange[]): Promise<SyncResponse> {
  const res = await fetch("/api/sync", {
    method: "POST",
    // Türkçe harfler (ş, ğ, ı...) başlıkta bozulmasın diye kodlanarak gönderilir
    headers: { "Content-Type": "application/json", "x-sync-password": encodeURIComponent(password) },
    body: JSON.stringify({ since, changes }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? `Sunucu hatası (${res.status})`);
  return body as SyncResponse;
}

/**
 * Sunucudan gelen kayıtları cihaza yazar.
 * `skip`: istek sürerken cihazda tekrar değişen kayıtlar — onları ezme, bir sonraki turda gönderilirler.
 */
async function applyRecords(records: SyncRecord[], skip: Set<string> = new Set()) {
  if (records.length === 0) return;
  const byTable = new Map<string, { puts: unknown[]; deletes: string[] }>();
  for (const r of records) {
    if (skip.has(r.key)) continue;
    const { table, id } = splitKey(r.key);
    if (!SYNC_TABLES.includes(table)) continue;
    const t = byTable.get(table) ?? { puts: [], deletes: [] };
    if (r.data) t.puts.push(r.data);
    else t.deletes.push(id);
    byTable.set(table, t);
  }
  applying = true;
  try {
    await db.transaction("rw", SYNC_TABLES.map((n) => db.table(n)), async () => {
      for (const [table, { puts, deletes }] of byTable) {
        if (deletes.length) await db.table(table).bulkDelete(deletes);
        if (puts.length) await db.table(table).bulkPut(puts);
      }
    });
  } finally {
    applying = false;
  }
}

async function snapshotBase(): Promise<Record<string, number>> {
  const base: Record<string, number> = {};
  for (const [k, v] of await readLocal()) base[k] = v.hash;
  return base;
}

// ---- Dışarıya açık işlemler ----

/**
 * Bu cihazı buluta bağlar.
 *  - Bulut boşsa: bu cihazdaki tüm veriler yüklenir → "uploaded"
 *  - Bulutta veri varsa: `confirmReplace` onaylanırsa bu cihazdaki veriler buluttakilerle DEĞİŞTİRİLİR → "downloaded"
 */
export async function connect(password: string, confirmReplace: () => boolean): Promise<"uploaded" | "downloaded" | "cancelled"> {
  const first = await request(password, 0, []); // şifreyi de doğrular
  const hasCloudData = first.records.some((r) => r.data !== null);

  if (!hasCloudData) {
    const local = await readLocal();
    const changes: SyncChange[] = [...local.entries()].map(([key, v]) => ({ key, data: v.data }));
    const res = await request(password, 0, changes);
    saveState({ password, cursor: res.cursor, base: Object.fromEntries([...local].map(([k, v]) => [k, v.hash])), lastSyncAt: Date.now() });
    refreshStatus();
    return "uploaded";
  }

  if (!confirmReplace()) return "cancelled";
  // Cihazdaki senkronlu tabloları boşalt, buluttakileri yaz
  applying = true;
  try {
    await db.transaction("rw", SYNC_TABLES.map((n) => db.table(n)), async () => {
      for (const t of SYNC_TABLES) await db.table(t).clear();
    });
  } finally {
    applying = false;
  }
  await applyRecords(first.records.filter((r) => r.data !== null));
  saveState({ password, cursor: first.cursor, base: await snapshotBase(), lastSyncAt: Date.now() });
  refreshStatus();
  return "downloaded";
}

export function disconnect() {
  saveState(null);
  refreshStatus();
}

let running: Promise<void> | null = null;
let again = false;

/** Bir senkron turu: değişiklikleri gönder, yenileri al. Aynı anda tek tur çalışır. */
export function syncNow(): Promise<void> {
  if (running) {
    again = true; // tur sürerken yeni değişiklik oldu → bitince bir tur daha
    return running;
  }
  running = (async () => {
    try {
      do {
        again = false;
        await syncRound();
      } while (again);
    } finally {
      running = null;
    }
  })();
  return running;
}

async function syncRound() {
  const st = loadState();
  if (!st) return;
  if (typeof navigator !== "undefined" && !navigator.onLine) return; // internet yokken deneme
  setStatus({ state: "syncing", lastSyncAt: st.lastSyncAt ?? null });

  try {
    // 1) Değişenleri bul
    const local = await readLocal();
    const changes: SyncChange[] = [];
    for (const [key, v] of local) if (st.base[key] !== v.hash) changes.push({ key, data: v.data });
    for (const key of Object.keys(st.base)) if (!local.has(key)) changes.push({ key, data: null });

    // 2) Gönder + yenileri al
    const res = await request(st.password, st.cursor, changes);

    // 3) Uygula — istek sırasında cihazda yeniden değişenleri ezme
    const now = await readLocal();
    const skip = new Set<string>();
    for (const r of res.records) {
      const before = local.get(r.key)?.hash;
      const after = now.get(r.key)?.hash;
      if (before !== after) skip.add(r.key);
    }
    await applyRecords(res.records, skip);
    if (skip.size > 0) again = true;

    // 4) Yeni temel durum: SADECE gönderdiklerimiz ve uyguladıklarımız "senkronlandı" sayılır.
    //    İstek sürerken değişen diğer kayıtların eski özeti kalır → bir sonraki turda gönderilir.
    const base = { ...st.base };
    for (const c of changes) {
      if (c.data) base[c.key] = hashOf(c.data);
      else delete base[c.key];
    }
    for (const r of res.records) {
      if (skip.has(r.key)) continue;
      if (r.data) base[r.key] = hashOf(r.data);
      else delete base[r.key];
    }
    saveState({ ...st, cursor: res.cursor, base, lastSyncAt: Date.now() });
    setStatus({ state: "idle", lastSyncAt: Date.now() });
  } catch (e) {
    setStatus({ state: "error", lastSyncAt: st.lastSyncAt ?? null, error: e instanceof Error ? e.message : "Senkron hatası" });
    throw e;
  }
}
