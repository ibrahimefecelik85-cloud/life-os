"use client";
import { useState } from "react";
import { ListTodo, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChoiceGroup } from "@/components/ui/Form";
import { EmptyState } from "@/components/ui/misc";
import { useNow } from "@/hooks/useNow";
import { clearCompletedTodos } from "@/features/todos/api";
import { useTodos } from "@/features/todos/hooks";
import { QuickAddTodo } from "@/features/todos/components/QuickAddTodo";
import { CATEGORY_OPTIONS, TodoFormModal } from "@/features/todos/components/TodoFormModal";
import { TodoItem } from "@/features/todos/components/TodoItem";
import type { Todo, TodoCategory } from "@/types";

type Filter = "tumu" | TodoCategory;
const FILTERS: { value: Filter; label: string }[] = [{ value: "tumu", label: "Tümü" }, ...CATEGORY_OPTIONS];

export default function YapilacaklarPage() {
  const now = useNow();
  const todos = useTodos();
  const [filter, setFilter] = useState<Filter>("tumu");
  const [showDone, setShowDone] = useState(false);
  const [editing, setEditing] = useState<{ item?: Todo } | null>(null);

  const filtered = (todos ?? []).filter((t) => filter === "tumu" || t.category === filter);
  const open = filtered.filter((t) => !t.done);
  const done = filtered.filter((t) => t.done);

  return (
    <>
      <PageHeader
        title="Yapılacaklar"
        subtitle={todos && `${(todos ?? []).filter((t) => !t.done).length} açık görev`}
        action={
          <Button size="sm" onClick={() => setEditing({})}>
            <Plus size={16} /> Yeni
          </Button>
        }
      />

      <div className="space-y-4">
        <ChoiceGroup value={filter} options={FILTERS} onChange={setFilter} />

        {/* Hızlı ekleme: seçili kategoriye ekler */}
        <QuickAddTodo category={filter === "tumu" ? "kisisel" : filter} />

        {now && (
          <Card>
            {todos === undefined ? null : open.length === 0 ? (
              <EmptyState icon={<ListTodo size={28} />} text="Açık görev yok 🎉" />
            ) : (
              <ul className="divide-y divide-zinc-800">
                {open.map((t) => (
                  <TodoItem key={t.id} todo={t} now={now} showCategory={filter === "tumu"} onEdit={(item) => setEditing({ item })} />
                ))}
              </ul>
            )}
          </Card>
        )}

        {now && done.length > 0 && (
          <div>
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => setShowDone((s) => !s)} className="text-sm text-zinc-400 hover:text-zinc-200">
                {showDone ? "▾" : "▸"} Tamamlananlar ({done.length})
              </button>
              {showDone && (
                <Button variant="ghost" size="sm" onClick={() => confirm("Tamamlanan tüm görevler silinsin mi?") && clearCompletedTodos()}>
                  Temizle
                </Button>
              )}
            </div>
            {showDone && (
              <ul className="mt-2 divide-y divide-zinc-800 px-4">
                {done.map((t) => (
                  <TodoItem key={t.id} todo={t} now={now} showCategory={filter === "tumu"} onEdit={(item) => setEditing({ item })} />
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {editing && (
        <TodoFormModal
          initial={editing.item}
          defaultCategory={filter === "tumu" ? "kisisel" : filter}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
