"use client";
// Ayın özeti: toplam harcama (büyük sayı), limit ilerlemesi ve günlük ortalama
import { getDaysInMonth, isSameMonth } from "date-fns";
import { AlertTriangle, CheckCircle2, Target } from "lucide-react";
import { formatTL } from "@/lib/money";

export function BudgetSummary({
  total,
  limit,
  month,
  now,
  onEditLimit,
}: {
  total: number;
  limit: number | null;
  month: Date;
  now: Date;
  onEditLimit: () => void;
}) {
  const isCurrent = isSameMonth(month, now);
  const daysInMonth = getDaysInMonth(month);
  const daysPassed = isCurrent ? now.getDate() : daysInMonth;
  const daysLeft = isCurrent ? daysInMonth - now.getDate() + 1 : 0; // bugün dahil
  const dailyAvg = daysPassed > 0 ? total / daysPassed : 0;

  const pct = limit ? (total / limit) * 100 : 0;
  const remaining = limit ? limit - total : 0;
  const status = !limit ? null : pct > 100 ? "asildi" : pct >= 80 ? "yakin" : "iyi";

  return (
    <section className="relative overflow-hidden rounded-3xl border border-ink-900 bg-gradient-to-br from-brand-500/85 via-brand-700/85 to-brand-900/90 p-5 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.3),0_14px_34px_-18px_rgb(58_39_23/0.7)] backdrop-blur-xl">
      <p className="text-xs font-medium uppercase tracking-widest text-brand-100">{isCurrent ? "Bu ay harcanan" : "Bu ayda harcanan"}</p>
      <p className="mt-1 text-5xl font-semibold tracking-tighter tabular-nums">{formatTL(total)}</p>

      {limit ? (
        <div className="mt-4">
          <div className="flex items-baseline justify-between text-xs text-brand-50">
            <span>
              Limit {formatTL(limit)} · %{Math.round(pct)}
            </span>
            <button type="button" onClick={onEditLimit} className="underline-offset-2 hover:underline">
              Değiştir
            </button>
          </div>
          <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-white/20">
            <div
              className={`h-full rounded-full transition-all ${status === "asildi" ? "bg-rose-300" : status === "yakin" ? "bg-amber-200" : "bg-white"}`}
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
          {/* Durum: renk + simge + yazı (sadece renge güvenmiyoruz) */}
          <p className="mt-2 flex items-center gap-1.5 text-sm">
            {status === "asildi" ? (
              <>
                <AlertTriangle size={15} /> Limit {formatTL(-remaining)} aşıldı
              </>
            ) : status === "yakin" ? (
              <>
                <AlertTriangle size={15} /> Limite yaklaştın · {formatTL(remaining)} kaldı
              </>
            ) : (
              <>
                <CheckCircle2 size={15} /> {formatTL(remaining)} kaldı
              </>
            )}
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={onEditLimit}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/40 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/15"
        >
          <Target size={13} /> Aylık limit belirle
        </button>
      )}

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-white/25 pt-3 text-xs text-brand-50">
        <span>Günlük ortalama {formatTL(dailyAvg)}</span>
        {isCurrent && limit && remaining > 0 && daysLeft > 0 && (
          <span>Ay sonuna kadar günde {formatTL(remaining / daysLeft)} harcayabilirsin</span>
        )}
      </div>
    </section>
  );
}
