// Wolves idmanı: haftalık düzenli aktivite. Veritabanı sürüm 5'te bir kere eklenir.
// Saat değişirse uygulamadan (Dersler → Program) düzenleyebilirsin.
import type { Transaction } from "dexie";
import type { ClassSession, Course, Weekday } from "@/types";
import { newId } from "@/lib/id";

const SESSIONS: { weekday: Weekday; start: string; end: string }[] = [
  { weekday: 3, start: "21:00", end: "23:00" }, // Çarşamba
  { weekday: 5, start: "21:00", end: "23:00" }, // Cuma
  { weekday: 7, start: "19:00", end: "21:00" }, // Pazar
];

export async function seedWolves(tx: Transaction) {
  const coursesT = tx.table<Course, string>("courses");
  const sessionsT = tx.table<ClassSession, string>("classSessions");

  // Wolves zaten varsa onu kullan, yoksa aktivite olarak oluştur
  const courses = await coursesT.toArray();
  let wolves = courses.find((c) => c.code.trim().toLowerCase() === "wolves");
  if (!wolves) {
    wolves = { id: newId(), code: "Wolves", name: "İdman", type: "aktivite", color: "orange", createdAt: Date.now() };
    await coursesT.add(wolves);
  }

  // Aynı gün + başlangıç saati zaten varsa tekrar ekleme
  const existing = await sessionsT.where("courseId").equals(wolves.id).toArray();
  for (const s of SESSIONS) {
    if (existing.some((x) => x.weekday === s.weekday && x.start === s.start)) continue;
    await sessionsT.add({ id: newId(), courseId: wolves.id, ...s, kind: "idman" });
  }
}
