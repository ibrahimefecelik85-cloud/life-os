"use client";
import { useState, type FormEvent } from "react";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Form";
import { todayISO } from "@/lib/dates";
import { parseAmount } from "@/lib/money";
import type { Expense, ID } from "@/types";
import { addExpense, deleteExpense, updateExpense } from "../api";
import { useExpenseCategories } from "../hooks";

const SELECTED = "border border-ink-900 bg-brand-600 text-white";
const IDLE = "glass-soft text-ink-800 hover:bg-white/60";

export function ExpenseFormModal({
  initial,
  defaultCategoryId,
  onClose,
}: {
  initial?: Expense;
  defaultCategoryId?: ID;
  onClose: () => void;
}) {
  const categories = useExpenseCategories();
  const [amount, setAmount] = useState(initial ? String(initial.amount).replace(".", ",") : "");
  const [categoryId, setCategoryId] = useState<ID>(initial?.categoryId ?? defaultCategoryId ?? "");
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [note, setNote] = useState(initial?.note ?? "");
  const [error, setError] = useState("");

  // Kategori seçilmemişse ilk kategori
  const selectedCat = categoryId || categories?.[0]?.id || "";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const value = parseAmount(amount);
    if (value === null) return setError("Geçerli bir tutar yaz (ör. 85 veya 12,50).");
    if (!selectedCat) return setError("Önce bir kategori eklemelisin.");
    const data = { amount: value, categoryId: selectedCat, date, note: note.trim() || undefined };
    if (initial) await updateExpense(initial.id, data);
    else await addExpense(data);
    onClose();
  }

  async function handleDelete() {
    if (!initial || !confirm("Bu harcama silinsin mi?")) return;
    await deleteExpense(initial.id);
    onClose();
  }

  return (
    <Modal open onClose={onClose} title={initial ? "Harcamayı düzenle" : "Harcama ekle"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Tutar (₺)">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-2xl font-semibold text-ink-400">₺</span>
            <Input
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError("");
              }}
              inputMode="decimal"
              placeholder="0"
              autoFocus={!initial}
              className="!h-14 pl-9 text-2xl font-semibold tabular-nums"
            />
          </div>
        </Field>

        <Field label="Kategori" group>
          <div className="flex flex-wrap gap-1.5">
            {categories?.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoryId(c.id)}
                className={`h-9 rounded-lg px-3 text-sm transition-colors ${selectedCat === c.id ? SELECTED : IDLE}`}
              >
                {c.emoji} {c.name}
              </button>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Tarih">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </Field>
          <Field label="Not (isteğe bağlı)">
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="ör. yemekhane" />
          </Field>
        </div>

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
