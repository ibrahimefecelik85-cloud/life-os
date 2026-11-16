"use client";
// Sıradaki kulüp etkinliği: büyük kahverengi cam kart + geri sayım
import { parseISO } from "date-fns";
import { MapPin, Plus } from "lucide-react";
import { daysUntil, formatLong } from "@/lib/dates";
import { CLUB_EVENT_LABELS } from "@/lib/labels";
import type { ClubEvent } from "@/types";

export function NextEventHero({ ev, now, onOpen, onAdd }: { ev?: ClubEvent; now: Date; onOpen: (e: ClubEvent) => void; onAdd: () => void }) {
  const base =
    "relative w-full overflow-hidden rounded-3xl border border-ink-900 bg-gradient-to-br from-brand-500/85 via-brand-700/85 to-brand-900/90 p-5 text-left text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.3),0_14px_34px_-18px_rgb(58_39_23/0.7)] backdrop-blur-xl";

  if (!ev) {
    return (
      <button type="button" onClick={onAdd} className={base}>
        <p className="text-xs font-medium uppercase tracking-widest text-brand-100">Sıradaki etkinlik</p>
        <p className="mt-2 text-lg font-semibold">Planlanmış etkinlik yok</p>
        <p className="mt-1 flex items-center gap-1 text-sm text-brand-50">
          <Plus size={14} /> Etkinlik veya turnuva ekle
        </p>
      </button>
    );
  }

  const n = daysUntil(ev.date, now);
  return (
    <button type="button" onClick={() => onOpen(ev)} className={base}>
      <p className="text-xs font-medium uppercase tracking-widest text-brand-100">Sıradaki {CLUB_EVENT_LABELS[ev.type].toLocaleLowerCase("tr")}</p>
      <div className="mt-1 flex items-end justify-between gap-3">
        <p className="text-2xl font-semibold leading-tight tracking-tight">{ev.title}</p>
        <p className="shrink-0 text-right">
          <span className="block text-4xl font-semibold tracking-tighter tabular-nums">{n === 0 ? "Bugün" : n}</span>
          {n > 0 && <span className="text-xs text-brand-100">gün kaldı</span>}
        </p>
      </div>
      <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-white/25 pt-3 text-xs text-brand-50">
        <span className="capitalize">{formatLong(parseISO(ev.date))}</span>
        {ev.time && (
          <span className="tabular-nums">
            {ev.time}
            {ev.endTime && `–${ev.endTime}`}
          </span>
        )}
        {ev.location && (
          <span className="flex items-center gap-0.5">
            <MapPin size={11} /> {ev.location}
          </span>
        )}
      </p>
    </button>
  );
}
