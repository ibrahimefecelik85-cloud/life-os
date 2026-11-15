"use client";
import { useState, type FormEvent } from "react";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ChoiceGroup, Field, Input, Select, Textarea } from "@/components/ui/Form";
import { ASSESSMENT_TYPE_LABELS, PRIORITY_LABELS } from "@/lib/labels";
import { todayISO } from "@/lib/dates";
import type { Assessment, AssessmentType, ISODate, Priority } from "@/types";
import { addAssessment, deleteAssessment, updateAssessment } from "../api";
import { useCourses } from "../hooks";

const TYPE_OPTIONS = (Object.keys(ASSESSMENT_TYPE_LABELS) as AssessmentType[]).map((k) => ({
  value: k,
  label: ASSESSMENT_TYPE_LABELS[k],
}));
const PRIORITY_OPTIONS = (Object.keys(PRIORITY_LABELS) as Priority[]).map((k) => ({
  value: k,
  label: PRIORITY_LABELS[k],
}));

/** Ödev / quiz / sınav / proje ekleme ve düzenleme penceresi */
export function AssessmentFormModal({
  initial,
  defaultDate,
  onClose,
}: {
  initial?: Assessment;
  defaultDate?: ISODate;
  onClose: () => void;
}) {
  const courses = useCourses();
  const [courseId, setCourseId] = useState(initial?.courseId ?? "");
  const [type, setType] = useState<AssessmentType>(initial?.type ?? "odev");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? defaultDate ?? todayISO());
  const [dueTime, setDueTime] = useState(initial?.dueTime ?? "");
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? "orta");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [error, setError] = useState("");

  const selectedCourseId = courseId || courses?.[0]?.id || "";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedCourseId) return setError("Önce bir ders eklemelisin.");
    const data = {
      courseId: selectedCourseId,
      type,
      // Başlık boşsa türünü kullan (ör. "Quiz")
      title: title.trim() || ASSESSMENT_TYPE_LABELS[type],
      dueDate,
      dueTime: dueTime || undefined,
      priority,
      notes: notes.trim() || undefined,
    };
    if (initial) await updateAssessment(initial.id, data);
    else await addAssessment(data);
    onClose();
  }

  async function handleDelete() {
    if (!initial || !confirm(`"${initial.title}" silinsin mi?`)) return;
    await deleteAssessment(initial.id);
    onClose();
  }

  return (
    <Modal open onClose={onClose} title={initial ? "Düzenle" : "Ödev / sınav ekle"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Ders">
          <Select value={selectedCourseId} onChange={(e) => setCourseId(e.target.value)}>
            {courses?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} {c.name ? `· ${c.name}` : ""}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Tür" group>
          <ChoiceGroup value={type} options={TYPE_OPTIONS} onChange={setType} />
        </Field>
        <Field label="Başlık">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ör. HW 3, Midterm 1" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tarih">
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
          </Field>
          <Field label="Saat (isteğe bağlı)">
            <Input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
          </Field>
        </div>
        <Field label="Öncelik" group>
          <ChoiceGroup value={priority} options={PRIORITY_OPTIONS} onChange={setPriority} />
        </Field>
        <Field label="Not (isteğe bağlı)">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Konular, sayfa numaraları..." />
        </Field>
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <div className="flex gap-2 pt-2">
          {initial && (
            <Button variant="danger" onClick={handleDelete} aria-label="Sil">
              <Trash2 size={16} />
            </Button>
          )}
          <Button type="submit" className="flex-1">
            Kaydet
          </Button>
        </div>
      </form>
    </Modal>
  );
}
