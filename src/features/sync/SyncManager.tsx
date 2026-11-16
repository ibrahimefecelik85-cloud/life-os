"use client";
// Arka planda senkronu tetikler (görünmez bileşen):
//   - veritabanında bir şey değişince (2 sn bekleyip, art arda değişiklikleri toplayarak)
//   - uygulama açılınca / tekrar öne gelince
//   - açıkken 30 saniyede bir (diğer cihazdaki değişiklikleri almak için)
//   - internet geri gelince
import { useEffect } from "react";
import { db } from "@/lib/db";
import { SYNC_TABLES } from "@/lib/sync/protocol";
import { isApplying, isSyncConfigured, refreshStatus, syncNow } from "./engine";

export function SyncManager() {
  useEffect(() => {
    refreshStatus();
    let timer: ReturnType<typeof setTimeout> | undefined;

    const run = () => {
      if (isSyncConfigured()) void syncNow().catch(() => {}); // hata durumu arayüzde gösteriliyor
    };
    const schedule = () => {
      if (isApplying() || !isSyncConfigured()) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        timer = undefined;
        run();
      }, 2000);
    };

    // Dexie "hook"ları: herhangi bir tabloda ekleme/güncelleme/silme olunca senkron planla
    const tables = SYNC_TABLES.map((t) => db.table(t));
    for (const t of tables) {
      t.hook("creating", schedule);
      t.hook("updating", schedule);
      t.hook("deleting", schedule);
    }

    // Öne gelince güncelle; arka plana geçerken bekleyen değişikliği hemen gönder
    // (ör. rutini tikleyip hemen Instagram'a geçince engel güncel olsun)
    const onVisible = () => {
      if (document.visibilityState === "visible") run();
      else if (timer) {
        clearTimeout(timer);
        timer = undefined;
        run();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", run);
    const interval = setInterval(() => document.visibilityState === "visible" && run(), 30_000);
    run();

    return () => {
      for (const t of tables) {
        t.hook("creating").unsubscribe(schedule);
        t.hook("updating").unsubscribe(schedule);
        t.hook("deleting").unsubscribe(schedule);
      }
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", run);
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  return null;
}
