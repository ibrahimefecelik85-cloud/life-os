"use client";
// Kategori dağılımı: yatay çubuklar, büyükten küçüğe.
// Tek ölçü (tutar) gösterdiği için tek renk; kategori kimliği yazıyla verilir.
// Bir satıra dokununca alttaki liste o kategoriye göre filtrelenir.
import { Card } from "@/components/ui/Card";
import { formatTL } from "@/lib/money";
import type { ExpenseCategory, ID } from "@/types";

export function CategoryBars({
  totals,
  grandTotal,
  categories,
  selected,
  onSelect,
}: {
  totals: { categoryId: ID; total: number }[];
  grandTotal: number;
  categories: Map<ID, ExpenseCategory>;
  selected: ID | null;
  onSelect: (id: ID | null) => void;
}) {
  const max = totals[0]?.total ?? 0;

  return (
    <Card title="Kategorilere göre">
      {totals.length === 0 ? (
        <p className="py-4 text-center text-sm text-ink-500">Bu ay harcama yok.</p>
      ) : (
        <ul className="space-y-1">
          {totals.map(({ categoryId, total }) => {
            const c = categories.get(categoryId);
            const pct = grandTotal ? (total / grandTotal) * 100 : 0;
            const active = selected === categoryId;
            const dimmed = selected !== null && !active;
            return (
              <li key={categoryId}>
                <button
                  type="button"
                  onClick={() => onSelect(active ? null : categoryId)}
                  aria-pressed={active}
                  title={`${c?.name ?? "?"}: ${formatTL(total)} (%${pct.toFixed(1)})`}
                  className={`grid w-full grid-cols-[7.5rem_1fr_auto] items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-white/45 ${
                    active ? "bg-white/55" : ""
                  } ${dimmed ? "opacity-45" : ""}`}
                >
                  <span className="truncate text-sm text-ink-800">
                    {c?.emoji} {c?.name ?? "?"}
                  </span>
                  {/* Çubuk: tabanda düz, uçta 4px yuvarlak */}
                  <span className="h-2.5">
                    <span
                      className="block h-full rounded-r-[4px] bg-chart"
                      style={{ width: `${Math.max(2, (total / max) * 100)}%` }}
                    />
                  </span>
                  <span className="text-right text-sm tabular-nums text-ink-900">
                    {formatTL(total)}
                    <span className="ml-1.5 text-xs text-ink-500">%{Math.round(pct)}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {selected && (
        <button type="button" onClick={() => onSelect(null)} className="mt-2 text-xs font-medium text-brand-700">
          Filtreyi kaldır
        </button>
      )}
    </Card>
  );
}
