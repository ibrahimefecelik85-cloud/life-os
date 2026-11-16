// Kulüp modülünün veri işlemleri
import { db } from "@/lib/db";
import { newId } from "@/lib/id";
import type { ClubEvent, ClubNote, ID } from "@/types";

// ---- Etkinlikler ----
export type ClubEventInput = Omit<ClubEvent, "id" | "createdAt">;

export const addClubEvent = (data: ClubEventInput) => db.clubEvents.add({ ...data, id: newId(), createdAt: Date.now() });
export const updateClubEvent = (id: ID, data: Partial<ClubEventInput>) => db.clubEvents.update(id, data);
export const deleteClubEvent = (id: ID) => db.clubEvents.delete(id);

// ---- Gelişmeler (notlar) ----
export type ClubNoteInput = Pick<ClubNote, "text" | "tag" | "date">;

export const addClubNote = (data: ClubNoteInput) =>
  db.clubNotes.add({ ...data, id: newId(), pinned: false, createdAt: Date.now() });
export const updateClubNote = (id: ID, data: Partial<ClubNote>) => db.clubNotes.update(id, data);
export const deleteClubNote = (id: ID) => db.clubNotes.delete(id);
export const togglePinClubNote = (n: ClubNote) => db.clubNotes.update(n.id, { pinned: !n.pinned });
