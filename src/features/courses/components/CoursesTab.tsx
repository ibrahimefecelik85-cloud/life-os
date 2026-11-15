"use client";
// Ders listesi: her ders için haftalık saat ve bekleyen teslim sayısı
import { useState } from "react";
import { ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { courseColor } from "@/lib/colors";
import { timeToMinutes } from "@/lib/dates";
import type { Course } from "@/types";
import { useAssessments, useCourses, useSessions } from "../hooks";
import { CourseFormModal } from "./CourseFormModal";

export function CoursesTab() {
  const courses = useCourses();
  const sessions = useSessions();
  const assessments = useAssessments();
  const [editing, setEditing] = useState<{ item?: Course } | null>(null);

  return (
    <div className="space-y-3">
      {courses?.map((c) => {
        const color = courseColor(c.color);
        const mins = (sessions ?? [])
          .filter((s) => s.courseId === c.id)
          .reduce((sum, s) => sum + timeToMinutes(s.end) - timeToMinutes(s.start), 0);
        const pending = (assessments ?? []).filter((a) => a.courseId === c.id && !a.done).length;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => setEditing({ item: c })}
            className="flex w-full items-center gap-3 glass rounded-2xl p-4 text-left hover:bg-ink-100"
          >
            <span className={`h-10 w-1.5 rounded-full ${color.dot}`} />
            <div className="min-w-0 flex-1">
              <p className={`font-semibold ${color.text}`}>{c.code}</p>
              <p className="truncate text-sm text-ink-700">{c.name ?? "Ders adı eklenmedi"}</p>
              <p className="text-xs text-ink-500">
                {mins > 0 ? `Haftada ${(mins / 60).toLocaleString("tr-TR", { maximumFractionDigits: 1 })} saat` : "Programa eklenmedi"}
                {pending > 0 && ` · ${pending} bekleyen teslim`}
                {c.instructor && ` · ${c.instructor}`}
              </p>
            </div>
            <ChevronRight size={18} className="text-ink-400" />
          </button>
        );
      })}

      <Button className="w-full" onClick={() => setEditing({})}>
        <Plus size={18} /> Ders ekle
      </Button>

      {editing && <CourseFormModal initial={editing.item} onClose={() => setEditing(null)} />}
    </div>
  );
}
