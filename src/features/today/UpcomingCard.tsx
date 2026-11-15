"use client";
// Gecikmiş + önümüzdeki 7 gün içindeki tamamlanmamış teslimler
import { useState } from "react";
import Link from "next/link";
import { addDays } from "date-fns";
import { CalendarClock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/misc";
import { toISODate } from "@/lib/dates";
import type { Assessment } from "@/types";
import { useAssessmentsBetween, useCourseMap, useOverdueAssessments } from "@/features/courses/hooks";
import { AssessmentFormModal } from "@/features/courses/components/AssessmentFormModal";
import { AssessmentItem } from "@/features/courses/components/AssessmentItem";

export function UpcomingCard({ now }: { now: Date }) {
  const today = toISODate(now);
  const overdue = useOverdueAssessments(today);
  const upcoming = useAssessmentsBetween(today, toISODate(addDays(now, 7)));
  const courseMap = useCourseMap();
  const [editing, setEditing] = useState<Assessment | null>(null);

  const list = [...(overdue ?? []), ...(upcoming ?? []).filter((a) => !a.done)];
  const loading = overdue === undefined || upcoming === undefined;

  return (
    <Card
      title="Yaklaşan teslim ve sınavlar"
      icon={<CalendarClock size={16} />}
      action={
        <Link href="/dersler" className="text-xs text-brand-600">
          Tümü
        </Link>
      }
    >
      {loading ? null : list.length === 0 ? (
        <EmptyState text="Önümüzdeki 7 günde teslim yok." />
      ) : (
        <ul className="divide-y divide-ink-900/15">
          {list.map((a) => (
            <AssessmentItem key={a.id} item={a} course={courseMap.get(a.courseId)} now={now} onEdit={setEditing} />
          ))}
        </ul>
      )}
      {editing && <AssessmentFormModal initial={editing} onClose={() => setEditing(null)} />}
    </Card>
  );
}
