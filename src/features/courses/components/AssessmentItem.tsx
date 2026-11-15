"use client";
// Listede tek bir ödev/sınav satırı
import { Badge, CheckCircle } from "@/components/ui/misc";
import { courseColor } from "@/lib/colors";
import { daysUntil, formatShort, relativeLabel } from "@/lib/dates";
import { ASSESSMENT_TYPE_LABELS, PRIORITY_LABELS, PRIORITY_STYLES } from "@/lib/labels";
import type { Assessment, Course } from "@/types";
import { toggleAssessment } from "../api";

export function AssessmentItem({
  item,
  course,
  now,
  onEdit,
  showDate = true,
}: {
  item: Assessment;
  course?: Course;
  now: Date;
  onEdit: (a: Assessment) => void;
  showDate?: boolean;
}) {
  const color = courseColor(course?.color);
  const n = daysUntil(item.dueDate, now);
  // Tarih rengi: gecikmiş kırmızı, 2 gün içinde sarı
  const dueClass = item.done
    ? "text-ink-500"
    : n < 0
      ? "text-rose-700"
      : n <= 2
        ? "text-amber-700"
        : "text-ink-600";

  return (
    <li className="flex items-start gap-3 py-2.5">
      <div className="pt-0.5">
        <CheckCircle checked={item.done} onToggle={() => toggleAssessment(item)} label={`${item.title} tamamlandı`} />
      </div>
      <button type="button" onClick={() => onEdit(item)} className="min-w-0 flex-1 text-left">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${color.dot}`} />
          <span className={`text-xs font-semibold ${color.text}`}>{course?.code ?? "?"}</span>
          <Badge className="border border-ink-900/30 bg-white/50 text-ink-700">{ASSESSMENT_TYPE_LABELS[item.type]}</Badge>
          {item.priority !== "orta" && !item.done && (
            <Badge className={PRIORITY_STYLES[item.priority]}>{PRIORITY_LABELS[item.priority]}</Badge>
          )}
        </div>
        <p className={`mt-0.5 truncate font-medium ${item.done ? "text-ink-500 line-through" : ""}`}>{item.title}</p>
        <p className={`text-xs ${dueClass}`}>
          {showDate && `${formatShort(item.dueDate)} · `}
          {item.dueTime && `${item.dueTime} · `}
          {item.done ? "Tamamlandı" : relativeLabel(item.dueDate, now)}
        </p>
      </button>
    </li>
  );
}
