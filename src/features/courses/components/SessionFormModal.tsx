"use client";
import { useState, type FormEvent } from "react";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ChoiceGroup, Field, Input, Select } from "@/components/ui/Form";
import { WEEKDAYS, timeToMinutes } from "@/lib/dates";
import { SESSION_KIND_LABELS } from "@/lib/labels";
import type { ClassSession, SessionKind, Weekday } from "@/types";
import { addSession, deleteSession, updateSession } from "../api";
import { useCourses } from "../hooks";

const KIND_OPTIONS = (Object.keys(SESSION_KIND_LABELS) as SessionKind[]).map((k) => ({
  value: k,
  label: SESSION_KIND_LABELS[k],
}));

const DAY_OPTIONS = WEEKDAYS.map((d) => ({ value: String(d.value), label: d.short }));

/** Haftalık programa ders saati ekleme/düzenleme penceresi */
export function SessionFormModal({
  initial,
  defaultWeekday = 1,
  onClose,
}: {
  initial?: ClassSession;
  defaultWeekday?: Weekday;
  onClose: () => void;
}) {
  const courses = useCourses();
  const [courseId, setCourseId] = useState(initial?.courseId ?? "");
  const [weekday, setWeekday] = useState<Weekday>(initial?.weekday ?? defaultWeekday);
  const [start, setStart] = useState(initial?.start ?? "09:40");
  const [end, setEnd] = useState(initial?.end ?? "11:30");
  const [kind, setKind] = useState<SessionKind>(initial?.kind ?? "ders");
  const [room, setRoom] = useState(initial?.room ?? "");
  const [error, setError] = useState("");

  // Ders seçilmemişse listedeki ilk dersi kullan
  const selectedCourseId = courseId || courses?.[0]?.id || "";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedCourseId) return setError("Önce bir ders eklemelisin.");
    if (timeToMinutes(end) <= timeToMinutes(start)) return setError("Bitiş saati başlangıçtan sonra olmalı.");
    const data = { courseId: selectedCourseId, weekday, start, end, kind, room: room.trim() || undefined };
    if (initial) await updateSession(initial.id, data);
    else await addSession(data);
    onClose();
  }

  async function handleDelete() {
    if (!initial || !confirm("Bu ders saati silinsin mi?")) return;
    await deleteSession(initial.id);
    onClose();
  }

  return (
    <Modal open onClose={onClose} title={initial ? "Ders saatini düzenle" : "Ders saati ekle"}>
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
        <Field label="Gün" group>
          <ChoiceGroup value={String(weekday)} options={DAY_OPTIONS} onChange={(v) => setWeekday(Number(v) as Weekday)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Başlangıç">
            <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} required />
          </Field>
          <Field label="Bitiş">
            <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} required />
          </Field>
        </div>
        <Field label="Tür" group>
          <ChoiceGroup value={kind} options={KIND_OPTIONS} onChange={setKind} />
        </Field>
        <Field label="Derslik (isteğe bağlı)">
          <Input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="AB1 245" />
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
