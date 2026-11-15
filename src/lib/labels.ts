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
  dusuk: "text-ink-400 bg-ink-400/10",
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
  okul: "text-brand-200 bg-brand-500/20",
  kulup: "text-ink-100 bg-ink-600/40",
  kisisel: "text-amber-200 bg-amber-800/30",
};
