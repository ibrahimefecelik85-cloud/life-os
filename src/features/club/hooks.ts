"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { ClubEvent, ClubNote } from "@/types";

const byDateTime = (a: ClubEvent, b: ClubEvent) =>
  a.date.localeCompare(b.date) || (a.time ?? "99").localeCompare(b.time ?? "99");

/** Tüm kulüp etkinlikleri, tarihe göre (eskiden yeniye) */
export function useClubEvents(): ClubEvent[] | undefined {
  return useLiveQuery(async () => (await db.clubEvents.toArray()).sort(byDateTime));
}

/** Gelişmeler: sabitlenenler üstte, sonra yeniden eskiye */
export function useClubNotes(): ClubNote[] | undefined {
  return useLiveQuery(async () =>
    (await db.clubNotes.toArray()).sort(
      (a, b) => Number(b.pinned) - Number(a.pinned) || b.date.localeCompare(a.date) || b.createdAt - a.createdAt,
    ),
  );
}
