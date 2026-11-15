"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { addDays, parseISO } from "date-fns";
import { db } from "@/lib/db";
import { toISODate, weekdayOf } from "@/lib/dates";
import type { Habit, HabitLog, ID, ISODate } from "@/types";

/** Alışkanlık o gün yapılacaklar listesinde mi? (days boşsa her gün) */
export const isScheduledOn = (habit: Habit, date: Date) =>
  habit.days.length === 0 || habit.days.includes(weekdayOf(date));

export function useHabits(): Habit[] | undefined {
  return useLiveQuery(() => db.habits.orderBy("order").toArray());
}

/** Belirli bir günün kayıtları: habitId → kayıt */
export function useHabitLogsForDate(date: ISODate | null): Map<ID, HabitLog> | undefined {
  return useLiveQuery(async () => {
    if (!date) return new Map();
    const logs = await db.habitLogs.where("date").equals(date).toArray();
    return new Map(logs.map((l) => [l.habitId, l]));
  }, [date]);
}

/** Son `days` günün tüm kayıtları (seri ve geçmiş görünümü için) */
export function useRecentHabitLogs(today: ISODate | null, days = 90): HabitLog[] | undefined {
  return useLiveQuery(async () => {
    if (!today) return [];
    const from = toISODate(addDays(parseISO(today), -days));
    return db.habitLogs.where("date").between(from, today, true, true).toArray();
  }, [today, days]);
}

/**
 * Seri: art arda kaç planlı gün tamamlandı.
 * Bugün henüz yapılmadıysa seri bozulmuş sayılmaz, dünden geriye sayılır.
 */
export function computeStreak(habit: Habit, doneDates: Set<ISODate>, today: Date): number {
  let streak = 0;
  let d = today;
  if (!doneDates.has(toISODate(d))) d = addDays(d, -1);
  for (let i = 0; i < 365; i++) {
    if (isScheduledOn(habit, d)) {
      if (!doneDates.has(toISODate(d))) break;
      streak++;
    }
    d = addDays(d, -1);
  }
  return streak;
}

/** habitId → tamamlanan günler kümesi */
export function groupDoneDates(logs: HabitLog[] | undefined): Map<ID, Set<ISODate>> {
  const map = new Map<ID, Set<ISODate>>();
  for (const l of logs ?? []) {
    if (!l.done) continue;
    if (!map.has(l.habitId)) map.set(l.habitId, new Set());
    map.get(l.habitId)!.add(l.date);
  }
  return map;
}
