"use client";
// Takvim, farklı modüllerin tarihli verilerini tek tip "CalendarItem" listesine çevirir.
// Yeni bir kaynak eklemek için (ör. antrenman, kulüp etkinliği):
//   1) CalendarItem["source"] tipine yeni bir değer ekle
//   2) useCalendarItems içinde o tablodan veriyi okuyup listeye ekle
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { courseColor } from "@/lib/colors";
import { ASSESSMENT_TYPE_LABELS } from "@/lib/labels";
import type { Assessment, CalendarEvent, ISODate, Todo } from "@/types";

export type CalendarItem = {
  key: string;
  date: ISODate;
  time?: string;
  title: string;
  label: string; // "Sınav", "Görev", "Etkinlik"...
  dot: string; // Tailwind renk sınıfı
  done: boolean;
  important: boolean; // sınav gibi öne çıkması gerekenler
} & (
  | { source: "assessment"; item: Assessment }
  | { source: "todo"; item: Todo }
  | { source: "event"; item: CalendarEvent }
);

export function useCalendarItems(from: ISODate, to: ISODate): CalendarItem[] | undefined {
  return useLiveQuery(async () => {
    const [assessments, todos, events, courses] = await Promise.all([
      db.assessments.where("dueDate").between(from, to, true, true).toArray(),
      db.todos.where("dueDate").between(from, to, true, true).toArray(),
      db.events.where("date").between(from, to, true, true).toArray(),
      db.courses.toArray(),
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
        }),
      ),
    ];

    // Gün içinde: önce saatliler (saate göre), sonra saatsizler
    return items.sort(
      (a, b) => a.date.localeCompare(b.date) || (a.time ?? "99").localeCompare(b.time ?? "99"),
    );
  }, [from, to]);
}
