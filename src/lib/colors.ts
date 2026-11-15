// Derslere atanabilecek renkler.
// Tailwind sınıf adlarını tam yazıyoruz; Tailwind sadece kodda tam geçen sınıfları üretir.
export const COURSE_COLORS = {
  sky: { dot: "bg-sky-400", text: "text-sky-300", soft: "bg-sky-400/10 border-sky-400/30" },
  amber: { dot: "bg-amber-400", text: "text-amber-300", soft: "bg-amber-400/10 border-amber-400/30" },
  emerald: { dot: "bg-emerald-400", text: "text-emerald-300", soft: "bg-emerald-400/10 border-emerald-400/30" },
  rose: { dot: "bg-rose-400", text: "text-rose-300", soft: "bg-rose-400/10 border-rose-400/30" },
  violet: { dot: "bg-violet-400", text: "text-violet-300", soft: "bg-violet-400/10 border-violet-400/30" },
  orange: { dot: "bg-orange-400", text: "text-orange-300", soft: "bg-orange-400/10 border-orange-400/30" },
  teal: { dot: "bg-teal-400", text: "text-teal-300", soft: "bg-teal-400/10 border-teal-400/30" },
  pink: { dot: "bg-pink-400", text: "text-pink-300", soft: "bg-pink-400/10 border-pink-400/30" },
} as const;

export type ColorKey = keyof typeof COURSE_COLORS;
export const COLOR_KEYS = Object.keys(COURSE_COLORS) as ColorKey[];

export function courseColor(key: string | undefined) {
  return COURSE_COLORS[(key as ColorKey) ?? "sky"] ?? COURSE_COLORS.sky;
}
