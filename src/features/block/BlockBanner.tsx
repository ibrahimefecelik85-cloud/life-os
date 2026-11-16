"use client";
// Günlük rutin kartının üstünde: engel durumu
//  - engelliyse: "Bugün Instagram/YouTube kapalı — X rutin daha"
//  - engel açık ama bugün henüz yeterli değilse: hafif uyarı
import { Ban, ShieldCheck } from "lucide-react";
import { toISODate } from "@/lib/dates";
import { useBlockStatus } from "./hooks";

export function BlockBanner({ now }: { now: Date }) {
  const r = useBlockStatus(toISODate(now));
  if (!r?.enabled) return null;
  const left = Math.max(0, r.today.required - r.today.done);

  if (r.blocked) {
    return (
      <div className="mb-3 flex items-start gap-2 rounded-xl border border-rose-700/40 bg-rose-500/10 p-3 text-sm text-rose-800">
        <Ban size={16} className="mt-0.5 shrink-0" />
        <span>
          <b>Bugün Instagram ve YouTube kapalı.</b> Dün {r.yesterday?.done} rutin yapıldı. {left} rutin daha bitirince açılır.
        </span>
      </div>
    );
  }
  if (left > 0) {
    return (
      <div className="mb-3 flex items-start gap-2 rounded-xl border border-ink-900/20 bg-white/40 p-3 text-xs text-ink-700">
        <ShieldCheck size={14} className="mt-0.5 shrink-0" />
        <span>Bugün {left} rutin daha yapmazsan yarın Instagram ve YouTube kapanır.</span>
      </div>
    );
  }
  return null;
}
