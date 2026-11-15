"use client";
import { useState, type FormEvent } from "react";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Form";
import { todayISO } from "@/lib/dates";
import type { CalendarEvent, ISODate } from "@/types";
import { addEvent, deleteEvent, updateEvent } from "../api";

export function EventFormModal({
  initial,
  defaultDate,
  onClose,
}: {
  initial?: CalendarEvent;
  defaultDate?: ISODate;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [date, setDate] = useState(initial?.date ?? defaultDate ?? todayISO());
  const [time, setTime] = useState(initial?.time ?? "");
  const [note, setNote] = useState(initial?.note ?? "");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const data = { title: title.trim(), date, time: time || undefined, note: note.trim() || undefined };
    if (initial) await updateEvent(initial.id, data);
    else await addEvent(data);
    onClose();
  }

  async function handleDelete() {
    if (!initial || !confirm(`"${initial.title}" silinsin mi?`)) return;
    await deleteEvent(initial.id);
    onClose();
  }

  return (
    <Modal open onClose={onClose} title={initial ? "Etkinliği düzenle" : "Yeni etkinlik"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Etkinlik">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ör. Maç, doğum günü, randevu" required autoFocus={!initial} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tarih">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </Field>
          <Field label="Saat (isteğe bağlı)">
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </Field>
        </div>
        <Field label="Not (isteğe bağlı)">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
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
