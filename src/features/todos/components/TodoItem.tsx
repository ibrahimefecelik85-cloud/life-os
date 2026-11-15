"use client";
import { Badge, CheckCircle } from "@/components/ui/misc";
import { daysUntil, relativeLabel } from "@/lib/dates";
import { TODO_CATEGORY_LABELS, TODO_CATEGORY_STYLES } from "@/lib/labels";
import type { Todo } from "@/types";
import { toggleTodo } from "../api";

export function TodoItem({
  todo,
  now,
  onEdit,
  showCategory = true,
}: {
  todo: Todo;
  now: Date;
  onEdit: (t: Todo) => void;
  showCategory?: boolean;
}) {
  const n = todo.dueDate ? daysUntil(todo.dueDate, now) : null;
  const dueClass = n === null || todo.done ? "text-ink-500" : n < 0 ? "text-rose-700" : n === 0 ? "text-amber-700" : "text-ink-500";

  return (
    <li className="flex items-center gap-3 py-2.5">
      <CheckCircle checked={todo.done} onToggle={() => toggleTodo(todo)} label={`${todo.title} tamamlandı`} />
      <button type="button" onClick={() => onEdit(todo)} className="min-w-0 flex-1 text-left">
        <p className={`truncate ${todo.done ? "text-ink-500 line-through" : ""}`}>{todo.title}</p>
        {(showCategory || todo.dueDate) && (
          <div className="mt-0.5 flex items-center gap-1.5">
            {showCategory && <Badge className={TODO_CATEGORY_STYLES[todo.category]}>{TODO_CATEGORY_LABELS[todo.category]}</Badge>}
            {todo.dueDate && <span className={`text-xs ${dueClass}`}>{relativeLabel(todo.dueDate, now)}</span>}
          </div>
        )}
      </button>
    </li>
  );
}
