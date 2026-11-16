"use client";
// Ayarlar → Bildirimler: aç/kapa, deneme bildirimi ve zamanlama ayarları
import { useEffect, useState } from "react";
import { Bell, BellOff, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/Form";
import { DEFAULT_NOTIFY_SETTINGS, type NotifySettings } from "@/lib/push/schedule";
import {
  currentSubscription,
  disablePush,
  enablePush,
  getNotifySettings,
  pushSupport,
  saveNotifySettings,
  sendTestPush,
  type PushSupport,
} from "./client";

const REPEAT_OPTIONS = [
  { value: 0, label: "Tekrar etme" },
  { value: 60, label: "Her saat" },
  { value: 120, label: "2 saatte bir" },
  { value: 180, label: "3 saatte bir" },
  { value: 240, label: "4 saatte bir" },
];

export function NotificationSettings() {
  const [support, setSupport] = useState<PushSupport | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [settings, setSettings] = useState<NotifySettings>(DEFAULT_NOTIFY_SETTINGS);

  // Tarayıcıya özgü bilgiler sadece tarayıcıda okunabilir
  useEffect(() => {
    let alive = true;
    Promise.all([currentSubscription().catch(() => null), getNotifySettings()]).then(([sub, s]) => {
      if (!alive) return;
      setSupport(pushSupport());
      setEnabled(Boolean(sub) && Notification.permission === "granted");
      setSettings(s);
    });
    return () => {
      alive = false;
    };
  }, []);

  async function run(action: () => Promise<void>, success: string) {
    setBusy(true);
    setMessage(null);
    try {
      await action();
      setMessage({ ok: true, text: success });
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "Bir hata oluştu." });
    } finally {
      setBusy(false);
    }
  }

  function update(patch: Partial<NotifySettings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    void saveNotifySettings(next); // değişiklik PushSync ile sunucuya da gider
  }

  return (
    <Card title="Bildirimler" icon={<Bell size={16} />}>
      {support === "needs-install" && (
        <p className="text-sm text-ink-600">
          iPhone&apos;da bildirimler sadece ana ekrana eklenmiş uygulamada çalışır: Safari&apos;de <b>Paylaş → Ana Ekrana Ekle</b>, sonra
          Life OS&apos;u ana ekrandan açıp buraya tekrar gel.
        </p>
      )}
      {support === "unsupported" && <p className="text-sm text-ink-600">Bu tarayıcı bildirimleri desteklemiyor.</p>}
      {support === "dev" && (
        <p className="text-sm text-ink-600">
          Bildirimler sadece yayındaki sürümde (Vercel adresi) çalışır; bilgisayardaki geliştirme modunda (npm run dev) kapalıdır.
        </p>
      )}

      {support === "ok" && (
        <div className="space-y-4">
          <p className="text-sm text-ink-600">
            Saati gelen ve tiklenmemiş rutinler için bildirim gelir. Tiklediğin rutin için o gün bir daha bildirim gelmez.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            {enabled ? (
              <>
                <Button
                  variant="secondary"
                  className="flex-1"
                  disabled={busy}
                  onClick={() => run(sendTestPush, "Deneme bildirimi gönderildi, birkaç saniye içinde gelmeli.")}
                >
                  <Send size={16} /> Deneme bildirimi
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  disabled={busy}
                  onClick={() =>
                    run(async () => {
                      await disablePush();
                      setEnabled(false);
                    }, "Bildirimler kapatıldı.")
                  }
                >
                  <BellOff size={16} /> Bildirimleri kapat
                </Button>
              </>
            ) : (
              <Button
                className="flex-1"
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    await enablePush();
                    setEnabled(true);
                  }, "Bildirimler açıldı.")
                }
              >
                <Bell size={16} /> Bildirimleri aç
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-ink-900/15 pt-4">
            <Field label="Saati olmayan rutinler için">
              <Input type="time" value={settings.defaultTime} onChange={(e) => e.target.value && update({ defaultTime: e.target.value })} />
            </Field>
            <Field label="Bu saatten sonra sessiz">
              <Input type="time" value={settings.quietAfter} onChange={(e) => e.target.value && update({ quietAfter: e.target.value })} />
            </Field>
            <div className="col-span-2">
              <Field label="Yapılmayanları tekrar hatırlat">
                <Select value={settings.repeatMinutes} onChange={(e) => update({ repeatMinutes: Number(e.target.value) })}>
                  {REPEAT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </div>
          <p className="text-xs text-ink-500">Her rutine ayrı saat vermek için: Bugün → Günlük rutin → Düzenle.</p>
        </div>
      )}

      {message && <p className={`mt-3 text-sm ${message.ok ? "text-brand-700" : "text-rose-700"}`}>{message.text}</p>}
    </Card>
  );
}
