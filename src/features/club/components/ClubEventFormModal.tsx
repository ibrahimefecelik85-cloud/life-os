"use client";
import { useState, type FormEvent } from "react";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ChoiceGroup, Field, Input, Textarea } from "@/components/ui/Form";
import { timeToMinutes, todayISO } from "@/lib/dates";
import { CLUB_EVENT_LABELS } from "@/lib/labels";
import type { ClubEvent, ClubEventType, ISODate } from "@/types";
import { addClubEvent, deleteClubEvent, updateClubEvent } from "../api";

const TYPE_OPTIONS = (Object.keys(CLUB_EVENT_LABELS) as ClubEventType[]).map((k) => ({ value: k, label: CLUB_EVENT_LABELS[k] }));

export function ClubEventFormModal({
  initial,
  defaultDate,
  onClose,
}: {
  initial?: ClubEvent;
  defaultDate?: ISODate;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [type, setType] = useState<ClubEventType>(initial?.type ?? "etkinlik");
  const [date, setDate] = useState(initial?.date ?? defaultDate ?? todayISO());
  const [time, setTime] = useState(initial?.time ?? "");
  const [endTime, setEndTime] = useState(initial?.endTime ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    if (time && endTime && timeToMinutes(endTime) <= timeToMinutes(time)) return setError("Bitiş saati başlangıçtan sonra olmalı.");
    const data = {
      title: title.trim(),
      type,
      date,
      time: time || undefined,
      endTime: time && endTime ? endTime : undefined,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
    };
    if (initial) await updateClubEvent(initial.id, data);
    else await addClubEvent(data);
    onClose();
  }

  async function handleDelete() {
    if (!initial || !confirm(`"${initial.title}" silinsin mi?`)) return;
    await deleteClubEvent(initial.id);
    onClose();
  }

  return (
    <Modal open onClose={onClose} title={initial ? "Etkinliği düzenle" : "Kulüp etkinliği ekle"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Tür" group>
          <ChoiceGroup value={type} options={TYPE_OPTIONS} onChange={setType} />
        </Field>
        <Field label="Başlık">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ör. Bahar turnuvası, yönetim toplantısı" required autoFocus={!initial} />
        </Field>
        <Field label="Tarih">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Başlangıç (isteğe bağlı)">
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </Field>
          <Field label="Bitiş (isteğe bağlı)">
            <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} disabled={!time} />
          </Field>
        </div>
        <Field label="Yer (isteğe bağlı)">
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="ör. Spor salonu" />
        </Field>
        <Field label="Not (isteğe bağlı)">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Hazırlıklar, kayıt son tarihi..." />
        </Field>
        {error && <p className="text-sm text-rose-700">{error}</p>}
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
