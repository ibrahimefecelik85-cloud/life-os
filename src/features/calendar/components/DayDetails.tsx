"use client";
// Seçili günün detayı: o günkü tüm kayıtlar + hızlı ekleme butonları
import type { ReactNode } from "react";
import { parseISO } from "date-fns";
import { CalendarPlus, ClipboardList, GraduationCap, ListTodo, Swords } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/misc";
import { formatLong, relativeDay, weekdayOf } from "@/lib/dates";
import { useCourseMap, useSessions } from "@/features/courses/hooks";
import { isSessionActive, useSemesterEnd } from "@/features/courses/semester";
import type { ISODate } from "@/types";
import type { CalendarItem } from "../hooks";

/** Çerçevesiz bölüm (başka bir kartın içinde kullanılırken) */
function PlainSection({ children }: { children: ReactNode }) {
  return <div className="border-t border-ink-900/50 pt-3">{children}</div>;
}

export type AddKind = "event" | "assessment" | "todo" | "club";

export function DayDetails({
  date,
  now,
  items,
  onOpen,
  onAdd,
  plain = false,
}: {
  date: ISODate;
  now: Date;
  items: CalendarItem[];
  onOpen: (item: CalendarItem) => void;
  onAdd: (kind: AddKind) => void;
  plain?: boolean; // kart çerçevesi olmadan (başka bir kartın içindeyken)
}) {
  const d = parseISO(date);
  const sessions = useSessions();
  const courseMap = useCourseMap();
  const semesterEnd = useSemesterEnd();
  const classCount =
    sessions?.filter((s) => s.weekday === weekdayOf(d) && isSessionActive(courseMap.get(s.courseId), date, semesterEnd)).length ?? 0;

  const Wrapper = plain ? PlainSection : Card;

  return (
    <Wrapper>
      <header className="mb-2">
        <h2 className="font-semibold capitalize">{formatLong(d)}</h2>
        <p className="flex items-center gap-2 text-xs text-ink-500">
          <span>{relativeDay(date, now)}</span>
          {classCount > 0 && (
            <span className="flex items-center gap-1">
              <GraduationCap size={12} /> {classCount} ders
            </span>
          )}
        </p>
      </header>

      {items.length === 0 ? (
        <p className="py-3 text-sm text-ink-500">Bu gün için kayıt yok.</p>
      ) : (
        <ul className="divide-y divide-ink-900/15">
          {items.map((i) => (
            <li key={i.key}>
              <button type="button" onClick={() => onOpen(i)} className="flex w-full items-center gap-3 py-2.5 text-left">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${i.dot}`} />
                <div className="min-w-0 flex-1">
                  <p className={`truncate ${i.done ? "text-ink-500 line-through" : ""}`}>{i.title}</p>
                  <p className="text-xs text-ink-500">
                    {i.label}
                    {i.time && ` · ${i.time}${i.endTime ? `–${i.endTime}` : ""}`}
                    {i.recurring && " · her hafta"}
                    {i.done && " · Tamamlandı"}
                  </p>
                </div>
                {i.important && !i.done && <Badge className="bg-rose-500/15 text-rose-700">Sınav</Badge>}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Button variant="secondary" size="sm" onClick={() => onAdd("event")}>
          <CalendarPlus size={14} /> Etkinlik
        </Button>
        <Button variant="secondary" size="sm" onClick={() => onAdd("assessment")}>
          <ClipboardList size={14} /> Ödev/Sınav
        </Button>
        <Button variant="secondary" size="sm" onClick={() => onAdd("todo")}>
          <ListTodo size={14} /> Görev
        </Button>
        <Button variant="secondary" size="sm" onClick={() => onAdd("club")}>
          <Swords size={14} /> Kulüp
        </Button>
      </div>
    </Wrapper>
  );
}
