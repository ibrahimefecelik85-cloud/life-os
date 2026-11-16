"use client";
// Dönem bitiş tarihi: bu tarihten SONRA okul dersleri (aktiviteler değil) takvimde, Bugün ekranında
// ve "Bu Hafta" görünümünde gösterilmez. Haftalık program silinmez, sadece gizlenir.
// Ayarlar tablosunda tutulur → bulut senkronuyla tüm cihazlarda aynı olur.
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { Course, ISODate } from "@/types";

export const SEMESTER_END_KEY = "semester.end";

/** undefined = yükleniyor, null = bitiş tarihi yok */
export function useSemesterEnd(): ISODate | null | undefined {
  return useLiveQuery(async () => {
    const row = await db.settings.get(SEMESTER_END_KEY);
    return typeof row?.value === "string" ? row.value : null;
  });
}

export const setSemesterEnd = (date: ISODate | null) =>
  date ? db.settings.put({ key: SEMESTER_END_KEY, value: date }) : db.settings.delete(SEMESTER_END_KEY);

/** Bu ders/aktivite o tarihte programda gösterilmeli mi? */
export function isSessionActive(course: Pick<Course, "type"> | undefined, date: ISODate, semesterEnd: ISODate | null | undefined): boolean {
  if (!semesterEnd || course?.type === "aktivite") return true;
  return date <= semesterEnd;
}
