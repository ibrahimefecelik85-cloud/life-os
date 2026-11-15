"use client";
import { useState, type FormEvent } from "react";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ChoiceGroup, Field, Input } from "@/components/ui/Form";
import { TODO_CATEGORY_LABELS } from "@/lib/labels";
import type { ISODate, Todo, TodoCategory } from "@/types";
import { addTodo, deleteTodo, updateTodo } from "../api";

export const CATEGORY_OPTIONS = (Object.keys(TODO_CATEGORY_LABELS) as TodoCategory[]).map((k) => ({
  value: k,
  label: TODO_CATEGORY_LABELS[k],
}));

export function TodoFormModal({
  initial,
  defaultCategory = "kisisel",
  defaultDate,
  onClose,
}: {
  initial?: Todo;
  defaultCategory?: TodoCategory;
  defaultDate?: ISODate;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState<TodoCategory>(initial?.category ?? defaultCategory);
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? defaultDate ?? "");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const data = { title: title.trim(), category, dueDate: dueDate || undefined };
    if (initial) await updateTodo(initial.id, data);
    else await addTodo(data);
    onClose();
  }

  async function handleDelete() {
    if (!initial) return;
    await deleteTodo(initial.id);
    onClose();
  }

  return (
    <Modal open onClose={onClose} title={initial ? "Görevi düzenle" : "Yeni görev"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Görev">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus={!initial} />
        </Field>
        <Field label="Kategori" group>
          <ChoiceGroup value={category} options={CATEGORY_OPTIONS} onChange={setCategory} />
        </Field>
        <Field label="Son tarih (isteğe bağlı)">
          <div className="flex gap-2">
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            {dueDate && (
              <Button variant="secondary" onClick={() => setDueDate("")}>
                Temizle
              </Button>
            )}
          </div>
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
