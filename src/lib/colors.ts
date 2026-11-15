// Derslere atanabilecek renkler.
// Tailwind sınıf adlarını tam yazıyoruz; Tailwind sadece kodda tam geçen sınıfları üretir.
export const COURSE_COLORS = {
  sky: { dot: "bg-sky-500", text: "text-sky-700", soft: "bg-sky-400/10 border-sky-400/30" },
  amber: { dot: "bg-amber-500", text: "text-amber-700", soft: "bg-amber-400/10 border-amber-400/30" },
  emerald: { dot: "bg-emerald-500", text: "text-emerald-700", soft: "bg-emerald-400/10 border-emerald-400/30" },
  rose: { dot: "bg-rose-500", text: "text-rose-700", soft: "bg-rose-400/10 border-rose-400/30" },
  violet: { dot: "bg-violet-500", text: "text-violet-700", soft: "bg-violet-400/10 border-violet-400/30" },
  orange: { dot: "bg-orange-500", text: "text-orange-700", soft: "bg-orange-400/10 border-orange-400/30" },
  teal: { dot: "bg-teal-500", text: "text-teal-700", soft: "bg-teal-400/10 border-teal-400/30" },
  pink: { dot: "bg-pink-500", text: "text-pink-700", soft: "bg-pink-400/10 border-pink-400/30" },
} as const;

export type ColorKey = keyof typeof COURSE_COLORS;
export const COLOR_KEYS = Object.keys(COURSE_COLORS) as ColorKey[];

export function courseColor(key: string | undefined) {
  return COURSE_COLORS[(key as ColorKey) ?? "sky"] ?? COURSE_COLORS.sky;
}
