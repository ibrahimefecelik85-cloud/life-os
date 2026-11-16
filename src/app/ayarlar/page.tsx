"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Download, Trash2, Upload } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { clearAllData, exportData, importData } from "@/features/backup/backup";
import { NotificationSettings } from "@/features/notifications/NotificationSettings";
import { SyncSettings } from "@/features/sync/SyncSettings";

export default function AyarlarPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleImport(file: File | undefined) {
    if (!file) return;
    if (!confirm("Yedek yüklenince şu anki verilerin silinip yerine yedektekiler gelecek. Devam edilsin mi?")) return;
    try {
      await importData(file);
      setMessage({ ok: true, text: "Yedek yüklendi." });
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "Yedek yüklenemedi." });
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleClear() {
    if (!confirm("TÜM veriler silinecek. Bulut senkronu açıksa diğer cihazlarından da silinir. Emin misin?")) return;
    await clearAllData();
    setMessage({ ok: true, text: "Tüm veriler silindi." });
  }

  return (
    <>
      <Link href="/" className="mb-2 inline-flex items-center gap-1 text-sm text-ink-600 hover:text-ink-800">
        <ChevronLeft size={16} /> Bugün
      </Link>
      <PageHeader title="Ayarlar" />

      <div className="space-y-4">
        <SyncSettings />
        <NotificationSettings />

        <Card title="Yedekleme">
          <p className="mb-3 text-sm text-ink-600">
            Verilerin sadece bu cihazın tarayıcısında saklanıyor. Tarayıcı verilerini silersen kaybolur, o yüzden ara sıra
            yedek al. Yedeği başka bir cihaza yükleyerek verilerini taşıyabilirsin.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={exportData} className="flex-1">
              <Download size={16} /> Yedeği kaydet
            </Button>
            <Button variant="secondary" onClick={() => fileRef.current?.click()} className="flex-1">
              <Upload size={16} /> Yedek yükle
            </Button>
            <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => handleImport(e.target.files?.[0])} />
          </div>
          {message && <p className={`mt-3 text-sm ${message.ok ? "text-brand-700" : "text-rose-700"}`}>{message.text}</p>}
        </Card>

        <Card title="Tehlikeli bölge">
          <Button variant="danger" onClick={handleClear} className="w-full">
            <Trash2 size={16} /> Tüm verileri sil
          </Button>
        </Card>
      </div>
    </>
  );
}
