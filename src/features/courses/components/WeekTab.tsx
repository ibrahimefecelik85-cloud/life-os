"use client";
// "Bu hafta neyim var?" görünümü: haftanın her günü için teslimler ve ders sayısı
import { useMemo, useState } from "react";
import { addWeeks, format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { AlertTriangle, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button, IconButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { toISODate, weekDays } from "@/lib/dates";
import type { Assessment, ISODate } from "@/types";
import { useAssessmentsBetween, useCourseMap, useOverdueAssessments, useSessions } from "../hooks";
import { AssessmentFormModal } from "./AssessmentFormModal";
import { AssessmentItem } from "./AssessmentItem";

type Editing = { item?: Assessment; date?: ISODate } | null;

export function WeekTab({ now }: { now: Date }) {
  const [offset, setOffset] = useState(0); // 0 = bu hafta, 1 = gelecek hafta...
  const [editing, setEditing] = useState<Editing>(null);

  const today = toISODate(now);
  const days = useMemo(() => weekDays(addWeeks(now, offset)), [now, offset]);
  const items = useAssessmentsBetween(days[0], days[6]);
  const overdue = useOverdueAssessments(offset === 0 ? days[0] : null);
  const sessions = useSessions();
  const courseMap = useCourseMap();

  const pending = items?.filter((a) => !a.done) ?? [];
  const examCount = pending.filter((a) => a.type === "sinav" || a.type === "quiz").length;

  const rangeLabel = `${format(parseISO(days[0]), "d MMM", { locale: tr })} – ${format(parseISO(days[6]), "d MMM", { locale: tr })}`;
  const weekLabel = offset === 0 ? "Bu hafta" : offset === 1 ? "Gelecek hafta" : offset === -1 ? "Geçen hafta" : rangeLabel;

  return (
    <div className="space-y-4">
      {/* Hafta seçici */}
      <div className="flex items-center justify-between">
        <IconButton onClick={() => setOffset((o) => o - 1)} aria-label="Önceki hafta">
          <ChevronLeft size={20} />
        </IconButton>
        <div className="text-center">
          <p className="font-semibold">{weekLabel}</p>
          <p className="text-xs text-ink-500">{rangeLabel}</p>
        </div>
        <IconButton onClick={() => setOffset((o) => o + 1)} aria-label="Sonraki hafta">
          <ChevronRight size={20} />
        </IconButton>
      </div>

      {/* Özet */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <Stat value={pending.length} label="bekleyen" />
        <Stat value={examCount} label="sınav / quiz" />
        <Stat value={sessions?.length ?? 0} label="ders saati" />
      </div>

      {overdue && overdue.length > 0 && (
        <Card title="Geciken" icon={<AlertTriangle size={16} className="text-rose-700" />}>
          <ul className="divide-y divide-ink-900/15">
            {overdue.map((a) => (
              <AssessmentItem key={a.id} item={a} course={courseMap.get(a.courseId)} now={now} onEdit={(item) => setEditing({ item })} />
            ))}
          </ul>
        </Card>
      )}

      {/* Günler */}
      {days.map((day, i) => {
        const dayItems = items?.filter((a) => a.dueDate === day) ?? [];
        const classCount = sessions?.filter((s) => s.weekday === i + 1).length ?? 0;
        const isToday = day === today;
        return (
          <section key={day} className={`glass rounded-2xl p-4 ${isToday ? "!border-brand-700 !bg-brand-300/25" : ""}`}>
            <header className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold capitalize">
                  {format(parseISO(day), "EEEE", { locale: tr })}
                  {isToday && <span className="ml-2 text-xs font-medium text-brand-600">Bugün</span>}
                </h3>
                <p className="text-xs text-ink-500">
                  {format(parseISO(day), "d MMMM", { locale: tr })}
                  {classCount > 0 && ` · ${classCount} ders`}
                </p>
              </div>
              <IconButton onClick={() => setEditing({ date: day })} aria-label="Bu güne ekle">
                <Plus size={18} />
              </IconButton>
            </header>
            {dayItems.length > 0 && (
              <ul className="mt-1 divide-y divide-ink-900/15">
                {dayItems.map((a) => (
                  <AssessmentItem
                    key={a.id}
                    item={a}
                    course={courseMap.get(a.courseId)}
                    now={now}
                    showDate={false}
                    onEdit={(item) => setEditing({ item })}
                  />
                ))}
              </ul>
            )}
          </section>
        );
      })}

      <Button className="w-full" onClick={() => setEditing({})}>
        <Plus size={18} /> Ödev / sınav ekle
      </Button>

      {editing && (
        <AssessmentFormModal initial={editing.item} defaultDate={editing.date} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="glass rounded-2xl py-3">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-[11px] text-ink-500">{label}</p>
    </div>
  );
}
