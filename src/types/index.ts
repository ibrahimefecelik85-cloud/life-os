// Uygulamadaki tüm veri tiplerinin tanımı.
// Yeni bir modül eklerken tipini buraya (veya modülün kendi klasörüne) eklemen yeterli.

import type { ColorKey } from "@/lib/colors";

export type ID = string;
/** "2026-11-15" biçiminde tarih */
export type ISODate = string;
/** "09:40" biçiminde saat */
export type TimeStr = string;
/** 1 = Pazartesi ... 7 = Pazar */
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

// ---------- Dersler ----------
/** "ders": okul dersi · "aktivite": ders dışı düzenli program (ör. Wolves idmanı) */
export type CourseType = "ders" | "aktivite";

export interface Course {
  id: ID;
  code: string; // "CE 112" veya "Wolves"
  name?: string; // "Statik"
  type?: CourseType; // boşsa "ders"
  color: ColorKey;
  instructor?: string;
  createdAt: number;
}

export type SessionKind = "ders" | "ps" | "lab" | "idman";

/** Haftalık programdaki tek bir ders saati */
export interface ClassSession {
  id: ID;
  courseId: ID;
  weekday: Weekday;
  start: TimeStr;
  end: TimeStr;
  kind: SessionKind;
  room?: string;
}

export type AssessmentType = "odev" | "quiz" | "sinav" | "proje";
export type Priority = "dusuk" | "orta" | "yuksek";

/** Ödev, quiz, sınav veya proje */
export interface Assessment {
  id: ID;
  courseId: ID;
  type: AssessmentType;
  title: string;
  dueDate: ISODate;
  dueTime?: TimeStr;
  priority: Priority;
  done: boolean;
  notes?: string;
  createdAt: number;
}

// ---------- Günlük rutin ----------
/** Her gün (veya seçili günlerde) tekrar eden alışkanlık */
export interface Habit {
  id: ID;
  title: string;
  order: number; // listedeki sıra
  days: Weekday[]; // hangi günler (boş = her gün)
  targetMinutes?: number; // ör. ders çalışma: 120 dk
  remindAt?: TimeStr; // bildirim saati (Aşama 3'te kullanılacak)
  createdAt: number;
}

/** Bir alışkanlığın belirli bir gündeki kaydı. id = `${habitId}_${date}` */
export interface HabitLog {
  id: string;
  habitId: ID;
  date: ISODate;
  done: boolean;
  minutes?: number;
  completedAt?: number;
}

// ---------- Takvim ----------
/** Ödev/görev olmayan genel etkinlik (maç, doğum günü, randevu...) */
export interface CalendarEvent {
  id: ID;
  title: string;
  date: ISODate;
  time?: TimeStr;
  note?: string;
  createdAt: number;
}

// ---------- Kulüp ----------
export type ClubEventType = "etkinlik" | "turnuva" | "toplanti" | "antrenman" | "diger";

/** Kulüp etkinliği (takvimde de görünür) */
export interface ClubEvent {
  id: ID;
  title: string;
  type: ClubEventType;
  date: ISODate;
  time?: TimeStr;
  endTime?: TimeStr;
  location?: string;
  notes?: string;
  createdAt: number;
}

export type ClubNoteTag = "duyuru" | "karar" | "not" | "sorun";

/** Kulüpte olup bitenlerin kaydı: duyuru, karar, not, sorun */
export interface ClubNote {
  id: ID;
  text: string;
  tag: ClubNoteTag;
  date: ISODate;
  pinned: boolean;
  createdAt: number;
}

// ---------- Bütçe ----------
export interface ExpenseCategory {
  id: ID;
  name: string;
  emoji: string;
  order: number;
}

/** Tek bir harcama. Tutar Türk lirası (TL). */
export interface Expense {
  id: ID;
  amount: number;
  categoryId: ID;
  date: ISODate;
  note?: string;
  createdAt: number;
}

/** Genel ayarlar (anahtar → değer), ör. aylık bütçe limiti */
export interface Setting {
  key: string;
  value: unknown;
}

// ---------- Yapılacaklar ----------
export type TodoCategory = "okul" | "kulup" | "kisisel";

export interface Todo {
  id: ID;
  title: string;
  category: TodoCategory;
  dueDate?: ISODate;
  done: boolean;
  createdAt: number;
  completedAt?: number;
}
