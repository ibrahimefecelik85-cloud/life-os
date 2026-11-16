"use client";
// Bugün ekranında küçük bulut simgesi: bağlı / senkronize ediliyor / hata. Dokununca Ayarlar'a gider.
import Link from "next/link";
import { Cloud, CloudAlert, CloudCheck, RefreshCw } from "lucide-react";
import { useSyncStatus } from "./useSyncStatus";

export function SyncIndicator() {
  const { state, error } = useSyncStatus();
  if (state === "off") return null;
  const label = state === "error" ? `Senkron hatası: ${error}` : state === "syncing" ? "Senkronize ediliyor" : "Bulutla senkron";
  return (
    <Link
      href="/ayarlar"
      aria-label={label}
      title={label}
      className={`flex h-10 w-10 items-center justify-center rounded-xl hover:bg-white/50 ${state === "error" ? "text-rose-700" : "text-ink-600"}`}
    >
      {state === "error" ? (
        <CloudAlert size={20} />
      ) : state === "syncing" ? (
        <RefreshCw size={18} className="animate-spin" />
      ) : state === "idle" ? (
        <CloudCheck size={20} />
      ) : (
        <Cloud size={20} />
      )}
    </Link>
  );
}
