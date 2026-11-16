"use client";
// Service worker'ı kaydeder (sadece derlenmiş/yayındaki sürümde).
// Geliştirme modunda (npm run dev) kapalı: yoksa eski dosyalar önbellekten gelip kafa karıştırır.
import { useEffect } from "react";

export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {
      /* desteklenmiyorsa uygulama yine normal çalışır */
    });
  }, []);
  return null;
}
