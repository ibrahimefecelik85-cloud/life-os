"use client";
// Bugün ekranındaki "Günlük rutin" kartı
import Link from "next/link";
import { useMemo } from "react";
import { Repeat } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/misc";
import { toISODate, timeToMinutes } from "@/lib/dates";
import { computeStreak, groupDoneDates, isScheduledOn, useHabits, useRecentHabitLogs } from "../hooks";
import { HabitRow } from "./HabitRow";

export function HabitsCard({ now }: { now: Date }) {
  const today = toISODate(now);
  const habits = useHabits();
  const logs = useRecentHabitLogs(today);
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const todays = useMemo(() => (habits ?? []).filter((h) => isScheduledOn(h, now)), [habits, now]);
  const doneDates = useMemo(() => groupDoneDates(logs), [logs]);
  const todayLogs = useMemo(() => new Map((logs ?? []).filter((l) => l.date === today).map((l) => [l.habitId, l])), [logs, today]);

  const doneCount = todays.filter((h) => todayLogs.get(h.id)?.done).length;
  const pct = todays.length ? Math.round((doneCount / todays.length) * 100) : 0;

  // Yapılmamışlar üstte, yapılanlar altta
  const sorted = [...todays].sort((a, b) => Number(!!todayLogs.get(a.id)?.done) - Number(!!todayLogs.get(b.id)?.done));

  return (
    <Card
      title="Günlük rutin"
      icon={<Repeat size={16} />}
      action={
        <Link href="/rutin" className="text-xs text-brand-600">
          {todays.length > 0 ? `${doneCount}/${todays.length} · Düzenle` : "Düzenle"}
        </Link>
      }
    >
      {habits === undefined || logs === undefined ? null : todays.length === 0 ? (
        <EmptyState text="Bugün için rutin yok." />
      ) : (
        <>
          <div className="mb-1 h-1.5 overflow-hidden rounded-full bg-ink-900/10">
            <div
              className={`h-full rounded-full transition-all ${pct === 100 ? "bg-brand-700" : "bg-brand-500"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          {pct === 100 && <p className="mt-2 text-sm text-brand-700">Bugünkü rutinin tamam 💪</p>}
          <ul className="divide-y divide-ink-900/15">
            {sorted.map((h) => {
              const log = todayLogs.get(h.id);
              return (
                <HabitRow
                  key={h.id}
                  habit={h}
                  log={log}
                  date={today}
                  streak={computeStreak(h, doneDates.get(h.id) ?? new Set(), now)}
                  overdue={!log?.done && !!h.remindAt && nowMin >= timeToMinutes(h.remindAt)}
                />
              );
            })}
          </ul>
        </>
      )}
    </Card>
  );
}
