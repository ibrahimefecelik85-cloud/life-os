"use client";
// Şu anki zamanı verir ve her dakika günceller.
// Sunucuda `null` döner: sayfa sunucuda hazırlanırken tarayıcının saatini bilemeyiz,
// bu yüzden tarihe bağlı içerik sadece tarayıcıda gösterilir (uyumsuzluk hatası olmaz).
// Uygulama gece yarısı açık kalırsa "bugün" de otomatik değişir.
import { useMemo, useSyncExternalStore } from "react";

const STEP = 60_000; // 1 dakika

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 15_000);
  // Telefonda uygulamaya geri dönüldüğünde hemen güncelle
  document.addEventListener("visibilitychange", onChange);
  return () => {
    clearInterval(id);
    document.removeEventListener("visibilitychange", onChange);
  };
}

// Dakikaya yuvarlanmış zaman: aynı dakika içinde değer değişmez, gereksiz yeniden çizim olmaz
const getSnapshot = () => Math.floor(Date.now() / STEP) * STEP;
const getServerSnapshot = () => null;

export function useNow(): Date | null {
  const ts = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => (ts === null ? null : new Date(ts)), [ts]);
}
