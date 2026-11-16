// Sosyal medya engeli KURALI (sunucu ve uygulama ortak kullanır — saf fonksiyon).
//
//   - Dün planlı rutinlerden en az `required` tanesi (ör. 6) yapılmadıysa → bugün engelli
//   - Bugün `required` rutini bitirince engel hemen kalkar
//   - Kural, açıldığı günden (startDate) önceki günlere uygulanmaz
//   - Planlı rutin sayısı `required`dan azsa, hepsinin yapılması yeterlidir
//   - "Ders çalışma" gibi dakika hedefli rutinler hedefe ulaşınca "yapıldı" sayılır (uygulama zaten böyle işaretler)

export interface BlockConfig {
  enabled: boolean;
  required: number; // ör. 6
  startDate: string; // "2026-11-16" — bu günden önceki günler engel sebebi olmaz
}

export const BLOCK_CONFIG_KEY = "block.config";
export const DEFAULT_BLOCK_CONFIG: BlockConfig = { enabled: false, required: 6, startDate: "" };

export interface HabitLite {
  id: string;
  title: string;
  days: number[]; // boş = her gün
}

export interface DayResult {
  date: string;
  done: number;
  required: number;
  missing: string[]; // yapılmayan rutinlerin adları
  ok: boolean;
}

export interface BlockResult {
  enabled: boolean;
  blocked: boolean;
  yesterday: DayResult | null; // null: kural o gün henüz başlamamıştı
  today: DayResult;
}

/** "2026-11-16" → haftanın günü (1=Pzt..7=Paz) */
export function weekdayOfISO(iso: string): number {
  const d = new Date(`${iso}T12:00:00Z`).getUTCDay();
  return d === 0 ? 7 : d;
}

/** "2026-11-16" → "2026-11-15" */
export function previousDay(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

function evaluateDay(date: string, habits: HabitLite[], isDone: (habitId: string, date: string) => boolean, required: number): DayResult {
  const wd = weekdayOfISO(date);
  const scheduled = habits.filter((h) => h.days.length === 0 || h.days.includes(wd));
  const done = scheduled.filter((h) => isDone(h.id, date));
  const need = Math.min(required, scheduled.length);
  return {
    date,
    done: done.length,
    required: need,
    missing: scheduled.filter((h) => !isDone(h.id, date)).map((h) => h.title),
    ok: done.length >= need,
  };
}

export function computeBlock(
  config: BlockConfig,
  habits: HabitLite[],
  isDone: (habitId: string, date: string) => boolean,
  today: string,
): BlockResult {
  const todayRes = evaluateDay(today, habits, isDone, config.required);
  if (!config.enabled) return { enabled: false, blocked: false, yesterday: null, today: todayRes };

  const y = previousDay(today);
  const yesterday = config.startDate && y >= config.startDate ? evaluateDay(y, habits, isDone, config.required) : null;
  const blocked = yesterday !== null && !yesterday.ok && !todayRes.ok;
  return { enabled: true, blocked, yesterday, today: todayRes };
}

/** Kestirmede gösterilecek kısa mesaj */
export function blockMessage(r: BlockResult): string {
  if (!r.blocked || !r.yesterday) return "OK";
  const left = r.today.required - r.today.done;
  return (
    `🚫 Bugün Instagram ve YouTube kapalı. Dün ${r.yesterday.done} rutin yapıldı, en az ${r.yesterday.required} gerekiyordu` +
    (r.yesterday.missing.length ? ` (eksik: ${r.yesterday.missing.join(", ")})` : "") +
    `. Bugün ${left} rutin daha bitirince açılır.`
  );
}
