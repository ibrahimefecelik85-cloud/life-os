"use client";
// Aylık takvim: ödevler, sınavlar, görevler ve etkinlikler tek bakışta
import { useMemo, useState } from "react";
import { addMonths, endOfISOWeek, endOfMonth, format, startOfISOWeek, startOfMonth, eachDayOfInterval } from "date-fns";
import { tr } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, IconButton } from "@/components/ui/Button";
import { useNow } from "@/hooks/useNow";
import { toISODate } from "@/lib/dates";
import { useCalendarItems, type CalendarItem } from "@/features/calendar/hooks";
import { MonthGrid } from "@/features/calendar/components/MonthGrid";
import { DayDetails, type AddKind } from "@/features/calendar/components/DayDetails";
import { EventFormModal } from "@/features/calendar/components/EventFormModal";
import { AssessmentFormModal } from "@/features/courses/components/AssessmentFormModal";
import { TodoFormModal } from "@/features/todos/components/TodoFormModal";
import type { Assessment, CalendarEvent, ISODate, Todo } from "@/types";

type Editing =
  | { kind: "event"; item?: CalendarEvent }
  | { kind: "assessment"; item?: Assessment }
  | { kind: "todo"; item?: Todo }
  | null;

export default function TakvimPage() {
  const now = useNow();
  return now ? <Calendar now={now} /> : <PageHeader title="Takvim" />;
}

function Calendar({ now }: { now: Date }) {
  const today = toISODate(now);
  const [monthOffset, setMonthOffset] = useState(0);
  const [selected, setSelected] = useState<ISODate>(today);
  const [editing, setEditing] = useState<Editing>(null);

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
      if (!map.has(i.date)) map.set(i.date, []);
      map.get(i.date)!.push(i);
    }
    return map;
  }, [items]);

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
  }

  const close = () => setEditing(null);

  return (
    <>
      <PageHeader
        title="Takvim"
        action={
          monthOffset !== 0 && (
            <Button size="sm" variant="secondary" onClick={() => goToMonth(0)}>
              Bugün
            </Button>
          )
        }
      />

      <div className="space-y-4">
        {/* Ay seçici */}
        <div className="flex items-center justify-between">
          <IconButton onClick={() => goToMonth(monthOffset - 1)} aria-label="Önceki ay">
            <ChevronLeft size={20} />
          </IconButton>
          <div className="text-center">
            <p className="text-lg font-semibold capitalize">{format(month, "MMMM yyyy", { locale: tr })}</p>
            <p className="text-xs text-zinc-500">
              {summary.length > 0 ? summary.map((s) => `${s.n} ${s.label}`).join(" · ") : "Bu ay boş"}
            </p>
          </div>
          <IconButton onClick={() => goToMonth(monthOffset + 1)} aria-label="Sonraki ay">
            <ChevronRight size={20} />
          </IconButton>
        </div>

        <MonthGrid days={days} month={month} today={today} selected={selected} itemsByDay={itemsByDay} onSelect={setSelected} />

        {/* Renk açıklaması */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-zinc-500">
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
            <span className="h-2 w-2 rounded-full bg-zinc-400" /> Görev
          </span>
        </div>

        <DayDetails
          date={selected}
          now={now}
          items={itemsByDay.get(selected) ?? []}
          onOpen={openItem}
          onAdd={(kind: AddKind) => setEditing({ kind })}
        />
      </div>

      {editing?.kind === "event" && <EventFormModal initial={editing.item} defaultDate={selected} onClose={close} />}
      {editing?.kind === "assessment" && <AssessmentFormModal initial={editing.item} defaultDate={selected} onClose={close} />}
      {editing?.kind === "todo" && <TodoFormModal initial={editing.item} defaultDate={selected} defaultCategory="kisisel" onClose={close} />}
    </>
  );
}
