"use client";
// Aylık takvim paneli: ay seçici + ızgara + seçili günün detayı.
// Hem Takvim sayfasında hem Bugün ekranında kullanılır.
import { useMemo, useState } from "react";
import { addMonths, eachDayOfInterval, endOfISOWeek, endOfMonth, format, startOfISOWeek, startOfMonth } from "date-fns";
import { tr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, GraduationCap } from "lucide-react";
import { IconButton } from "@/components/ui/Button";
import { toISODate } from "@/lib/dates";
import { AssessmentFormModal } from "@/features/courses/components/AssessmentFormModal";
import { SessionFormModal } from "@/features/courses/components/SessionFormModal";
import { TodoFormModal } from "@/features/todos/components/TodoFormModal";
import type { Assessment, CalendarEvent, ClassSession, ISODate, Todo } from "@/types";
import { useCalendarItems, type CalendarItem } from "../hooks";
import { DayDetails } from "./DayDetails";
import { EventFormModal } from "./EventFormModal";
import { MonthGrid } from "./MonthGrid";

type Editing =
  | { kind: "event"; item?: CalendarEvent }
  | { kind: "assessment"; item?: Assessment }
  | { kind: "todo"; item?: Todo }
  | { kind: "session"; item: ClassSession }
  | null;

// "Dersler/idman göster" tercihi bu tarayıcıda hatırlanır
const PREF_KEY = "life-os:calendar-show-sessions";
function readShowSessions(): boolean {
  try {
    return localStorage.getItem(PREF_KEY) !== "0";
  } catch {
    return true;
  }
}

/** embedded: başka bir kartın içinde (Bugün ekranı) — renk açıklaması gizlenir, gün detayı sade görünür */
export function CalendarPanel({ now, embedded = false }: { now: Date; embedded?: boolean }) {
  const today = toISODate(now);
  const [monthOffset, setMonthOffset] = useState(0);
  const [selected, setSelected] = useState<ISODate>(today);
  const [editing, setEditing] = useState<Editing>(null);
  const [showSessions, setShowSessions] = useState(readShowSessions);

  function toggleSessions() {
    const next = !showSessions;
    setShowSessions(next);
    try {
      localStorage.setItem(PREF_KEY, next ? "1" : "0");
    } catch {
      /* depolama kapalıysa sadece bu oturumda geçerli */
    }
  }

  const month = useMemo(() => startOfMonth(addMonths(now, monthOffset)), [now, monthOffset]);
  // Izgara: ayın ilk gününün haftasının Pazartesi'sinden son gününün haftasının Pazar'ına
  const days = useMemo(
    () => eachDayOfInterval({ start: startOfISOWeek(month), end: endOfISOWeek(endOfMonth(month)) }).map(toISODate),
    [month],
  );

  const items = useCalendarItems(days[0], days[days.length - 1]);
  const itemsByDay = useMemo(() => {
    const map = new Map<ISODate, CalendarItem[]>();
    for (const i of items ?? []) {
      if (i.recurring && !showSessions) continue;
      if (!map.has(i.date)) map.set(i.date, []);
      map.get(i.date)!.push(i);
    }
    return map;
  }, [items, showSessions]);

  // Bu ayın özeti (sadece ayın günleri, tamamlanmamışlar)
  const monthKey = format(month, "yyyy-MM");
  const monthItems = (items ?? []).filter((i) => i.date.startsWith(monthKey) && !i.done);
  const count = (pred: (i: CalendarItem) => boolean) => monthItems.filter(pred).length;
  const summary = [
    { label: "sınav", n: count((i) => i.source === "assessment" && i.item.type === "sinav") },
    { label: "quiz", n: count((i) => i.source === "assessment" && i.item.type === "quiz") },
    { label: "ödev/proje", n: count((i) => i.source === "assessment" && (i.item.type === "odev" || i.item.type === "proje")) },
    { label: "etkinlik", n: count((i) => i.source === "event") },
    { label: "görev", n: count((i) => i.source === "todo") },
  ].filter((s) => s.n > 0);

  function goToMonth(offset: number) {
    setMonthOffset(offset);
    // Bu aya dönülünce bugünü, diğer aylarda ayın 1'ini seç
    setSelected(offset === 0 ? today : toISODate(startOfMonth(addMonths(now, offset))));
  }

  function openItem(i: CalendarItem) {
    if (i.source === "event") setEditing({ kind: "event", item: i.item });
    if (i.source === "assessment") setEditing({ kind: "assessment", item: i.item });
    if (i.source === "todo") setEditing({ kind: "todo", item: i.item });
    if (i.source === "session") setEditing({ kind: "session", item: i.item });
  }

  const close = () => setEditing(null);

  return (
    <div className="space-y-4">
      {/* Ay seçici */}
      <div className="flex items-center justify-between">
        <IconButton onClick={() => goToMonth(monthOffset - 1)} aria-label="Önceki ay">
          <ChevronLeft size={20} />
        </IconButton>
        <div className="text-center">
          <p className="font-display text-xl font-semibold capitalize text-ink-950">{format(month, "MMMM yyyy", { locale: tr })}</p>
          <p className="text-xs text-ink-500">
            {summary.length > 0 ? summary.map((s) => `${s.n} ${s.label}`).join(" · ") : "Bu ay boş"}
          </p>
          {monthOffset !== 0 && (
            <button type="button" onClick={() => goToMonth(0)} className="mt-1 block w-full text-xs font-medium text-brand-600">
              Bugüne dön
            </button>
          )}
          <button
            type="button"
            onClick={toggleSessions}
            aria-pressed={showSessions}
            className={`mt-2 inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-[11px] font-medium transition-colors ${
              showSessions ? "glass-soft text-ink-800" : "border border-dashed border-ink-900/30 text-ink-500"
            }`}
          >
            <GraduationCap size={12} /> Dersler/idman: {showSessions ? "açık" : "kapalı"}
          </button>
        </div>
        <IconButton onClick={() => goToMonth(monthOffset + 1)} aria-label="Sonraki ay">
          <ChevronRight size={20} />
        </IconButton>
      </div>

      <MonthGrid days={days} month={month} today={today} selected={selected} itemsByDay={itemsByDay} onSelect={setSelected} compact={embedded} />

      {!embedded && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-ink-500">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-sky-400" /> Ödev/sınav (ders rengi)
          </span>
          <span className="flex items-center gap-1">
            <span className="h-0.5 w-3 rounded-full bg-rose-500" /> Sınav günü
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-fuchsia-400" /> Etkinlik
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-ink-600" /> Görev
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-ink-600 opacity-50" /> Soluk: ders/idman
          </span>
        </div>
      )}

      <DayDetails
        date={selected}
        now={now}
        items={itemsByDay.get(selected) ?? []}
        onOpen={openItem}
        onAdd={(kind) => setEditing({ kind })}
        plain={embedded}
      />

      {editing?.kind === "event" && <EventFormModal initial={editing.item} defaultDate={selected} onClose={close} />}
      {editing?.kind === "assessment" && <AssessmentFormModal initial={editing.item} defaultDate={selected} onClose={close} />}
      {editing?.kind === "todo" && <TodoFormModal initial={editing.item} defaultDate={selected} onClose={close} />}
      {editing?.kind === "session" && <SessionFormModal initial={editing.item} onClose={close} />}
    </div>
  );
}
