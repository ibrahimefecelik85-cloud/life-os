"use client";
// Bugün yapılacaklar: son tarihi bugün/geçmiş olanlar + tarihsiz açık görevler
import { useState } from "react";
import Link from "next/link";
import { ListTodo } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/misc";
import { toISODate } from "@/lib/dates";
import type { Todo } from "@/types";
import { useTodos } from "@/features/todos/hooks";
import { QuickAddTodo } from "@/features/todos/components/QuickAddTodo";
import { TodoFormModal } from "@/features/todos/components/TodoFormModal";
import { TodoItem } from "@/features/todos/components/TodoItem";

export function TodayTodos({ now }: { now: Date }) {
  const today = toISODate(now);
  const todos = useTodos();
  const [editing, setEditing] = useState<Todo | null>(null);

  const list = (todos ?? []).filter(
    (t) =>
      (!t.done && (!t.dueDate || t.dueDate <= today)) ||
      // bugün tamamlananları da göster (üstü çizili), gün boyu ilerlemeyi görmek için
      (t.done && t.completedAt && toISODate(new Date(t.completedAt)) === today),
  );
  const doneCount = list.filter((t) => t.done).length;

  return (
    <Card
      title="Yapılacaklar"
      icon={<ListTodo size={16} />}
      action={
        <Link href="/yapilacaklar" className="text-xs text-indigo-400">
          {list.length > 0 ? `${doneCount}/${list.length} · Tümü` : "Tümü"}
        </Link>
      }
    >
      {todos !== undefined && list.length === 0 && <EmptyState text="Bugün için görev yok." />}
      {list.length > 0 && (
        <ul className="mb-2 divide-y divide-zinc-800">
          {list.map((t) => (
            <TodoItem key={t.id} todo={t} now={now} onEdit={setEditing} />
          ))}
        </ul>
      )}
      <QuickAddTodo dueDate={today} placeholder="Bugün için görev ekle..." />
      {editing && <TodoFormModal initial={editing} onClose={() => setEditing(null)} />}
    </Card>
  );
}
