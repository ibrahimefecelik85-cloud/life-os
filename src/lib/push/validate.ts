// Tarayıcıdan gelen verinin şeklini kontrol eder (sunucuya bozuk/zararlı veri yazılmasın)
import { DEFAULT_NOTIFY_SETTINGS, type DeviceState, type NotifySettings, type ReminderDef } from "./schedule";

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const str = (v: unknown, max: number) => (typeof v === "string" && v.length > 0 && v.length <= max ? v : null);

export function parseSubscription(v: unknown): DeviceState["subscription"] | null {
  const o = v as { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };
  const endpoint = str(o?.endpoint, 1000);
  const p256dh = str(o?.keys?.p256dh, 200);
  const auth = str(o?.keys?.auth, 100);
  if (!endpoint || !endpoint.startsWith("https://") || !p256dh || !auth) return null;
  return { endpoint, keys: { p256dh, auth } };
}

export function parseReminders(v: unknown): ReminderDef[] | null {
  if (!Array.isArray(v) || v.length > 50) return null;
  const out: ReminderDef[] = [];
  for (const r of v) {
    const id = str(r?.id, 64);
    const title = str(r?.title, 120);
    if (!id || !title) return null;
    const days = Array.isArray(r.days) ? r.days.filter((d: unknown) => Number.isInteger(d) && (d as number) >= 1 && (d as number) <= 7) : [];
    const remindAt = typeof r.remindAt === "string" && TIME.test(r.remindAt) ? r.remindAt : undefined;
    out.push({ id, title, days, remindAt });
  }
  return out;
}

export function parseSettings(v: unknown): NotifySettings {
  const o = (v ?? {}) as Partial<NotifySettings>;
  return {
    defaultTime: typeof o.defaultTime === "string" && TIME.test(o.defaultTime) ? o.defaultTime : DEFAULT_NOTIFY_SETTINGS.defaultTime,
    repeatMinutes:
      typeof o.repeatMinutes === "number" && o.repeatMinutes >= 0 && o.repeatMinutes <= 24 * 60
        ? Math.round(o.repeatMinutes)
        : DEFAULT_NOTIFY_SETTINGS.repeatMinutes,
    quietAfter: typeof o.quietAfter === "string" && TIME.test(o.quietAfter) ? o.quietAfter : DEFAULT_NOTIFY_SETTINGS.quietAfter,
  };
}

export function parseDone(v: unknown): DeviceState["done"] {
  const o = v as { date?: unknown; ids?: unknown };
  const date = typeof o?.date === "string" && DATE.test(o.date) ? o.date : "";
  const ids = Array.isArray(o?.ids) ? o.ids.filter((x): x is string => typeof x === "string" && x.length <= 64).slice(0, 50) : [];
  return { date, ids };
}
