"use client";
// Rutin yönetimi: ekle, düzenle, sırala ve son 7 günü gör
import { useMemo, useState } from "react";
import Link from "next/link";
import { addDays, format } from "date-fns";
import { tr } from "date-fns/locale";
import { ArrowDown, ArrowUp, Bell, ChevronLeft, Flame, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, IconButton } from "@/components/ui/Button";
import { useNow } from "@/hooks/useNow";
import { WEEKDAYS, toISODate } from "@/lib/dates";
import { moveHabit } from "@/features/habits/api";
import { computeStreak, groupDoneDates, isScheduledOn, useHabits, useRecentHabitLogs } from "@/features/habits/hooks";
import { HabitFormModal } from "@/features/habits/components/HabitFormModal";
import type { Habit } from "@/types";

function daysLabel(h: Habit) {
  if (h.days.length === 0) return "Her gün";
  if (h.days.join() === "1,2,3,4,5") return "Hafta içi";
  if (h.days.join() === "6,7") return "Hafta sonu";
  return h.days.map((d) => WEEKDAYS[d - 1].short).join(", ");
}

export default function RutinPage() {
  const now = useNow();
  const today = now ? toISODate(now) : null;
  const habits = useHabits();
  const logs = useRecentHabitLogs(today);
  const [editing, setEditing] = useState<{ item?: Habit } | null>(null);

  const doneDates = useMemo(() => groupDoneDates(logs), [logs]);
  // Son 7 gün (soldan sağa: 6 gün önce → bugün)
  const last7 = useMemo(() => (now ? Array.from({ length: 7 }, (_, i) => addDays(now, i - 6)) : []), [now]);

  return (
    <>
      <Link href="/" className="mb-2 inline-flex items-center gap-1 text-sm text-ink-600 hover:text-ink-800">
        <ChevronLeft size={16} /> Bugün
      </Link>
      <PageHeader
        title="Günlük rutin"
        subtitle="Her gün tekrar eden işlerin"
        action={
          <Button size="sm" onClick={() => setEditing({})}>
            <Plus size={16} /> Yeni
          </Button>
        }
      />

      {now && habits && (
        <ul className="space-y-2">
          {habits.map((h, i) => {
            const done = doneDates.get(h.id) ?? new Set<string>();
            const streak = computeStreak(h, done, now);
            return (
              <li key={h.id} className="glass rounded-2xl p-3">
                <div className="flex items-start gap-2">
                  <button type="button" onClick={() => setEditing({ item: h })} className="min-w-0 flex-1 text-left">
                    <p className="font-medium">{h.title}</p>
                    <p className="flex flex-wrap items-center gap-x-2 text-xs text-ink-500">
                      <span>{daysLabel(h)}</span>
                      {h.remindAt && (
                        <span className="flex items-center gap-0.5">
                          <Bell size={11} /> {h.remindAt}
                        </span>
                      )}
                      {h.targetMinutes && <span>{h.targetMinutes} dk</span>}
                      {streak > 0 && (
                        <span className="flex items-center gap-0.5 text-orange-700">
                          <Flame size={11} /> {streak} gün
                        </span>
                      )}
                    </p>
                  </button>
                  <div className="flex">
                    <IconButton onClick={() => moveHabit(h.id, -1)} disabled={i === 0} aria-label="Yukarı taşı" className="disabled:opacity-30">
                      <ArrowUp size={16} />
                    </IconButton>
                    <IconButton onClick={() => moveHabit(h.id, 1)} disabled={i === habits.length - 1} aria-label="Aşağı taşı" className="disabled:opacity-30">
                      <ArrowDown size={16} />
                    </IconButton>
                  </div>
                </div>

                {/* Son 7 gün: yeşil = yapıldı, gri = yapılmadı, boş = o gün planlı değil */}
                <div className="mt-2 flex gap-1.5">
                  {last7.map((d) => {
                    const iso = toISODate(d);
                    const scheduled = isScheduledOn(h, d);
                    const ok = done.has(iso);
                    return (
                      <div key={iso} className="flex flex-1 flex-col items-center gap-1">
                        <div
                          className={`h-2 w-full rounded-full ${
                            ok ? "bg-brand-700" : scheduled ? "bg-ink-900/15" : "border border-dashed border-ink-900/30"
                          }`}
                        />
                        <span className={`text-[10px] ${iso === today ? "text-ink-700" : "text-ink-400"}`}>
                          {format(d, "EEEEEE", { locale: tr })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {editing && <HabitFormModal initial={editing.item} onClose={() => setEditing(null)} />}
    </>
  );
}
