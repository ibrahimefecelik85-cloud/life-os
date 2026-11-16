// Bütçe modülünün veri işlemleri
import { db } from "@/lib/db";
import { newId } from "@/lib/id";
import type { Expense, ExpenseCategory, ID } from "@/types";

// ---- Harcamalar ----
export type ExpenseInput = Omit<Expense, "id" | "createdAt">;

export const addExpense = (data: ExpenseInput) => db.expenses.add({ ...data, id: newId(), createdAt: Date.now() });
export const updateExpense = (id: ID, data: Partial<ExpenseInput>) => db.expenses.update(id, data);
export const deleteExpense = (id: ID) => db.expenses.delete(id);

// ---- Kategoriler ----
export async function addCategory(name: string, emoji: string) {
  const last = await db.expenseCategories.orderBy("order").last();
  return db.expenseCategories.add({ id: newId(), name, emoji, order: (last?.order ?? -1) + 1 });
}

export const updateCategory = (id: ID, data: Partial<Pick<ExpenseCategory, "name" | "emoji">>) =>
  db.expenseCategories.update(id, data);

/** Kategoriyi siler; içindeki harcamalar başka bir kategoriye taşınır (harcama kaybolmaz) */
export const deleteCategory = (id: ID, moveTo: ID) =>
  db.transaction("rw", db.expenses, db.expenseCategories, async () => {
    await db.expenses.where("categoryId").equals(id).modify({ categoryId: moveTo });
    await db.expenseCategories.delete(id);
  });

// ---- Aylık limit (ayarlar tablosunda) ----
const LIMIT_KEY = "budget.monthlyLimit";

export const setMonthlyLimit = (amount: number | null) =>
  amount ? db.settings.put({ key: LIMIT_KEY, value: amount }) : db.settings.delete(LIMIT_KEY);

export async function getMonthlyLimit(): Promise<number | null> {
  const row = await db.settings.get(LIMIT_KEY);
  return typeof row?.value === "number" ? row.value : null;
}
