"use client";
// Ayarlar → Sosyal medya engeli: aç/kapa, kaç rutin gerektiği, Kestirme adresi ve kurulum adımları
import { useState } from "react";
import { Ban, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Select } from "@/components/ui/Form";
import { todayISO } from "@/lib/dates";
import { getSyncPassword } from "@/features/sync/engine";
import { useSyncStatus } from "@/features/sync/useSyncStatus";
import { saveBlockConfig, useBlockConfig } from "./hooks";

export function BlockSettings() {
  const config = useBlockConfig();
  const sync = useSyncStatus();
  const [copied, setCopied] = useState(false);
  if (!config) return null;

  const syncOn = sync.state !== "off";

  async function copyUrl() {
    const pw = getSyncPassword();
    if (!pw) return;
    const url = `${window.location.origin}/api/block?key=${encodeURIComponent(pw)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      prompt("Bu adresi kopyala:", url);
    }
  }

  return (
    <Card title="Sosyal medya engeli" icon={<Ban size={16} />}>
      <p className="text-sm text-ink-600">
        Bir gün en az <b>{config.required}</b> rutin yapılmazsa ertesi gün Instagram ve YouTube açılınca seni ana ekrana atar. O
        günün rutinlerini bitirince engel hemen kalkar.
      </p>

      {!syncOn && (
        <p className="mt-3 text-sm text-rose-700">Önce Bulut senkronizasyonunu bağla — engel buluttaki rutin tiklerine bakar.</p>
      )}

      <div className="mt-4 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Field label="Günde en az kaç rutin">
              <Select value={config.required} onChange={(e) => void saveBlockConfig({ ...config, required: Number(e.target.value) })}>
                {[3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>
                    {n} rutin
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          {config.enabled ? (
            <Button variant="danger" onClick={() => void saveBlockConfig({ ...config, enabled: false })}>
              Engeli kapat
            </Button>
          ) : (
            // Açıldığı gün başlangıç: dünkü (kural öncesi) eksikler yüzünden hemen engellemesin
            <Button onClick={() => void saveBlockConfig({ ...config, enabled: true, startDate: todayISO() })} disabled={!syncOn}>
              Engeli aç
            </Button>
          )}
        </div>

        {config.enabled && (
          <div className="space-y-3 border-t border-ink-900/15 pt-4">
            <p className="text-sm font-medium">iPhone Kestirmeler kurulumu</p>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-ink-700">
              <li>Aşağıdaki butonla adresi kopyala (şifren içinde, kimseyle paylaşma).</li>
              <li>
                Kestirmeler → <b>Otomasyon</b> → <b>+</b> → <b>Uygulama</b> → Instagram ve YouTube&apos;u seç → <b>Açıldığında</b> →{" "}
                <b>Hemen Çalıştır</b> → İleri → <b>Yeni Boş Otomasyon</b>.
              </li>
              <li>
                <b>URL İçeriğini Al</b> ekle, URL olarak kopyaladığın adresi yapıştır.
              </li>
              <li>
                <b>Eğer</b> ekle: <i>URL&apos;nin İçeriği</i> → <b>şuna eşit değil</b> → <code>OK</code>.
              </li>
              <li>
                Eğer&apos;in içine: <b>Bildirim Göster</b> (metin: <i>URL&apos;nin İçeriği</i>) ve <b>Ana Ekrana Git</b>.
              </li>
            </ol>
            <Button variant="secondary" className="w-full" onClick={copyUrl} disabled={!syncOn}>
              {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Kopyalandı" : "Kestirme adresini kopyala"}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
