"use client";
// Sosyal medya engeli: ayarı okuma/yazma ve bugünkü durumu cihazdaki verilerden hesaplama
// (sunucudaki /api/block ile AYNI kural: src/lib/block/rule.ts)
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { BLOCK_CONFIG_KEY, computeBlock, DEFAULT_BLOCK_CONFIG, previousDay, type BlockConfig, type BlockResult } from "@/lib/block/rule";

export async function getBlockConfig(): Promise<BlockConfig> {
  const row = await db.settings.get(BLOCK_CONFIG_KEY);
  return { ...DEFAULT_BLOCK_CONFIG, ...(row?.value as Partial<BlockConfig> | undefined) };
}

export const saveBlockConfig = (c: BlockConfig) => db.settings.put({ key: BLOCK_CONFIG_KEY, value: c });

export function useBlockConfig(): BlockConfig | undefined {
  return useLiveQuery(getBlockConfig);
}

/** Bugünkü engel durumu (cihazdaki verilere göre) */
export function useBlockStatus(today: string | null): BlockResult | undefined {
  return useLiveQuery(async () => {
    if (!today) return undefined;
    const [config, habits, logs] = await Promise.all([
      getBlockConfig(),
      db.habits.toArray(),
      db.habitLogs.where("date").anyOf([today, previousDay(today)]).toArray(),
    ]);
    const done = new Set(logs.filter((l) => l.done).map((l) => `${l.habitId}_${l.date}`));
    return computeBlock(
      config,
      habits.map((h) => ({ id: h.id, title: h.title, days: h.days })),
      (id, date) => done.has(`${id}_${date}`),
      today,
    );
  }, [today]);
}
