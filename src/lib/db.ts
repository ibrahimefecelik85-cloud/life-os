// Tarayıcı veritabanı (IndexedDB), Dexie kütüphanesiyle.
// Tüm tablolar burada tanımlanır. Yeni tablo eklerken:
//   1) Aşağıya yeni bir `this.version(N+1).stores({...})` ekle (eskileri silme!)
//   2) Sınıfa tablonun tipini ekle
//   3) ALL_TABLES listesine ekle (yedekleme için)
// Not: IndexedDB true/false değerlerini indeksleyemez, o yüzden "done" alanlarını
// indekse koymuyoruz; filtrelemeyi JavaScript'te yapıyoruz (veri küçük, sorun değil).
import Dexie, { type EntityTable, type Transaction } from "dexie";
import type { Assessment, CalendarEvent, ClassSession, Course, Habit, HabitLog, Todo } from "@/types";
import { newId } from "./id";
import { seedFall2026 } from "./seed/fall2026";
import { seedWolves } from "./seed/wolves";

class LifeOSDB extends Dexie {
  courses!: EntityTable<Course, "id">;
  classSessions!: EntityTable<ClassSession, "id">;
  assessments!: EntityTable<Assessment, "id">;
  todos!: EntityTable<Todo, "id">;
  habits!: EntityTable<Habit, "id">;
  habitLogs!: EntityTable<HabitLog, "id">;
  events!: EntityTable<CalendarEvent, "id">;

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

    // Sürüm 3: takvim etkinlikleri
    this.version(3).stores({
      events: "id, date",
    });

    // Sürüm 4: 2026 Güz ders programı ve ara sınavlar (tablo değişikliği yok, sadece veri)
    this.version(4)
      .stores({})
      .upgrade((tx) => seedFall2026(tx));

    // Sürüm 5: Wolves idmanı (Çar, Cum 21–23 · Paz 19–21)
    this.version(5)
      .stores({})
      .upgrade((tx) => seedWolves(tx));

    // Veritabanı ilk kez oluşturulduğunda başlangıç verilerini ekle
    this.on("populate", async (tx) => {
      await seedFall2026(tx); // dersler + program + sınavlar
      await seedWolves(tx);
      await seedHabits(tx);
    });
  }
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
export const ALL_TABLES = ["courses", "classSessions", "assessments", "todos", "habits", "habitLogs", "events"] as const;
