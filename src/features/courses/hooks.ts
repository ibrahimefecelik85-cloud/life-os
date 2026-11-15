"use client";
// Dersler modülünün veri okuma "hook"ları.
// useLiveQuery sayesinde veri değiştiğinde ekran kendiliğinden güncellenir.
// Not: veri yüklenene kadar sonuç `undefined` olur (ekranda "yükleniyor" durumu).
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { db } from "@/lib/db";
import { timeToMinutes } from "@/lib/dates";
import type { Assessment, ClassSession, Course, ID, ISODate } from "@/types";

export function useCourses(): Course[] | undefined {
  return useLiveQuery(() => db.courses.orderBy("code").toArray());
}

/** id → ders eşlemesi (listelerde ders adını/rengini bulmak için) */
export function useCourseMap(): Map<ID, Course> {
  const courses = useCourses();
  return useMemo(() => new Map((courses ?? []).map((c) => [c.id, c])), [courses]);
}

const byStart = (a: ClassSession, b: ClassSession) => timeToMinutes(a.start) - timeToMinutes(b.start);

/** Tüm program saatleri, gün ve saate göre sıralı */
export function useSessions(): ClassSession[] | undefined {
  return useLiveQuery(async () => {
    const all = await db.classSessions.toArray();
    return all.sort((a, b) => a.weekday - b.weekday || byStart(a, b));
  });
}

/** Belirli bir günün (1=Pzt..7=Paz) dersleri */
export function useSessionsForDay(weekday: number | null): ClassSession[] | undefined {
  return useLiveQuery(async () => {
    if (weekday === null) return [];
    const list = await db.classSessions.where("weekday").equals(weekday).toArray();
    return list.sort(byStart);
  }, [weekday]);
}

const byDue = (a: Assessment, b: Assessment) =>
  a.dueDate.localeCompare(b.dueDate) || (a.dueTime ?? "99").localeCompare(b.dueTime ?? "99");

/** Tüm teslimler, tarihe göre sıralı */
export function useAssessments(): Assessment[] | undefined {
  return useLiveQuery(async () => (await db.assessments.toArray()).sort(byDue));
}

/** İki tarih arasındaki teslimler (ikisi dahil) */
export function useAssessmentsBetween(from: ISODate | null, to: ISODate | null): Assessment[] | undefined {
  return useLiveQuery(async () => {
    if (!from || !to) return [];
    const list = await db.assessments.where("dueDate").between(from, to, true, true).toArray();
    return list.sort(byDue);
  }, [from, to]);
}

/** Tarihi geçmiş ama tamamlanmamış teslimler */
export function useOverdueAssessments(today: ISODate | null): Assessment[] | undefined {
  return useLiveQuery(async () => {
    if (!today) return [];
    const list = await db.assessments.where("dueDate").below(today).toArray();
    return list.filter((a) => !a.done).sort(byDue);
  }, [today]);
}
