"use client";
// Kategorileri düzenleme: ad/emoji değiştir, yeni ekle, sil (harcamalar başka kategoriye taşınır)
import { useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button, IconButton } from "@/components/ui/Button";
import { Input } from "@/components/ui/Form";
import type { ExpenseCategory } from "@/types";
import { addCategory, deleteCategory, updateCategory } from "../api";
import { useExpenseCategories } from "../hooks";

export function CategoriesModal({ onClose }: { onClose: () => void }) {
  const categories = useExpenseCategories();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await addCategory(name.trim(), emoji.trim() || "•");
    setName("");
    setEmoji("");
  }

  async function handleDelete(c: ExpenseCategory) {
    const others = (categories ?? []).filter((x) => x.id !== c.id);
    if (others.length === 0) return alert("En az bir kategori kalmalı.");
    // Harcamalar "Diğer"e, o yoksa listedeki ilk kategoriye taşınır
    const target = others.find((x) => x.name.toLocaleLowerCase("tr") === "diğer") ?? others[0];
    if (!confirm(`"${c.name}" silinsin mi? İçindeki harcamalar "${target.name}" kategorisine taşınacak.`)) return;
    await deleteCategory(c.id, target.id);
  }

  return (
    <Modal open onClose={onClose} title="Kategoriler">
      <ul className="space-y-2">
        {categories?.map((c) => (
          <li key={c.id} className="flex items-center gap-2">
            <Input
              defaultValue={c.emoji}
              onBlur={(e) => e.target.value.trim() && updateCategory(c.id, { emoji: e.target.value.trim() })}
              aria-label={`${c.name} simgesi`}
              className="!w-14 text-center"
            />
            <Input
              defaultValue={c.name}
              onBlur={(e) => e.target.value.trim() && updateCategory(c.id, { name: e.target.value.trim() })}
              aria-label="Kategori adı"
            />
            <IconButton onClick={() => handleDelete(c)} aria-label={`${c.name} sil`} className="shrink-0 hover:!text-rose-700">
              <Trash2 size={16} />
            </IconButton>
          </li>
        ))}
      </ul>

      <form onSubmit={handleAdd} className="mt-4 flex items-center gap-2 border-t border-ink-900/15 pt-4">
        <Input value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="🙂" aria-label="Yeni kategori simgesi" className="!w-14 text-center" />
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Yeni kategori" aria-label="Yeni kategori adı" />
        <Button type="submit" className="shrink-0" aria-label="Ekle">
          <Plus size={16} />
        </Button>
      </form>
      <p className="mt-3 text-xs text-ink-500">Ad veya simgeyi değiştirip kutudan çıkınca kaydedilir.</p>
    </Modal>
  );
}
