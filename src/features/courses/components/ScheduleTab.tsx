"use client";
// Haftalık ders programı: üstte gün seçici + o günün dersleri, altta haftanın özeti
import { useState } from "react";
import { CalendarDays, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge, EmptyState } from "@/components/ui/misc";
import { courseColor } from "@/lib/colors";
import { WEEKDAYS, weekdayOf } from "@/lib/dates";
import { SESSION_KIND_LABELS } from "@/lib/labels";
import type { ClassSession, Weekday } from "@/types";
import { useCourseMap, useSessions } from "../hooks";
import { SemesterEndCard } from "./SemesterEndCard";
import { SessionFormModal } from "./SessionFormModal";

export function ScheduleTab({ now }: { now: Date }) {
  const [day, setDay] = useState<Weekday>(weekdayOf(now));
  const [editing, setEditing] = useState<{ item?: ClassSession } | null>(null);
  const sessions = useSessions();
  const courseMap = useCourseMap();

  const daySessions = sessions?.filter((s) => s.weekday === day) ?? [];
  // Hafta sonu dersi yoksa özet tabloda sadece Pzt–Cum göster
  const hasWeekend = sessions?.some((s) => s.weekday >= 6);
  const gridDays = WEEKDAYS.filter((d) => hasWeekend || d.value <= 5);

  return (
    <div className="space-y-4">
      {/* Gün seçici */}
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => {
          const count = sessions?.filter((s) => s.weekday === d.value).length ?? 0;
          return (
            <button
              key={d.value}
              type="button"
              onClick={() => setDay(d.value)}
              className={`flex h-14 flex-col items-center justify-center rounded-xl text-sm transition-colors ${
                day === d.value ? "border border-ink-900 bg-brand-600 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.25)]" : "glass-soft text-ink-700 hover:bg-white/60"
              }`}
            >
              <span className="font-medium">{d.short}</span>
              <span className="text-[10px] opacity-70">{count > 0 ? `${count} ders` : "–"}</span>
            </button>
          );
        })}
      </div>

      <Card title={WEEKDAYS[day - 1].long}>
        {daySessions.length === 0 ? (
          <EmptyState icon={<CalendarDays size={28} />} text="Bu gün ders yok." />
        ) : (
          <ul className="space-y-2">
            {daySessions.map((s) => {
              const course = courseMap.get(s.courseId);
              const color = courseColor(course?.color);
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setEditing({ item: s })}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${color.soft}`}
                  >
                    <div className="w-14 shrink-0 text-xs tabular-nums text-ink-700">
                      <p className="font-semibold">{s.start}</p>
                      <p className="text-ink-500">{s.end}</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5">
                        <span className={`font-semibold ${color.text}`}>{course?.code}</span>
                        {s.kind !== "ders" && <Badge className="border border-ink-900/30 bg-white/50 text-ink-700">{SESSION_KIND_LABELS[s.kind]}</Badge>}
                      </p>
                      {course?.name && <p className="truncate text-sm text-ink-700">{course.name}</p>}
                      {s.room && (
                        <p className="flex items-center gap-1 text-xs text-ink-500">
                          <MapPin size={12} /> {s.room}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Button className="w-full" onClick={() => setEditing({})}>
        <Plus size={18} /> Ders saati ekle
      </Button>

      <SemesterEndCard now={now} />

      {/* Haftanın kısa özeti */}
      {sessions && sessions.length > 0 && (
        <Card title="Haftalık görünüm">
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${gridDays.length}, minmax(0, 1fr))` }}>
            {gridDays.map((d) => (
              <div key={d.value} className="space-y-1">
                <p className="text-center text-[11px] font-medium text-ink-500">{d.short}</p>
                {sessions
                  .filter((s) => s.weekday === d.value)
                  .map((s) => {
                    const course = courseMap.get(s.courseId);
                    const color = courseColor(course?.color);
                    return (
                      <div key={s.id} className={`rounded-md border px-1 py-1 text-center ${color.soft}`}>
                        <p className={`truncate text-[10px] font-semibold ${color.text}`}>{course?.code}</p>
                        <p className="text-[9px] tabular-nums text-ink-600">{s.start}</p>
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
        </Card>
      )}

      {editing && <SessionFormModal initial={editing.item} defaultWeekday={day} onClose={() => setEditing(null)} />}
    </div>
  );
}
