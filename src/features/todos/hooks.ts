"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { Todo } from "@/types";

/**
 * Sıralama: önce tamamlanmamışlar; onların içinde son tarihi olanlar
 * tarihe göre, tarihi olmayanlar en sonda (yeniden eskiye).
 */
export function sortTodos(a: Todo, b: Todo) {
  if (a.done !== b.done) return a.done ? 1 : -1;
  if (a.done) return (b.completedAt ?? 0) - (a.completedAt ?? 0);
  if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
  if (a.dueDate) return -1;
  if (b.dueDate) return 1;
  return b.createdAt - a.createdAt;
}

export function useTodos(): Todo[] | undefined {
  return useLiveQuery(async () => (await db.todos.toArray()).sort(sortTodos));
}
