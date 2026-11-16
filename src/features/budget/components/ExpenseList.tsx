"use client";
// Harcamalar, güne göre gruplu (yeniden eskiye). Dokununca düzenlenir.
import { parseISO } from "date-fns";
import { Card } from "@/components/ui/Card";
import { formatLong } from "@/lib/dates";
import { formatTL } from "@/lib/money";
import type { Expense, ExpenseCategory, ID, ISODate } from "@/types";
import { sumAmounts } from "../hooks";

export function ExpenseList({
  expenses,
  categories,
  title,
  onEdit,
}: {
  expenses: Expense[];
  categories: Map<ID, ExpenseCategory>;
  title: string;
  onEdit: (e: Expense) => void;
}) {
  const groups = new Map<ISODate, Expense[]>();
  for (const e of expenses) groups.set(e.date, [...(groups.get(e.date) ?? []), e]);

  return (
    <Card title={title}>
      {expenses.length === 0 ? (
        <p className="py-4 text-center text-sm text-ink-500">Henüz harcama yok.</p>
      ) : (
        <div className="space-y-4">
          {[...groups.entries()].map(([date, list]) => (
            <section key={date}>
              <header className="mb-1 flex items-baseline justify-between text-xs text-ink-500">
                <span className="capitalize">{formatLong(parseISO(date))}</span>
                <span className="tabular-nums">{formatTL(sumAmounts(list))}</span>
              </header>
              <ul className="divide-y divide-ink-900/15">
                {list.map((e) => {
                  const c = categories.get(e.categoryId);
                  return (
                    <li key={e.id}>
                      <button type="button" onClick={() => onEdit(e)} className="flex w-full items-center gap-3 py-2.5 text-left">
                        <span className="glass-soft flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base">
                          {c?.emoji ?? "•"}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate">{e.note || c?.name || "?"}</span>
                          {e.note && <span className="block text-xs text-ink-500">{c?.name}</span>}
                        </span>
                        <span className="font-medium tabular-nums">{formatTL(e.amount)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </Card>
  );
}
