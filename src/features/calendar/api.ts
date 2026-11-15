// Takvim etkinliklerinin veri işlemleri
import { db } from "@/lib/db";
import { newId } from "@/lib/id";
import type { CalendarEvent, ID } from "@/types";

export type EventInput = Omit<CalendarEvent, "id" | "createdAt">;

export const addEvent = (data: EventInput) => db.events.add({ ...data, id: newId(), createdAt: Date.now() });
export const updateEvent = (id: ID, data: Partial<EventInput>) => db.events.update(id, data);
export const deleteEvent = (id: ID) => db.events.delete(id);
