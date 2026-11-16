"use client";
// Rutinler, bugünkü tikler veya bildirim ayarları değişince sunucuya otomatik bildirir.
// Böylece tiklediğin rutin için bir daha bildirim gelmez. Görünmez bir bileşendir.
import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { todayISO } from "@/lib/dates";
import { pushSupport, syncNow } from "./client";

export function PushSync() {
  // Değişiklikleri izlemek için kısa bir "parmak izi"
  const fingerprint = useLiveQuery(async () => {
    const [habits, logs, settings] = await Promise.all([
      db.habits.toArray(),
      db.habitLogs.where("date").equals(todayISO()).toArray(),
      db.settings.get("notify.settings"),
    ]);
    return JSON.stringify([
      habits.map((h) => [h.id, h.title, h.days, h.remindAt]),
      logs.map((l) => [l.habitId, l.done]),
      settings?.value,
      todayISO(),
    ]);
  });

  useEffect(() => {
    if (fingerprint === undefined || pushSupport() !== "ok" || Notification.permission !== "granted") return;
    // Art arda tiklemelerde tek istek gitsin diye 1 sn bekle
    const t = setTimeout(() => void syncNow().catch(() => {}), 1000);
    return () => clearTimeout(t);
  }, [fingerprint]);

  // Uygulamaya geri dönünce (ör. gece yarısından sonra) de güncelle
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible" && pushSupport() === "ok" && Notification.permission === "granted") {
        void syncNow().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  return null;
}
