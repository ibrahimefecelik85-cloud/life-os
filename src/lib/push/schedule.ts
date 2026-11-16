// Rutin bildirimlerinin ZAMANLAMA kuralları (sunucu ve tarayıcı ortak kullanır).
// Saf fonksiyonlar: veritabanı veya ağ yok, bu yüzden kolay test edilir.
//
// Kural:
//   - Bir rutin bugün planlıysa ve TİKLENMEMİŞSE hatırlatılır.
//   - İlk hatırlatma: rutinin kendi saati, yoksa varsayılan saat (ör. 12:00).
//   - Sonra `repeatMinutes` dakikada bir tekrar (ör. 3 saatte bir), `quietAfter` saatine kadar.
//   - Tiklenen rutine o gün bir daha bildirim GİTMEZ.
//   - Aynı anda vadesi gelen rutinler TEK bildirimde toplanır.

export interface ReminderDef {
  id: string;
  title: string;
  days: number[]; // 1=Pzt..7=Paz, boş = her gün
  remindAt?: string; // "HH:mm"
}

export interface NotifySettings {
  defaultTime: string; // saati olmayan rutinler için ilk hatırlatma, "12:00"
  repeatMinutes: number; // 0 = tekrar yok
  quietAfter: string; // bu saatten sonra tekrar hatırlatma yok, "22:30"
}

export const DEFAULT_NOTIFY_SETTINGS: NotifySettings = {
  defaultTime: "12:00",
  repeatMinutes: 180,
  quietAfter: "22:30",
};

/** Sunucuda saklanan cihaz kaydı */
export interface DeviceState {
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } };
  reminders: ReminderDef[];
  settings: NotifySettings;
  done: { date: string; ids: string[] }; // bugün tiklenenler
  sent: { date: string; last: Record<string, number> }; // bugün en son ne zaman bildirildi (gün içi dakika)
  updatedAt: number;
}

export const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

/** İstanbul saatine göre şu an: tarih, haftanın günü ve gün içi dakika */
export function istanbulNow(at: Date = new Date()): { date: string; weekday: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hourCycle: "h23",
  }).formatToParts(at);
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    weekday: weekdays.indexOf(get("weekday")) + 1,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

/** Şu an bildirilmesi gereken rutinler */
export function dueReminders(state: DeviceState, now: { date: string; weekday: number; minutes: number }): ReminderDef[] {
  const s = state.settings ?? DEFAULT_NOTIFY_SETTINGS;
  const doneToday = state.done?.date === now.date ? new Set(state.done.ids) : new Set<string>();
  const sentToday = state.sent?.date === now.date ? state.sent.last : {};
  const quiet = toMinutes(s.quietAfter);

  return state.reminders.filter((r) => {
    if (r.days.length > 0 && !r.days.includes(now.weekday)) return false; // bugün planlı değil
    if (doneToday.has(r.id)) return false; // tiklendi → bir daha yok
    const first = toMinutes(r.remindAt ?? s.defaultTime);
    if (now.minutes < first) return false; // henüz saati gelmedi
    const last = sentToday[r.id];
    if (last === undefined) return true; // ilk hatırlatma
    if (!s.repeatMinutes || now.minutes >= quiet) return false; // tekrar kapalı / sessiz saat
    return now.minutes - last >= s.repeatMinutes; // tekrar zamanı geldi mi
  });
}

/** Bildirim metni: tek rutinse adı, birden fazlaysa sayı + liste */
export function buildMessage(due: ReminderDef[]): { title: string; body: string } {
  if (due.length === 1) return { title: `⏰ ${due[0].title}`, body: "Bugün henüz yapılmadı." };
  return { title: `${due.length} rutin bekliyor`, body: due.map((r) => r.title).join(", ") };
}

/** Gönderilenleri işaretle (yeni durum döner) */
export function markSent(state: DeviceState, due: ReminderDef[], now: { date: string; minutes: number }): DeviceState {
  const last = state.sent?.date === now.date ? { ...state.sent.last } : {};
  for (const r of due) last[r.id] = now.minutes;
  return { ...state, sent: { date: now.date, last } };
}
