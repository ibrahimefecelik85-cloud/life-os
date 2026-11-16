// Bildirim aboneliklerinin sunucu tarafı hafızası.
// Vercel'de Upstash Redis kullanılır (ortam değişkenleri aşağıda).
// Değişkenler yoksa (bilgisayarında `npm run dev`) geçici bellek kullanılır — sunucu kapanınca silinir.
import "server-only";
import { createHash } from "node:crypto";
import { Redis } from "@upstash/redis";
import type { DeviceState } from "./schedule";

const PREFIX = "lifeos:device:";
const INDEX = "lifeos:devices";
export const MAX_DEVICES = 10; // kişisel uygulama: kötüye kullanıma karşı üst sınır

// Vercel'in Upstash entegrasyonu KV_REST_API_* adlarını, Upstash'in kendisi UPSTASH_REDIS_REST_* adlarını kullanır
const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

// Geliştirme için yedek: bellek içi
const memory = new Map<string, DeviceState>();

export const storeKind = redis ? "upstash" : "memory";

/** Abonelik adresinden kısa, sabit bir kimlik üretir */
export const deviceId = (endpoint: string) => createHash("sha256").update(endpoint).digest("hex").slice(0, 24);

export async function getDevice(id: string): Promise<DeviceState | null> {
  if (!redis) return memory.get(id) ?? null;
  return (await redis.get<DeviceState>(PREFIX + id)) ?? null;
}

export async function saveDevice(id: string, state: DeviceState): Promise<void> {
  if (!redis) {
    memory.set(id, state);
    return;
  }
  await redis.set(PREFIX + id, state);
  await redis.sadd(INDEX, id);
}

export async function deleteDevice(id: string): Promise<void> {
  if (!redis) {
    memory.delete(id);
    return;
  }
  await redis.del(PREFIX + id);
  await redis.srem(INDEX, id);
}

export async function listDeviceIds(): Promise<string[]> {
  if (!redis) return [...memory.keys()];
  return (await redis.smembers(INDEX)) as string[];
}
