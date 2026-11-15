"use client";
// Tüm ödev/quiz/sınavların listesi; duruma ve derse göre filtrelenebilir
import { useState } from "react";
import { ClipboardList, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChoiceGroup, Select } from "@/components/ui/Form";
import { EmptyState } from "@/components/ui/misc";
import type { Assessment } from "@/types";
import { useAssessments, useCourseMap, useCourses } from "../hooks";
import { AssessmentFormModal } from "./AssessmentFormModal";
import { AssessmentItem } from "./AssessmentItem";

type Filter = "bekleyen" | "tamamlanan" | "tumu";
const FILTERS: { value: Filter; label: string }[] = [
  { value: "bekleyen", label: "Bekleyen" },
  { value: "tamamlanan", label: "Tamamlanan" },
  { value: "tumu", label: "Tümü" },
];

export function AssessmentsTab({ now }: { now: Date }) {
  const [filter, setFilter] = useState<Filter>("bekleyen");
  const [courseFilter, setCourseFilter] = useState("");
  const [editing, setEditing] = useState<{ item?: Assessment } | null>(null);

  const all = useAssessments();
  const courses = useCourses();
  const courseMap = useCourseMap();

  let list = all ?? [];
  if (filter === "bekleyen") list = list.filter((a) => !a.done);
  if (filter === "tamamlanan") list = list.filter((a) => a.done).reverse(); // en yeni üstte
  if (courseFilter) list = list.filter((a) => a.courseId === courseFilter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ChoiceGroup value={filter} options={FILTERS} onChange={setFilter} />
        <Select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className="!h-9 !w-auto text-sm">
          <option value="">Tüm dersler</option>
          {courses?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code}
            </option>
          ))}
        </Select>
      </div>

      <Card>
        {all === undefined ? null : list.length === 0 ? (
          <EmptyState icon={<ClipboardList size={28} />} text="Burada bir şey yok." />
        ) : (
          <ul className="divide-y divide-ink-200">
            {list.map((a) => (
              <AssessmentItem key={a.id} item={a} course={courseMap.get(a.courseId)} now={now} onEdit={(item) => setEditing({ item })} />
            ))}
          </ul>
        )}
      </Card>

      <Button className="w-full" onClick={() => setEditing({})}>
        <Plus size={18} /> Ödev / sınav ekle
      </Button>

      {editing && <AssessmentFormModal initial={editing.item} onClose={() => setEditing(null)} />}
    </div>
  );
}
