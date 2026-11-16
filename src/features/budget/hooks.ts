"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { db } from "@/lib/db";
import type { Expense, ExpenseCategory, ID } from "@/types";
import { getMonthlyLimit } from "./api";

export function useExpenseCategories(): ExpenseCategory[] | undefined {
  return useLiveQuery(() => db.expenseCategories.orderBy("order").toArray());
}

export function useCategoryMap(): Map<ID, ExpenseCategory> {
  const cats = useExpenseCategories();
  return useMemo(() => new Map((cats ?? []).map((c) => [c.id, c])), [cats]);
}

/** Verilen ayın harcamaları (yeniden eskiye) */
export function useMonthExpenses(month: Date): Expense[] | undefined {
  const from = format(startOfMonth(month), "yyyy-MM-dd");
  const to = format(endOfMonth(month), "yyyy-MM-dd");
  return useLiveQuery(async () => {
    const list = await db.expenses.where("date").between(from, to, true, true).toArray();
    return list.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
  }, [from, to]);
}

/** Aylık limit: undefined = yükleniyor, null = limit yok */
export function useMonthlyLimit(): number | null | undefined {
  return useLiveQuery(getMonthlyLimit);
}

/** Kategori bazında toplamlar, büyükten küçüğe */
export function totalsByCategory(expenses: Expense[]): { categoryId: ID; total: number }[] {
  const map = new Map<ID, number>();
  for (const e of expenses) map.set(e.categoryId, (map.get(e.categoryId) ?? 0) + e.amount);
  return [...map.entries()].map(([categoryId, total]) => ({ categoryId, total })).sort((a, b) => b.total - a.total);
}

export const sumAmounts = (expenses: Expense[]) => Math.round(expenses.reduce((s, e) => s + e.amount, 0) * 100) / 100;
