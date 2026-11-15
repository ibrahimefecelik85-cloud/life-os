"use client";
import { useState, type FormEvent } from "react";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Form";
import { COLOR_KEYS, COURSE_COLORS, type ColorKey } from "@/lib/colors";
import type { Course } from "@/types";
import { addCourse, deleteCourse, updateCourse } from "../api";

/** Ders ekleme/düzenleme penceresi. `initial` verilirse düzenleme modunda açılır. */
export function CourseFormModal({ initial, onClose }: { initial?: Course; onClose: () => void }) {
  const [code, setCode] = useState(initial?.code ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [instructor, setInstructor] = useState(initial?.instructor ?? "");
  const [color, setColor] = useState<ColorKey>(initial?.color ?? "sky");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const data = {
      code: code.trim().toUpperCase(),
      name: name.trim() || undefined,
      instructor: instructor.trim() || undefined,
      color,
    };
    if (initial) await updateCourse(initial.id, data);
    else await addCourse(data);
    onClose();
  }

  async function handleDelete() {
    if (!initial) return;
    if (!confirm(`${initial.code} silinsin mi? Bu derse ait program saatleri ve teslimler de silinir.`)) return;
    await deleteCourse(initial.id);
    onClose();
  }

  return (
    <Modal open onClose={onClose} title={initial ? "Dersi düzenle" : "Yeni ders"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Ders kodu">
          <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="CE 112" required autoFocus={!initial} />
        </Field>
        <Field label="Ders adı (isteğe bağlı)">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Statik" />
        </Field>
        <Field label="Hoca (isteğe bağlı)">
          <Input value={instructor} onChange={(e) => setInstructor(e.target.value)} />
        </Field>
        <Field label="Renk" group>
          <div className="flex flex-wrap gap-2">
            {COLOR_KEYS.map((k) => (
              <button
                key={k}
                type="button"
                aria-label={k}
                onClick={() => setColor(k)}
                className={`h-8 w-8 rounded-full ${COURSE_COLORS[k].dot} ${
                  color === k ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-900" : ""
                }`}
              />
            ))}
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
