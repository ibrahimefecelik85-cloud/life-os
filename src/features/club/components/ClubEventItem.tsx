"use client";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/misc";
import { formatShort, relativeDay } from "@/lib/dates";
import { CLUB_EVENT_LABELS } from "@/lib/labels";
import type { ClubEvent } from "@/types";

export function ClubEventItem({ ev, now, onEdit, past }: { ev: ClubEvent; now: Date; onEdit: (e: ClubEvent) => void; past?: boolean }) {
  return (
    <li>
      <button type="button" onClick={() => onEdit(ev)} className={`flex w-full items-start gap-3 py-2.5 text-left ${past ? "opacity-55" : ""}`}>
        {/* Tarih kutusu */}
        <span className="glass-soft flex w-12 shrink-0 flex-col items-center rounded-xl py-1.5">
          <span className="text-lg font-semibold leading-none tabular-nums">{ev.date.slice(8, 10)}</span>
          <span className="mt-0.5 text-[10px] uppercase text-ink-500">{formatShort(ev.date).split(" ")[1]}</span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <Badge className={ev.type === "turnuva" ? "bg-ink-900 text-white" : "border border-ink-900/30 bg-white/50 text-ink-700"}>
              {CLUB_EVENT_LABELS[ev.type]}
            </Badge>
            {!past && <span className="text-xs text-ink-500">{relativeDay(ev.date, now)}</span>}
          </span>
          <span className="mt-0.5 block truncate font-medium">{ev.title}</span>
          <span className="flex flex-wrap items-center gap-x-2 text-xs text-ink-500">
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
          </span>
        </span>
      </button>
    </li>
  );
}
