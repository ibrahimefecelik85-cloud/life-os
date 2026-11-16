"use client";
// Bütçe: aylık özet, kategori dağılımı, günlük grafik ve harcama listesi
import { useMemo, useState } from "react";
import { addMonths, format, startOfMonth } from "date-fns";
import { tr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, Tags } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, IconButton } from "@/components/ui/Button";
import { useNow } from "@/hooks/useNow";
import { BudgetSummary } from "@/features/budget/components/BudgetSummary";
import { CategoryBars } from "@/features/budget/components/CategoryBars";
import { CategoriesModal } from "@/features/budget/components/CategoriesModal";
import { DailyChart } from "@/features/budget/components/DailyChart";
import { ExpenseFormModal } from "@/features/budget/components/ExpenseFormModal";
import { ExpenseList } from "@/features/budget/components/ExpenseList";
import { LimitModal } from "@/features/budget/components/LimitModal";
import { sumAmounts, totalsByCategory, useCategoryMap, useMonthExpenses, useMonthlyLimit } from "@/features/budget/hooks";
import type { Expense, ID } from "@/types";

type Dialog = { kind: "expense"; item?: Expense } | { kind: "limit" } | { kind: "categories" } | null;

export default function ButcePage() {
  const now = useNow();
  return now ? <Budget now={now} /> : <PageHeader title="Bütçe" />;
}

function Budget({ now }: { now: Date }) {
  const [offset, setOffset] = useState(0);
  const [filter, setFilter] = useState<ID | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);

  const month = useMemo(() => startOfMonth(addMonths(now, offset)), [now, offset]);
  const expenses = useMonthExpenses(month);
  const limit = useMonthlyLimit();
  const categories = useCategoryMap();

  const list = expenses ?? [];
  const total = sumAmounts(list);
  const totals = useMemo(() => totalsByCategory(expenses ?? []), [expenses]);
  const filtered = filter ? list.filter((e) => e.categoryId === filter) : list;
  const filterName = filter ? categories.get(filter)?.name : null;

  function goTo(n: number) {
    setOffset(n);
    setFilter(null);
  }

  const close = () => setDialog(null);

  return (
    <>
      <PageHeader
        title="Bütçe"
        action={
          <Button size="sm" variant="secondary" onClick={() => setDialog({ kind: "categories" })}>
            <Tags size={14} /> Kategoriler
          </Button>
        }
      />

      <div className="space-y-4">
        {/* Ay seçici */}
        <div className="flex items-center justify-between">
          <IconButton onClick={() => goTo(offset - 1)} aria-label="Önceki ay">
            <ChevronLeft size={20} />
          </IconButton>
          <div className="text-center">
            <p className="text-lg font-semibold capitalize">{format(month, "MMMM yyyy", { locale: tr })}</p>
            {offset !== 0 && (
              <button type="button" onClick={() => goTo(0)} className="text-xs font-medium text-brand-600">
                Bu aya dön
              </button>
            )}
          </div>
          <IconButton onClick={() => goTo(offset + 1)} aria-label="Sonraki ay">
            <ChevronRight size={20} />
          </IconButton>
        </div>

        {expenses !== undefined && limit !== undefined && (
          <>
            <BudgetSummary total={total} limit={limit} month={month} now={now} onEditLimit={() => setDialog({ kind: "limit" })} />

            <Button className="w-full" onClick={() => setDialog({ kind: "expense" })}>
              <Plus size={18} /> Harcama ekle
            </Button>

            <CategoryBars totals={totals} grandTotal={total} categories={categories} selected={filter} onSelect={setFilter} />
            <DailyChart expenses={list} month={month} now={now} />
            <ExpenseList
              expenses={filtered}
              categories={categories}
              title={filterName ? `Harcamalar · ${filterName}` : "Harcamalar"}
              onEdit={(item) => setDialog({ kind: "expense", item })}
            />
          </>
        )}
      </div>

      {dialog?.kind === "expense" && <ExpenseFormModal initial={dialog.item} defaultCategoryId={filter ?? undefined} onClose={close} />}
      {dialog?.kind === "limit" && <LimitModal current={limit ?? null} onClose={close} />}
      {dialog?.kind === "categories" && <CategoriesModal onClose={close} />}
    </>
  );
}
