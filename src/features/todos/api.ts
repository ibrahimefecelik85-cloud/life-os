// Yapılacaklar modülünün veri işlemleri
import { db } from "@/lib/db";
import { newId } from "@/lib/id";
import type { ID, Todo } from "@/types";

export type TodoInput = Pick<Todo, "title" | "category" | "dueDate">;

export const addTodo = (data: TodoInput) =>
  db.todos.add({ ...data, id: newId(), done: false, createdAt: Date.now() });

export const updateTodo = (id: ID, data: Partial<Todo>) => db.todos.update(id, data);
export const deleteTodo = (id: ID) => db.todos.delete(id);

export const toggleTodo = (t: Todo) =>
  db.todos.update(t.id, { done: !t.done, completedAt: t.done ? undefined : Date.now() });

/** Tamamlanmış tüm görevleri siler */
export const clearCompletedTodos = async () => {
  const done = (await db.todos.toArray()).filter((t) => t.done).map((t) => t.id);
  await db.todos.bulkDelete(done);
};
