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
          const visibleDots = items.slice(0, 4);

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
                  : "border-ink-200/80 bg-ink-50 hover:bg-ink-100"
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
                  <span key={i.key} className={`h-1.5 w-1.5 rounded-full ${i.dot} ${i.done ? "opacity-30" : ""}`} />
                ))}
                {items.length > 4 && <span className="text-[9px] leading-none text-ink-500">+{items.length - 4}</span>}
              </span>

              {/* Geniş ekran: kısa başlıklar */}
              <span className="hidden w-full space-y-0.5 sm:block">
                {items.slice(0, maxTitles).map((i) => (
                  <span
                    key={i.key}
                    className={`flex items-center gap-1 truncate text-left text-[10px] ${i.done ? "text-ink-400 line-through" : "text-ink-700"}`}
                  >
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${i.dot}`} />
                    <span className="truncate">{i.title}</span>
                  </span>
                ))}
                {items.length > maxTitles && (
                  <span className="block text-[10px] text-ink-500">+{items.length - maxTitles} daha</span>
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
