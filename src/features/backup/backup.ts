// Tüm verileri JSON dosyası olarak dışa/içe aktarma.
// Veriler sadece bu tarayıcıda durduğu için düzenli yedek almak önemli.
import { ALL_TABLES, db } from "@/lib/db";

const FORMAT = "life-os-backup";

export async function exportData(): Promise<void> {
  const tables: Record<string, unknown[]> = {};
  for (const name of ALL_TABLES) tables[name] = await db.table(name).toArray();

  const payload = { format: FORMAT, version: 1, exportedAt: new Date().toISOString(), tables };
  const name = `life-os-yedek-${new Date().toISOString().slice(0, 10)}.json`;
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });

  // Telefonda (özellikle iPhone'da ana ekrandan açılan uygulamada) dosya indirme çalışmayabilir:
  // paylaşım menüsü varsa onu aç → "Dosyalar'a Kaydet", WhatsApp, Mail...
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const file = new File([blob], name, { type: "application/json" });
  if (isMobile && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "Life OS yedeği" });
      return;
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return; // kullanıcı vazgeçti
      // paylaşım başarısızsa aşağıdaki normal indirmeyi dene
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

/** Yedek dosyasını yükler. Mevcut verilerin YERİNE geçer. */
export async function importData(file: File): Promise<void> {
  const payload = JSON.parse(await file.text());
  if (payload?.format !== FORMAT || typeof payload.tables !== "object") {
    throw new Error("Bu dosya bir Life OS yedeği değil.");
  }
  await db.transaction("rw", ALL_TABLES.map((n) => db.table(n)), async () => {
    for (const name of ALL_TABLES) {
      const rows = payload.tables[name];
      // Eski yedeklerde olmayan tablolara (ör. rutin) dokunma
      if (!Array.isArray(rows)) continue;
      await db.table(name).clear();
      await db.table(name).bulkAdd(rows);
    }
  });
}

export async function clearAllData(): Promise<void> {
  await db.transaction("rw", ALL_TABLES.map((n) => db.table(n)), async () => {
    for (const name of ALL_TABLES) await db.table(name).clear();
  });
}
