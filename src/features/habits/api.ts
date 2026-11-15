// Günlük rutin modülünün veri işlemleri
import { db } from "@/lib/db";
import { newId } from "@/lib/id";
import type { Habit, HabitLog, ID, ISODate } from "@/types";

export type HabitInput = Pick<Habit, "title" | "days" | "targetMinutes" | "remindAt">;

/** Bir alışkanlığın belirli gündeki kaydının kimliği (her gün için tek kayıt) */
export const logId = (habitId: ID, date: ISODate) => `${habitId}_${date}`;

export async function addHabit(data: HabitInput) {
  const last = await db.habits.orderBy("order").last();
  return db.habits.add({ ...data, id: newId(), order: (last?.order ?? -1) + 1, createdAt: Date.now() });
}

export const updateHabit = (id: ID, data: Partial<HabitInput>) => db.habits.update(id, data);

export const deleteHabit = (id: ID) =>
  db.transaction("rw", db.habits, db.habitLogs, async () => {
    await db.habitLogs.where("habitId").equals(id).delete();
    await db.habits.delete(id);
  });

/** Listede bir yukarı (-1) veya aşağı (+1) taşı */
export async function moveHabit(id: ID, direction: -1 | 1) {
  const list = await db.habits.orderBy("order").toArray();
  const i = list.findIndex((h) => h.id === id);
  const j = i + direction;
  if (i < 0 || j < 0 || j >= list.length) return;
  await db.transaction("rw", db.habits, async () => {
    await db.habits.update(list[i].id, { order: list[j].order });
    await db.habits.update(list[j].id, { order: list[i].order });
  });
}

function saveLog(habit: Habit, date: ISODate, patch: Partial<HabitLog>, prev?: HabitLog) {
  const next: HabitLog = { id: logId(habit.id, date), habitId: habit.id, date, done: false, ...prev, ...patch };
  next.completedAt = next.done ? (prev?.completedAt ?? Date.now()) : undefined;
  return db.habitLogs.put(next);
}

/** Tamamlandı işaretini aç/kapa */
export async function toggleHabit(habit: Habit, date: ISODate) {
  const prev = await db.habitLogs.get(logId(habit.id, date));
  const done = !prev?.done;
  // Dakika hedefi olanlarda: işaretlenince hedefi doldur, kaldırılınca sıfırla
  const minutes = habit.targetMinutes ? (done ? Math.max(prev?.minutes ?? 0, habit.targetMinutes) : 0) : undefined;
  return saveLog(habit, date, { done, minutes }, prev);
}

/** Dakika ekle/çıkar (ör. +30 dk). Hedefe ulaşınca otomatik tamamlanır. */
export async function addHabitMinutes(habit: Habit, date: ISODate, delta: number) {
  const prev = await db.habitLogs.get(logId(habit.id, date));
  const minutes = Math.max(0, (prev?.minutes ?? 0) + delta);
  const done = habit.targetMinutes ? minutes >= habit.targetMinutes : !!prev?.done;
  return saveLog(habit, date, { minutes, done }, prev);
}
