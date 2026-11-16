"use client";
// Takvim, farklı modüllerin tarihli verilerini tek tip "CalendarItem" listesine çevirir.
// Yeni bir kaynak eklemek için (ör. kulüp etkinliği):
//   1) CalendarItem["source"] tipine yeni bir değer ekle
//   2) useCalendarItems içinde o tablodan veriyi okuyup listeye ekle
import { useLiveQuery } from "dexie-react-hooks";
import { eachDayOfInterval, parseISO } from "date-fns";
import { db } from "@/lib/db";
import { courseColor } from "@/lib/colors";
import { toISODate, weekdayOf } from "@/lib/dates";
import { ASSESSMENT_TYPE_LABELS, CLUB_EVENT_LABELS, SESSION_KIND_LABELS } from "@/lib/labels";
import type { Assessment, CalendarEvent, ClassSession, ClubEvent, ISODate, Todo } from "@/types";

export type CalendarItem = {
  key: string;
  date: ISODate;
  time?: string;
  endTime?: string; // ders/idman gibi saat aralığı olanlar için
  title: string;
  label: string; // "Sınav", "Görev", "Etkinlik"...
  dot: string; // Tailwind renk sınıfı
  done: boolean;
  important: boolean; // sınav gibi öne çıkması gerekenler
  recurring: boolean; // haftalık programdan gelen (ders, idman) — takvimde soluk gösterilir
} & (
  | { source: "assessment"; item: Assessment }
  | { source: "todo"; item: Todo }
  | { source: "event"; item: CalendarEvent }
  | { source: "session"; item: ClassSession }
  | { source: "club"; item: ClubEvent }
);

export function useCalendarItems(from: ISODate, to: ISODate): CalendarItem[] | undefined {
  return useLiveQuery(async () => {
    const [assessments, todos, events, courses, sessions, clubEvents] = await Promise.all([
      db.assessments.where("dueDate").between(from, to, true, true).toArray(),
      db.todos.where("dueDate").between(from, to, true, true).toArray(),
      db.events.where("date").between(from, to, true, true).toArray(),
      db.courses.toArray(),
      db.classSessions.toArray(),
      db.clubEvents.where("date").between(from, to, true, true).toArray(),
    ]);
    const courseMap = new Map(courses.map((c) => [c.id, c]));

    const items: CalendarItem[] = [
      ...assessments.map((a): CalendarItem => {
        const course = courseMap.get(a.courseId);
        return {
          key: `a-${a.id}`,
          source: "assessment",
          item: a,
          date: a.dueDate,
          time: a.dueTime,
          title: `${course?.code ?? "?"} · ${a.title}`,
          label: ASSESSMENT_TYPE_LABELS[a.type],
          dot: courseColor(course?.color).dot,
          done: a.done,
          important: a.type === "sinav",
          recurring: false,
        };
      }),
      ...todos.map(
        (t): CalendarItem => ({
          key: `t-${t.id}`,
          source: "todo",
          item: t,
          date: t.dueDate!,
          title: t.title,
          label: "Görev",
          dot: "bg-ink-600",
          done: t.done,
          important: false,
          recurring: false,
        }),
      ),
      ...events.map(
        (e): CalendarItem => ({
          key: `e-${e.id}`,
          source: "event",
          item: e,
          date: e.date,
          time: e.time,
          title: e.title,
          label: "Etkinlik",
          dot: "bg-fuchsia-400",
          done: false,
          important: false,
          recurring: false,
        }),
      ),
      ...clubEvents.map(
        (c): CalendarItem => ({
          key: `c-${c.id}`,
          source: "club",
          item: c,
          date: c.date,
          time: c.time,
          endTime: c.endTime,
          title: c.title,
          label: `Kulüp · ${CLUB_EVENT_LABELS[c.type]}`,
          dot: "bg-ink-900",
          done: false,
          important: false,
          recurring: false,
        }),
      ),
    ];

    // Haftalık program (ders, PS, lab, idman): aralıktaki her güne o günün saatlerini yerleştir
    const byWeekday = new Map<number, ClassSession[]>();
    for (const s of sessions) byWeekday.set(s.weekday, [...(byWeekday.get(s.weekday) ?? []), s]);
    for (const day of eachDayOfInterval({ start: parseISO(from), end: parseISO(to) })) {
      const date = toISODate(day);
      for (const s of byWeekday.get(weekdayOf(day)) ?? []) {
        const course = courseMap.get(s.courseId);
        items.push({
          key: `s-${s.id}-${date}`,
          source: "session",
          item: s,
          date,
          time: s.start,
          endTime: s.end,
          title: course?.code ?? "?",
          label: SESSION_KIND_LABELS[s.kind],
          dot: courseColor(course?.color).dot,
          done: false,
          important: false,
          recurring: true,
        });
      }
    }

    // Gün içinde: önce saatliler (saate göre), sonra saatsizler
    return items.sort(
      (a, b) => a.date.localeCompare(b.date) || (a.time ?? "99").localeCompare(b.time ?? "99"),
    );
  }, [from, to]);
}
