// Tarayıcı veritabanı (IndexedDB), Dexie kütüphanesiyle.
// Tüm tablolar burada tanımlanır. Yeni tablo eklerken:
//   1) Aşağıya yeni bir `this.version(N+1).stores({...})` ekle (eskileri silme!)
//   2) Sınıfa tablonun tipini ekle
// Not: IndexedDB true/false değerlerini indeksleyemez, o yüzden "done" alanlarını
// indekse koymuyoruz; filtrelemeyi JavaScript'te yapıyoruz (veri küçük, sorun değil).
import Dexie, { type EntityTable } from "dexie";
import type { Assessment, ClassSession, Course, Todo } from "@/types";
import { newId } from "./id";

class LifeOSDB extends Dexie {
  courses!: EntityTable<Course, "id">;
  classSessions!: EntityTable<ClassSession, "id">;
  assessments!: EntityTable<Assessment, "id">;
  todos!: EntityTable<Todo, "id">;

  constructor() {
    super("life-os");

    // Şema: ilk alan birincil anahtar (id), diğerleri aranabilir alanlar (indeks)
    this.version(1).stores({
      courses: "id, code",
      classSessions: "id, courseId, weekday",
      assessments: "id, courseId, dueDate",
      todos: "id, category, dueDate",
    });

    // Veritabanı ilk kez oluşturulduğunda derslerini hazır ekle
    this.on("populate", (tx) => {
      const now = Date.now();
      const defaults: Course[] = [
        { id: newId(), code: "CE 112", name: "Statik", color: "amber", createdAt: now },
        { id: newId(), code: "MATH 104", color: "sky", createdAt: now + 1 },
        { id: newId(), code: "BUS 101", name: "İşletmeye Giriş", color: "emerald", createdAt: now + 2 },
        { id: newId(), code: "MATH 211", color: "violet", createdAt: now + 3 },
      ];
      tx.table("courses").bulkAdd(defaults);
    });
  }
}

export const db = new LifeOSDB();

/** Yedekleme için tüm tabloların listesi */
export const ALL_TABLES = ["courses", "classSessions", "assessments", "todos"] as const;
