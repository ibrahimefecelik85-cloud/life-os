"use client";
// Bugün ekranındaki kısa bütçe kartı: bu ayki toplam, limit durumu ve hızlı harcama ekleme
import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Plus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatTL } from "@/lib/money";
import { sumAmounts, useMonthExpenses, useMonthlyLimit } from "../hooks";
import { ExpenseFormModal } from "./ExpenseFormModal";

export function BudgetTodayCard({ now }: { now: Date }) {
  const expenses = useMonthExpenses(now);
  const limit = useMonthlyLimit();
  const [adding, setAdding] = useState(false);

  const total = sumAmounts(expenses ?? []);
  const pct = limit ? (total / limit) * 100 : 0;

  return (
    <Card
      title="Bütçe"
      icon={<Wallet size={16} />}
      action={
        <Link href="/butce" className="text-xs text-brand-600">
          Detay
        </Link>
      }
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs text-ink-500">Bu ay harcanan</p>
          <p className="text-2xl font-semibold tracking-tight tabular-nums">{formatTL(total)}</p>
          {limit ? (
            <p className={`mt-0.5 flex items-center gap-1 text-xs ${pct > 100 ? "text-rose-700" : pct >= 80 ? "text-amber-700" : "text-ink-500"}`}>
              {pct >= 80 && <AlertTriangle size={12} />}
              {pct > 100 ? `Limit ${formatTL(total - limit)} aşıldı` : `${formatTL(limit - total)} kaldı · %${Math.round(pct)}`}
            </p>
          ) : null}
        </div>
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus size={14} /> Harcama
        </Button>
      </div>
      {limit ? (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-900/10">
          <div
            className={`h-full rounded-full ${pct > 100 ? "bg-rose-500" : pct >= 80 ? "bg-amber-500" : "bg-chart"}`}
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
      ) : null}
      {adding && <ExpenseFormModal onClose={() => setAdding(false)} />}
    </Card>
  );
}
