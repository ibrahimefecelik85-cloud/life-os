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
export interface Course {
  id: ID;
  code: string; // "CE 112"
  name?: string; // "Statik"
  color: ColorKey;
  instructor?: string;
  createdAt: number;
}

export type SessionKind = "ders" | "ps" | "lab";

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
