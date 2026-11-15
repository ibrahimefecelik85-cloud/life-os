// Tarayıcı veritabanı (IndexedDB), Dexie kütüphanesiyle.
// Tüm tablolar burada tanımlanır. Yeni tablo eklerken:
//   1) Aşağıya yeni bir `this.version(N+1).stores({...})` ekle (eskileri silme!)
//   2) Sınıfa tablonun tipini ekle
//   3) ALL_TABLES listesine ekle (yedekleme için)
// Not: IndexedDB true/false değerlerini indeksleyemez, o yüzden "done" alanlarını
// indekse koymuyoruz; filtrelemeyi JavaScript'te yapıyoruz (veri küçük, sorun değil).
import Dexie, { type EntityTable, type Transaction } from "dexie";
import type { Assessment, ClassSession, Course, Habit, HabitLog, Todo } from "@/types";
import { newId } from "./id";

class LifeOSDB extends Dexie {
  courses!: EntityTable<Course, "id">;
  classSessions!: EntityTable<ClassSession, "id">;
  assessments!: EntityTable<Assessment, "id">;
  todos!: EntityTable<Todo, "id">;
  habits!: EntityTable<Habit, "id">;
  habitLogs!: EntityTable<HabitLog, "id">;

  constructor() {
    super("life-os");

    // Şema: ilk alan birincil anahtar (id), diğerleri aranabilir alanlar (indeks)
    this.version(1).stores({
      courses: "id, code",
      classSessions: "id, courseId, weekday",
      assessments: "id, courseId, dueDate",
      todos: "id, category, dueDate",
    });

    // Sürüm 2: günlük rutin tabloları
    this.version(2)
      .stores({
        habits: "id, order",
        habitLogs: "id, habitId, date",
      })
      // Uygulamayı zaten kullananlar için: rutin listesini ekle
      .upgrade((tx) => seedHabits(tx));

    // Veritabanı ilk kez oluşturulduğunda başlangıç verilerini ekle
    this.on("populate", (tx) => {
      seedCourses(tx);
      seedHabits(tx);
    });
  }
}

function seedCourses(tx: Transaction) {
  const now = Date.now();
  const defaults: Course[] = [
    { id: newId(), code: "CE 112", name: "Statik", color: "amber", createdAt: now },
    { id: newId(), code: "MATH 104", color: "sky", createdAt: now + 1 },
    { id: newId(), code: "BUS 101", name: "İşletmeye Giriş", color: "emerald", createdAt: now + 2 },
    { id: newId(), code: "MATH 211", color: "violet", createdAt: now + 3 },
  ];
  return tx.table("courses").bulkAdd(defaults);
}

function seedHabits(tx: Transaction) {
  const now = Date.now();
  const items: Pick<Habit, "title" | "targetMinutes">[] = [
    { title: "Peak uygulaması" },
    { title: "Supplement alımı" },
    { title: "Ders çalışma", targetMinutes: 120 },
    { title: "Satranç" },
    { title: "Yüz temizleme" },
    { title: "Kitap okuma" },
    { title: "Mail ve Moodle kontrolü" },
    { title: "Darkside ve Hudl çalışması" },
  ];
  const habits: Habit[] = items.map((h, i) => ({
    ...h,
    id: newId(),
    order: i,
    days: [],
    createdAt: now + i,
  }));
  return tx.table("habits").bulkAdd(habits);
}

export const db = new LifeOSDB();

/** Yedekleme için tüm tabloların listesi */
export const ALL_TABLES = ["courses", "classSessions", "assessments", "todos", "habits", "habitLogs"] as const;
