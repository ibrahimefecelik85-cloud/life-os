// Para birimi yardımcıları (Türk lirası)

const fmt = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 2 });
const fmtShort = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });

/** 1234.5 → "₺1.234,50" */
export const formatTL = (n: number) => fmt.format(n);

/** Kuruşsuz: 1234.5 → "₺1.235" (grafik etiketleri için) */
export const formatTLShort = (n: number) => fmtShort.format(n);

/**
 * Kullanıcının yazdığı tutarı sayıya çevirir. "12,5", "12.5", "1.250,75" hepsi çalışır.
 * Geçersizse null döner.
 */
export function parseAmount(input: string): number | null {
  let s = input.trim().replace(/\s|₺|tl/gi, "");
  if (!s) return null;
  // Hem nokta hem virgül varsa: Türkçe biçim (nokta binlik, virgül ondalık)
  if (s.includes(",") && s.includes(".")) s = s.replace(/\./g, "").replace(",", ".");
  else s = s.replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : null;
}
