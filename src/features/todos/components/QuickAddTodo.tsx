"use client";
// Tek satırlık hızlı görev ekleme kutusu (Enter'a basınca ekler)
import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import type { ISODate, TodoCategory } from "@/types";
import { addTodo } from "../api";

export function QuickAddTodo({
  category = "kisisel",
  dueDate,
  placeholder = "Görev ekle...",
}: {
  category?: TodoCategory;
  dueDate?: ISODate;
  placeholder?: string;
}) {
  const [title, setTitle] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await addTodo({ title: title.trim(), category, dueDate });
    setTitle("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white pl-3 focus-within:border-brand-500">
      <Plus size={18} className="shrink-0 text-ink-500" />
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={placeholder}
        enterKeyHint="done"
        className="h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-ink-400"
      />
    </form>
  );
}
