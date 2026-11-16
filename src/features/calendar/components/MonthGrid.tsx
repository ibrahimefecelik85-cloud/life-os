"use client";
// Aylık takvim ızgarası. Telefonda her günde renkli noktalar,
// geniş ekranda ise kısa başlıklar gösterilir.
import { format, isSameMonth, parseISO } from "date-fns";
import { WEEKDAYS } from "@/lib/dates";
import type { ISODate } from "@/types";
import type { CalendarItem } from "../hooks";

export function MonthGrid({
  days,
  month,
  today,
  selected,
  itemsByDay,
  onSelect,
  compact = false,
}: {
  days: ISODate[];
  month: Date;
  today: ISODate;
  selected: ISODate;
  itemsByDay: Map<ISODate, CalendarItem[]>;
  onSelect: (d: ISODate) => void;
  compact?: boolean; // Bugün ekranında daha kısa hücreler
}) {
  const maxTitles = compact ? 2 : 3;
  return (
    <div>
      <div className="mb-1 grid grid-cols-7 text-center text-[11px] font-medium text-ink-500">
        {WEEKDAYS.map((d) => (
          <span key={d.value}>{d.short}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((iso) => {
          const date = parseISO(iso);
          const items = itemsByDay.get(iso) ?? [];
          const inMonth = isSameMonth(date, month);
          const isToday = iso === today;
          const isSelected = iso === selected;
          const hasExam = items.some((i) => i.important && !i.done);
          // Önce ödev/sınav/etkinlik/görev, sonra haftalık dersler (yer azsa öncelik onlarda)
          const deadlines = items.filter((i) => !i.recurring);
          const sessions = items.filter((i) => i.recurring);
          const ordered = [...deadlines, ...sessions];
          const visibleDots = ordered.slice(0, 5);

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelect(iso)}
              aria-label={`${format(date, "d")} – ${items.length} kayıt`}
              aria-pressed={isSelected}
              className={`relative flex min-h-14 flex-col items-center gap-1 overflow-hidden rounded-xl border p-1 transition-colors sm:items-stretch ${compact ? "sm:min-h-16" : "sm:min-h-24"} ${
                isSelected
                  ? "border-brand-500 bg-brand-500/10"
                  : "border-ink-900/25 bg-white/30 hover:bg-white/55"
              } ${inMonth ? "" : "opacity-35"}`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs tabular-nums sm:self-start ${
                  isToday ? "bg-brand-500 font-semibold text-white" : "text-ink-700"
                }`}
              >
                {format(date, "d")}
              </span>

              {/* Telefon: noktalar */}
              <span className="flex flex-wrap justify-center gap-0.5 sm:hidden">
                {visibleDots.map((i) => (
                  <span
                    key={i.key}
                    className={`rounded-full ${i.dot} ${i.recurring ? "h-1 w-1 self-center opacity-50" : "h-1.5 w-1.5"} ${i.done ? "opacity-30" : ""}`}
                  />
                ))}
                {ordered.length > 5 && <span className="text-[9px] leading-none text-ink-500">+{ordered.length - 5}</span>}
              </span>

              {/* Geniş ekran: kısa başlıklar */}
              <span className="hidden w-full space-y-0.5 sm:block">
                {deadlines.slice(0, maxTitles).map((i) => (
                  <span
                    key={i.key}
                    className={`flex items-center gap-1 truncate text-left text-[10px] ${i.done ? "text-ink-400 line-through" : "text-ink-700"}`}
                  >
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${i.dot}`} />
                    <span className="truncate">{i.title}</span>
                  </span>
                ))}
                {deadlines.length > maxTitles && (
                  <span className="block text-[10px] text-ink-500">+{deadlines.length - maxTitles} daha</span>
                )}
                {/* Haftalık dersler/idman: başlık yerine soluk noktalar */}
                {sessions.length > 0 && (
                  <span className="flex gap-0.5 pt-0.5">
                    {sessions.map((i) => (
                      <span key={i.key} className={`h-1.5 w-1.5 rounded-full opacity-50 ${i.dot}`} title={`${i.time} ${i.title}`} />
                    ))}
                  </span>
                )}
              </span>

              {/* Sınav günü: altta kırmızı çizgi */}
              {hasExam && <span className="absolute inset-x-1.5 bottom-0.5 h-0.5 rounded-full bg-rose-500" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
