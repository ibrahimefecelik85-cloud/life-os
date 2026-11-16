"use client";
// Günlük harcama sütun grafiği. Bir sütunun üstüne gelince / dokununca o günün tutarı üstte yazar.
import { useState } from "react";
import { format, getDaysInMonth, isSameMonth, setDate } from "date-fns";
import { tr } from "date-fns/locale";
import { Card } from "@/components/ui/Card";
import { formatTL, formatTLShort } from "@/lib/money";
import type { Expense } from "@/types";

export function DailyChart({ expenses, month, now }: { expenses: Expense[]; month: Date; now: Date }) {
  const [active, setActive] = useState<number | null>(null);
  const days = getDaysInMonth(month);
  const todayNum = isSameMonth(month, now) ? now.getDate() : null;

  const perDay = Array.from({ length: days }, () => 0);
  for (const e of expenses) perDay[Number(e.date.slice(8, 10)) - 1] += e.amount;
  const max = Math.max(...perDay, 0);
  const peakDay = perDay.indexOf(max) + 1;

  // Üstteki bilgi satırı: seçili gün, yoksa en yüksek gün
  const shownDay = active ?? (max > 0 ? peakDay : null);
  const info =
    shownDay === null
      ? "Bu ay harcama yok"
      : `${format(setDate(month, shownDay), "d MMMM EEEE", { locale: tr })} · ${formatTL(perDay[shownDay - 1])}`;

  return (
    <Card title="Günlük harcama">
      <p className="mb-3 h-5 text-sm text-ink-700" aria-live="polite">
        {active === null && max > 0 && <span className="text-ink-500">En yüksek gün: </span>}
        {info}
      </p>

      <div className="relative">
        {/* En yüksek değer çizgisi (silik ızgara) */}
        {max > 0 && (
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center gap-2">
            <span className="h-px flex-1 border-t border-dashed border-ink-900/15" />
            <span className="text-[10px] tabular-nums text-ink-500">{formatTLShort(max)}</span>
          </div>
        )}

        <div className="flex h-32 items-end gap-[2px] border-b border-ink-900/30 pt-4" onMouseLeave={() => setActive(null)}>
          {perDay.map((v, i) => {
            const day = i + 1;
            const isActive = active === day;
            return (
              <button
                key={day}
                type="button"
                onMouseEnter={() => setActive(day)}
                onFocus={() => setActive(day)}
                // Telefonda dokunma önce "üzerine gelme" sayılır; tıklama da seçsin (açıp kapatmasın)
                onClick={() => setActive(day)}
                aria-label={`${day}. gün: ${formatTL(v)}`}
                // Dokunma alanı: sütunun tamamı (çubuk ince olsa da kolay dokunulur)
                className="group flex h-full flex-1 items-end justify-center"
              >
                {v > 0 && (
                  <span
                    className={`block w-full max-w-6 rounded-t-[4px] bg-chart transition-opacity ${
                      active !== null && !isActive ? "opacity-40" : ""
                    }`}
                    style={{ height: `${Math.max(3, (v / max) * 100)}%` }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Gün etiketleri: 1, 5, 10, 15, 20, 25 (+ ay sonu, 30'a çok yakın değilse). Bugün: küçük nokta */}
        <div className="mt-1 flex gap-[2px] text-[10px] tabular-nums text-ink-500">
          {perDay.map((_, i) => {
            const day = i + 1;
            const show = day === 1 || day % 5 === 0 || (day === days && days % 5 >= 2);
            const isToday = day === todayNum;
            return (
              <span key={day} className={`flex flex-1 flex-col items-center ${isToday ? "font-semibold text-brand-700" : ""}`}>
                <span className={`mb-0.5 h-1 w-1 rounded-full ${isToday ? "bg-brand-700" : ""}`} />
                {show ? day : ""}
              </span>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
