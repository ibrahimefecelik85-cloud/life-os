// Tarih yardımcıları. Tüm tarihler "yyyy-MM-dd" metni olarak saklanır,
// böylece karşılaştırma ve sıralama basit metin karşılaştırmasıyla yapılabilir.
import {
  addDays,
  differenceInCalendarDays,
  format,
  getISODay,
  parseISO,
  startOfISOWeek,
} from "date-fns";
import { tr } from "date-fns/locale";
import type { ISODate, Weekday } from "@/types";

export const toISODate = (d: Date): ISODate => format(d, "yyyy-MM-dd");
export const todayISO = (): ISODate => toISODate(new Date());
export const weekdayOf = (d: Date): Weekday => getISODay(d) as Weekday;

export const WEEKDAYS: { value: Weekday; short: string; long: string }[] = [
  { value: 1, short: "Pzt", long: "Pazartesi" },
  { value: 2, short: "Sal", long: "Salı" },
  { value: 3, short: "Çar", long: "Çarşamba" },
  { value: 4, short: "Per", long: "Perşembe" },
  { value: 5, short: "Cum", long: "Cuma" },
  { value: 6, short: "Cmt", long: "Cumartesi" },
  { value: 7, short: "Paz", long: "Pazar" },
];

/** "15 Kasım Pazar" */
export const formatLong = (d: Date) => format(d, "d MMMM EEEE", { locale: tr });

/** "15 Kas Paz" */
export const formatShort = (iso: ISODate) => format(parseISO(iso), "d MMM EEE", { locale: tr });

/** Bugünden itibaren kaç gün var (geçmişse negatif) */
export const daysUntil = (iso: ISODate, from: Date = new Date()) =>
  differenceInCalendarDays(parseISO(iso), from);

/** "Bugün", "Yarın", "3 gün kaldı", "2 gün gecikti" gibi okunabilir etiket */
export function relativeLabel(iso: ISODate, from: Date = new Date()): string {
  const n = daysUntil(iso, from);
  if (n === 0) return "Bugün";
  if (n === 1) return "Yarın";
  if (n === -1) return "Dün";
  if (n < 0) return `${-n} gün gecikti`;
  return `${n} gün kaldı`;
}

/** Verilen tarihin içinde bulunduğu haftanın (Pzt–Paz) günleri */
export function weekDays(d: Date): ISODate[] {
  const start = startOfISOWeek(d);
  return Array.from({ length: 7 }, (_, i) => toISODate(addDays(start, i)));
}

/** "09:40" → dakika cinsinden (580) */
export const timeToMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
