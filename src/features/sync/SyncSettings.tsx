"use client";
// Ayarlar → Bulut senkronizasyonu: şifreyle bağlan, durumu gör, şimdi senkronize et, bağlantıyı kes
import { useState, type FormEvent } from "react";
import { Cloud, CloudOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Form";
import { connect, disconnect, syncNow } from "./engine";
import { useSyncStatus } from "./useSyncStatus";

function timeAgo(ts: number | null): string {
  if (!ts) return "henüz yok";
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return "az önce";
  if (s < 3600) return `${Math.round(s / 60)} dk önce`;
  return new Date(ts).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" });
}

export function SyncSettings() {
  const status = useSyncStatus();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleConnect(e: FormEvent) {
    e.preventDefault();
    if (!password) return;
    setBusy(true);
    setMessage(null);
    try {
      const result = await connect(password, () =>
        confirm(
          "Bulutta zaten veri var. Bu cihazdaki veriler silinip buluttakilerle DEĞİŞTİRİLECEK.\n\n" +
            "(En güncel verilerin başka bir cihazdaysa önce o cihazı bağlamış olmalısın.) Devam edilsin mi?",
        ),
      );
      if (result === "uploaded") setMessage({ ok: true, text: "Bağlandı. Bu cihazdaki veriler buluta yüklendi." });
      if (result === "downloaded") setMessage({ ok: true, text: "Bağlandı. Buluttaki veriler bu cihaza alındı." });
      if (result === "cancelled") setMessage({ ok: false, text: "Vazgeçildi, hiçbir şey değişmedi." });
      setPassword("");
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : "Bağlanılamadı." });
    } finally {
      setBusy(false);
    }
  }

  const connected = status.state !== "off";

  return (
    <Card title="Bulut senkronizasyonu" icon={<Cloud size={16} />}>
      {!connected ? (
        <form onSubmit={handleConnect} className="space-y-3">
          <p className="text-sm text-ink-600">
            Bağlanınca verilerin telefon ve bilgisayar arasında otomatik eşitlenir. Şifre, Vercel&apos;de <b>SYNC_PASSWORD</b> olarak
            girdiğin şifredir.
          </p>
          <Field label="Senkron şifresi">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
          </Field>
          <Button type="submit" className="w-full" disabled={busy || !password}>
            <Cloud size={16} /> {busy ? "Bağlanıyor..." : "Bağlan"}
          </Button>
        </form>
      ) : (
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-sm">
            {status.state === "error" ? (
              <span className="text-rose-700">⚠ Senkron hatası: {status.error}</span>
            ) : status.state === "syncing" ? (
              <span className="text-ink-700">Senkronize ediliyor…</span>
            ) : (
              <span className="text-ink-700">✓ Bağlı · son senkron {timeAgo(status.lastSyncAt)}</span>
            )}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="secondary" className="flex-1" disabled={status.state === "syncing"} onClick={() => void syncNow().catch(() => {})}>
              <RefreshCw size={16} className={status.state === "syncing" ? "animate-spin" : ""} /> Şimdi senkronize et
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={() => confirm("Bu cihazın bulut bağlantısı kesilsin mi? Veriler bu cihazda kalır.") && disconnect()}
            >
              <CloudOff size={16} /> Bağlantıyı kes
            </Button>
          </div>
        </div>
      )}
      {message && <p className={`mt-3 text-sm ${message.ok ? "text-brand-700" : "text-rose-700"}`}>{message.text}</p>}
    </Card>
  );
}
