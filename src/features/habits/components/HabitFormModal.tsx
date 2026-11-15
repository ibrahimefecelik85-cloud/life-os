"use client";
import { useState, type FormEvent } from "react";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Form";
import { WEEKDAYS } from "@/lib/dates";
import type { Habit, Weekday } from "@/types";
import { addHabit, deleteHabit, updateHabit } from "../api";

export function HabitFormModal({ initial, onClose }: { initial?: Habit; onClose: () => void }) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [days, setDays] = useState<Weekday[]>(initial?.days ?? []);
  const [remindAt, setRemindAt] = useState(initial?.remindAt ?? "");
  const [target, setTarget] = useState(initial?.targetMinutes ? String(initial.targetMinutes) : "");

  const everyDay = days.length === 0;
  const toggleDay = (d: Weekday) =>
    setDays((prev) => {
      const next = prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort();
      return next.length === 7 ? [] : next; // 7 gün seçiliyse "her gün" say
    });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const mins = parseInt(target, 10);
    const data = {
      title: title.trim(),
      days,
      remindAt: remindAt || undefined,
      targetMinutes: mins > 0 ? mins : undefined,
    };
    if (initial) await updateHabit(initial.id, data);
    else await addHabit(data);
    onClose();
  }

  async function handleDelete() {
    if (!initial || !confirm(`"${initial.title}" ve geçmiş kayıtları silinsin mi?`)) return;
    await deleteHabit(initial.id);
    onClose();
  }

  return (
    <Modal open onClose={onClose} title={initial ? "Rutini düzenle" : "Yeni rutin"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Ne yapılacak?">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus={!initial} />
        </Field>

        <Field label="Hangi günler" group>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setDays([])}
              className={`h-9 rounded-lg px-3 text-sm ${everyDay ? "bg-ink-900 text-white" : "bg-ink-200 text-ink-700"}`}
            >
              Her gün
            </button>
            {WEEKDAYS.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => toggleDay(d.value)}
                className={`h-9 w-11 rounded-lg text-sm ${
                  !everyDay && days.includes(d.value) ? "bg-ink-900 text-white" : "bg-ink-200 text-ink-700"
                }`}
              >
                {d.short}
              </button>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Hatırlatma saati">
            <Input type="time" value={remindAt} onChange={(e) => setRemindAt(e.target.value)} />
          </Field>
          <Field label="Hedef dakika (isteğe bağlı)">
            <Input type="number" inputMode="numeric" min={0} step={15} value={target} onChange={(e) => setTarget(e.target.value)} placeholder="ör. 120" />
          </Field>
        </div>
        <p className="text-xs text-ink-500">
          Telefon bildirimleri uygulama telefona kurulduktan sonra (Aşama 3) çalışacak. Şimdilik saati geçen maddeler Bugün
          ekranında sarı görünür.
        </p>

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
