// 2026-2027 Güz dönemi ders programı ve ara sınavlar (Özyeğin SIS ekran görüntülerinden).
// Veritabanı sürüm 4'te bir kere eklenir. Yeni dönemde bu dosyayı kopyalayıp
// db.ts'e yeni bir sürüm eklemen yeterli.
//
// Not: SIS ekranında bitiş saatleri yazmıyor; blok yüksekliklerinden ve okulun
// X:40–Y:30 saat düzeninden çıkarıldı. Yanlış olan varsa uygulamadan düzenleyebilirsin.
import type { Transaction } from "dexie";
import type { Assessment, ClassSession, Course, SessionKind, Weekday } from "@/types";
import type { ColorKey } from "@/lib/colors";
import { newId } from "@/lib/id";

const COURSES: { code: string; name?: string; color: ColorKey; instructor?: string }[] = [
  { code: "CE 112", name: "Statik", color: "amber", instructor: "Hadi Valizadeh" },
  { code: "MATH 104", color: "sky", instructor: "Hüsnü Ata Erbay" },
  { code: "BUS 101", name: "İşletmeye Giriş", color: "emerald", instructor: "Pelin Atahan" },
  { code: "MATH 211", color: "violet", instructor: "Burçin Güneş" },
];

const SESSIONS: { code: string; weekday: Weekday; start: string; end: string; kind: SessionKind; room: string }[] = [
  { code: "MATH 104", weekday: 1, start: "14:40", end: "16:30", kind: "ders", room: "EF 238" },
  { code: "CE 112", weekday: 2, start: "10:40", end: "12:30", kind: "ders", room: "EF 245" },
  { code: "BUS 101", weekday: 2, start: "16:40", end: "18:30", kind: "ders", room: "LF 150" },
  { code: "MATH 104", weekday: 3, start: "10:40", end: "12:30", kind: "ders", room: "EF 238" },
  { code: "MATH 211", weekday: 3, start: "12:40", end: "15:30", kind: "ders", room: "SCOLA 326" },
  { code: "CE 112", weekday: 4, start: "10:40", end: "12:30", kind: "ders", room: "EF 245" },
  { code: "MATH 104", weekday: 4, start: "14:40", end: "16:30", kind: "ps", room: "EF 238 (Songül Esin)" },
  { code: "MATH 211", weekday: 5, start: "14:40", end: "15:30", kind: "ps", room: "SCOLA 3. kat" },
  { code: "BUS 101", weekday: 5, start: "16:40", end: "18:30", kind: "lab", room: "FEAS 101" },
];

const EXAMS: { code: string; title: string; date: string; time: string; notes: string }[] = [
  { code: "MATH 211", title: "Ara Sınav", date: "2026-12-05", time: "13:40", notes: "13:40–15:25 · Salon: EF AB1.509 (SIS'ten kontrol et)" },
  { code: "MATH 104", title: "Ara Sınav", date: "2026-12-09", time: "18:40", notes: "18:40–20:40 · Salon: EF AB1.225 (SIS'ten kontrol et)" },
  { code: "BUS 101", title: "Ara Sınav", date: "2026-12-13", time: "13:40", notes: "13:40–15:40 · Salon: LF AB3.133 (SIS'ten kontrol et)" },
];

/** "MATH104", "math 104" ve "MATH 104" aynı ders sayılsın */
const norm = (code: string) => code.replace(/\s+/g, "").toUpperCase();

/** Programı ve sınavları ekler; zaten var olanları tekrar eklemez. */
export async function seedFall2026(tx: Transaction) {
  const coursesT = tx.table<Course, string>("courses");
  const sessionsT = tx.table<ClassSession, string>("classSessions");
  const assessmentsT = tx.table<Assessment, string>("assessments");

  // 1) Dersler: varsa eşleştir (hoca boşsa doldur), yoksa oluştur
  const existing = await coursesT.toArray();
  const idByCode = new Map(existing.map((c) => [norm(c.code), c]));
  const now = Date.now();
  for (const [i, c] of COURSES.entries()) {
    const found = idByCode.get(norm(c.code));
    if (found) {
      if (!found.instructor && c.instructor) await coursesT.update(found.id, { instructor: c.instructor });
    } else {
      const course: Course = { id: newId(), ...c, createdAt: now + i };
      await coursesT.add(course);
      idByCode.set(norm(c.code), course);
    }
  }
  const courseId = (code: string) => idByCode.get(norm(code))!.id;

  // 2) Ders saatleri: aynı ders + gün + başlangıç saati varsa ekleme
  const sessions = await sessionsT.toArray();
  for (const s of SESSIONS) {
    const id = courseId(s.code);
    const dup = sessions.some((x) => x.courseId === id && x.weekday === s.weekday && x.start === s.start);
    if (!dup) {
      await sessionsT.add({ id: newId(), courseId: id, weekday: s.weekday, start: s.start, end: s.end, kind: s.kind, room: s.room });
    }
  }

  // 3) Sınavlar: aynı ders + tarih + "sınav" türü varsa ekleme
  const assessments = await assessmentsT.toArray();
  for (const [i, e] of EXAMS.entries()) {
    const id = courseId(e.code);
    const dup = assessments.some((a) => a.courseId === id && a.dueDate === e.date && a.type === "sinav");
    if (!dup) {
      await assessmentsT.add({
        id: newId(),
        courseId: id,
        type: "sinav",
        title: e.title,
        dueDate: e.date,
        dueTime: e.time,
        priority: "yuksek",
        done: false,
        notes: e.notes,
        createdAt: now + i,
      });
    }
  }
}
