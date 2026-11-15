// Koddaki değerlerin (ör. "sinav") ekranda görünen Türkçe karşılıkları.
import type { AssessmentType, Priority, SessionKind, TodoCategory } from "@/types";

export const ASSESSMENT_TYPE_LABELS: Record<AssessmentType, string> = {
  odev: "Ödev",
  quiz: "Quiz",
  sinav: "Sınav",
  proje: "Proje",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  dusuk: "Düşük",
  orta: "Orta",
  yuksek: "Yüksek",
};

export const PRIORITY_STYLES: Record<Priority, string> = {
  dusuk: "text-zinc-400 bg-zinc-400/10",
  orta: "text-amber-300 bg-amber-400/10",
  yuksek: "text-rose-300 bg-rose-400/10",
};

export const SESSION_KIND_LABELS: Record<SessionKind, string> = {
  ders: "Ders",
  ps: "PS",
  lab: "Lab",
};

export const TODO_CATEGORY_LABELS: Record<TodoCategory, string> = {
  okul: "Okul",
  kulup: "Kulüp",
  kisisel: "Kişisel",
};

export const TODO_CATEGORY_STYLES: Record<TodoCategory, string> = {
  okul: "text-sky-300 bg-sky-400/10",
  kulup: "text-violet-300 bg-violet-400/10",
  kisisel: "text-emerald-300 bg-emerald-400/10",
};
